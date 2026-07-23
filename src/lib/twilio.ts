import twilio from "twilio";

interface SendWhatsAppFreeformParams {
  to: string; // international format e.g. +971xxxxxxxx
  message: string;
  mediaUrl?: string;
  contentSid?: undefined;
}

interface SendWhatsAppTemplateParams {
  to: string;
  contentSid: string;
  contentVariables: Record<string, string>;
  message?: undefined;
  mediaUrl?: undefined;
}

type SendWhatsAppParams = SendWhatsAppFreeformParams | SendWhatsAppTemplateParams;

export async function sendWhatsAppMessage(params: SendWhatsAppParams) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error("Twilio environment variables are not configured");
  }

  const client = twilio(accountSid, authToken);

  const normalized = params.to.replace(/\s+/g, "");
  const formattedTo = normalized.startsWith("whatsapp:") ? normalized : `whatsapp:${normalized}`;

  if (params.contentSid) {
    return client.messages.create({
      from,
      to: formattedTo,
      contentSid: params.contentSid,
      contentVariables: JSON.stringify(params.contentVariables),
    });
  }

  return client.messages.create({
    from,
    to: formattedTo,
    body: params.message,
    ...(params.mediaUrl ? { mediaUrl: [params.mediaUrl] } : {}),
  });
}
