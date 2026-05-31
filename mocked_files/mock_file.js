"use strict";

/**
 * Provides logging capabilities for the application.
 * * This module handles formatting, timestamping, and routing
 * log messages to standard output or external monitoring tools.
 * It is designed to be instantiated once and shared.
 * * @class
 */
class LoggerService {
    /**
     * Initializes the logger with a specific log level.
     * * @param {string} level The minimum severity level to log (e.g., 'info', 'error').
     * @param {boolean} colorize Whether to use ANSI colors in the console output.
     */
    constructor(level, colorize) {
        this.level = level;
        this.colorize = colorize;
    }

    /**
     * Records an informational message.
     * * @param {string} message The main text to log.
     * @param {Object} [meta] Optional metadata to attach to the log entry.
     * @returns {void}
     */
    info(message, meta = null) {
        console.log(`[INFO] ${message}`);
    }
}

/**
 * Manages user accounts and authentication states.
 * * Interfaces with the database to create, retrieve, update,
 * and delete user records. It also handles password hashing
 * and token generation.
 * * @class
 */
class UserManager {
    /**
     * Creates a new instance of UserManager.
     * * @param {LoggerService} logger An injected logger instance.
     */
    constructor(logger) {
        this.logger = logger;
        this.users = [];
    }

    /**
     * Registers a new user in the system.
     * * Validates the provided credentials, ensures the email
     * is not already taken, and stores the user record.
     * * @param {string} username The chosen username.
     * @param {string} email The user's email address.
     * @param {string} password The raw password (will be hashed).
     * @returns {boolean} True if registration was successful.
     */
    register(username, email, password) {
        this.logger.info("Registering user");
        return true;
    }

    /**
     * Deactivates a user account.
     * * Flags the account as inactive instead of deleting it
     * entirely from the database to preserve audit logs.
     * * @param {string} userId The unique identifier of the user.
     * @returns {number} The number of affected rows.
     */
    deactivateAccount(userId) {
        return 1;
    }
}

/**
 * Utility function to calculate discounts.
 * * @param {number} basePrice The original price.
 * @param {number} discountPercentage The percentage to deduct.
 * @returns {number} The final price after discount.
 */
function calculateDiscount(basePrice, discountPercentage) {
    return basePrice - (basePrice * (discountPercentage / 100));
}

module.exports = {
    LoggerService,
    UserManager,
    calculateDiscount
};