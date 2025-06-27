/**
 * Date: 2025-06-25
 * File Purpose: Corrected JWT unit tests with proper security expectations
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/tests/jwt.corrected.test.js
 */

// Load test environment first
require('dotenv').config({ path: './tests/test.env' });

const jwt = require('jsonwebtoken');
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

describe('JWT Utilities - Security-Correct Tests', () => {
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
    clearLogs();
    logger.info('Starting corrected JWT tests with proper security expectations');
  });

  describe('Token Generation', () => {
    test('should generate a valid access token', () => {
      const token = generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
      
      const decoded = decodeToken(token);
      expect(decoded.payload.type).toBe('access');
      expect(decoded.payload.id).toBe(mockUser.id);
      expect(decoded.payload.email).toBe(mockUser.email);
    });

    test('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
      
      const decoded = decodeToken(token);
      expect(decoded.payload.type).toBe('refresh');
      expect(decoded.payload.id).toBe(mockUser.id);
      expect(decoded.payload.email).toBe(mockUser.email);
    });

    test('should throw error without JWT_SECRET', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => {
        generateAccessToken(mockUser);
      }).toThrow('JWT_SECRET environment variable is required');
      
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('Token Verification - Correct Security Behavior', () => {
    test('should verify valid access token', () => {
      const accessToken = generateAccessToken(mockUser);
      const verified = verifyAccessToken(accessToken);

      expect(verified).toBeDefined();
      expect(verified.type).toBe('access');
      expect(verified.id).toBe(mockUser.id);
      expect(verified.email).toBe(mockUser.email);
    });

    test('should verify valid refresh token', () => {
      const refreshToken = generateRefreshToken(mockUser);
      const verified = verifyRefreshToken(refreshToken);

      expect(verified).toBeDefined();
      expect(verified.type).toBe('refresh');
      expect(verified.id).toBe(mockUser.id);
    });

    test('should reject refresh token as access token (SECURITY: Different secrets)', () => {
      // When using different secrets for access and refresh tokens,
      // attempting to verify a refresh token as an access token should fail
      // at the signature verification stage, NOT at token type validation.
      // This is CORRECT security behavior.
      
      const refreshToken = generateRefreshToken(mockUser);
      
      logger.info('Testing cross-token verification - should fail at signature level');
      
      expect(() => {
        verifyAccessToken(refreshToken);
      }).toThrow('Invalid token'); // Should fail at signature verification
    });

    test('should reject access token as refresh token (SECURITY: Different secrets)', () => {
      // Same security principle applies in reverse
      const accessToken = generateAccessToken(mockUser);
      
      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow('Invalid refresh token'); // Should fail at signature verification
    });

    test('should reject invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid.token.here');
      }).toThrow();
    });
  });

  describe('Token Utilities', () => {
    test('should extract token from valid Bearer header', () => {
      const token = 'abc123';
      const header = `Bearer ${token}`;
      
      expect(extractTokenFromHeader(header)).toBe(token);
    });

    test('should return null for missing header', () => {
      expect(extractTokenFromHeader(null)).toBeNull();
      expect(extractTokenFromHeader(undefined)).toBeNull();
    });

    test('should return null for invalid format', () => {
      expect(extractTokenFromHeader('Basic abc123')).toBeNull();
      expect(extractTokenFromHeader('abc123')).toBeNull();
    });

    test('should return null for empty Bearer', () => {
      expect(extractTokenFromHeader('Bearer ')).toBeNull();
      expect(extractTokenFromHeader('Bearer')).toBeNull();
    });
  });

  describe('Token Pair Generation', () => {
    test('should generate both access and refresh tokens', () => {
      const tokens = generateTokenPair(mockUser);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('tokenType', 'Bearer');
      expect(tokens).toHaveProperty('expiresIn');
    });

    test('should generate valid tokens that verify correctly', () => {
      const tokens = generateTokenPair(mockUser);
      
      // Verify access token
      const accessDecoded = verifyAccessToken(tokens.accessToken);
      expect(accessDecoded._id).toBe(mockUser._id);
      expect(accessDecoded.type).toBe('access');
      
      // Verify refresh token
      const refreshDecoded = verifyRefreshToken(tokens.refreshToken);
      expect(refreshDecoded.id).toBe(mockUser.id);
      expect(refreshDecoded.type).toBe('refresh');
    });
  });

  describe('Token Decoding', () => {
    test('should decode token without verification', () => {
      const token = generateAccessToken(mockUser);
      const decoded = decodeToken(token);
      
      expect(decoded).toHaveProperty('header');
      expect(decoded).toHaveProperty('payload');
      expect(decoded.payload.type).toBe('access');
    });

    test('should decode expired token', () => {
      // Create a token that's already expired
      const shortLivedToken = jwt.sign(
        { ...mockUser, type: 'access' },
        process.env.JWT_SECRET,
        { 
          expiresIn: '-1s', // Already expired
          issuer: JWT_CONFIG.ISSUER,
          audience: JWT_CONFIG.AUDIENCE
        }
      );
      
      const decoded = decodeToken(shortLivedToken);
      expect(decoded).toHaveProperty('payload');
      expect(decoded.payload.type).toBe('access');
    });

    test('should throw error for malformed token', () => {
      expect(() => {
        decodeToken('not-a-jwt-token');
      }).toThrow();
    });
  });

  describe('Token Expiration', () => {
    test('should respect access token expiration', () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { ...mockUser, type: 'access' },
        process.env.JWT_SECRET,
        { 
          expiresIn: '-1s',
          issuer: JWT_CONFIG.ISSUER,
          audience: JWT_CONFIG.AUDIENCE
        }
      );
      
      expect(() => {
        verifyAccessToken(expiredToken);
      }).toThrow('Token has expired');
    });
  });

  describe('Security Tests', () => {
    test('should not accept tokens with different secrets', () => {
      const wrongSecretToken = jwt.sign(
        { ...mockUser, type: 'access' },
        'wrong-secret',
        { 
          issuer: JWT_CONFIG.ISSUER,
          audience: JWT_CONFIG.AUDIENCE
        }
      );
      
      expect(() => {
        verifyAccessToken(wrongSecretToken);
      }).toThrow('Invalid token');
    });

    test('should validate token issuer and audience', () => {
      const wrongIssuerToken = jwt.sign(
        { ...mockUser, type: 'access' },
        process.env.JWT_SECRET,
        { 
          issuer: 'wrong-issuer',
          audience: JWT_CONFIG.AUDIENCE
        }
      );
      
      expect(() => {
        verifyAccessToken(wrongIssuerToken);
      }).toThrow('Invalid token');
    });
  });

  describe('Same Secret Testing - Token Type Validation', () => {
    // Test token type validation when using the same secret
    // This tests the actual token type validation logic
    
    test('should reject wrong token type when using same secret', () => {
      // Temporarily use same secret for both token types
      const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;
      process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET;
      
      try {
        const refreshToken = generateRefreshToken(mockUser);
        
        // Now when we try to verify refresh token as access token,
        // it should fail at token type validation, not signature verification
        expect(() => {
          verifyAccessToken(refreshToken);
        }).toThrow('Invalid token type');
        
      } finally {
        // Restore original secret
        process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
      }
    });
  });
});

/**
 * Security Analysis:
 * 
 * The corrected tests demonstrate proper JWT security behavior:
 * 
 * 1. When different secrets are used for access and refresh tokens,
 *    cross-verification fails at signature verification (CORRECT)
 * 
 * 2. When same secrets are used, verification fails at token type 
 *    validation (ALSO CORRECT)
 * 
 * 3. Both behaviors are secure - the system rejects invalid tokens
 *    regardless of where in the verification process the failure occurs
 * 
 * 4. Using different secrets for different token types provides
 *    additional security isolation
 */