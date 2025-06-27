/**
 * Date: 2025-06-25
 * File Purpose: Authentication middleware for protecting routes and verifying JWT tokens
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/src/middleware/auth.js
 */

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT tokens and protect routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract authorization header from request
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'MISSING_TOKEN'
      });
    }

    // Extract token from Bearer format
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format. Use Bearer <token>.',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid or expired token.',
        error: 'TOKEN_VERIFICATION_FAILED',
        details: err.message
      });
    }

    // Fetch user from database to ensure user still exists and is active
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Account has been deactivated.',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user information to request object for use in route handlers
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified
    };

    // Attach token information for potential use in route handlers
    req.token = {
      payload: decoded,
      raw: token
    };

    // Continue to next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error: 'AUTHENTICATION_ERROR'
    });
  }
};

/**
 * Authorization middleware to check user roles
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} - Express middleware function
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Authentication required.',
          error: 'AUTHENTICATION_REQUIRED'
        });
      }

      // Check if user role is in allowed roles
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          error: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
      }

      // Continue to next middleware or route handler
      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization.',
        error: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

/**
 * Optional authentication middleware - doesn't block if no token provided
 * Useful for routes that can work for both authenticated and anonymous users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Extract authorization header from request
    const authHeader = req.headers.authorization;

    // If no auth header, continue without authentication
    if (!authHeader) {
      req.user = null;
      return next();
    }

    // Extract token from Bearer format
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify the JWT token
    try {
      const decoded = verifyAccessToken(token);

      // Fetch user from database
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        // Attach user information to request object
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified
        };

        req.token = {
          payload: decoded,
          raw: token
        };
      } else {
        req.user = null;
      }
    } catch {
      // If token verification fails, continue without authentication
      req.user = null;
    }

    next();
  } catch (err) {
    console.error('Optional authentication middleware error:', err);
    // In case of error, continue without authentication
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user's email is verified
 * Should be used after authenticate middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireEmailVerification = (req, res, next) => {
  try {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Check if email is verified
    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Email verification required.',
        error: 'EMAIL_VERIFICATION_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Email verification middleware error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error during email verification check.',
      error: 'EMAIL_VERIFICATION_ERROR'
    });
  }
};

// Export authentication middleware functions for use in routes
module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireEmailVerification
};

/**
 * Future Improvements:
 * - Add IP address tracking for security monitoring
 * - Implement session management for enhanced security
 * - Add brute force protection with temporary account lockout
 * - Implement device tracking and management
 * - Add API rate limiting per user
 * - Implement token refresh logic in middleware
 * - Add user agent tracking for security analysis
 * - Implement geographical access restrictions
 */
