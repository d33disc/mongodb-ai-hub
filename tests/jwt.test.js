/**
 * Date: 2025-06-25
 * File Purpose: Unit tests for JWT utility functions
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/tests/jwt.test.js
 */

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  generateTokenPair,
  decodeToken
} = require('../src/utils/jwt');

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';

describe('JWT Utilities', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'user',
    firstName: 'Test',
    lastName: 'User'
  };

  describe('generateAccessToken', () => {
    test('should generate a valid access token', () => {
      const token = generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    test('should include correct payload data', () => {
      const token = generateAccessToken(mockUser);
      const decoded = decodeToken(token);
      
      expect(decoded.payload._id).toBe(mockUser._id);
      expect(decoded.payload.email).toBe(mockUser.email);
      expect(decoded.payload.role).toBe(mockUser.role);
      expect(decoded.payload.type).toBe('access');
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

  describe('generateRefreshToken', () => {
    test('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should include minimal payload data', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = decodeToken(token);
      
      expect(decoded.payload.id).toBe(mockUser._id);
      expect(decoded.payload.email).toBe(mockUser.email);
      expect(decoded.payload.type).toBe('refresh');
      expect(decoded.payload).not.toHaveProperty('firstName');
      expect(decoded.payload).not.toHaveProperty('lastName');
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify valid access token', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded._id).toBe(mockUser._id);
      expect(decoded.type).toBe('access');
    });

    test('should reject invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow('Invalid token');
    });

    test('should reject refresh token as access token', () => {
      const refreshToken = generateRefreshToken(mockUser);
      
      expect(() => {
        verifyAccessToken(refreshToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.type).toBe('refresh');
    });

    test('should reject access token as refresh token', () => {
      const accessToken = generateAccessToken(mockUser);
      
      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('extractTokenFromHeader', () => {
    test('should extract token from valid Bearer header', () => {
      const token = 'valid-jwt-token';
      const header = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    test('should return null for missing header', () => {
      const extracted = extractTokenFromHeader(null);
      expect(extracted).toBeNull();
    });

    test('should return null for invalid format', () => {
      const extracted = extractTokenFromHeader('Invalid format');
      expect(extracted).toBeNull();
    });

    test('should return null for empty Bearer', () => {
      const extracted = extractTokenFromHeader('Bearer ');
      expect(extracted).toBe('');
    });
  });

  describe('generateTokenPair', () => {
    test('should generate both access and refresh tokens', () => {
      const tokens = generateTokenPair(mockUser);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('tokenType', 'Bearer');
      expect(tokens).toHaveProperty('expiresIn');
    });

    test('should generate valid tokens', () => {
      const tokens = generateTokenPair(mockUser);
      
      // Verify access token
      const accessDecoded = verifyAccessToken(tokens.accessToken);
      expect(accessDecoded._id).toBe(mockUser._id);
      
      // Verify refresh token
      const refreshDecoded = verifyRefreshToken(tokens.refreshToken);
      expect(refreshDecoded.id).toBe(mockUser._id);
    });
  });

  describe('decodeToken', () => {
    test('should decode token without verification', () => {
      const token = generateAccessToken(mockUser);
      const decoded = decodeToken(token);
      
      expect(decoded).toHaveProperty('header');
      expect(decoded).toHaveProperty('payload');
      expect(decoded).toHaveProperty('signature');
    });

    test('should decode expired token', () => {
      // Generate token with very short expiry
      const jwt = require('jsonwebtoken');
      const shortLivedToken = jwt.sign(
        { ...mockUser, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );
      
      // Wait for token to expire
      setTimeout(() => {
        const decoded = decodeToken(shortLivedToken);
        expect(decoded.payload._id).toBe(mockUser._id);
      }, 10);
    });

    test('should throw error for malformed token', () => {
      expect(() => {
        decodeToken('not-a-jwt-token');
      }).toThrow();
    });
  });

  describe('Token Expiration', () => {
    test('should respect access token expiration', (done) => {
      // Create a token with 1ms expiry
      const jwt = require('jsonwebtoken');
      const shortToken = jwt.sign(
        { ...mockUser, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );

      setTimeout(() => {
        expect(() => {
          verifyAccessToken(shortToken);
        }).toThrow('Token has expired');
        done();
      }, 10);
    });
  });

  describe('Security Tests', () => {
    test('should not accept tokens with different secrets', () => {
      const jwt = require('jsonwebtoken');
      const tokenWithWrongSecret = jwt.sign(
        { ...mockUser, type: 'access' },
        'wrong-secret'
      );

      expect(() => {
        verifyAccessToken(tokenWithWrongSecret);
      }).toThrow('Invalid token');
    });

    test('should validate token issuer and audience', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);
      
      expect(decoded.iss).toBe('mongodb-ai-hub');
      expect(decoded.aud).toBe('mongodb-ai-hub-users');
    });
  });
});