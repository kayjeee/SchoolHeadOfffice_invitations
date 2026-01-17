import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, inviterName } = req.body;

  if (!email || !inviterName) {
    return res.status(400).json({ message: "Email and inviter name are required." });
  }

  try {
    // Configure nodemailer with SMTP details
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "relay.dnsexit.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send the email
    const mailOptions = {
      from: `"schoolheadoffice" <${process.env.SMTP_FROM_EMAIL}>`, // Sender address
      to: email, // Recipient's email
      subject: "You're invited!", // Email subject
      text: `Hi, you've been invited by ${inviterName} to join our app! Click here to sign up: ${process.env.NEXT_PUBLIC_BASE_URL}/`, // Plain text
      html: `<p>Hi, you've been invited by <strong>${inviterName}</strong> to join our app!</p>
             <p>Click here to sign up: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/">Join Now</a></p>`, // HTML version
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Invitation sent successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending email." });
  }
}
