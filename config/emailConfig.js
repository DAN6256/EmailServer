const axios = require('axios');
require('dotenv').config();

// EmailJS API Endpoint
const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

/**
 * Sends an email via EmailJS REST API
 * @param {string} serviceId - Your EmailJS Service ID
 * @param {string} templateId - Your EmailJS Template ID
 * @param {object} templateParams - The variables defined in your template
 */
const sendEmailJS = async (serviceId, templateId, templateParams) => {
  try {
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,      // From .env
      accessToken: process.env.EMAILJS_PRIVATE_KEY, // From .env (CRITICAL for backend)
      template_params: templateParams
    };

    // Send POST request to EmailJS
    const response = await axios.post(EMAILJS_URL, payload);
    return { success: true, data: response.data };

  } catch (error) {
    console.error('EmailJS Error:', error.response ? error.response.data : error.message);
    return { 
      success: false, 
      error: error.response ? error.response.data : error.message 
    };
  }
};

// Simple test function to check if keys exist
const testEmailConfig = async () => {
  if (!process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
    return { success: false, error: 'Missing EmailJS Public or Private keys in .env' };
  }
  return { success: true, message: 'EmailJS configuration is ready' };
};

module.exports = {
  sendEmailJS,
  testEmailConfig
};