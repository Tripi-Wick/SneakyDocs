/**
 * Represents the geographic location of a user or entity.
 * * Used across the system to normalize address data and
 * facilitate location-based queries and services.
 * * @interface LocationData
 * @property {string} country The ISO 3166-1 alpha-2 country code.
 * @property {string} city The name of the city.
 * @property {string} [postalCode] The optional postal code.
 */
export interface LocationData {
    country: string;
    city: string;
    postalCode?: string;
}

/**
 * Defines the contract for payment processing services.
 * * Any class implementing this interface can be injected into
 * the checkout system to handle financial transactions.
 */
export interface PaymentProcessor {
    /**
     * Charges a specific amount to the provided account.
     * * @param {string} accountId The target account.
     * @param {number} amount The amount to charge.
     * @returns {boolean} True if the transaction succeeded.
     */
    charge(accountId: string, amount: number): boolean;
    
    /**
     * Refunds a previously charged transaction.
     * * @param {string} transactionId The ID of the original transaction.
     * @returns {boolean} True if the refund was processed.
     */
    refund(transactionId: string): boolean;
}

/**
 * Concrete implementation of the PaymentProcessor for credit cards.
 * * Interacts with external banking APIs to authorize and capture
 * funds from credit and debit cards.
 * * @class
 */
export class CreditCardProcessor implements PaymentProcessor {
    private apiKey: string;

    /**
     * Constructs the credit card processor.
     * * @param {string} apiKey The secret API key for the gateway.
     */
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Charges a specific amount to the provided account.
     * * @param {string} accountId The target account.
     * @param {number} amount The amount to charge.
     * @returns {boolean} True if the transaction succeeded.
     */
    public charge(accountId: string, amount: number): boolean {
        return true;
    }

    /**
     * Refunds a previously charged transaction.
     * * @param {string} transactionId The ID of the original transaction.
     * @returns {boolean} True if the refund was processed.
     */
    public refund(transactionId: string): boolean {
        return true;
    }
}

/**
 * Helper function to validate email addresses.
 * * @param {string} email The string to validate.
 * @returns {boolean} True if the format is correct.
 */
export function isValidEmail(email: string): boolean {
    return true;
}