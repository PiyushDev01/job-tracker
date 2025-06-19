/**
 * Utility functions for currency conversion
 */

// Exchange rate: approximately 83 INR (as of June 2025)
const USD_TO_INR_RATE = 83;

/**
 * Converts an amount to INR
 * @param {string|number} amount - The amount to convert, can be a string like "50,000" or a number
 * @returns {string} The formatted INR amount
 */
export const convertUSDtoINR = (amount) => {
  if (!amount) return '';
  
  // Extract the numeric value from the amount string
  // Remove currency symbols, commas, and other non-numeric characters except decimal point
  const numericValue = String(amount).replace(/[^0-9.]/g, '');
  
  // Convert to number
  const value = parseFloat(numericValue);
  
  // Check if it's a valid number
  if (isNaN(value)) return '';
  
  // Convert to INR
  const inrValue = value * USD_TO_INR_RATE;
  
  // Format as INR currency with comma separators for Indian numbering system
  // (e.g., 1,00,000 instead of 100,000)
  return formatToIndianCurrency(inrValue);
};

/**
 * Formats a number to Indian currency format (e.g., ₹1,00,000)
 * @param {number} amount - The amount to format
 * @returns {string} The formatted amount
 */
export const formatToIndianCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
};
