const EMOJI = {
  job: "✅",
  payment: "💳",
  customer: "🏠",
  cleaner: "👤",
  company: "🏢",
};

async function post(text: string) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return; // silently skip if not configured
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).catch(() => {}); // never throw — notification failure must not break the app
}

export async function slackJobCompleted({
  cleanerName,
  villaNumber,
  communityName,
  carLabel,
}: {
  cleanerName: string;
  villaNumber: string;
  communityName: string;
  carLabel: string;
}) {
  await post(
    `${EMOJI.job} *Job completed* — ${cleanerName} cleaned the *${carLabel}* at Villa ${villaNumber}, ${communityName}`
  );
}

export async function slackPaymentReceived({
  villaNumber,
  communityName,
  amount,
  method,
}: {
  villaNumber: string;
  communityName: string;
  amount: number;
  method: string;
}) {
  await post(
    `${EMOJI.payment} *Payment received* — Villa ${villaNumber} (${communityName}) paid *AED ${amount}* via ${method}`
  );
}

export async function slackCustomerAdded({
  villaNumber,
  communityName,
  ownerName,
}: {
  villaNumber: string;
  communityName: string;
  ownerName: string;
}) {
  await post(
    `${EMOJI.customer} *New customer* — ${ownerName} at Villa ${villaNumber}, ${communityName}`
  );
}

export async function slackCleanerAdded({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  await post(`${EMOJI.cleaner} *New ${role}* added — ${name}`);
}

export async function slackCompanyAdded({ name }: { name: string }) {
  await post(`${EMOJI.company} *New company* created — ${name}`);
}
