const NOTION_VERSION = "2022-06-28";
const COMPANIES_DB_ID = "b3a9ca42105745c590e48d4d9b8df59a";

async function notionFetch(path: string, init: RequestInit) {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    console.error(`Notion API error (${path}):`, res.status, await res.text().catch(() => ""));
    return null;
  }
  return res.json();
}

const STATUS_MAP: Record<string, string> = {
  pending: "Lead",
  active: "Active",
  suspended: "Churned",
};

export interface CompanySyncData {
  carwajId: string;
  name: string;
  status: string;
  mrr: number;
  communitiesCount: number;
  villasCount: number;
  activeClients: number;
  pausedClients: number;
  formerClients: number;
}

async function findCompanyPageId(carwajId: string): Promise<string | null> {
  const result = await notionFetch(`/databases/${COMPANIES_DB_ID}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: { property: "Carwaj ID", rich_text: { equals: carwajId } },
      page_size: 1,
    }),
  });
  return result?.results?.[0]?.id ?? null;
}

function buildCompanyProperties(data: CompanySyncData) {
  return {
    "Company Name": { title: [{ text: { content: data.name } }] },
    "Status": { select: { name: STATUS_MAP[data.status] ?? "Lead" } },
    "MRR (AED)": { number: data.mrr },
    "Communities Count": { number: data.communitiesCount },
    "Villas Count": { number: data.villasCount },
    "Active Clients": { number: data.activeClients },
    "Paused Clients": { number: data.pausedClients },
    "Former Clients": { number: data.formerClients },
    "Carwaj ID": { rich_text: [{ text: { content: data.carwajId } }] },
    "Last Synced": { date: { start: new Date().toISOString().slice(0, 10) } },
  };
}

// Creates or updates the Notion page for a company, matched by "Carwaj ID".
// Read-only against Supabase — callers pass in already-fetched data.
export async function syncCompanyToNotion(data: CompanySyncData): Promise<"created" | "updated" | "skipped"> {
  if (!process.env.NOTION_API_KEY) return "skipped";

  const existingPageId = await findCompanyPageId(data.carwajId);
  const properties = buildCompanyProperties(data);

  if (existingPageId) {
    await notionFetch(`/pages/${existingPageId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return "updated";
  }

  await notionFetch(`/pages`, {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: COMPANIES_DB_ID },
      properties,
    }),
  });
  return "created";
}
