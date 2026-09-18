import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function getMagicLinkEmailHtml(magicLink: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to TinyLottie</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 40px 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background-color: #00DDB3; padding: 10px 14px; border-radius: 12px;">
                <span style="font-size: 20px; font-weight: 800; color: #000000; letter-spacing: -0.5px;">TL</span>
              </div>
              <h1 style="margin: 16px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                TinyLottie
              </h1>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom: 28px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                Your Magic Sign-In Link
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #9ca3af;">
                We received a sign-in request for <strong style="color: #ffffff;">${email}</strong>. Click the secure button below to log in to TinyLottie.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${magicLink}" target="_blank" style="display: inline-block; background-color: #00DDB3; color: #000000; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(0, 221, 179, 0.39);">
                Sign In to TinyLottie &rarr;
              </a>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="border-top: 1px solid #1f2937; padding-top: 24px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 18px; color: #6b7280;">
                Button not working? Copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 16px 0; font-size: 11px; word-break: break-all; color: #00DDB3; line-height: 16px;">
                <a href="${magicLink}" style="color: #00DDB3; text-decoration: underline;">${magicLink}</a>
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 16px; color: #6b7280;">
                This link is valid for 1 hour and can only be used once. If you did not request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 520px; margin-top: 24px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #4b5563;">
              &copy; ${new Date().getFullYear()} TinyLottie. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const cleanEmail = email?.trim()?.toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // 1. Generate the secure magic link via Firebase Admin SDK
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://tinylottie.com");

    const actionCodeSettings = {
      url: `${origin}/?magicLink=true`,
      handleCodeInApp: true,
    };

    const magicLink = await adminAuth().generateSignInWithEmailLink(
      cleanEmail,
      actionCodeSettings
    );

    // 2. Send the email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn(
        "[magic-link] RESEND_API_KEY is not set. Generated link for testing:",
        magicLink
      );
      return NextResponse.json(
        {
          error:
            "RESEND_API_KEY is missing. Please add your Resend API key to environment variables.",
          devLink: process.env.NODE_ENV === "development" ? magicLink : undefined,
        },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "TinyLottie <login@tinylottie.com>";

    let { error: resendError, data: resendData } = await resend.emails.send({
      from: fromEmail,
      to: cleanEmail,
      subject: "Sign in to TinyLottie",
      html: getMagicLinkEmailHtml(magicLink, cleanEmail),
    });

    // If custom domain is not yet verified on Resend, automatically fallback to test sender
    if (resendError && fromEmail.includes("@tinylottie.com")) {
      console.warn(
        "[magic-link] Primary domain not yet verified, falling back to onboarding@resend.dev:",
        resendError.message
      );
      const fallback = await resend.emails.send({
        from: "TinyLottie <onboarding@resend.dev>",
        to: cleanEmail,
        subject: "Sign in to TinyLottie",
        html: getMagicLinkEmailHtml(magicLink, cleanEmail),
      });
      resendError = fallback.error;
      resendData = fallback.data;
    }

    if (resendError) {
      console.error("[magic-link] Resend send error:", resendError);
      return NextResponse.json(
        { error: `Failed to send email: ${resendError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: resendData?.id,
    });
  } catch (error: any) {
    console.error("[magic-link] Error generating/sending link:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
