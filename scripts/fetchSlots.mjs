import fs from "fs";
import path from "path";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const token = process.env.SLOTSLAUNCH_API_TOKEN;

function getOriginHost() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://hokimainbet.com";
  try {
    return new URL(site).hostname;
  } catch {
    return site.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

const originHost = getOriginHost();

const providers = [
  { slug: "pragmatic-play", name: "Pragmatic Play", limit: 20 },
  { slug: "hacksaw-gaming", name: "Hacksaw Gaming", limit: 15 },
  { slug: "nolimit-city", name: "Nolimit City", limit: 10 },
];

const FEATURED_BY_SLUG = {
  "gates-of-gatot-kaca": { featured: true, localBadge: "🇮🇩 UNGGULAN" },
};

const OUTPUT_PATH = path.join(process.cwd(), "lib/slotsData.ts");
const REQUEST_DELAY_MS = 2_100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function apiHeaders() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Origin: originHost,
  };
}

function mapVolatility(value) {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function mapGame(game, provider) {
  const slug = game.slug;
  const overrides = FEATURED_BY_SLUG[slug] ?? {};
  const apiId = game.id;
  const iframeUrl = `https://slotslaunch.com/iframe/${apiId}?token=${token}`;

  return {
    id: apiId,
    name: game.name,
    slug,
    provider: provider.name,
    providerSlug: provider.slug,
    rtp: game.rtp || 96,
    maxWin: game.max_win_per_spin
      ? `x${game.max_win_per_spin.toLocaleString("en-US")}`
      : "N/A",
    volatility: mapVolatility(game.volatility),
    iframeUrl,
    thumb: game.thumb || null,
    releaseDate: game.release || null,
    ...overrides,
  };
}

async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
    return {
      error: `Non-JSON response (${res.status})`,
      preview: text.slice(0, 120),
    };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: "Invalid JSON response" };
  }
}

async function apiGet(endpoint) {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `https://slotslaunch.com/api/${endpoint}${separator}token=${token}`;

  await sleep(REQUEST_DELAY_MS);

  let res;
  try {
    res = await fetch(url, { headers: apiHeaders() });
  } catch (err) {
    return { error: err.message };
  }

  const data = await parseJsonResponse(res);
  if (data?.error) {
    console.log(`⚠️  ${endpoint}: ${data.error}`);
    if (data.preview) {
      console.log(`    ${data.preview}`);
    }
  }
  return data;
}

async function fetchProviderIds() {
  const idsBySlug = new Map();
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage) {
    const data = await apiGet(`providers?per_page=150&page=${page}&order_by=name&order=asc`);
    if (data?.error || !Array.isArray(data?.data)) {
      break;
    }

    for (const provider of data.data) {
      if (provider?.slug && provider?.id) {
        idsBySlug.set(provider.slug, provider.id);
      }
    }

    lastPage = data.meta?.last_page ?? page;
    page += 1;
  }

  return idsBySlug;
}

async function fetchProviderGames(provider, providerId) {
  const attempts = [];

  if (providerId) {
    attempts.push(
      `games?provider[]=${providerId}&per_page=${provider.limit}&order_by=release&order=desc&published=1`,
      `games?provider[]=${providerId}&per_page=${provider.limit}&order_by=updated_at&order=desc&published=1`,
    );
  }

  attempts.push(
    `games?provider=${provider.slug}&limit=${provider.limit}&sort=newest`,
    `games?provider[]=${provider.slug}&per_page=${provider.limit}&order_by=release&order=desc&published=1`,
  );

  for (const endpoint of attempts) {
    const data = await apiGet(endpoint);
    if (data?.error || !Array.isArray(data?.data) || data.data.length === 0) {
      continue;
    }

    const filtered =
      endpoint.includes("provider=") || endpoint.includes("provider[]=")
        ? data.data
        : data.data.filter(
            (game) =>
              game.provider_slug === provider.slug ||
              game.provider?.toLowerCase() === provider.name.toLowerCase(),
          );

    if (filtered.length === 0) {
      continue;
    }

    return filtered.slice(0, provider.limit).map((game) => mapGame(game, provider));
  }

  return null;
}

function writeSlotsFile(allGames) {
  const output = `// Auto-generated by scripts/fetchSlots.mjs — do not edit manually
// Last updated: ${new Date().toISOString()}

export interface SlotGame {
  id: number
  name: string
  slug: string
  provider: "Pragmatic Play" | "Hacksaw Gaming" | "Nolimit City"
  providerSlug: string
  rtp: number
  maxWin: string
  volatility: 1 | 2 | 3
  iframeUrl: string
  thumb: string | null
  releaseDate: string | null
  featured?: boolean
  localBadge?: string
}

export const slots: SlotGame[] = ${JSON.stringify(allGames, null, 2)}

export const HOME_FEATURED_SLOT_SLUGS = [
  "gates-of-gatot-kaca",
  "gates-of-olympus",
  "wanted-dead-or-a-wild",
  "sweet-bonanza",
] as const

export function getSlotById(idOrSlug: string): SlotGame | undefined {
  return slots.find(
    (slot) => slot.slug === idOrSlug || String(slot.id) === idOrSlug,
  )
}

export function getHomeFeaturedSlots(): SlotGame[] {
  return HOME_FEATURED_SLOT_SLUGS.map((slug) =>
    slots.find((slot) => slot.slug === slug),
  ).filter((slot): slot is SlotGame => slot !== undefined)
}
`;

  fs.writeFileSync(OUTPUT_PATH, output);
}

async function fetchGames() {
  if (!token) {
    console.error("❌ SLOTSLAUNCH_API_TOKEN is not set");
    process.exit(1);
  }

  console.log(`Using Origin: ${originHost}`);

  const providerIds = await fetchProviderIds();
  console.log(`Providers indexed: ${providerIds.size}`);

  const allGames = [];
  const seenSlugs = new Set();

  for (const provider of providers) {
    const providerId = providerIds.get(provider.slug);
    if (!providerId) {
      console.log(`⚠️  ${provider.name}: provider id not found, trying slug filter`);
    }

    const games = await fetchProviderGames(provider, providerId);
    if (games?.length) {
      for (const game of games) {
        if (seenSlugs.has(game.slug)) continue;
        seenSlugs.add(game.slug);
        allGames.push(game);
      }
      console.log(`✅ ${provider.name}: ${games.length} games fetched`);
    } else {
      console.log(`❌ ${provider.name}: failed`);
    }
  }

  if (allGames.length === 0) {
    console.error("\n❌ No games fetched from SlotsLaunch API");
    process.exit(1);
  }

  writeSlotsFile(allGames);
  console.log(`\n✅ Total: ${allGames.length} games written to lib/slotsData.ts`);
}

fetchGames().catch((err) => {
  console.error(err);
  process.exit(1);
});
