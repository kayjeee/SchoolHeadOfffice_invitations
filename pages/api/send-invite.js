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
    // Configure nodemailer with ExitDNS SMTP details
    const transporter = nodemailer.createTransport({
      host: "relay.dnsexit.com", // Replace with ExitDNS SMTP host
      port: 587, // Usually 587 for TLS
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Your ExitDNS SMTP username
        pass: process.env.SMTP_PASSWORD, // Your ExitDNS SMTP password
      },
    });

    // Send the email
    const mailOptions = {
      from: '"schoolheadoffice" <info@schoolheadoffice.co.za>', // Sender address
      to: email, // Recipient's email
      subject: "You're invited!", // Email subject
      text: `Hi, you've been invited by ${inviterName} to join our app! Click here to sign up: https://schoolheadoffice.co.za/`, // Plain text
      html: `<p>Hi, you've been invited by <strong>${inviterName}</strong> to join our app!</p>
             <p>Click here to sign up: <a href="https://schoolheadoffice.co.za/">Join Now</a></p>`, // HTML version
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Invitation sent successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending email." });
  }
}
