import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "..");
const dataDir = path.join(appDir, "data");
const statePath = path.join(dataDir, "state.json");
const playersPath = path.join(dataDir, "players.json");
const workbookPath = path.join(dataDir, "worldcup_players.xlsx");

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const ESPN_ATHLETE_BASE = "https://site.web.api.espn.com/apis/common/v3/sports/soccer/athletes";
const FIFA_RANKING_URL =
  "https://inside.fifa.com/api/live-world-ranking/get-rankings?mode=schedule&gender=1&locale=en&scheduleId=FRS_Male_Football_20260401&count=250";
const FIFA_RANKING_SOURCE = "FIFA/Coca-Cola Men's World Ranking, 11 June 2026";

const leagueNames = {
  "eng.1": "Premier League",
  "eng.2": "Championship",
  "eng.3": "League One",
  "eng.5": "National League",
  "esp.1": "La Liga",
  "esp.2": "LaLiga 2",
  "ita.1": "Serie A",
  "ita.2": "Serie B",
  "ger.1": "Bundesliga",
  "ger.2": "2. Bundesliga",
  "fra.1": "Ligue 1",
  "fra.2": "Ligue 2",
  "usa.1": "MLS",
  "mex.1": "Liga MX",
  "por.1": "Primeira Liga",
  "ned.1": "Eredivisie",
  "sco.1": "Scottish Premiership",
  "bel.1": "Belgian Pro League",
  "tur.1": "Super Lig",
  "sau.1": "Saudi Pro League",
  "ksa.1": "Saudi Pro League",
  "qat.1": "Qatar Stars League",
  "uae.1": "UAE Pro League",
  "gre.1": "Super League Greece",
  "aut.1": "Austrian Bundesliga",
  "sui.1": "Swiss Super League",
  "den.1": "Danish Superliga",
  "nor.1": "Eliteserien",
  "swe.1": "Allsvenskan",
  "rus.1": "Russian Premier League",
  "ukr.1": "Ukrainian Premier League",
  "jpn.1": "J1 League",
  "kor.1": "K League 1",
  "chn.1": "Chinese Super League",
  "arg.1": "Liga Profesional",
  "arg.3": "Argentine Primera B Metropolitana",
  "bra.1": "Brasileirao",
  "bra.2": "Campeonato Brasileiro Serie B",
  "col.1": "Primera A",
  "chi.1": "Chilean Primera Division",
  "crc.1": "Costa Rican Primera Division",
  "ecu.1": "Ecuadorian Serie A",
  "hon.1": "Honduran Liga Nacional",
  "idn.1": "Liga 1 Indonesia",
  "irl.1": "League of Ireland Premier Division",
  "isr.1": "Israeli Premier League",
  "mys.1": "Malaysia Super League",
  "ned.2": "Eerste Divisie",
  "par.1": "Paraguayan Primera Division",
  "per.1": "Peruvian Liga 1",
  "rou.1": "Liga I",
  "usa.usl.1": "USL Championship",
  "ven.1": "Venezuelan Primera Division",
  "uru.1": "Primera Division",
  "rsa.1": "Premier Soccer League",
  "egy.1": "Egyptian Premier League",
  "aus.1": "A-League",
  "mls.1": "MLS",
  "cyp.1": "Cypriot First Division",
  "afc.champions": "AFC Champions League",
  "afc.cup": "AFC Cup",
  "caf.champions": "CAF Champions League",
  "caf.confed": "CAF Confederation Cup",
};

const clubLeagueOverrides = {
  agmk: "Uzbekistan Super League",
  alahly: "Egyptian Premier League",
  alahli: "Saudi Pro League",
  alduhail: "Qatar Stars League",
  alettifaq: "Saudi Pro League",
  alfaisaly: "Jordanian Pro League",
  alfayha: "Saudi Pro League",
  algharafa: "Qatar Stars League",
  alhilal: "Saudi Pro League",
  alhussein: "Jordanian Pro League",
  alittihad: "Saudi Pro League",
  alnajma: "Saudi Pro League",
  alnassr: "Saudi Pro League",
  alorobah: "Saudi Pro League",
  alqadsiah: "Saudi Pro League",
  alrayyan: "Qatar Stars League",
  alriyadh: "Saudi Pro League",
  alsadd: "Qatar Stars League",
  alshabab: "Saudi Pro League",
  alshorta: "Iraqi Premier League",
  alwahda: "UAE Pro League",
  alwakrah: "Qatar Stars League",
  alwehdat: "Jordanian Pro League",
  alzawraa: "Iraqi Premier League",
  akrontolyatti: "Russian Premier League",
  airforceclub: "Iraqi Premier League",
  asfar: "Botola Pro",
  boracbanjaluka: "Premier League of Bosnia and Herzegovina",
  clubsportifsfaxien: "Tunisian Ligue Professionnelle 1",
  dender: "Belgian Pro League",
  dinamozagreb: "Croatian Football League",
  dynamomakhachkala: "Russian Premier League",
  esperancesportivedetunis: "Tunisian Ligue Professionnelle 1",
  esteghlal: "Persian Gulf Pro League",
  fastavzlin: "Czech First League",
  fcastana: "Kazakhstan Premier League",
  fcseoul: "K League 1",
  ferencvaros: "Nemzeti Bajnoksag I",
  gangwonfc: "K League 1",
  gyorietofc: "Nemzeti Bajnoksag I",
  hajduksplit: "Croatian Football League",
  jeonbukmotors: "K League 1",
  jskabylie: "Algerian Ligue Professionnelle 1",
  khaldiya: "Bahraini Premier League",
  legiawarsaw: "Ekstraklasa",
  lokomotivetashkent: "Uzbekistan Super League",
  maribor: "Slovenian PrvaLiga",
  nasafqarshi: "Uzbekistan Super League",
  navbahor: "Uzbekistan Super League",
  neomsc: "Saudi Pro League",
  nkmaribor: "Slovenian PrvaLiga",
  paidelinnameeskond: "Meistriliiga",
  pakhtakortashkent: "Uzbekistan Super League",
  persepolis: "Persian Gulf Pro League",
  pyramidsfc: "Egyptian Premier League",
  puskasakademia: "Nemzeti Bajnoksag I",
  redstarbelgrade: "Serbian SuperLiga",
  rijeka: "Croatian Football League",
  rsbberkane: "Botola Pro",
  sepahan: "Persian Gulf Pro League",
  shababalahli: "UAE Pro League",
  sjk: "Veikkausliiga",
  slovanbratislava: "Slovak First Football League",
  spartaprague: "Czech First League",
  torreense: "Liga Portugal 2",
  traktorsazifc: "Persian Gulf Pro League",
  ulsanhd: "K League 1",
  usmalger: "Algerian Ligue Professionnelle 1",
  viktoriaplzen: "Czech First League",
  zamalek: "Egyptian Premier League",
};

const positionOrder = {
  G: 1,
  GK: 1,
  D: 2,
  DF: 2,
  M: 3,
  MF: 3,
  F: 4,
  FW: 4,
};

function coreApiUrl(ref) {
  return ref ? ref.replace("sports.core.api.espn.pvt", "sports.core.api.espn.com").replace(/^http:/, "https:") : null;
}

function leagueNameFromCode(code) {
  return code ? leagueNames[code] || code : "";
}

function readableLeagueName(value) {
  return value ? leagueNames[value] || value : "";
}

function leagueName(ref) {
  const value = ref || "";
  const match = /\/leagues\/([^/?#]+)/.exec(value) || /\/league\/([^/?#]+)/.exec(value) || /[?&]league=([^&#]+)/.exec(value);
  return match ? leagueNameFromCode(match[1]) : "";
}

function leagueNameFromLinks(links) {
  for (const link of links || []) {
    const name = leagueName(link.href);
    if (name) return name;
  }
  return "";
}

function cleanTeamName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json,text/plain,*/*",
      "user-agent": "Mozilla/5.0 Codex data refresh",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} from ${new URL(url).hostname}: ${url}`);
  }
  return response.json();
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = next++;
      if (index >= items.length) break;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function extractRosterItems(athletes) {
  return (athletes || []).flatMap((entry) => (Array.isArray(entry.items) ? entry.items : [entry]));
}

function normalizePlayer(player, team, rank) {
  const position = player.position?.abbreviation || player.position?.name || "";
  return {
    id: String(player.id || ""),
    name: player.fullName || player.displayName || "",
    shortName: player.shortName || "",
    jersey: player.jersey || "",
    position,
    positionName: player.position?.displayName || player.position?.name || position,
    age: player.age ?? null,
    dateOfBirth: player.dateOfBirth || "",
    citizenship: player.citizenship || "",
    teamId: team.teamId,
    country: team.name,
    countryAbbrev: team.abbrev,
    group: team.group,
    fifaRank: rank?.rank ?? null,
    fifaRankPrevious: rank?.previousRank ?? null,
    fifaPoints: rank?.totalPoints != null ? Number(rank.totalPoints.toFixed(2)) : null,
    fifaConfederation: rank?.confederationName || "",
    club: player.club?.displayName || "",
    clubRef: coreApiUrl(player.defaultTeam?.$ref),
    league: leagueName(player.defaultLeague?.$ref),
    headshot: player.headshot?.href || "",
    playerUrl: player.links?.find((link) => Array.isArray(link.rel) && link.rel.includes("playercard"))?.href || "",
  };
}

function isCountryPlaceholder(clubName, team) {
  if (!clubName) return false;
  const club = cleanTeamName(clubName);
  return club === cleanTeamName(team.name) || club === cleanTeamName(team.abbrev);
}

function leagueNameForClub(clubName) {
  return clubLeagueOverrides[cleanTeamName(clubName)] || "";
}

async function resolveClubName(clubRef, cache) {
  if (!clubRef) return "";
  if (!cache.has(clubRef)) {
    cache.set(
      clubRef,
      fetchJson(clubRef)
        .then((club) => club.displayName || club.shortDisplayName || club.name || "")
        .catch(() => "")
    );
  }
  return cache.get(clubRef);
}

async function fetchAthleteProfile(playerId, cache) {
  if (!playerId) return null;
  if (!cache.has(playerId)) {
    cache.set(playerId, fetchJson(`${ESPN_ATHLETE_BASE}/${playerId}`).catch(() => null));
  }
  return cache.get(playerId);
}

async function resolveClubAndLeague(player, team, caches) {
  const profile = await fetchAthleteProfile(player.id, caches.athlete);
  const clubTeam = profile?.athlete?.team;
  if (clubTeam && !clubTeam.isNational) {
    player.club = clubTeam.displayName || clubTeam.shortDisplayName || clubTeam.name || player.club;
    player.league = leagueNameForClub(player.club) || leagueNameFromLinks(clubTeam.links) || player.league;
  }

  if (!player.club && player.clubRef) {
    player.club = await resolveClubName(player.clubRef, caches.club);
  }

  if (!player.league && player.club) {
    player.league = leagueNameForClub(player.club);
  }

  if (isCountryPlaceholder(player.club, team)) {
    player.club = "";
  }
  player.league = leagueNameForClub(player.club) || readableLeagueName(player.league);
  if (player.league?.startsWith("fifa.")) {
    player.league = "";
  }
  player.club ||= "Club unlisted by ESPN";
  player.league ||= "League unlisted by ESPN";
  return player;
}

function getTeams(state) {
  const teams = [];
  for (const group of state.groups || []) {
    for (const entry of group.entries || []) {
      teams.push({
        ...entry,
        group: group.name,
        teamId: String(entry.teamId),
      });
    }
  }
  return teams;
}

function matchRank(team, rankByCode, rankByName) {
  return rankByCode.get(team.abbrev) || rankByName.get(cleanTeamName(team.name)) || null;
}

function updateStateRankings(state, ranks, generatedAt) {
  const rankByCode = new Map(ranks.map((rank) => [rank.countryCode, rank]));
  const rankByName = new Map(ranks.map((rank) => [cleanTeamName(rank.teamName), rank]));
  for (const group of state.groups || []) {
    for (const entry of group.entries || []) {
      const rank = matchRank(entry, rankByCode, rankByName);
      if (!rank) continue;
      entry.fifaRank = rank.rank;
      entry.fifaRankPrevious = rank.previousRank;
      entry.fifaPoints = Number(rank.totalPoints.toFixed(2));
      entry.fifaConfederation = rank.confederationName;
      entry.fifaCountryCode = rank.countryCode;
    }
  }
  state.rankingSource = {
    name: FIFA_RANKING_SOURCE,
    url: "https://inside.fifa.com/fifa-world-ranking/men",
    apiUrl: FIFA_RANKING_URL,
    generatedAt,
  };
}

async function buildWorkbook({ players, teams, ranks, sourceMeta }) {
  const workbook = Workbook.create();
  const playersSheet = workbook.worksheets.add("Players");
  const teamsSheet = workbook.worksheets.add("Teams");
  const sourcesSheet = workbook.worksheets.add("Sources");

  const playerHeaders = [
    "Country",
    "Country Code",
    "Group",
    "FIFA Rank",
    "Player",
    "Jersey",
    "Position",
    "Club",
    "League",
    "Age",
    "Confederation",
    "ESPN Player URL",
  ];
  const playerRows = players.map((player) => [
    player.country,
    player.countryAbbrev,
    player.group,
    player.fifaRank,
    player.name,
    player.jersey,
    player.positionName || player.position,
    player.club,
    player.league,
    player.age,
    player.fifaConfederation,
    player.playerUrl,
  ]);
  playersSheet.getRangeByIndexes(0, 0, playerRows.length + 1, playerHeaders.length).values = [playerHeaders, ...playerRows];
  playersSheet.tables.add(`A1:L${playerRows.length + 1}`, true, "PlayersTable");
  playersSheet.freezePanes.freezeRows(1);

  const teamHeaders = [
    "Country",
    "Country Code",
    "Group",
    "FIFA Rank",
    "Previous Rank",
    "FIFA Points",
    "Confederation",
    "Players Listed",
    "ESPN Team ID",
  ];
  const playerCounts = new Map();
  for (const player of players) {
    playerCounts.set(player.teamId, (playerCounts.get(player.teamId) || 0) + 1);
  }
  const rankByCode = new Map(ranks.map((rank) => [rank.countryCode, rank]));
  const rankByName = new Map(ranks.map((rank) => [cleanTeamName(rank.teamName), rank]));
  const teamRows = teams.map((team) => {
    const rank = matchRank(team, rankByCode, rankByName);
    return [
      team.name,
      team.abbrev,
      team.group,
      rank?.rank ?? "",
      rank?.previousRank ?? "",
      rank?.totalPoints != null ? Number(rank.totalPoints.toFixed(2)) : "",
      rank?.confederationName || "",
      playerCounts.get(team.teamId) || 0,
      team.teamId,
    ];
  });
  teamsSheet.getRangeByIndexes(0, 0, teamRows.length + 1, teamHeaders.length).values = [teamHeaders, ...teamRows];
  teamsSheet.tables.add(`A1:I${teamRows.length + 1}`, true, "TeamsTable");
  teamsSheet.freezePanes.freezeRows(1);

  const sourceRows = [
    ["Generated at", sourceMeta.generatedAt],
    ["FIFA ranking source", sourceMeta.fifaRankingSource],
    ["FIFA ranking page", sourceMeta.fifaRankingPage],
    ["FIFA ranking API", sourceMeta.fifaRankingApi],
    ["Roster source", sourceMeta.rosterSource],
    ["Athlete profile source", sourceMeta.athleteSource],
    [
      "Notes",
      "Club and league fields prefer ESPN athlete profile club metadata, with roster/default team metadata as fallback. Unlisted values are labeled when ESPN has no club or league.",
    ],
  ];
  sourcesSheet.getRangeByIndexes(0, 0, sourceRows.length, 2).values = sourceRows;

  for (const sheet of [playersSheet, teamsSheet, sourcesSheet]) {
    sheet.showGridLines = false;
    const used = sheet.getUsedRange();
    used.format.font = { name: "Aptos", size: 10, color: "#111827" };
    used.format.borders = { preset: "all", style: "thin", color: "#E5E7EB" };
    sheet.getRangeByIndexes(0, 0, 1, used.columnCount).format = {
      fill: "#0F172A",
      font: { bold: true, color: "#FFFFFF" },
    };
    sheet.getRangeByIndexes(0, 0, used.rowCount, used.columnCount).format.wrapText = true;
  }

  const widths = [160, 92, 92, 82, 190, 70, 125, 180, 180, 60, 120, 260];
  widths.forEach((width, index) => {
    playersSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
  [160, 92, 92, 82, 95, 95, 130, 95, 95].forEach((width, index) => {
    teamsSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
  [180, 640].forEach((width, index) => {
    sourcesSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });

  const playersPreview = await workbook.render({ sheetName: "Players", range: "A1:L24", scale: 1, format: "png" });
  await fs.writeFile(path.join(dataDir, "worldcup_players_preview.png"), new Uint8Array(await playersPreview.arrayBuffer()));
  const teamsPreview = await workbook.render({ sheetName: "Teams", range: "A1:I24", scale: 1, format: "png" });
  await fs.writeFile(path.join(dataDir, "worldcup_teams_preview.png"), new Uint8Array(await teamsPreview.arrayBuffer()));
  const sourcesPreview = await workbook.render({ sheetName: "Sources", range: "A1:B7", scale: 1, format: "png" });
  await fs.writeFile(path.join(dataDir, "worldcup_sources_preview.png"), new Uint8Array(await sourcesPreview.arrayBuffer()));

  const scan = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 100 },
    summary: "final formula error scan",
  });
  console.log(scan.ndjson);

  const xlsx = await SpreadsheetFile.exportXlsx(workbook);
  await xlsx.save(workbookPath);
}

async function main() {
  const generatedAt = new Date().toISOString();
  const state = JSON.parse(await fs.readFile(statePath, "utf8"));
  const teams = getTeams(state);

  console.log(`Fetching FIFA rankings...`);
  const rankingResponse = await fetchJson(FIFA_RANKING_URL);
  const ranks = rankingResponse.rankings || [];
  updateStateRankings(state, ranks, generatedAt);

  const rankByCode = new Map(ranks.map((rank) => [rank.countryCode, rank]));
  const rankByName = new Map(ranks.map((rank) => [cleanTeamName(rank.teamName), rank]));

  console.log(`Fetching ${teams.length} ESPN rosters...`);
  const caches = {
    club: new Map(),
    athlete: new Map(),
  };
  const teamResults = await mapLimit(teams, 6, async (team) => {
    const rank = matchRank(team, rankByCode, rankByName);
    const roster = await fetchJson(`${ESPN_BASE}/teams/${team.teamId}/roster`);
    const normalized = extractRosterItems(roster.athletes).map((player) => normalizePlayer(player, team, rank));
    await mapLimit(normalized, 8, (player) => resolveClubAndLeague(player, team, caches));
    return {
      team,
      rank,
      players: normalized
        .map(({ clubRef, ...player }) => player)
        .sort((a, b) => {
          const pos = (positionOrder[a.position] || 9) - (positionOrder[b.position] || 9);
          if (pos) return pos;
          return (Number(a.jersey) || 99) - (Number(b.jersey) || 99) || a.name.localeCompare(b.name);
        }),
    };
  });

  const players = teamResults.flatMap((result) => result.players);
  const playersPayload = {
    generatedAt,
    rosterSource: ESPN_BASE,
    rankingSource: state.rankingSource,
    teams: teamResults.map(({ team, rank, players }) => ({
      teamId: team.teamId,
      name: team.name,
      abbrev: team.abbrev,
      group: team.group,
      fifaRank: rank?.rank ?? null,
      fifaRankPrevious: rank?.previousRank ?? null,
      fifaPoints: rank?.totalPoints != null ? Number(rank.totalPoints.toFixed(2)) : null,
      fifaConfederation: rank?.confederationName || "",
      playerCount: players.length,
    })),
    players,
  };

  await fs.writeFile(playersPath, `${JSON.stringify(playersPayload, null, 2)}\n`, "utf8");
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

  console.log(`Building workbook with ${players.length} players...`);
  await buildWorkbook({
    players,
    teams,
    ranks,
    sourceMeta: {
      generatedAt,
      fifaRankingSource: FIFA_RANKING_SOURCE,
      fifaRankingPage: "https://inside.fifa.com/fifa-world-ranking/men",
      fifaRankingApi: FIFA_RANKING_URL,
      rosterSource: ESPN_BASE,
      athleteSource: ESPN_ATHLETE_BASE,
    },
  });

  const missingRanks = teams.filter((team) => !matchRank(team, rankByCode, rankByName)).map((team) => `${team.name} (${team.abbrev})`);
  const missingClubCount = players.filter((player) => !player.club).length;
  const missingLeagueCount = players.filter((player) => !player.league).length;
  console.log(
    JSON.stringify(
      {
        generatedAt,
        teams: teams.length,
        players: players.length,
        workbookPath,
        playersPath,
        missingRanks,
        missingClubCount,
        missingLeagueCount,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
