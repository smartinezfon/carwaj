const WASENDER_BASE_URL = "https://www.wasenderapi.com/api";

function getApiKey() {
  const key = process.env.WASENDER_API_KEY;
  if (!key) throw new Error("WASENDER_API_KEY must be set");
  return key;
}

function formatPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

async function sendMessage(to: string, body: Record<string, unknown>) {
  const res = await fetch(`${WASENDER_BASE_URL}/send-message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: formatPhone(to), ...body }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`WasenderAPI error ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json();
}

// ── Notification senders ────────────────────────────────────────────────────

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
  const text = `Hi ${ownerName} 👋 Your ${carLabel} has just been cleaned! ✅ Have a great day.`;

  if (afterPhotoUrl) {
    return sendMessage(ownerPhone, { text, imageUrl: afterPhotoUrl });
  }

  return sendMessage(ownerPhone, { text });
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
  return sendMessage(ownerPhone, {
    text: `Hi ${ownerName} 👋 A friendly reminder that your car cleaning payment of *AED ${amount}* is due ${dayWord} (${dueDate}). Please arrange payment at your earliest convenience. Thank you!`,
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
  return sendMessage(ownerPhone, {
    text: `Hi ${ownerName}, your car cleaning payment of *AED ${amount}* was due on ${dueDate} and is now *${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue*. Please arrange payment as soon as possible. Thank you!`,
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
  return sendMessage(ownerPhone, {
    text: `Hi ${ownerName} 🙏 We have received your payment of *AED ${amount}* via ${method}. Thank you for your business — we look forward to keeping your car spotless!`,
  });
}
