const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const APPError = require('./appError');
dotenv.config();

const sendEmail = async (options) => {

    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    // Define the email options
    const mailOptions = {
        from: 'Naveen Pallagani <navi777@gmail.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Send the email
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return new APPError('There was an error sending the email. Please try again later.', 500);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
    
}

module.exports = sendEmail;