// utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com', // Replace with your provider's SMTP server
        port: 465, // Port may vary depending on your provider
        secure: true, // Use true for TLS, false for non-TLS (consult your provider)
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define email options
    const { to, subject, html } = options
    const mailOptions = {
        from: `${process.env.COMPANY_NAME} <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        html
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;