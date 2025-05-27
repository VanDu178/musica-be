const nodemailer = require("nodemailer");

//Cấu hình
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER, // email gửi đi
    pass: process.env.EMAIL_APP_PASS, // mật khẩu ứng dụng (App Password)
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"No Reply" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email sending failed:", err);
    throw err;
  }
};

module.exports = sendEmail;
