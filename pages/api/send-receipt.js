import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { toCreator, toPayer, project, amount, receiptUrl } = req.body;

  try {
    await resend.emails.send({
      from: "Fundora <no-reply@yourdomain.com>",
      to: [toPayer],
      subject: "Payment Receipt - Fundora",
      html: `
        <h2>Payment Successful</h2>
        <p>Thank you for supporting <b>${project}</b>.</p>
        <p>Amount: ₹${amount}</p>
        <p>
          <a href="${receiptUrl}">Download Receipt</a>
        </p>
        <br />
        <p>Regards,<br/>Fundora</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Email failed" });
  }
}
