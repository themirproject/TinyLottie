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
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Sign in to TinyLottie</title>
  <style>
    :root {
      color-scheme: light;
      supported-color-schemes: light;
    }
    body {
      background-color: #f8fafc !important;
      color: #0f172a !important;
    }
    /* Prevent Gmail mobile dark mode from inverting the button background */
    .btn-mint {
      background-color: #00DDB3 !important;
      background-image: linear-gradient(#00DDB3, #00DDB3) !important;
      color: #ffffff !important;
    }
    .btn-mint span {
      color: #ffffff !important;
    }
    [data-ogsc] .btn-mint,
    [data-ogsb] .btn-mint {
      background-color: #00DDB3 !important;
      background-image: linear-gradient(#00DDB3, #00DDB3) !important;
      color: #ffffff !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <img src="https://tinylottie.com/logo-icon.png" width="36" height="36" alt="TinyLottie Logo" style="display: block; width: 36px; height: 36px; border-radius: 10px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">TinyLottie</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom: 28px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
                Your Sign-In Link
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #475569;">
                We received a request to log in for <strong style="color: #0f172a;">${email}</strong>. Click the button below to sign in to TinyLottie:
              </p>
            </td>
          </tr>

          <!-- CTA Button (Gradient background prevents Gmail dark mode inversion; White text) -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${magicLink}" target="_blank" class="btn-mint" style="display: inline-block; background-color: #00DDB3 !important; background-image: linear-gradient(0deg, #00DDB3, #00DDB3) !important; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(0, 221, 179, 0.45); -webkit-text-size-adjust: none;">
                <span style="color: #ffffff !important; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">Log In to TinyLottie &rarr;</span>
              </a>
            </td>
          </tr>

          <!-- Security Notice & Fallback -->
          <tr>
            <td style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; text-align: left;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #64748b;">
                  Button not working? Copy and paste this link:
                </p>
                <p style="margin: 0; font-size: 11px; word-break: break-all; line-height: 16px;">
                  <a href="${magicLink}" style="color: #00A685; text-decoration: underline;">${magicLink}</a>
                </p>
              </div>
              <p style="margin: 0; font-size: 11px; line-height: 16px; color: #94a3b8;">
                This link is valid for 1 hour and can only be used once. If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 500px; margin-top: 20px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #94a3b8;">
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
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    let origin = process.env.NEXT_PUBLIC_APP_URL || "https://tinylottie.com";
    if (host.includes("localhost") || process.env.NODE_ENV === "development") {
      origin = "http://localhost:3000";
    } else {
      origin = "https://tinylottie.com";
    }

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
      replyTo: "emir.kalayci@gmail.com",
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
        replyTo: "emir.kalayci@gmail.com",
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
