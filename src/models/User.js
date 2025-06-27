/**
 * Date: 2025-06-25
 * File Purpose: User data model for authentication and user management
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/src/models/User.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition with comprehensive validation and security features
const userSchema = new mongoose.Schema(
  {
    // Primary identifier - must be unique and valid email format
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },

    // Hashed password - will be encrypted before storage
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Don't include password in queries by default for security
    },

    // User's first name for personalization
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },

    // User's last name for full identification
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },

    // Role-based access control - determines user permissions
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    // Email verification status for account security
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    // Track user login activity for security monitoring
    lastLogin: {
      type: Date,
      default: null
    },

    // Account status for administrative control
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    // Add automatic timestamps for audit trail
    timestamps: true,

    // Transform output to remove sensitive data and format response
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index email field for faster lookups and enforce uniqueness
userSchema.index({ email: 1 }, { unique: true });

// Pre-save middleware to hash password before storing in database
userSchema.pre('save', async function (next) {
  // Only hash password if it's been modified (new user or password change)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with cost factor of 12 for strong security
    const salt = await bcrypt.genSalt(12);

    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare provided password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Use bcrypt to compare plain text password with hashed password
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last login timestamp
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save();
};

// Static method to find user by email and include password for authentication
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select('+password');
};

// Virtual field to get full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Export the User model for use in authentication routes and middleware
module.exports = mongoose.model('User', userSchema);

/**
 * Future Improvements:
 * - Add password reset token functionality
 * - Implement email verification token system
 * - Add user profile image support
 * - Add user preferences/settings schema
 * - Implement account lockout after failed login attempts
 * - Add two-factor authentication support
 * - Add password history to prevent reuse
 * - Implement user activity logging
 */
