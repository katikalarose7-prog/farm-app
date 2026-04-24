// farm-backend/testEmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('📧 Testing email...');
  console.log('Using:', process.env.EMAIL_USER);
  console.log('Pass set:', !!process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  try {
    // Verify connection first
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Send test email
    const info = await transporter.sendMail({
      from:    `"Tully Farm 🌾" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_USER,
      subject: '✅ Test Email from Tully Farm',
      html:    '<h1>🌾 Email is working!</h1><p>Your farm email is set up correctly.</p>'
    });

    console.log('✅ Email sent! Message ID:', info.messageId);

  } catch (error) {
    console.log('❌ Email error:', error.message);
    console.log('Full error:', error);
  }
}

testEmail();