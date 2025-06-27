/**
 * Date: 2025-06-25
 * File Purpose: JWT utility functions for token generation, validation, and management
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/src/utils/jwt.js
 */

const jwt = require('jsonwebtoken');
const {
  createModuleLogger,
  logFunctionEntry,
  logFunctionExit,
  logFunctionError
} = require('./logger');

// Create module-specific logger
const logger = createModuleLogger('JWT');

// JWT configuration constants for consistent token management
const JWT_CONFIG = {
  // Access token expires in 15 minutes for security
  ACCESS_TOKEN_EXPIRES_IN: '15m',

  // Refresh token expires in 7 days for user convenience
  REFRESH_TOKEN_EXPIRES_IN: '7d',

  // Token issuer identification
  ISSUER: 'mongodb-ai-hub',

  // Token audience specification
  AUDIENCE: 'mongodb-ai-hub-users'
};

/**
 * Generate JWT access token for authenticated user
 * @param {Object} payload - User data to include in token (id, email, role)
 * @returns {string} - Signed JWT access token
 */
const generateAccessToken = payload => {
  const startTime = Date.now();
  logFunctionEntry('JWT', 'generateAccessToken', {
    payloadKeys: Object.keys(payload || {}),
    hasId: !!payload?.id,
    hasEmail: !!payload?.email
  });

  try {
    logger.debug('Checking JWT_SECRET availability');
    // Ensure required JWT secret is available
    if (!process.env.JWT_SECRET) {
      const error = new Error('JWT_SECRET environment variable is required');
      logFunctionError('JWT', 'generateAccessToken', error, startTime);
      throw error;
    }

    logger.debug('Creating access token payload', {
      originalPayloadKeys: Object.keys(payload || {}),
      tokenType: 'access'
    });

    // Create token payload with user information and metadata
    const tokenPayload = {
      ...payload,
      type: 'access'
    };

    logger.debug('Signing access token', {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      payloadType: tokenPayload.type
    });

    // Sign and return the access token with expiration
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    });

    logger.info('Access token generated successfully', {
      tokenLength: token.length,
      userId: payload?.id,
      userEmail: payload?.email
    });

    logFunctionExit('JWT', 'generateAccessToken', 'TOKEN_GENERATED', startTime);
    return token;
  } catch (error) {
    logger.error('Failed to generate access token', {
      error: error.message,
      payloadProvided: !!payload,
      secretAvailable: !!process.env.JWT_SECRET
    });
    logFunctionError('JWT', 'generateAccessToken', error, startTime);
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Generate JWT refresh token for token renewal
 * @param {Object} payload - User data to include in token (id, email)
 * @returns {string} - Signed JWT refresh token
 */
const generateRefreshToken = payload => {
  try {
    // Ensure required JWT secret is available
    if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_SECRET) {
      throw new Error('JWT refresh secret environment variable is required');
    }

    // Create refresh token payload with minimal user information
    const tokenPayload = {
      id: payload.id || payload._id,
      email: payload.email,
      type: 'refresh'
    };

    // Use separate secret for refresh tokens or fallback to main secret
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    // Sign and return the refresh token with longer expiration
    return jwt.sign(tokenPayload, refreshSecret, {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    });
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};

/**
 * Verify and decode JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyAccessToken = token => {
  const startTime = Date.now();
  logFunctionEntry('JWT', 'verifyAccessToken', {
    tokenProvided: !!token,
    tokenLength: token?.length,
    tokenPrefix: token?.substring(0, 20) + '...'
  });

  try {
    logger.debug('Checking JWT_SECRET availability for access token verification');
    // Ensure required JWT secret is available
    if (!process.env.JWT_SECRET) {
      const error = new Error('JWT_SECRET environment variable is required');
      logFunctionError('JWT', 'verifyAccessToken', error, startTime);
      throw error;
    }

    logger.debug('Verifying access token signature', {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
      secretAvailable: !!process.env.JWT_SECRET
    });

    // Verify token signature and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    });

    logger.debug('Token decoded successfully', {
      decodedType: decoded.type,
      expectedType: 'access',
      hasType: 'type' in decoded,
      decodedKeys: Object.keys(decoded),
      userId: decoded.id,
      userEmail: decoded.email
    });

    // Validate token type
    if (decoded.type !== 'access') {
      const error = new Error('Invalid token type');
      logger.warn('Token type validation failed', {
        expectedType: 'access',
        actualType: decoded.type,
        decodedPayload: decoded
      });
      logFunctionError('JWT', 'verifyAccessToken', error, startTime);
      throw error;
    }

    logger.info('Access token verified successfully', {
      userId: decoded.id,
      userEmail: decoded.email,
      tokenType: decoded.type
    });

    logFunctionExit('JWT', 'verifyAccessToken', 'TOKEN_VERIFIED', startTime);
    return decoded;
  } catch (error) {
    logger.error('Access token verification failed', {
      errorName: error.name,
      errorMessage: error.message,
      tokenProvided: !!token
    });

    // Handle different JWT error types
    if (error.message === 'Invalid token type') {
      // Re-throw token type errors with original message
      logFunctionError('JWT', 'verifyAccessToken', error, startTime);
      throw error;
    } else if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Token has expired');
      logFunctionError('JWT', 'verifyAccessToken', expiredError, startTime);
      throw expiredError;
    } else if (error.name === 'JsonWebTokenError') {
      const invalidError = new Error('Invalid token');
      logFunctionError('JWT', 'verifyAccessToken', invalidError, startTime);
      throw invalidError;
    } else if (error.name === 'NotBeforeError') {
      const notActiveError = new Error('Token not active yet');
      logFunctionError('JWT', 'verifyAccessToken', notActiveError, startTime);
      throw notActiveError;
    } else {
      const generalError = new Error(`Token verification failed: ${error.message}`);
      logFunctionError('JWT', 'verifyAccessToken', generalError, startTime);
      throw generalError;
    }
  }
};

/**
 * Verify and decode JWT refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = token => {
  try {
    // Ensure required JWT secret is available
    if (!process.env.JWT_REFRESH_SECRET && !process.env.JWT_SECRET) {
      throw new Error('JWT refresh secret environment variable is required');
    }

    // Use separate secret for refresh tokens or fallback to main secret
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    // Verify token signature and decode payload
    const decoded = jwt.verify(token, refreshSecret, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    });

    // Validate token type
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    // Handle different JWT error types
    if (error.message === 'Invalid token type') {
      throw error;
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Refresh token not active yet');
    } else {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null if not found
 */
const extractTokenFromHeader = authHeader => {
  // Check if authorization header exists and has Bearer format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract token part after 'Bearer '
  const token = authHeader.substring(7);

  // Return null if token is empty or just whitespace
  return token.trim() || null;
};

/**
 * Generate both access and refresh tokens for user
 * @param {Object} user - User object with id, email, role
 * @returns {Object} - Object containing both access and refresh tokens
 */
const generateTokenPair = user => {
  try {
    // Create payload with user information
    const payload = {
      id: user._id || user.id,
      _id: user._id || user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    // Generate both tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN
    };
  } catch (error) {
    throw new Error(`Token pair generation failed: ${error.message}`);
  }
};

/**
 * Decode token without verification (for debugging or token inspection)
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload (not verified)
 */
const decodeToken = token => {
  try {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      throw new Error('Invalid token format');
    }
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error(`Token decoding failed: ${error.message}`);
  }
};

// Export all JWT utility functions for use throughout the application
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  generateTokenPair,
  decodeToken,
  JWT_CONFIG
};

/**
 * Future Improvements:
 * - Add token blacklisting for logout functionality
 * - Implement token rotation strategy for enhanced security
 * - Add rate limiting for token generation
 * - Implement token introspection endpoint
 * - Add support for custom token claims
 * - Implement token revocation functionality
 * - Add token usage analytics and logging
 * - Support for different token types (email verification, password reset)
 */
