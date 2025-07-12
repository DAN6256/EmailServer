const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with SSL configuration fix
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, error: 'Email configuration failed', details: error.message };
  }
};

module.exports = {
  transporter,
  testEmailConfig
};