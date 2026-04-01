require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegisrationEmail(userEmail, name) {
    const subject = "welcome to backend ledger";
    const text = `hello ${name},\nthank you for registering at backend ledger`;
    const html = `<p>hello ${name},</p><p>Thank you for registering at backend ledger</p>`;
    
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, toAccount, amount, type) {
    const subject = "Transaction Successful - Backend Ledger";

    const text = `Hello ${name},
Your transaction was successful.

Type: ${type}
Amount: ₹${amount}
To Account: ${toAccount}

Thank you for using Backend Ledger.`;

    const html = `
        <p>Hello ${name},</p>
        <p>Your transaction was successful.</p>
        <ul>
            <li><b>Type:</b> ${type}</li>
            <li><b>Amount:</b> ₹${amount}</li>
            <li><b>To Account:</b> ${toAccount}</li>
        </ul>
        <p>Thank you for using Backend Ledger.</p>
    `;

    await sendEmail(userEmail, subject, text, html);
}
module.exports = {
  sendEmail,
  sendRegisrationEmail,
  sendTransactionEmail
};