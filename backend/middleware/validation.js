/**
 * Data Validation Module
 * Implements comprehensive input validation to prevent injection attacks and data corruption
 */

const validator = require('validator');

/**
 * Validation schemas for different entities
 */
const validationSchemas = {
  user: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'Username must be 3-50 characters, alphanumeric with _ and -'
    },
    password: {
      required: true,
      minLength: 12,
      maxLength: 100,
      strength: 'medium', // Requires uppercase, lowercase, number, special char
      message: 'Password must be 12+ characters with uppercase, lowercase, number, and special character'
    },
    email: {
      required: false,
      type: 'email',
      maxLength: 255,
      message: 'Must be a valid email address'
    },
    phone: {
      required: false,
      pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      message: 'Must be a valid phone number'
    },
    role: {
      required: true,
      enum: ['admin', 'officer', 'supervisor'],
      message: 'Role must be admin, officer, or supervisor'
    },
    status: {
      required: false,
      enum: ['active', 'inactive', 'suspended'],
      message: 'Status must be active, inactive, or suspended'
    }
  },

  case: {
    caseNumber: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[A-Z0-9-]+$/,
      message: 'Case number must be alphanumeric with hyphens'
    },
    caseType: {
      required: true,
      minLength: 3,
      maxLength: 100,
      message: 'Case type required (3-100 characters)'
    },
    victimName: {
      required: true,
      minLength: 2,
      maxLength: 255,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Victim name must contain only letters, spaces, hyphens, and apostrophes'
    },
    location: {
      required: true,
      minLength: 3,
      maxLength: 500,
      message: 'Location required (3-500 characters)'
    },
    department: {
      required: true,
      enum: ['CID', 'Traffic', 'Patrol', 'Narcotics', 'Homicide', 'Other'],
      message: 'Invalid department'
    },
    priority: {
      required: false,
      enum: ['low', 'normal', 'high', 'critical'],
      message: 'Priority must be low, normal, high, or critical'
    },
    status: {
      required: false,
      enum: ['open', 'closed', 'pending', 'suspended', 'assigned', 'in-progress', 'awaiting-review'],
      message: 'Invalid case status'
    }
  },

  suspect: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'First name must contain only letters, spaces, hyphens, and apostrophes'
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Last name must contain only letters, spaces, hyphens, and apostrophes'
    },
    dateOfBirth: {
      required: false,
      type: 'date',
      message: 'Must be a valid date'
    },
    nationalId: {
      required: false,
      minLength: 5,
      maxLength: 50,
      pattern: /^[A-Z0-9-]+$/,
      message: 'National ID must be alphanumeric'
    },
    phone: {
      required: false,
      pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      message: 'Must be a valid phone number'
    }
  },

  document: {
    fileName: {
      required: true,
      minLength: 3,
      maxLength: 255,
      pattern: /^[a-zA-Z0-9._\-() ]+$/,
      message: 'File name contains invalid characters'
    },
    fileSize: {
      required: true,
      max: 52428800, // 50MB
      message: 'File size must not exceed 50MB'
    },
    fileType: {
      required: true,
      enum: ['pdf', 'doc', 'docx', 'xlsx', 'jpg', 'png', 'txt'],
      message: 'File type not allowed'
    }
  }
};

/**
 * Validate a field against a schema
 */
const validateField = (value, fieldSchema, fieldName) => {
  const errors = [];

  // Check if required
  if (fieldSchema.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push(`${fieldName} is required`);
    return errors;
  }

  if (!value) {
    return errors; // Field not required and empty
  }

  // Check type
  if (fieldSchema.type === 'email') {
    if (!validator.isEmail(value)) {
      errors.push(`${fieldName}: ${fieldSchema.message}`);
    }
  }

  if (fieldSchema.type === 'date') {
    if (!validator.isISO8601(value)) {
      errors.push(`${fieldName}: ${fieldSchema.message}`);
    }
  }

  // Check length
  if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
    errors.push(`${fieldName} must be at least ${fieldSchema.minLength} characters`);
  }

  if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
    errors.push(`${fieldName} must not exceed ${fieldSchema.maxLength} characters`);
  }

  // Check pattern
  if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
    errors.push(`${fieldName}: ${fieldSchema.message}`);
  }

  // Check enum
  if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
    errors.push(`${fieldName}: ${fieldSchema.message}`);
  }

  // Check password strength
  if (fieldSchema.strength) {
    const strengthErrors = validatePasswordStrength(value, fieldSchema.strength);
    errors.push(...strengthErrors);
  }

  // Check numeric max
  if (fieldSchema.max && value > fieldSchema.max) {
    errors.push(`${fieldName} must not exceed ${fieldSchema.max}`);
  }

  return errors;
};

/**
 * Validate password strength
 */
const validatePasswordStrength = (password, requiredStrength) => {
  const errors = [];
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase) {
    errors.push('Password must contain uppercase letters');
  }
  if (!hasLowercase) {
    errors.push('Password must contain lowercase letters');
  }
  if (!hasNumber) {
    errors.push('Password must contain numbers');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain special characters');
  }

  return errors;
};

/**
 * Validate object against schema
 */
const validateObject = (data, schema) => {
  const errors = [];
  
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const fieldErrors = validateField(data[fieldName], fieldSchema, fieldName);
    errors.push(...fieldErrors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize input to prevent XSS attacks
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input).trim();
  }
  return input;
};

/**
 * Sanitize object
 */
const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Middleware to validate request body
 */
const validateRequestBody = (schema) => {
  return (req, res, next) => {
    // Sanitize input
    req.body = sanitizeObject(req.body);

    // Validate
    const validation = validateObject(req.body, schema);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: validation.errors
      });
    }

    next();
  };
};

module.exports = {
  validationSchemas,
  validateField,
  validateObject,
  validatePasswordStrength,
  sanitizeInput,
  sanitizeObject,
  validateRequestBody
};
