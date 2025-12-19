const sendEmail = async (options) => {
    // In a real application, you would use nodemailer or a service like SendGrid
    // For now, we'll log the email content to the console
    console.log('--- EMAIL SENT ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('------------------');

    // Return true to simulate success
    return true;
};

module.exports = sendEmail;
