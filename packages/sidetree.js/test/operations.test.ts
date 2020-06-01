import {
  generateCreateOperation,
  ICreateOperationData,
  generateUpdateOperation,
  generateRecoverOperation,
} from './operations_helper';

describe('Operations', () => {
  let createOperationData: ICreateOperationData;
  describe('create', () => {
    it('should generate a create operation', async () => {
      createOperationData = await generateCreateOperation();
      expect(createOperationData).toBeDefined();
    });
  });

  describe('update', () => {
    it('should generate an update operation', async () => {
      const updateOperationData = await generateUpdateOperation(
        createOperationData.createOperation.didUniqueSuffix,
        createOperationData.nextUpdateRevealValueEncodedString,
        createOperationData.signingKeyId,
        createOperationData.signingPrivateKey
      );
      expect(updateOperationData).toBeDefined();
    });
  });

  describe('recover', () => {
    it('should generate a recover operation', async () => {
      const recoveryOperationData = await generateRecoverOperation({
        didUniqueSuffix: createOperationData.createOperation.didUniqueSuffix,
        recoveryPrivateKey: createOperationData.recoveryPrivateKey,
      });
      expect(recoveryOperationData).toBeDefined();
    });
  });
});
