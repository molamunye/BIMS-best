// Load environment variables first
require('dotenv').config();

// This service requires the 'axios' package.
// Please run 'npm install axios' in the backend directory.
const axios = require("axios");
const CHAPA_API_URL = "https://api.chapa.co/v1";
// Prefer explicit secret key. Set these in your .env:
// CHAPA_SECRET_KEY (server-side secret)
const CHAPA_SECRET_KEY =
  process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_KEY;
const CHAPA_ENCRYPTION_KEY =
  process.env.CHAPA_ENCRYPTION_KEY || process.env.CHAPA_ENC_KEY;
// Validate that the API key is set
if (!CHAPA_SECRET_KEY || CHAPA_SECRET_KEY.trim() === "") {
  console.error("ERROR: CHAPA_SECRET_KEY is not set in environment variables.");
  console.error(
    "Please set CHAPA_SECRET_KEY or CHAPA_API_KEY in your .env file."
  );
}
const chapaAPI = axios.create({
  baseURL: CHAPA_API_URL,
  headers: {
    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});
/**
 * Initiates a payment with Chapa.
 * @param {number} amount - The amount to be paid.
 * @param {string} currency - The currency of the payment (e.g., 'ETB').
 * @param {string} email - The email of the customer.
 * @param {string} first_name - The first name of the customer.
 * @param {string} last_name - The last name of the customer.
 * @param {string} tx_ref - A unique transaction reference.
 * @param {string} callback_url - The URL to redirect to after payment.
 * @param {string} return_url - The URL to return to after payment.
 * @returns {Promise<object>} The response from the Chapa API.
 */
const initializePayment = async ({
  amount,
  currency,
  email,
  first_name,
  last_name,
  tx_ref,
  callback_url,
  return_url,
}) => {
  // Validate API key before making request
  if (!CHAPA_SECRET_KEY || CHAPA_SECRET_KEY.trim() === "") {
    throw new Error(
      "CHAPA_SECRET_KEY is not configured. Please set CHAPA_SECRET_KEY or CHAPA_API_KEY in your .env file."
    );
  }
  try {
    const response = await chapaAPI.post("/transaction/initialize", {
      amount,
      currency,
      email,
      first_name,
      last_name,
      tx_ref,
      callback_url, // Chapa will post transaction status to this URL
      return_url,
    });
    // Chapa's response shape is { status, message, data: { checkout_url, ... } }
    // Return the full response object to maintain consistency with controllers
    return response.data;
  } catch (error) {
    console.error(
      "Chapa Initialization Error:",
      error.response ? error.response.data : error.message
    );
    // Check if it's an authentication error
    if (error.response && error.response.status === 401) {
      throw new Error(
        "Invalid Chapa API Key. Please verify your CHAPA_SECRET_KEY in the .env file."
      );
    }
    // Propagate useful error details
    const errMsg =
      error.response && error.response.data
        ? JSON.stringify(error.response.data)
        : error.message;
    throw new Error(`Failed to initialize Chapa payment: ${errMsg}`);
  }
};
/**
 * Verifies a payment with Chapa.
 * @param {string} tx_ref - The transaction reference to verify.
 * @returns {Promise<object>} The response from the Chapa API.
 */
const verifyChapaTransaction = async (tx_ref) => {
  // Validate API key before making request
  if (!CHAPA_SECRET_KEY || CHAPA_SECRET_KEY.trim() === "") {
    throw new Error(
      "CHAPA_SECRET_KEY is not configured. Please set CHAPA_SECRET_KEY or CHAPA_API_KEY in your .env file."
    );
  }
  try {
    const response = await chapaAPI.get(`/transaction/verify/${tx_ref}`);
    return response.data;
  } catch (error) {
    console.error(
      "Chapa Verification Error:",
      error.response ? error.response.data : error.message
    );
    // Check if it's an authentication error
    if (error.response && error.response.status === 401) {
      throw new Error(
        "Invalid Chapa API Key. Please verify your CHAPA_SECRET_KEY in the .env file."
      );
    }
    throw new Error("Failed to verify Chapa payment.");
  }
};
/**
 * Extracts and formats user details for a Chapa payment.
 * @param {object} user - The user object from req.user.
 * @returns {object} Formatted user details for Chapa.
 */
const getChapaPaymentDetails = (user) => {
  const email = user?.email || "test@example.com";
  const fullName = user?.fullName || "Test User";
  const firstName = fullName.split(" ")[0] || "Client";
  const lastName = fullName.split(" ").slice(1).join(" ") || "User";
  return {
    email,
    first_name: firstName,
    last_name: lastName,
    currency: "ETB", // Standard currency
  };
};
// Alias for backward compatibility
const verifyPayment = verifyChapaTransaction;
module.exports = {
  initializePayment,
  verifyChapaTransaction,
  verifyPayment, // Alias
  getChapaPaymentDetails,
};