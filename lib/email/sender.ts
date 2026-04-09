import nodemailer from "nodemailer";

type EmailPayload = {
  html: string;
  subject: string;
  to: string[];
};

function getTransporter() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const password = process.env.EMAIL_SERVER_PASSWORD;

  if (!host || !port || !user || !password) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass: password,
    },
  });
}

export async function sendEmail(payload: EmailPayload) {
  const recipients = [...new Set(payload.to.filter(Boolean))];

  if (recipients.length === 0) {
    return;
  }

  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      JSON.stringify(
        {
          type: "email-fallback",
          subject: payload.subject,
          to: recipients,
          html: payload.html,
        },
        null,
        2,
      ),
    );
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "MRBS <noreply@company.com>",
    to: recipients.join(", "),
    subject: payload.subject,
    html: payload.html,
  });
}
