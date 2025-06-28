/**
 * Test Authentication Routes - Without Rate Limiting
 * Standardized response format for testing
 */

const express = require('express');
const User = require('../src/models/User');
const { generateTokenPair } = require('../src/utils/jwt');
const { authenticate } = require('../src/middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateProfileUpdate,
  sanitizeInput
} = require('../src/middleware/validation');

const router = express.Router();

// Register route (without rate limiting for tests)
router.post('/register', 
  sanitizeInput,
  validateUserRegistration,
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, role = 'user' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
          error: 'USER_ALREADY_EXISTS'
        });
      }

      // Create new user
      const newUser = new User({
        email,
        password,
        firstName,
        lastName,
        role: role === 'admin' ? 'user' : role
      });

      const savedUser = await newUser.save();

      // Generate tokens
      const tokens = generateTokenPair(savedUser);
      const userData = savedUser.toJSON();
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userData,
          tokens
        }
      });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
          error: 'DUPLICATE_EMAIL'
        });
      }

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
        message: 'Internal server error during registration',
        error: 'INTERNAL_ERROR'
      });
    }
  }
);

// Login route (without rate limiting for tests)
router.post('/login',
  sanitizeInput,
  validateUserLogin,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user with password included for authentication
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
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

      // Update last login
      await user.updateLastLogin();

      // Generate tokens
      const tokens = generateTokenPair(user);
      const userData = user.toJSON();

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          tokens
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
        error: 'INTERNAL_ERROR'
      });
    }
  }
);

// Profile route
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Profile update route
router.put('/profile', 
  authenticate,
  sanitizeInput,
  validateProfileUpdate,
  async (req, res) => {
    try {
      const { firstName, lastName } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      // Update user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      const updatedUser = await user.save();
      const userData = updatedUser.toJSON();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: userData
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during profile update',
        error: 'INTERNAL_ERROR'
      });
    }
  }
);

// Token verification route
router.get('/verify', authenticate, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        valid: true,
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;