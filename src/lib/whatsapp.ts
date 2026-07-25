import { sendWhatsAppMessage } from "./twilio";

export async function notifyCarCleaned({
  ownerPhone,
  ownerName,
  carLabel,
}: {
  ownerPhone: string;
  ownerName: string;
  carLabel: string;
}) {
  return sendWhatsAppMessage({
    to: ownerPhone,
    contentSid: process.env.TWILIO_TEMPLATE_CAR_CLEANED_SID!,
    contentVariables: { "1": ownerName, "2": carLabel },
  });
}

export async function notifyPaymentDue({
  ownerPhone,
  ownerName,
  amount,
  dueDate,
  daysUntilDue,
}: {
  ownerPhone: string;
  ownerName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}) {
  const dayWord = daysUntilDue === 1 ? "tomorrow" : `in ${daysUntilDue} days`;
  return sendWhatsAppMessage({
    to: ownerPhone,
    contentSid: process.env.TWILIO_TEMPLATE_PAYMENT_DUE_SID!,
    contentVariables: {
      "1": ownerName,
      "2": String(amount),
      "3": dayWord,
      "4": dueDate,
    },
  });
}

export async function notifyPaymentOverdue({
  ownerPhone,
  ownerName,
  amount,
  dueDate,
  overdueDays,
}: {
  ownerPhone: string;
  ownerName: string;
  amount: number;
  dueDate: string;
  overdueDays: number;
}) {
  return sendWhatsAppMessage({
    to: ownerPhone,
    message: `Hi ${ownerName}, your car cleaning payment of *AED ${amount}* was due on ${dueDate} and is now *${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue*. Please arrange payment as soon as possible. Thank you!`,
  });
}

export async function notifyClientOnboarding({
  ownerPhone,
  ownerName,
  onboardingUrl,
}: {
  ownerPhone: string;
  ownerName: string;
  onboardingUrl: string;
}) {
  return sendWhatsAppMessage({
    to: ownerPhone,
    contentSid: process.env.TWILIO_TEMPLATE_CLIENT_ONBOARDING_SID!,
    contentVariables: { "1": ownerName, "2": onboardingUrl },
  });
}

export async function notifyPaymentReceived({
  ownerPhone,
  ownerName,
  amount,
  method,
}: {
  ownerPhone: string;
  ownerName: string;
  amount: number;
  method: string;
}) {
  return sendWhatsAppMessage({
    to: ownerPhone,
    contentSid: process.env.TWILIO_TEMPLATE_PAYMENT_RECEIVED_SID!,
    contentVariables: { "1": ownerName, "2": String(amount), "3": method },
  });
}
