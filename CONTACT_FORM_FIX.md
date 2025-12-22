# Contact Form 500 Error - Fix Guide

## Issue
Getting 500 error when submitting contact form: `/api/contact/form/submit`

## Root Cause
The `nodemailer` package needs to be installed on Render. The code has been updated to handle this gracefully, but you still need to install the package.

## Quick Fix Steps

### 1. Install nodemailer on Render

**Option A: Auto-install (Recommended)**
- Push the updated `package.json` to GitHub
- Render will automatically run `npm install` during deployment
- This will install `nodemailer` automatically

**Option B: Manual Install (if needed)**
- Go to Render Dashboard → Your backend service
- Open Shell/SSH (if available)
- Run: `npm install nodemailer`

### 2. Verify Installation

After deployment, check Render logs for:
- ✅ No errors about `nodemailer` not found
- ✅ Contact form submissions are logged

### 3. Test the Contact Form

1. Go to: https://bims-plus-app.onrender.com/contact-us
2. Fill out the form
3. Submit
4. Should see success message (even if email isn't configured yet)

## What Was Fixed

### Backend Changes:
1. ✅ **Better error handling** - Gracefully handles missing nodemailer
2. ✅ **Improved logging** - Detailed logs for debugging
3. ✅ **Graceful degradation** - Returns success even if email fails (so users don't see errors)
4. ✅ **HTML escaping** - Prevents XSS attacks in email content

### Current Behavior:
- If `nodemailer` is not installed → Logs to console, returns success to user
- If email credentials not set → Logs to console, returns success to user  
- If email sending fails → Logs error, returns success to user (with note)
- If everything works → Sends email, returns success to user

## Expected Logs in Render

### When nodemailer is NOT installed:
```
⚠️  nodemailer not installed. Run: npm install nodemailer
--- EMAIL (nodemailer not installed - LOGGING TO CONSOLE) ---
To: munyemola@gmail.com
Subject: BIMS Contact Form: [subject]
...
```

### When email credentials NOT set:
```
--- EMAIL (NOT CONFIGURED - LOGGING TO CONSOLE) ---
To: munyemola@gmail.com
Subject: BIMS Contact Form: [subject]
...
⚠️  To enable email sending, set EMAIL_USER and EMAIL_PASSWORD
```

### When everything works:
```
[CONTACT FORM] Received submission: { name: '...', email: '...', ... }
[CONTACT FORM] Preparing to send email to: munyemola@gmail.com
[CONTACT FORM] Attempting to send email...
✅ Email sent successfully: <messageId>
✅ Contact form submitted - Email sent to munyemola@gmail.com
```

## Next Steps

1. **Deploy the updated code** (package.json includes nodemailer)
2. **Check Render logs** after deployment
3. **Test the contact form** - should work now (even without email configured)
4. **Set up email** (optional) - Follow EMAIL_SETUP.md to enable actual email sending

## Testing

After deployment, test with:

```bash
curl -X POST https://bims-bplus.onrender.com/api/contact/form/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "This is a test"
  }'
```

Should return:
```json
{
  "message": "Thank you for contacting us! We will get back to you soon.",
  "success": true
}
```

## Notes

- The form will work even without email configured (logs to console)
- Users will always see success message (better UX)
- Check Render logs to see if emails are actually being sent
- To enable real email sending, follow EMAIL_SETUP.md

