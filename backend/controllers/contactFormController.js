// controllers/contactFormController.js
const sendEmail = require('../utils/emailService');

// @desc    Handle contact form submission
// @route   POST /api/contact-form/submit
// @access  Public
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          name: !name,
          email: !email,
          subject: !subject,
          message: !message
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Recipient email (your email)
    const recipientEmail = process.env.CONTACT_EMAIL || 'munyemola@gmail.com';

    // Create email content
    const emailSubject = `BIMS Contact Form: ${subject}`;
    const emailText = `
New contact form submission from BIMS website:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the BIMS contact form.
Reply directly to: ${email}
    `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>This message was sent from the BIMS contact form.</p>
          <p>Reply directly to: <a href="mailto:${email}">${email}</a></p>
        </div>
      </div>
    `;

    // Send email
    const emailSent = await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    if (emailSent) {
      console.log(`✅ Contact form submitted - Email sent to ${recipientEmail}`);
      res.status(200).json({ 
        message: 'Thank you for contacting us! We will get back to you soon.',
        success: true 
      });
    } else {
      // Email failed but don't expose error to user
      console.error('❌ Failed to send contact form email');
      res.status(500).json({ 
        message: 'There was an error sending your message. Please try again later or contact us directly.',
        success: false 
      });
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ 
      message: 'An error occurred. Please try again later.',
      success: false 
    });
  }
};

module.exports = { submitContactForm };

