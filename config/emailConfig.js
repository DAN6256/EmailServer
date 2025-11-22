const axios = require('axios');
require('dotenv').config();

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

const sendEmailJS = async (serviceId, templateId, templateParams) => {

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
    
    const errMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('EmailJS API Error:', errMsg);
    return { success: false, error: errMsg };
  }
};



module.exports = { sendEmailJS, testEmailConfig };