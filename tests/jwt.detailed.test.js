/**
 * Date: 2025-06-25
 * File Purpose: Comprehensive JWT unit tests with detailed logging and debugging
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/tests/jwt.detailed.test.js
 */

// Load test environment first
require('dotenv').config({ path: './tests/test.env' });

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  generateTokenPair,
  decodeToken,
  JWT_CONFIG
} = require('../src/utils/jwt');

const { logger, clearLogs } = require('../src/utils/logger');

describe('JWT Utilities - Detailed Debugging', () => {
  // Test user data
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'user',
    firstName: 'Test',
    lastName: 'User'
  };

  beforeAll(() => {
    // Clear logs before starting tests
    clearLogs();
    logger.info('Starting JWT detailed tests', { 
      environment: process.env.NODE_ENV,
      jwtSecretAvailable: !!process.env.JWT_SECRET,
      refreshSecretAvailable: !!process.env.JWT_REFRESH_SECRET
    });
  });

  beforeEach(() => {
    logger.info('='.repeat(50));
    logger.info('Starting new test case');
  });

  afterEach(() => {
    logger.info('Completed test case');
    logger.info('='.repeat(50));
  });

  describe('generateAccessToken - Detailed Analysis', () => {
    test('should generate a valid access token with detailed logging', () => {
      logger.info('TEST: generateAccessToken with valid payload');
      
      const token = generateAccessToken(mockUser);
      
      logger.debug('Generated token analysis', {
        tokenLength: token.length,
        tokenParts: token.split('.').length,
        tokenPrefix: token.substring(0, 20) + '...',
        tokenSuffix: '...' + token.substring(token.length - 20)
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      
      // Decode without verification to check structure
      const decoded = decodeToken(token);
      logger.debug('Decoded token structure', {
        header: decoded.header,
        payload: decoded.payload,
        payloadKeys: Object.keys(decoded.payload)
      });
      
      expect(decoded.payload.type).toBe('access');
      expect(decoded.payload.id).toBe(mockUser.id);
      expect(decoded.payload.email).toBe(mockUser.email);
    });

    test('should include correct payload data with logging', () => {
      logger.info('TEST: generateAccessToken payload validation');
      
      const token = generateAccessToken(mockUser);
      const decoded = decodeToken(token);
      
      logger.debug('Payload validation', {
        expectedId: mockUser.id,
        actualId: decoded.payload.id,
        expectedEmail: mockUser.email,
        actualEmail: decoded.payload.email,
        expectedType: 'access',
        actualType: decoded.payload.type
      });

      expect(decoded.payload.id).toBe(mockUser.id);
      expect(decoded.payload._id).toBe(mockUser._id);
      expect(decoded.payload.email).toBe(mockUser.email);
      expect(decoded.payload.role).toBe(mockUser.role);
      expect(decoded.payload.type).toBe('access');
      expect(decoded.payload.firstName).toBe(mockUser.firstName);
      expect(decoded.payload.lastName).toBe(mockUser.lastName);
    });
  });

  describe('generateRefreshToken - Detailed Analysis', () => {
    test('should generate a valid refresh token', () => {
      logger.info('TEST: generateRefreshToken with valid payload');
      
      const token = generateRefreshToken(mockUser);
      
      logger.debug('Generated refresh token analysis', {
        tokenLength: token.length,
        tokenParts: token.split('.').length
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
      
      const decoded = decodeToken(token);
      logger.debug('Decoded refresh token structure', {
        payload: decoded.payload,
        payloadKeys: Object.keys(decoded.payload)
      });
      
      expect(decoded.payload.type).toBe('refresh');
      expect(decoded.payload.id).toBe(mockUser.id);
      expect(decoded.payload.email).toBe(mockUser.email);
    });
  });

  describe('verifyAccessToken - Debug Token Type Issues', () => {
    test('should verify valid access token', () => {
      logger.info('TEST: verifyAccessToken with valid access token');
      
      const accessToken = generateAccessToken(mockUser);
      logger.debug('Generated access token for verification', {
        tokenGenerated: !!accessToken,
        tokenLength: accessToken.length
      });
      
      const decodedBeforeVerify = decodeToken(accessToken);
      logger.debug('Token before verification', {
        type: decodedBeforeVerify.payload.type,
        allPayload: decodedBeforeVerify.payload
      });
      
      const verified = verifyAccessToken(accessToken);
      logger.debug('Verification result', {
        verifiedType: verified.type,
        verifiedId: verified.id,
        verificationSuccessful: !!verified
      });

      expect(verified).toBeDefined();
      expect(verified.type).toBe('access');
      expect(verified.id).toBe(mockUser.id);
      expect(verified.email).toBe(mockUser.email);
    });

    test('should reject refresh token as access token - DEBUG', () => {
      logger.info('TEST: verifyAccessToken should reject refresh token');
      
      // Generate a refresh token
      const refreshToken = generateRefreshToken(mockUser);
      logger.debug('Generated refresh token for access verification test', {
        tokenLength: refreshToken.length
      });
      
      const decodedRefreshToken = decodeToken(refreshToken);
      logger.debug('Refresh token details', {
        type: decodedRefreshToken.payload.type,
        payload: decodedRefreshToken.payload
      });
      
      // Try to verify refresh token as access token
      logger.info('Attempting to verify refresh token as access token (should fail)');
      
      expect(() => {
        const result = verifyAccessToken(refreshToken);
        logger.error('UNEXPECTED: Refresh token was accepted as access token', {
          result: result,
          resultType: result?.type
        });
      }).toThrow('Invalid token type');
      
      logger.info('Test passed: Refresh token correctly rejected as access token');
    });

    test('should reject invalid token', () => {
      logger.info('TEST: verifyAccessToken with invalid token');
      
      const invalidToken = 'invalid.token.here';
      logger.debug('Testing with invalid token', { invalidToken });
      
      expect(() => {
        verifyAccessToken(invalidToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken - Debug Token Type Issues', () => {
    test('should verify valid refresh token', () => {
      logger.info('TEST: verifyRefreshToken with valid refresh token');
      
      const refreshToken = generateRefreshToken(mockUser);
      const decoded = decodeToken(refreshToken);
      logger.debug('Refresh token before verification', {
        type: decoded.payload.type,
        payload: decoded.payload
      });
      
      const verified = verifyRefreshToken(refreshToken);
      logger.debug('Refresh token verification result', {
        verifiedType: verified.type,
        verificationSuccessful: !!verified
      });

      expect(verified).toBeDefined();
      expect(verified.type).toBe('refresh');
      expect(verified.id).toBe(mockUser.id);
    });

    test('should reject access token as refresh token - DEBUG', () => {
      logger.info('TEST: verifyRefreshToken should reject access token');
      
      // Generate an access token
      const accessToken = generateAccessToken(mockUser);
      const decodedAccessToken = decodeToken(accessToken);
      logger.debug('Access token details for refresh verification test', {
        type: decodedAccessToken.payload.type,
        payload: decodedAccessToken.payload
      });
      
      // Try to verify access token as refresh token
      logger.info('Attempting to verify access token as refresh token (should fail)');
      
      expect(() => {
        const result = verifyRefreshToken(accessToken);
        logger.error('UNEXPECTED: Access token was accepted as refresh token', {
          result: result,
          resultType: result?.type
        });
      }).toThrow('Invalid token type');
      
      logger.info('Test passed: Access token correctly rejected as refresh token');
    });
  });

  describe('generateTokenPair - Debug Structure Issues', () => {
    test('should generate both access and refresh tokens', () => {
      logger.info('TEST: generateTokenPair structure validation');
      
      const tokens = generateTokenPair(mockUser);
      logger.debug('Token pair generated', {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn,
        tokensStructure: Object.keys(tokens)
      });

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('tokenType', 'Bearer');
      expect(tokens).toHaveProperty('expiresIn');
    });

    test('should generate valid tokens with correct types', () => {
      logger.info('TEST: generateTokenPair token validation');
      
      const tokens = generateTokenPair(mockUser);
      
      // Verify access token
      const accessDecoded = decodeToken(tokens.accessToken);
      logger.debug('Access token from pair', {
        type: accessDecoded.payload.type,
        id: accessDecoded.payload.id,
        _id: accessDecoded.payload._id,
        hasAllFields: !!(accessDecoded.payload.id && accessDecoded.payload._id)
      });
      
      expect(accessDecoded.payload.type).toBe('access');
      expect(accessDecoded.payload._id).toBe(mockUser._id);
      expect(accessDecoded.payload.id).toBe(mockUser.id);
      
      // Verify refresh token
      const refreshDecoded = decodeToken(tokens.refreshToken);
      logger.debug('Refresh token from pair', {
        type: refreshDecoded.payload.type,
        id: refreshDecoded.payload.id
      });
      
      expect(refreshDecoded.payload.type).toBe('refresh');
      expect(refreshDecoded.payload.id).toBe(mockUser.id);
      
      // Test actual verification
      logger.info('Testing actual token verification');
      const verifiedAccess = verifyAccessToken(tokens.accessToken);
      const verifiedRefresh = verifyRefreshToken(tokens.refreshToken);
      
      logger.debug('Verification results', {
        accessVerified: !!verifiedAccess,
        refreshVerified: !!verifiedRefresh,
        accessType: verifiedAccess.type,
        refreshType: verifiedRefresh.type
      });
      
      expect(verifiedAccess.type).toBe('access');
      expect(verifiedRefresh.type).toBe('refresh');
    });
  });

  describe('Token Cross-Validation - Comprehensive Testing', () => {
    test('comprehensive token type validation', () => {
      logger.info('TEST: Comprehensive cross-validation of token types');
      
      // Generate both token types
      const accessToken = generateAccessToken(mockUser);
      const refreshToken = generateRefreshToken(mockUser);
      const tokenPair = generateTokenPair(mockUser);
      
      logger.debug('All tokens generated', {
        standalone: {
          access: !!accessToken,
          refresh: !!refreshToken
        },
        pair: {
          access: !!tokenPair.accessToken,
          refresh: !!tokenPair.refreshToken
        }
      });
      
      // Decode all tokens to check their types
      const decodedStandaloneAccess = decodeToken(accessToken);
      const decodedStandaloneRefresh = decodeToken(refreshToken);
      const decodedPairAccess = decodeToken(tokenPair.accessToken);
      const decodedPairRefresh = decodeToken(tokenPair.refreshToken);
      
      logger.debug('All decoded token types', {
        standaloneAccess: decodedStandaloneAccess.payload.type,
        standaloneRefresh: decodedStandaloneRefresh.payload.type,
        pairAccess: decodedPairAccess.payload.type,
        pairRefresh: decodedPairRefresh.payload.type
      });
      
      // Verify correct tokens pass
      expect(() => verifyAccessToken(accessToken)).not.toThrow();
      expect(() => verifyAccessToken(tokenPair.accessToken)).not.toThrow();
      expect(() => verifyRefreshToken(refreshToken)).not.toThrow();
      expect(() => verifyRefreshToken(tokenPair.refreshToken)).not.toThrow();
      
      // Verify incorrect tokens fail
      expect(() => verifyAccessToken(refreshToken)).toThrow('Invalid token type');
      expect(() => verifyAccessToken(tokenPair.refreshToken)).toThrow('Invalid token type');
      expect(() => verifyRefreshToken(accessToken)).toThrow('Invalid token type');
      expect(() => verifyRefreshToken(tokenPair.accessToken)).toThrow('Invalid token type');
      
      logger.info('All cross-validation tests passed');
    });
  });
});

/**
 * Future Improvements:
 * - Add performance benchmarks for token operations
 * - Add tests for token tampering detection
 * - Add tests for concurrent token operations
 * - Add tests for token memory usage
 * - Add tests for different payload sizes
 * - Add tests for edge cases with malformed payloads
 * - Add tests for different JWT secret lengths
 * - Add tests for token expiration edge cases
 */