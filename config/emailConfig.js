const axios = require('axios');
require('dotenv').config();

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

const sendEmailJS = async (serviceId, templateId, templateParams) => {
  // SAFETY CHECK
  console.log("DEBUG KEYS:", {
    hasPublicKey: !!process.env.EMAILJS_PUBLIC_KEY,
    hasPrivateKey: !!process.env.EMAILJS_PRIVATE_KEY, // <--- If this is false, that's the error
    privateKeyLength: process.env.EMAILJS_PRIVATE_KEY ? process.env.EMAILJS_PRIVATE_KEY.length : 0
});

  try {
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,      
      accessToken: process.env.EMAILJS_PRIVATE_KEY, 
      template_params: templateParams
    };

    const response = await axios.post(EMAILJS_URL, payload);
    return { success: true, data: response.data };

  } catch (error) {
    // Improved Error Logging
    const errMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('❌ EmailJS API Error:', errMsg);
    return { success: false, error: errMsg };
  }
};

const testEmailConfig = async () => {
  if (!process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
    return { success: false, error: 'Missing EmailJS Keys in .env' };
  }
  return { success: true, message: 'EmailJS configuration is ready' };
};

module.exports = { sendEmailJS, testEmailConfig };