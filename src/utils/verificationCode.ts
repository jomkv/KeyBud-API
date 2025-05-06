import crypto from "node:crypto";
import transporter from "../config/nodemailer";
import ServerError from "../errors/ServerError";
import path from "node:path";

export const generateCode = (): string => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

export const sendCode = async (email: string, code: string) => {
  try {
    const mailDetails = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "KeyBud Email Verification",
      text: "",
      html: `
       <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border: 1px solid #dddddd;
              border-radius: 8px;
              overflow: hidden;
            }
            .email-header {
              background-color: #1f1f1f;
              padding: 20px;
              text-align: center;
            }
            .email-header img {
              width: 50px;
              height: 50px;
              object-fit: contain; 
            }
            .email-body {
              padding: 20px;
              text-align: center;
            }
            .email-body h2 {
              font-size: 24px;
              color: #333333;
            }
            .email-body p {
              font-size: 16px;
              color: #555555;
              margin: 10px 0;
            }
            .verification-code {
              font-size: 32px;
              font-weight: bold;
              color: #1f1f1f;
              margin: 20px 0;
            }
            .email-footer {
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #888888;
              border-top: 1px solid #dddddd;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <a href="${process.env.CLIENT_URL}" target="_blank">
                <img src="https://res.cloudinary.com/deo9b05on/image/upload/v1746514759/Keybud_Icon2_cltwsp.png" alt="Keybud Icon">
              </a>
            </div>
            <div class="email-body">
              <h2>Verify Your Email</h2>
              <p>Please use the following verification code to finalize your signup process:</p>
              <div class="verification-code">${code}</div>
            </div>
            <div class="email-footer">
              <p>If you did not request this, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
      `,
    };

    await transporter.sendMail(mailDetails);
  } catch (err) {
    throw new Error();
  }
};
