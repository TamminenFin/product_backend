import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import config from "../config";

interface EmailOption {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: config.node_env === "production",
  auth: {
    user: config.smtp_mail,
    pass: config.smtp_password,
  },
});

const sendEmail = async (options: EmailOption): Promise<void> => {
  const { email, subject, template, data } = options;
  const templatePath = path.join(__dirname, "../mails", template);
  try {
    const html: string = await ejs.renderFile(templatePath, data);

    const mailOption = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOption);
  } catch (error) {
    console.error("Error rendering email template or sending email:", error);
    throw error;
  }
};

export default sendEmail;
