import { Resend } from "resend";
import { env } from "@portl/env/server";

const resend = new Resend(env.RESEND_API_KEY || "placeholder");

export class EmailService {
  static async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not configured. Logging email instead:");
      console.warn(`To: ${to}\nSubject: ${subject}\nHTML: ${html}`);
      return { success: true, messageId: "logged-dev-mode" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: env.EMAIL_FROM || "Portl Gate <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error("Failed to send email via Resend SDK:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (err: any) {
      console.error("Resend SDK email delivery error:", err);
      return { success: false, error: err.message };
    }
  }
}
