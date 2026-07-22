interface VerificationEmailProps {
  name: string;
  url: string;
}

interface ResetPasswordEmailProps {
  name: string;
  url: string;
}

export function getVerificationEmailTemplate({ name, url }: VerificationEmailProps): string {
  const displayName = name || "Resident";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Portl</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #27272a; background: linear-gradient(180deg, #27272a 0%, #18181b 100%);">
              <div style="display: inline-block; width: 48px; height: 48px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; line-height: 48px; text-align: center;">
                <span style="color: #f59e0b; font-size: 24px; font-weight: bold;">🏢</span>
              </div>
              <h1 style="margin: 16px 0 4px 0; color: #ffffff; font-size: 24px; font-weight: 800; tracking-tight: -0.5px;">Portl</h1>
              <p style="margin: 0; color: #a1a1aa; font-size: 13px; font-weight: 500;">Smart Housing & Society Management</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 18px; font-weight: 700;">Verify Your Email Address</h2>
              <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                Hello <strong style="color: #ffffff;">${displayName}</strong>,<br>
                Welcome to Portl! Please verify your email address to complete your account setup and unlock access to housing society onboarding.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${url}" target="_blank" style="display: inline-block; background-color: #f59e0b; color: #000000; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry / Security Note -->
              <div style="background-color: #27272a; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #d4d4d8; font-size: 12px; line-height: 1.5;">
                  <strong>Note:</strong> This verification link will expire in 24 hours. If you did not create a Portl account, you can safely ignore this email.
                </p>
              </div>

              <!-- Direct Link Fallback -->
              <p style="margin: 0 0 8px 0; color: #71717a; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
                Button not working? Copy and paste this URL into your browser:
              </p>
              <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 11px; color: #f59e0b; word-break: break-all; line-height: 1.4;">
                ${url}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #71717a; font-size: 12px;">
                Sent securely by <strong>Portl Gate</strong>
              </p>
              <p style="margin: 0; color: #52525b; font-size: 11px;">
                © ${new Date().getFullYear()} Portl Technologies. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getResetPasswordEmailTemplate({ name, url }: ResetPasswordEmailProps): string {
  const displayName = name || "User";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Portl</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #27272a; background: linear-gradient(180deg, #27272a 0%, #18181b 100%);">
              <div style="display: inline-block; width: 48px; height: 48px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; line-height: 48px; text-align: center;">
                <span style="color: #f59e0b; font-size: 24px; font-weight: bold;">🔒</span>
              </div>
              <h1 style="margin: 16px 0 4px 0; color: #ffffff; font-size: 24px; font-weight: 800; tracking-tight: -0.5px;">Portl Gate</h1>
              <p style="margin: 0; color: #a1a1aa; font-size: 13px; font-weight: 500;">Account Security Center</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 18px; font-weight: 700;">Password Reset Request</h2>
              <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                Hello <strong style="color: #ffffff;">${displayName}</strong>,<br>
                We received a request to reset the password for your Portl account. Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${url}" target="_blank" style="display: inline-block; background-color: #f59e0b; color: #000000; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Warning -->
              <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 24px;">
                <p style="margin: 0; color: #fca5a5; font-size: 12px; line-height: 1.5;">
                  <strong>Security Alert:</strong> If you did not request a password reset, someone else may be trying to access your account. You can safely ignore this email or contact support.
                </p>
              </div>

              <!-- Direct Link Fallback -->
              <p style="margin: 0 0 8px 0; color: #71717a; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
                Button not working? Copy and paste this URL into your browser:
              </p>
              <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 11px; color: #f59e0b; word-break: break-all; line-height: 1.4;">
                ${url}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #71717a; font-size: 12px;">
                Sent securely by <strong>Portl Gate</strong>
              </p>
              <p style="margin: 0; color: #52525b; font-size: 11px;">
                © ${new Date().getFullYear()} Portl Technologies. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
