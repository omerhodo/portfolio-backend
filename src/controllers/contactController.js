import axios from 'axios';
import nodemailer from 'nodemailer';

// @desc    Verify reCAPTCHA token
// @route   Helper function
const verifyRecaptcha = async (token) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      throw new Error('reCAPTCHA secret key not configured');
    }

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    );

    return response.data;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    throw new Error('reCAPTCHA verification failed');
  }
};

// @desc    Send contact form email
// @route   POST /api/contact
// @access  Public
export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message, recaptchaToken } = req.body;

    // Validate required fields
    if (!name || !email || !message || !recaptchaToken) {
      return res.status(400).json({
        message: 'Please provide all required fields (name, email, message, recaptchaToken)'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res.status(400).json({
        message: 'reCAPTCHA verification failed. Please try again.',
        score: recaptchaResult.score
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: subject || `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong style="color: #555;">From:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong style="color: #555;">Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${subject ? `<p style="margin: 10px 0;"><strong style="color: #555;">Subject:</strong> ${subject}</p>` : ''}
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #333;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #555;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            This email was sent from your portfolio contact form.<br>
            reCAPTCHA Score: ${recaptchaResult.score.toFixed(2)}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

From: ${name}
Email: ${email}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

---
reCAPTCHA Score: ${recaptchaResult.score.toFixed(2)}
Time: ${new Date().toLocaleString()}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Message sent successfully! I will get back to you soon.',
      success: true
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      message: error.message || 'Failed to send message. Please try again later.',
      success: false
    });
  }
};
