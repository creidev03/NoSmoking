import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface FeedbackEmailParams {
  type: string;
  subject: string;
  message: string;
  userEmail: string;
  userId: string;
}

export async function sendFeedbackEmail(
  params: FeedbackEmailParams
): Promise<{ success: boolean; error?: string }> {
  const emailSubject = `[NoSmoking] ${params.type}: ${params.subject}`;
  const emailBody = [
    `New feedback submission`,
    ``,
    `Type: ${params.type}`,
    `Subject: ${params.subject}`,
    `User ID: ${params.userId}`,
    `User Email: ${params.userEmail}`,
    `Submitted at: ${new Date().toISOString()}`,
    ``,
    `Message:`,
    params.message,
  ].join("\n");

  const { error } = await resend.emails.send({
    from: "NoSmoking App <onboarding@resend.dev>",
    to: "creidev03@gmail.com",
    subject: emailSubject,
    text: emailBody,
  });

  if (error) {
    return { success: false, error: "email_failed" };
  }

  return { success: true };
}
