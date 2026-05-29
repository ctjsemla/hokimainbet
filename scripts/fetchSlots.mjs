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
const origin =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://hokimainbet.com";

const providers = [
  { slug: "pragmatic-play", name: "Pragmatic Play", limit: 20 },
  { slug: "hacksaw-gaming", name: "Hacksaw Gaming", limit: 15 },
  { slug: "nolimit-city", name: "Nolimit City", limit: 10 },
];

const FEATURED_BY_SLUG = {
  "gates-of-gatot-kaca": { featured: true, localBadge: "🇮🇩 UNGGULAN" },
};

const OUTPUT_PATH = path.join(process.cwd(), "lib/slotsData.ts");

function mapVolatility(value) {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function mapGame(game, provider) {
  const slug = game.slug;
  const overrides = FEATURED_BY_SLUG[slug] ?? {};
  const apiId = game.id;
  const iframeUrl =
    game.url ||
    `https://slotslaunch.com/iframe/${apiId}?token=${token}`;

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
    return { error: "Non-JSON response (network block or HTML error page)" };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: "Invalid JSON response" };
  }
}

const PROVIDER_SLUG_BY_NAME = {
  "Pragmatic Play": "pragmatic-play",
  "Hacksaw Gaming": "hacksaw-gaming",
  "Nolimit City": "nolimit-city",
};

function migrateLegacySlotsFile() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return false;
  }

  const source = fs.readFileSync(OUTPUT_PATH, "utf8");
  if (!source.includes('id: "') && !source.includes("id: '")) {
    return false;
  }

  const entries = [...source.matchAll(
    /\{\s*id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?provider:\s*"([^"]+)"[\s\S]*?rtp:\s*([\d.]+)[\s\S]*?maxWin:\s*"([^"]+)"[\s\S]*?volatility:\s*(\d)[\s\S]*?iframeUrl:\s*"([^"]+)"(?:[\s\S]*?featured:\s*true)?(?:[\s\S]*?localBadge:\s*"([^"]*)")?/g,
  )];

  if (entries.length === 0) {
    return false;
  }

  const games = entries.map((match, index) => {
    const slug = match[1];
    const provider = match[3];
    const overrides = FEATURED_BY_SLUG[slug] ?? {};
    return {
      id: 90_000 + index,
      name: match[2],
      slug,
      provider,
      providerSlug: PROVIDER_SLUG_BY_NAME[provider] ?? "pragmatic-play",
      rtp: Number(match[4]),
      maxWin: match[5],
      volatility: Number(match[6]),
      iframeUrl: match[7],
      thumb: null,
      releaseDate: null,
      ...overrides,
    };
  });

  writeSlotsFile(games);
  console.log(
    `\n⚠️  API unavailable — migrated ${games.length} legacy games to lib/slotsData.ts`,
  );
  return true;
}

async function fetchProviderGames(provider) {
  const headers = {
    Accept: "application/json",
    Origin: origin,
  };

  const attempts = [
    `https://slotslaunch.com/api/games?token=${token}&provider=${provider.slug}&limit=${provider.limit}&sort=newest`,
    `https://slotslaunch.com/api/games?token=${token}&provider[]=${provider.slug}&per_page=${provider.limit}&order_by=release&order=desc&published=1`,
    `https://slotslaunch.com/api/games?token=${token}&per_page=${provider.limit}&order_by=release&order=desc&published=1`,
  ];

  for (const url of attempts) {
    let res;
    try {
      res = await fetch(url, { headers });
    } catch (err) {
      console.log(`⚠️  ${provider.name}: request failed — ${err.message}`);
      continue;
    }
    const data = await parseJsonResponse(res);

    if (data?.error) {
      console.log(`⚠️  ${provider.name}: ${data.error}`);
      continue;
    }

    if (!Array.isArray(data?.data) || data.data.length === 0) {
      continue;
    }

    const filtered =
      attempts[2] === url
        ? data.data.filter(
            (game) =>
              game.provider_slug === provider.slug ||
              game.provider?.toLowerCase() === provider.name.toLowerCase(),
          )
        : data.data;

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

  const allGames = [];

  for (const provider of providers) {
    const games = await fetchProviderGames(provider);
    if (games?.length) {
      allGames.push(...games);
      console.log(`✅ ${provider.name}: ${games.length} games fetched`);
    } else {
      console.log(`❌ ${provider.name}: failed`);
    }
  }

  if (allGames.length === 0) {
    if (migrateLegacySlotsFile()) {
      process.exit(0);
    }
    if (fs.existsSync(OUTPUT_PATH)) {
      console.log(
        "\n⚠️  No games fetched — keeping existing lib/slotsData.ts for build",
      );
      process.exit(0);
    }
    console.error("\n❌ No games fetched and no existing slotsData.ts");
    process.exit(1);
  }

  writeSlotsFile(allGames);
  console.log(`\n✅ Total: ${allGames.length} games written to lib/slotsData.ts`);
}

fetchGames().catch((err) => {
  console.error(err);
  process.exit(1);
});
