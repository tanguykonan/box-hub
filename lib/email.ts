import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const emailFrom = process.env.EMAIL_FROM || "Box Hub <onboarding@resend.dev>";

interface SendOtpParams {
  to: string;
  code: string;
  username?: string | null;
  mode?: "login" | "register";
}

/**
 * Génère le gabarit HTML professionnel et épuré de l'e-mail Box Hub (style Zoho / Vercel).
 */
function getOtpHtmlTemplate(code: string, username?: string | null, mode: string = "login"): string {
  const isRegister = mode === "register";
  const salutation = username ? `Bonjour ${username} !` : "Bonjour !";
  const actionText = isRegister
    ? "Utilisez le code de confirmation (OTP) suivant pour finaliser la création et la vérification de votre compte <strong>Box Hub</strong>."
    : "Utilisez le code de confirmation (OTP) suivant pour vous connecter à votre compte <strong>Box Hub</strong>.";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre code de vérification Box Hub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; text-align: left;">
          
          <!-- Branding Header -->
          <tr>
            <td style="padding-bottom: 28px;">
              <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ea580c; display: inline-block;">
                Box Hub
              </span>
            </td>
          </tr>

          <!-- Salutation & Main Message -->
          <tr>
            <td>
              <h1 style="margin: 0 0 18px 0; font-size: 22px; font-weight: 700; color: #111827;">
                ${salutation}
              </h1>
              
              <p style="margin: 0 0 14px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                ${actionText}
              </p>

              <p style="margin: 0 0 28px 0; font-size: 14px; color: #4b5563;">
                Ce code sera valide pendant <strong>10 minutes</strong>.
              </p>

              <!-- Large Bold OTP Code Display -->
              <div style="margin: 0 0 28px 0;">
                <span style="font-family: -apple-system, BlinkMacSystemFont, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #111827; display: inline-block;">
                  ${code}
                </span>
              </div>

              <!-- Assistance Info -->
              <p style="margin: 0 0 28px 0; font-size: 14px; color: #4b5563;">
                Pour toute question ou assistance, n'hésitez pas à nous contacter à <a href="mailto:ulrich@tanguykonan.dev" style="color: #ea580c; text-decoration: underline; font-weight: 600;">ulrich@tanguykonan.dev</a>.
              </p>

              <!-- Sign-off -->
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;">
                Cordialement,
              </p>
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">
                L'équipe Box Hub
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Expédie l'e-mail OTP avec Resend.
 */
export async function sendOtpEmail({
  to,
  code,
  username,
  mode = "login",
}: SendOtpParams): Promise<{ success: boolean; error?: string }> {
  try {
    if (!resend) {
      console.warn("⚠️ [Resend] Aucune clé RESEND_API_KEY trouvée dans les variables d'environnement.");
      return { success: false, error: "Clé API Resend non configurée." };
    }

    const htmlContent = getOtpHtmlTemplate(code, username, mode);
    const subject = mode === "register"
      ? `Votre code d'inscription Box Hub : ${code}`
      : `Votre code de connexion Box Hub : ${code}`;

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject,
      html: htmlContent,
      text: `Bonjour,\n\nVotre code de vérification Box Hub est : ${code}\n\nCe code expire dans 10 minutes.\n\nCordialement,\nL'équipe Box Hub`,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Resend] E-mail envoyé avec succès à ${to} (ID: ${data?.id})`);
    return { success: true };
  } catch (err: any) {
    console.error("[Resend Exception]:", err);
    return { success: false, error: err?.message || "Erreur inattendue lors de l'envoi d'e-mail." };
  }
}
