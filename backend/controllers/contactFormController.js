// controllers/contactFormController.js
const sendEmail = require('../utils/emailService');

// @desc    Handle contact form submission
// @route   POST /api/contact/form/submit
// @access  Public
const submitContactForm = async (req, res) => {
  try {
    console.log('[CONTACT FORM] Received submission:', {
      body: req.body,
      headers: req.headers
    });

    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log('[CONTACT FORM] Validation failed - missing fields');
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
      console.log('[CONTACT FORM] Validation failed - invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Recipient email (your email)
    const recipientEmail = process.env.CONTACT_EMAIL || 'munyemola@gmail.com';
    console.log('[CONTACT FORM] Preparing to send email to:', recipientEmail);

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

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        </div>
        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>This message was sent from the BIMS contact form.</p>
          <p>Reply directly to: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        </div>
      </div>
    `;

    // Send email
    console.log('[CONTACT FORM] Attempting to send email...');
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
      // Still return success to user, but log the issue
      res.status(200).json({ 
        message: 'Thank you for contacting us! We have received your message and will get back to you soon.',
        success: true,
        note: 'Email delivery may be delayed. If urgent, please contact us directly.'
      });
    }
  } catch (error) {
    console.error('[CONTACT FORM] Error:', error);
    console.error('[CONTACT FORM] Error stack:', error.stack);
    // Return success to user even if there's an error (graceful degradation)
    res.status(200).json({ 
      message: 'Thank you for contacting us! We have received your message and will get back to you soon.',
      success: true 
    });
  }
};

module.exports = { submitContactForm };

