const EMOJI = {
  job: "✅",
  payment: "💳",
  customer: "🏠",
  cleaner: "👤",
  company: "🏢",
};

async function post(text: string) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).catch(() => {});
}

function ctx({
  company,
  cleaner,
  community,
  villa,
}: {
  company?: string;
  cleaner?: string;
  community?: string;
  villa?: string;
}) {
  const parts = [];
  if (company) parts.push(`🏢 ${company}`);
  if (cleaner) parts.push(`👤 ${cleaner}`);
  if (community) parts.push(`📍 ${community}`);
  if (villa) parts.push(`🏠 Villa ${villa}`);
  return parts.length ? `\n${parts.join("  ·  ")}` : "";
}

export async function slackJobCompleted({
  companyName,
  cleanerName,
  communityName,
  villaNumber,
  carLabel,
}: {
  companyName: string;
  cleanerName: string;
  communityName: string;
  villaNumber: string;
  carLabel: string;
}) {
  await post(
    `${EMOJI.job} *Job completed* — *${carLabel}* cleaned` +
    ctx({ company: companyName, cleaner: cleanerName, community: communityName, villa: villaNumber })
  );
}

export async function slackPaymentReceived({
  companyName,
  cleanerName,
  communityName,
  villaNumber,
  amount,
  method,
}: {
  companyName: string;
  cleanerName?: string;
  communityName: string;
  villaNumber: string;
  amount: number;
  method: string;
}) {
  await post(
    `${EMOJI.payment} *Payment received* — *AED ${amount}* via ${method}` +
    ctx({ company: companyName, cleaner: cleanerName, community: communityName, villa: villaNumber })
  );
}

export async function slackCustomerAdded({
  companyName,
  cleanerName,
  communityName,
  villaNumber,
  ownerName,
}: {
  companyName: string;
  cleanerName?: string;
  communityName: string;
  villaNumber: string;
  ownerName: string;
}) {
  await post(
    `${EMOJI.customer} *New customer* — ${ownerName}` +
    ctx({ company: companyName, cleaner: cleanerName, community: communityName, villa: villaNumber })
  );
}

export async function slackCleanerAdded({
  companyName,
  name,
  role,
}: {
  companyName: string;
  name: string;
  role: string;
}) {
  await post(
    `${EMOJI.cleaner} *New ${role} added* — ${name}` +
    ctx({ company: companyName })
  );
}

export async function slackCompanyAdded({ name }: { name: string }) {
  await post(`${EMOJI.company} *New company created* — ${name}`);
}
