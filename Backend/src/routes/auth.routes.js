const express = require("express");
const router = express.Router();
const container = require("../config/container");
const authMiddleware = require("../middleware/auth.middleware");
const {
  registerValidation,
  loginValidation,
  validate,
} = require("../validators/auth.validator");

const authController = container.resolve("AuthController");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerValidation, validate, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginValidation, validate, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authMiddleware.authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authMiddleware.authenticate, authController.getProfile);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token
 * @access  Private
 */
router.get("/verify", authMiddleware.authenticate, authController.verifyToken);

module.exports = router;
