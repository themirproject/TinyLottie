import { Resend } from "resend";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const resendApiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error("RESEND_API_KEY is not set in .env.local or process.env");
  process.exit(1);
}
const resend = new Resend(resendApiKey);

const customerEmail = "emir.kalayci@gmail.com";
const customerName = "Emir Kalaycı";
const orderId = "TEST-99201";
const firstName = "Emir";
const actionUrl = "https://tinylottie.com/profile?pro=activated";

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to TinyLottie PRO</title>
  <style>
    :root {
      color-scheme: light;
      supported-color-schemes: light;
    }
    body {
      background-color: #f8fafc !important;
      color: #0f172a !important;
    }
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
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
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

          <!-- PRO Badge & Welcome Message -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="display: inline-block; background-color: #E6FAF5; border: 1px solid rgba(0, 221, 179, 0.4); border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 700; color: #00A685; letter-spacing: 0.5px; text-transform: uppercase;">
                ★ PRO LIFETIME MEMBER
              </div>
              <h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                You're officially PRO! 🎉
              </h1>
              <p style="margin: 0; font-size: 15px; line-height: 24px; color: #475569;">
                Hi ${firstName}, thank you for supporting TinyLottie! Your PRO plan is active for <strong style="color: #0f172a;">${customerEmail}</strong>.
              </p>
            </td>
          </tr>

          <!-- What's Unlocked Card -->
          <tr>
            <td style="padding-bottom: 28px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 20px 14px 20px;">
                <p style="margin: 0 0 14px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px;">
                  What's Unlocked on Your Account
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top; width: 28px; font-size: 16px;">⚡</td>
                    <td style="padding-bottom: 12px; vertical-align: top; font-size: 14px; line-height: 20px; color: #334155;">
                      <strong style="color: #0f172a;">Unlimited File Size:</strong> Compress heavy and complex animations without any size caps.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top; width: 28px; font-size: 16px;">📦</td>
                    <td style="padding-bottom: 12px; vertical-align: top; font-size: 14px; line-height: 20px; color: #334155;">
                      <strong style="color: #0f172a;">Bulk Optimization:</strong> Drag & drop dozens of files and download them in a batch.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top; width: 28px; font-size: 16px;">🎯</td>
                    <td style="padding-bottom: 12px; vertical-align: top; font-size: 14px; line-height: 20px; color: #334155;">
                      <strong style="color: #0f172a;">Max Compression:</strong> Deep precision float optimization and unused metadata stripping.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 6px; vertical-align: top; width: 28px; font-size: 16px;">🚀</td>
                    <td style="padding-bottom: 6px; vertical-align: top; font-size: 14px; line-height: 20px; color: #334155;">
                      <strong style="color: #0f172a;">Priority Processing:</strong> Fast-lane server priority for instant processing.
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${actionUrl}" target="_blank" class="btn-mint" style="display: inline-block; background-color: #00DDB3 !important; background-image: linear-gradient(0deg, #00DDB3, #00DDB3) !important; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(0, 221, 179, 0.45); -webkit-text-size-adjust: none;">
                <span style="color: #ffffff !important; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">Start Using TinyLottie PRO &rarr;</span>
              </a>
            </td>
          </tr>

          <!-- Order Summary & Friendly note -->
          <tr>
            <td style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                Order Reference: <strong>#${orderId}</strong> &bull; Lifetime License
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748b;">
                Need help or have a feature idea? Simply reply to this email &mdash; we read every message!
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 520px; margin-top: 20px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #94a3b8;">
              &copy; ${new Date().getFullYear()} TinyLottie. High performance Lottie optimization.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

console.log("Sending test welcome email to:", customerEmail);
const result = await resend.emails.send({
  from: "TinyLottie <welcome@tinylottie.com>",
  to: customerEmail,
  replyTo: "emir.kalayci@gmail.com",
  subject: "Welcome to TinyLottie PRO! 🎉",
  html: html,
});

console.log("Resend result:", JSON.stringify(result, null, 2));
