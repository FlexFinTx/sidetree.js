import {
  ErrorCode,
  IOperationQueue,
  SidetreeError,
  QueuedOperationModel,
} from '@sidetree/common';
import { Binary, Collection, MongoClient, Db, ObjectId } from 'mongodb';
import MongoDb from './MongoDb';

/**
 * Sidetree operation stored in MongoDb.
 * Note: we use the shorter property name "opIndex" instead of "operationIndex" due to a constraint imposed by CosmosDB/MongoDB:
 * the sum of property names of a unique index keys need to be less than 40 characters.
 * Note: We represent opIndex, transactionNumber, and transactionTime as long instead of number (double) to avoid some floating
 * point comparison quirks.
 */
interface IMongoQueuedOperation {
  _id?: ObjectId;
  didUniqueSuffix: string;
  operationBufferBsonBinary: Binary;
}

/**
 * Operation queue used by the Batch Writer implemented using MongoDB.
 */
export default class MongoDbOperationQueue implements IOperationQueue {
  /** Collection name for queued operations. */
  public readonly collectionName: string = 'queued-operations';

  private collection: Collection<IMongoQueuedOperation> | undefined;

  private serverUrl: string;
  private databaseName: string;

  private db: Db | undefined;

  constructor(serverUrl: string, databaseName: string) {
    this.serverUrl = serverUrl;
    this.databaseName = databaseName;
  }

  private client: MongoClient | undefined;

  public async close(): Promise<void> {
    return this.client!.close();
  }

  /**
   * Initialize the MongoDB operation store.
   */
  public async initialize(): Promise<void> {
    this.client =
      this.client ||
      (await MongoClient.connect(this.serverUrl, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })); // `useNewUrlParser` addresses nodejs's URL parser deprecation warning.
    this.db = this.client.db(this.databaseName);
    this.collection = await MongoDb.createCollectionIfNotExist(
      this.db,
      this.databaseName,
      'didUniqueSuffix'
    );
  }

  async enqueue(
    didUniqueSuffix: string,
    operationBuffer: Buffer
  ): Promise<void> {
    try {
      const queuedOperation: IMongoQueuedOperation = {
        didUniqueSuffix,
        operationBufferBsonBinary: new Binary(operationBuffer),
      };

      await this.collection!.insertOne(queuedOperation);
    } catch (error) {
      // Duplicate insert errors (error code 11000).
      if (error.code === 11000) {
        throw new SidetreeError(ErrorCode.BatchWriterAlreadyHasOperationForDid);
      }

      throw error;
    }
  }

  async dequeue(count: number): Promise<QueuedOperationModel[]> {
    if (count <= 0) {
      return [];
    }

    const queuedOperations = await this.collection!.find()
      .sort({ _id: 1 })
      .limit(count)
      .toArray();
    const lastOperation = queuedOperations[queuedOperations.length - 1];
    await this.collection!.deleteMany({ _id: { $lte: lastOperation._id } });

    return queuedOperations.map(operation =>
      MongoDbOperationQueue.convertToQueuedOperationModel(operation)
    );
  }

  async peek(count: number): Promise<QueuedOperationModel[]> {
    if (count <= 0) {
      return [];
    }

    // NOTE: `_id` is the default index that is sorted based by create time.
    const queuedOperations = await this.collection!.find()
      .sort({ _id: 1 })
      .limit(count)
      .toArray();

    return queuedOperations.map(operation =>
      MongoDbOperationQueue.convertToQueuedOperationModel(operation)
    );
  }

  /**
   * Checks to see if the queue already contains an operation for the given DID unique suffix.
   */
  async contains(didUniqueSuffix: string): Promise<boolean> {
    const operations = await this.collection!.find({ didUniqueSuffix })
      .limit(1)
      .toArray();
    return operations.length > 0;
  }

  /**
   * * Clears the unresolvable transaction store. Mainly used in tests.
   */
  public async clearCollection(): Promise<void> {
    await this.collection!.drop();
    if (this.db) {
      this.collection = await MongoDb.createCollectionIfNotExist(
        this.db,
        this.databaseName,
        'didUniqueSuffix'
      );
    }
  }

  private static convertToQueuedOperationModel(
    mongoQueuedOperation: IMongoQueuedOperation
  ): QueuedOperationModel {
    return {
      didUniqueSuffix: mongoQueuedOperation.didUniqueSuffix,
      operationBuffer: mongoQueuedOperation.operationBufferBsonBinary.buffer,
    };
  }
}
