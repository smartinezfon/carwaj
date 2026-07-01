const GRAPH_API_VERSION = "v20.0";

function getConfig() {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error("META_WHATSAPP_ACCESS_TOKEN and META_WHATSAPP_PHONE_NUMBER_ID must be set");
  }

  return { accessToken, phoneNumberId };
}

function formatPhone(phone: string) {
  // Strip any non-digit characters except leading +
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

async function sendMessage(to: string, body: Record<string, unknown>) {
  const { accessToken, phoneNumberId } = getConfig();

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formatPhone(to),
        ...body,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Meta API error ${res.status}: ${JSON.stringify(err)}`);
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
  if (afterPhotoUrl) {
    return sendMessage(ownerPhone, {
      type: "image",
      image: {
        link: afterPhotoUrl,
        caption: `Hi ${ownerName} 👋 Your ${carLabel} has just been cleaned! ✅ Have a great day.`,
      },
    });
  }

  return sendMessage(ownerPhone, {
    type: "text",
    text: {
      body: `Hi ${ownerName} 👋 Your ${carLabel} has just been cleaned! ✅ Have a great day.`,
    },
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
  return sendMessage(ownerPhone, {
    type: "text",
    text: {
      body: `Hi ${ownerName} 👋 A friendly reminder that your car cleaning payment of *AED ${amount}* is due ${dayWord} (${dueDate}). Please arrange payment at your earliest convenience. Thank you!`,
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
  return sendMessage(ownerPhone, {
    type: "text",
    text: {
      body: `Hi ${ownerName}, your car cleaning payment of *AED ${amount}* was due on ${dueDate} and is now *${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue*. Please arrange payment as soon as possible. Thank you!`,
    },
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
    type: "text",
    text: {
      body: `Hi ${ownerName} 🙏 We have received your payment of *AED ${amount}* via ${method}. Thank you for your business — we look forward to keeping your car spotless!`,
    },
  });
}
