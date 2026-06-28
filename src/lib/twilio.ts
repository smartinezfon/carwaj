import twilio from "twilio";

interface SendWhatsAppParams {
  to: string; // international format e.g. +971xxxxxxxx
  message: string;
  mediaUrl?: string;
}

export async function sendWhatsAppMessage({ to, message, mediaUrl }: SendWhatsAppParams) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error("Twilio environment variables are not configured");
  }

  const client = twilio(accountSid, authToken);

  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return client.messages.create({
    from,
    to: formattedTo,
    body: message,
    ...(mediaUrl ? { mediaUrl: [mediaUrl] } : {}),
  });
}
