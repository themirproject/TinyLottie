import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    const cleanEmail = email?.trim().toLowerCase();
    const cleanMessage = message?.trim();
    const cleanName = name?.trim() || "Anonymous User";
    const cleanSubject = subject?.trim() || "General Inquiry";

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!cleanMessage || cleanMessage.length < 5) {
      return NextResponse.json(
        { error: "Message must be at least 5 characters long." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[contact-api] RESEND_API_KEY is not configured.");
      return NextResponse.json(
        { error: "Contact service is temporarily unavailable." },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #00A685;">TinyLottie &bull; Contact Form</span>
              <h2 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                ${cleanSubject}
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 0;">
              <table role="presentation" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b; width: 80px;">From:</td>
                  <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${cleanName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Email:</td>
                  <td style="padding: 4px 0; font-size: 14px; color: #00A685; font-weight: 600;">
                    <a href="mailto:${cleanEmail}" style="color: #00A685; text-decoration: underline;">${cleanEmail}</a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-top: 10px;">
                <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                <p style="margin: 0; font-size: 14px; line-height: 22px; color: #334155; white-space: pre-wrap;">${cleanMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Tip: You can hit <strong>Reply</strong> in your email client to respond directly to ${cleanName} (${cleanEmail}).
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const fromEmail =
      process.env.RESEND_CONTACT_FROM_EMAIL || "TinyLottie Support <support@tinylottie.com>";

    let { data, error } = await resend.emails.send({
      from: fromEmail,
      to: "emir.kalayci@gmail.com",
      replyTo: `${cleanName} <${cleanEmail}>`,
      subject: `[TinyLottie] ${cleanSubject} — from ${cleanName}`,
      html: emailHtml,
    });

    if (error && fromEmail.includes("@tinylottie.com")) {
      console.warn(
        "[contact-api] Custom domain error, retrying with fallback sender:",
        error
      );
      const fallback = await resend.emails.send({
        from: "TinyLottie Support <onboarding@resend.dev>",
        to: "emir.kalayci@gmail.com",
        replyTo: `${cleanName} <${cleanEmail}>`,
        subject: `[TinyLottie] ${cleanSubject} — from ${cleanName}`,
        html: emailHtml,
      });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("[contact-api] Failed to send contact email:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("[contact-api] Server error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
