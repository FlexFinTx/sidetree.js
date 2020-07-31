import { ErrorCode, SidetreeError } from '@sidetree/common';
import Jwk from '../../util/Jwk';

describe('Jwk', () => {
  describe('Ed25519 keys', () => {
    it('should generate generateEd25519KeyPair keypair', async () => {
      const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();
      expect(publicKey).toBeTruthy();
      expect(privateKey).toBeTruthy();
    });
  });

  describe('validateJwkCurve25519()', () => {
    it('should throw error if `undefined` is passed.', async () => {
      expect(() => {
        Jwk.validateJwkCurve25519(undefined);
      }).toThrow(new SidetreeError(ErrorCode.JwkCurve25519Undefined));
    });

    it('should throw error if un unknown property is included in the JWK.', async () => {
      const jwk = {
        unknownProperty: 'any value',
        kty: 'EC',
        crv: 'secp256k1',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY',
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkCurve25519HasUnknownProperty));
    });

    it('should throw error if JWK has the wrong `kty` value.', async () => {
      const jwk = {
        kty: 'WRONG_TYPE',
        crv: 'secp256k1',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY',
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidKty));
    });

    it('should throw error if JWK has the wrong `crv` value.', async () => {
      const jwk = {
        kty: 'EC',
        crv: 'WRONG_CURVE',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY',
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidCrv));
    });

    it('should throw error if JWK has the wrong `x` type.', async () => {
      const jwk = {
        kty: 'EC',
        crv: 'secp256k1',
        x: 123,
        y: 'v0-Q5H3vcfAfQ4zsebJQvMrIg3pcsaJzRvuIYZ3_UOY',
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(
        new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidTypeX)
      );
    });

    it('should throw error if JWK has the wrong `y` type.', async () => {
      const jwk = {
        kty: 'EC',
        crv: 'secp256k1',
        x: '5s3-bKjD1Eu_3NJu8pk7qIdOPl1GBzU_V8aR3xiacoM',
        y: 123,
      };

      expect(() => {
        Jwk.validateJwkCurve25519(jwk);
      }).toThrow(
        new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidTypeY)
      );
    });
  });
});
