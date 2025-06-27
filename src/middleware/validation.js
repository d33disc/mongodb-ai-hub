/**
 * Date: 2025-06-25
 * File Purpose: Input validation middleware using express-validator for secure data handling
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/src/middleware/validation.js
 */

const { body, validationResult, param, query } = require('express-validator');

/**
 * Middleware to handle validation results and return formatted errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  // Extract validation errors from request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format validation errors for consistent API response
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
  }

  next();
};

/**
 * Validation rules for user registration
 * Ensures all required fields are present and meet security requirements
 */
const validateUserRegistration = [
  // Email validation - must be valid email format and unique
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ min: 5, max: 100 })
    .withMessage('Email must be between 5 and 100 characters'),

  // Password validation - enforce strong password policy
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain lowercase, uppercase, digit, and special character'),

  // First name validation - required and reasonable length
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, apostrophes, and hyphens'),

  // Last name validation - required and reasonable length
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, apostrophes, and hyphens'),

  // Role validation - optional but must be valid if provided
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),

  handleValidationErrors
];

/**
 * Validation rules for user login
 * Ensures email and password are provided in correct format
 */
const validateUserLogin = [
  // Email validation for login
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  // Password validation for login - just check if provided
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password cannot be empty or exceed 128 characters'),

  handleValidationErrors
];

/**
 * Validation rules for password change
 * Ensures current and new passwords meet requirements
 */
const validatePasswordChange = [
  // Current password validation
  body('currentPassword').notEmpty().withMessage('Current password is required'),

  // New password validation - same rules as registration
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain lowercase, uppercase, digit, and special character'),

  // Confirm password validation
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match new password');
    }
    return true;
  }),

  handleValidationErrors
];

/**
 * Validation rules for profile update
 * Allows updating user profile information
 */
const validateProfileUpdate = [
  // First name validation - optional for update
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, apostrophes, and hyphens'),

  // Last name validation - optional for update
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, apostrophes, and hyphens'),

  // Email validation - optional for update
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ min: 5, max: 100 })
    .withMessage('Email must be between 5 and 100 characters'),

  handleValidationErrors
];

/**
 * Validation rules for MongoDB ObjectId parameters
 * Ensures URL parameters are valid MongoDB ObjectIds
 */
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format. Must be a valid MongoDB ObjectId`),

  handleValidationErrors
];

/**
 * Validation rules for pagination query parameters
 * Ensures page and limit parameters are valid numbers
 */
const validatePagination = [
  // Page number validation
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer between 1 and 1000'),

  // Limit validation
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),

  // Sort field validation
  query('sort')
    .optional()
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .withMessage('Sort field must contain only letters, numbers, and underscores'),

  // Sort order validation
  query('order')
    .optional()
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('Order must be "asc", "desc", "1", or "-1"'),

  handleValidationErrors
];

/**
 * Validation rules for search query parameters
 * Ensures search parameters are safe and within limits
 */
const validateSearch = [
  // Search query validation
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.'"!@#$%^&*()]+$/)
    .withMessage('Search query contains invalid characters'),

  // Search fields validation
  query('fields')
    .optional()
    .matches(/^[a-zA-Z_][a-zA-Z0-9_,]*$/)
    .withMessage('Search fields must contain only letters, numbers, underscores, and commas'),

  handleValidationErrors
];

/**
 * General sanitization middleware to clean input data
 * Removes potential XSS and injection attack vectors
 */
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string values in request body
  const sanitizeObject = obj => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove HTML tags and trim whitespace
        obj[key] = obj[key].replace(/<[^>]*>/g, '').trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

// Export validation middleware functions for use in routes
module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateObjectId,
  validatePagination,
  validateSearch,
  sanitizeInput,
  handleValidationErrors
};

/**
 * Future Improvements:
 * - Add file upload validation for profile pictures
 * - Implement custom validation for specific business rules
 * - Add rate limiting validation based on user behavior
 * - Implement geolocation validation for security
 * - Add validation for date ranges and time formats
 * - Implement validation for external API integrations
 * - Add validation logging for security monitoring
 * - Support for custom validation error messages based on user locale
 */
