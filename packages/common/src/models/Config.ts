﻿/**
 * Defines all the configuration parameters needed to initialize Sidetree Core.
 */
export default interface Config {
  batchingIntervalInSeconds: number;
  contentAddressableStoreServiceUri: string;
  didMethodName: string;
  maxConcurrentDownloads: number;
  observingIntervalInSeconds: number;
  mongoDbConnectionString: string;
  databaseName: string;
}
