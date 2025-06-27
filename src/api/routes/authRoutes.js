/**
 * Date: 2025-06-25
 * File Purpose: Authentication routes for user registration, login, and account management
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/src/api/routes/authRoutes.js
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../../models/User');
const { generateTokenPair } = require('../../utils/jwt');
const { authenticate, authorize } = require('../../middleware/auth');
const { createModuleLogger, logFunctionEntry, logFunctionExit, logFunctionError } = require('../../utils/logger');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateProfileUpdate,
  sanitizeInput
} = require('../../middleware/validation');

const router = express.Router();

// Create module-specific logger
const logger = createModuleLogger('AUTH_ROUTES');

// Rate limiting configuration for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Less restrictive rate limiting for general auth operations
const generalAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Higher limit for less sensitive operations
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 * @body    { email, password, firstName, lastName, role? }
 */
router.post('/register', 
  authRateLimit,
  sanitizeInput,
  validateUserRegistration,
  async (req, res) => {
    const startTime = Date.now();
    logFunctionEntry('AUTH_ROUTES', 'register', { 
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      firstName: req.body?.firstName,
      lastName: req.body?.lastName
    });

    try {
      const { email, password, firstName, lastName, role = 'user' } = req.body;

      logger.debug('Starting user registration', {
        email,
        firstName,
        lastName,
        role,
        hasPassword: !!password
      });

      // Check if user already exists with this email
      logger.debug('Checking for existing user');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.warn('Registration attempt with existing email', { email });
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
          error: 'USER_ALREADY_EXISTS'
        });
      }

      // Create new user instance
      logger.debug('Creating new user instance');
      const newUser = new User({
        email,
        password, // Will be hashed by the pre-save middleware
        firstName,
        lastName,
        role: role === 'admin' ? 'user' : role // Prevent admin creation via registration
      });

      // Save user to database
      logger.debug('Saving user to database');
      const savedUser = await newUser.save();
      logger.info('User saved successfully', { userId: savedUser._id, email: savedUser.email });

      // Generate JWT tokens for immediate login
      logger.debug('Generating JWT tokens');
      const tokens = generateTokenPair(savedUser);
      logger.debug('Tokens generated', {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        tokenType: tokens.tokenType
      });

      // Prepare user data for response (password excluded by toJSON transform)
      const userData = savedUser.toJSON();
      logger.debug('User data prepared for response', {
        userDataKeys: Object.keys(userData),
        hasPassword: 'password' in userData
      });

      const responseData = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: userData,
          tokens
        }
      };

      logger.info('Registration successful', {
        userId: savedUser._id,
        email: savedUser.email,
        responseStructure: Object.keys(responseData),
        dataStructure: Object.keys(responseData.data),
        userStructure: Object.keys(responseData.data.user),
        tokensStructure: Object.keys(responseData.data.tokens)
      });

      logFunctionExit('AUTH_ROUTES', 'register', 'REGISTRATION_SUCCESS', startTime);
      res.status(201).json(responseData);
    } catch (error) {
      logger.error('User registration failed', {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        email: req.body?.email
      });
      logFunctionError('AUTH_ROUTES', 'register', error, startTime);

      // Handle duplicate key error (email already exists)
      if (error.code === 11000) {
        logger.warn('Duplicate email registration attempt', { email: req.body?.email });
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
          error: 'DUPLICATE_EMAIL'
        });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));

        logger.warn('Registration validation failed', { 
          validationErrors,
          email: req.body?.email
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          errors: validationErrors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        error: 'REGISTRATION_ERROR'
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 * @body    { email, password }
 */
router.post('/login',
  authRateLimit,
  sanitizeInput,
  validateUserLogin,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email and include password for comparison
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated',
          error: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Update last login timestamp
      await user.updateLastLogin();

      // Generate JWT tokens
      const tokens = generateTokenPair(user);

      // Prepare user data for response
      const userData = user.toJSON();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          tokens
        }
      });
    } catch (error) {
      console.error('User login error:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
        error: 'LOGIN_ERROR'
      });
    }
  }
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user's profile information
 * @access  Private
 */
router.get('/profile',
  generalAuthRateLimit,
  authenticate,
  async (req, res) => {
    try {
      // Fetch fresh user data from database
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Profile retrieval error:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving profile',
        error: 'PROFILE_ERROR'
      });
    }
  }
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user's profile information
 * @access  Private
 * @body    { firstName?, lastName?, email? }
 */
router.put('/profile',
  generalAuthRateLimit,
  authenticate,
  sanitizeInput,
  validateProfileUpdate,
  async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      const userId = req.user.id;

      // If email is being updated, check for conflicts
      if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use by another account',
            error: 'EMAIL_CONFLICT'
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) {
        updateData.email = email;
        updateData.isEmailVerified = false; // Reset verification if email changes
      }

      // Update user in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.toJSON()
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          errors: validationErrors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while updating profile',
        error: 'PROFILE_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user's password
 * @access  Private
 * @body    { currentPassword, newPassword, confirmPassword }
 */
router.put('/change-password',
  authRateLimit,
  authenticate,
  sanitizeInput,
  validatePasswordChange,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password for verification
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
          error: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Update password (will be hashed by pre-save middleware)
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error while changing password',
        error: 'PASSWORD_CHANGE_ERROR'
      });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout',
  authenticate,
  async (req, res) => {
    try {
      // In a JWT-based system, logout is primarily handled client-side
      // by removing the token from storage. This endpoint serves as a 
      // confirmation and could be extended for token blacklisting.
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error during logout',
        error: 'LOGOUT_ERROR'
      });
    }
  }
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token validity
 * @access  Private
 */
router.get('/verify',
  authenticate,
  async (req, res) => {
    try {
      // If we reach here, the token is valid (authenticate middleware passed)
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user,
          tokenInfo: {
            issuedAt: req.token.payload.iat,
            expiresAt: req.token.payload.exp
          }
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error during token verification',
        error: 'TOKEN_VERIFICATION_ERROR'
      });
    }
  }
);

// Export the authentication router for use in main server
module.exports = router;

/**
 * Future Improvements:
 * - Add email verification functionality
 * - Implement password reset via email
 * - Add refresh token rotation
 * - Implement account lockout after failed attempts
 * - Add social media authentication (OAuth)
 * - Implement two-factor authentication
 * - Add user activity tracking
 * - Implement token blacklisting for logout
 * - Add user role management endpoints
 * - Implement account deletion functionality
 */