import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('country').notEmpty().withMessage('Country is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];
