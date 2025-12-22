const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Use Gmail SMTP (you can change this to other providers)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD, // App password for Gmail
    },
  });
};

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body (optional)
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async (options) => {
  try {
    // If email credentials are not configured, log to console
    if (!process.env.EMAIL_USER && !process.env.SMTP_USER) {
      console.log('--- EMAIL (NOT CONFIGURED - LOGGING TO CONSOLE) ---');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.text || options.html}`);
      console.log('---------------------------------------------------');
      console.log('⚠️  To enable email sending, set EMAIL_USER and EMAIL_PASSWORD in environment variables');
      return true; // Return true to not break the flow
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"BIMS Platform" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw error - log it but return false
    return false;
  }
};

module.exports = sendEmail;
