# Email Setup Guide for Contact Form

## Overview
The contact form now sends emails directly to your email address (munyemola@gmail.com) when users submit the form.

## Setup Instructions

### 1. Install Dependencies
The `nodemailer` package has been added to `package.json`. After pulling the changes, run:

```bash
cd backend
npm install
```

### 2. Configure Gmail App Password

Since you're using Gmail (munyemola@gmail.com), you need to create an App Password:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "BIMS Contact Form" as the name
   - Click "Generate"
   - **Copy the 16-character password** (you'll need this)

### 3. Add Environment Variables to Render

Go to your Render dashboard → Backend service → Environment, and add:

```env
EMAIL_USER=munyemola@gmail.com
EMAIL_PASSWORD=your-16-character-app-password-here
CONTACT_EMAIL=munyemola@gmail.com
```

**Important:**
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: The 16-character app password from step 2 (NOT your regular Gmail password)
- `CONTACT_EMAIL`: Where contact form emails should be sent (can be different from EMAIL_USER)

### 4. Alternative: Use Other Email Providers

If you prefer not to use Gmail, you can configure other SMTP providers. Update `backend/utils/emailService.js`:

**For Outlook/Hotmail:**
```javascript
return nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

**For Custom SMTP:**
```javascript
return nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
```

## Testing

### Test the Contact Form

1. Deploy the backend with the new environment variables
2. Go to: https://bims-plus-app.onrender.com/contact-us
3. Fill out and submit the form
4. Check your email (munyemola@gmail.com) for the message

### Test via API

You can also test directly:

```bash
curl -X POST https://bims-bplus.onrender.com/api/contact/form/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message from the contact form."
  }'
```

## Email Format

When someone submits the contact form, you'll receive an email with:

- **Subject:** `BIMS Contact Form: [User's Subject]`
- **From:** BIMS Platform (your configured email)
- **To:** munyemola@gmail.com (or CONTACT_EMAIL)
- **Content:**
  - Name
  - Email (clickable to reply)
  - Subject
  - Message body

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables:**
   - Verify EMAIL_USER and EMAIL_PASSWORD are set in Render
   - Make sure you're using the App Password, not your regular password

2. **Check Render Logs:**
   - Go to Render Dashboard → Your service → Logs
   - Look for email-related errors
   - You should see: `✅ Email sent successfully: [messageId]`

3. **Common Issues:**
   - **"Invalid login"**: Wrong password or not using App Password
   - **"Connection timeout"**: SMTP server issues (try again later)
   - **"Authentication failed"**: Check 2-Step Verification is enabled

### Fallback Behavior

If email credentials are not configured, the system will:
- Log the email content to console (for development)
- Still return success to the user (to not break the flow)
- Show a warning in logs: `⚠️ To enable email sending, set EMAIL_USER and EMAIL_PASSWORD`

## Security Notes

- **Never commit** email passwords to Git
- Use App Passwords, not your main Gmail password
- App Passwords can be revoked and regenerated if compromised
- Consider using environment-specific email addresses for production

## Contact Information Updated

The following have been updated with your real contact info:
- ✅ Footer component: +251 924 548 557, munyemola@gmail.com
- ✅ Contact Us page: +251 924 548 557, munyemola@gmail.com
- ✅ All links are clickable (tel: and mailto:)

## Next Steps

1. ✅ Install nodemailer: `npm install` in backend
2. ✅ Set up Gmail App Password
3. ✅ Add environment variables to Render
4. ✅ Deploy backend
5. ✅ Test contact form submission
6. ✅ Verify emails are received

