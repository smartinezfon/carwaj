import { sendWhatsAppMessage } from "./twilio";

export async function notifyCarCleaned({
  ownerPhone,
  ownerName,
  carLabel,
  afterPhotoUrl,
}: {
  ownerPhone: string;
  ownerName: string;
  carLabel: string;
  afterPhotoUrl?: string | null;
}) {
  return sendWhatsAppMessage({
    to: ownerPhone,
    message: `Hi ${ownerName} 👋 Your ${carLabel} has just been cleaned! ✅ Have a great day.`,
    mediaUrl: afterPhotoUrl ?? undefined,
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
    message: `Hi ${ownerName} 👋 A friendly reminder that your car cleaning payment of *AED ${amount}* is due ${dayWord} (${dueDate}). Please arrange payment at your earliest convenience. Thank you!`,
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
    message: `Hi ${ownerName}! 👋\n\nYour car cleaning service has been set up. Please take 2 minutes to add your car details and preferred cleaning days:\n\n${onboardingUrl}\n\n⏰ This link expires in 24 hours. After that, your cleaner will add the details for you.`,
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
    message: `Hi ${ownerName} 🙏 We have received your payment of *AED ${amount}* via ${method}. Thank you for your business — we look forward to keeping your car spotless!`,
  });
}
