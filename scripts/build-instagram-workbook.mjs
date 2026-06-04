import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "/Users/gerwins/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs/social");
const dataPath = path.join(root, "data/social/instagram-first-3-months-2026.json");
const posts = JSON.parse(await fs.readFile(dataPath, "utf8"));

const workbook = Workbook.create();
const overview = workbook.worksheets.add("Übersicht");
const monthCalendar = workbook.worksheets.add("Kalender");
const calendar = workbook.worksheets.add("Content Kalender");
const postingTexts = workbook.worksheets.add("Posting Texte");
const briefs = workbook.worksheets.add("Creative Briefs");

const abs = (relativePath) => path.join(root, relativePath);
const weekday = (date) => new Intl.DateTimeFormat("de-DE", { weekday: "long" }).format(new Date(`${date}T12:00:00`));
const fullDate = (date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T12:00:00`));
const periodLabel = `${fullDate(posts[0].date)} bis ${fullDate(posts[posts.length - 1].date)}`;

overview.getRange("A1:F1").values = [["Morrow Instagram Plan", "", "", "", "", ""]];
overview.getRange("A3:B10").values = [
  ["Zeitraum", periodLabel],
  ["Frequenz", "Launch am Freitag, danach 3 Feed-Posts pro Woche"],
  ["Format", "1080 x 1350 px"],
  ["Anzahl Beiträge", posts.length],
  ["Creative-System", "Styleguide Social Media: Photo Quote, Story Photo, Editorial Look, Photo Poster"],
  ["Upload-Rhythmus", "Freitag 19:30 zum Start, danach Montag 19:30, Mittwoch 12:15, Sonntag 09:30"],
  ["Ziel", "Profilvertrauen, organischer Aufbau, sichtbare Markenwelt"],
  ["Hinweis", "Captions sind direkt zum Kopieren vorbereitet, inklusive Hashtags."],
];

const calendarHeaders = [
  "Nr.",
  "Datum",
  "Wochentag",
  "Uhrzeit",
  "Säule",
  "Content-Rolle",
  "Styleguide Template",
  "Format",
  "Slide-Anzahl",
  "Cover Datei",
  "Carousel Ordner",
  "Headline im Creative",
  "Beschreibung / Caption Copy-Paste",
  "Hashtags separat",
  "Status",
  "Notizen",
];

const calendarRows = posts.map((post) => {
  const tags = (post.caption.match(/#[A-Za-zÀ-ÿ0-9]+/g) || []).join(" ");
  return [
    Number(post.id),
    post.date,
    weekday(post.date),
    post.time,
    post.pillar,
    post.contentRole || "",
    post.styleguideTemplate,
    post.format,
    post.slides?.length ? post.slides.length + 1 : 1,
    abs(`public/social/instagram/stills/morrow-instagram-${post.id}.png`),
    post.slides?.length ? abs(`public/social/instagram/carousels/morrow-instagram-${post.id}`) : "",
    post.headline,
    post.caption,
    tags,
    "geplant",
    "",
  ];
});

calendar.getRange(`A1:P${calendarRows.length + 1}`).values = [calendarHeaders, ...calendarRows];

const monday = (date) => {
  const d = new Date(`${date}T12:00:00`);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
};
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const isoDate = (date) => date.toISOString().slice(0, 10);
const displayDate = (date) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(date);
const weekStart = monday(posts[0].date);
const weekEnd = monday(posts[posts.length - 1].date);
const weekCount = Math.round((weekEnd - weekStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
const postsByDate = new Map(posts.map((post) => [post.date, post]));
const calendarGrid = [["Woche", "Montag", "Mittwoch", "Freitag", "Sonntag"]];
const postCard = (post) => {
  if (!post) return "Kein Posting geplant";
  return [
    `${new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" }).format(new Date(`${post.date}T12:00:00`))} | ${post.time}`,
    `Post ${Number(post.id)} | ${post.format}`,
    post.headline,
    "",
    "Beschreibung Copy-Paste inkl. Hashtags:",
    post.caption,
  ].join("\n");
};

for (let week = 0; week < weekCount; week += 1) {
  const currentWeek = addDays(weekStart, week * 7);
  calendarGrid.push([
    `${displayDate(currentWeek)} - ${displayDate(addDays(currentWeek, 6))}`,
    postCard(postsByDate.get(isoDate(currentWeek))),
    postCard(postsByDate.get(isoDate(addDays(currentWeek, 2)))),
    postCard(postsByDate.get(isoDate(addDays(currentWeek, 4)))),
    postCard(postsByDate.get(isoDate(addDays(currentWeek, 6)))),
  ]);
}

monthCalendar.getRange(`A1:E${calendarGrid.length}`).values = calendarGrid;

const postingHeaders = [
  "Nr.",
  "Datum",
  "Uhrzeit",
  "Format",
  "Headline",
  "Beschreibung Copy-Paste inkl. Hashtags",
  "Creative Datei",
  "Carousel Ordner",
];
const postingRows = posts.map((post) => [
  Number(post.id),
  post.date,
  post.time,
  post.format,
  post.headline,
  post.caption,
  abs(`public/social/instagram/stills/morrow-instagram-${post.id}.png`),
  post.slides?.length ? abs(`public/social/instagram/carousels/morrow-instagram-${post.id}`) : "",
]);
postingTexts.getRange(`A1:H${postingRows.length + 1}`).values = [postingHeaders, ...postingRows];

const briefHeaders = ["Nr.", "Creative-System", "Gestaltungslogik", "Bild/Foto", "Copy-Rolle", "Slides", "Styleguide-Bezug"];
const briefRows = posts.map((post) => {
  const designLogic = {
    quote: "Olive/Brown Zitatkarte mit Rahmen, großem Anführungszeichen und Editorial-Footer.",
    photo: "Vollflächiges warmes Morrow-Foto, große Story-Typografie, Logo oben.",
    split: "Brown Editorial-Karte mit gerahmtem Foto, großer Typo und dezenter Morrow-Wortmarke.",
    checklist: "Offwhite Foto-Poster mit riesigem Wochentag, Datum/Uhrzeit und hochwertigem Morrow-Fotomotiv.",
  }[post.layout];

  const asset = post.asset ? abs(post.asset) : "Typografie/Fotofläche";
  return [
    Number(post.id),
    post.styleguideTemplate,
    designLogic,
    asset,
    post.pillar,
    post.slides
      ?.map((slide, index) => {
        const support = slide.support?.map(([label, value]) => `   ${label}: ${value}`).join("\n");
        return `${index + 2}. ${slide.title} - ${slide.body}${support ? `\n${support}` : ""}`;
      })
      .join("\n") || "Single Still",
    "Orientiert an Styleguide-Seite Social Media sowie Morrow-Imagery-Regeln.",
  ];
});
briefs.getRange(`A1:G${briefRows.length + 1}`).values = [briefHeaders, ...briefRows];

overview.getRange("A1:F1").merge();
overview.getRange("A1:F1").format = { fontWeight: "bold", fontSize: 20, fill: { color: "#ece6d6" } };
overview.getRange("A3:A10").format = { fontWeight: "bold", fill: { color: "#f7f4eb" } };
monthCalendar.showGridLines = false;
monthCalendar.getRange("A1:E1").format = { fontWeight: "bold", fontSize: 13, fill: { color: "#75491f" }, fontColor: "#ece6d6", horizontalAlignment: "center" };
monthCalendar.getRange(`A2:E${calendarGrid.length}`).format = {
  wrapText: true,
  verticalAlignment: "top",
  fill: { color: "#f7f4eb" },
  borders: { color: "#cdbd9d", style: "continuous" },
};
monthCalendar.getRange("A:A").format.columnWidthPx = 110;
monthCalendar.getRange("B:E").format.columnWidthPx = 360;
monthCalendar.getRange(`2:${calendarGrid.length}`).format.rowHeightPx = 430;
calendar.getRange("A1:P1").format = { fontWeight: "bold", fill: { color: "#ece6d6" } };
calendar.getRange(`M2:M${calendarRows.length + 1}`).format = { wrapText: true, verticalAlignment: "top" };
calendar.getRange("M:M").format.columnWidthPx = 420;
postingTexts.getRange("A1:H1").format = { fontWeight: "bold", fill: { color: "#ece6d6" } };
postingTexts.getRange(`F2:F${postingRows.length + 1}`).format = { wrapText: true, verticalAlignment: "top" };
postingTexts.getRange("F:F").format.columnWidthPx = 520;
postingTexts.getRange(`2:${postingRows.length + 1}`).format.rowHeightPx = 145;
briefs.getRange("A1:G1").format = { fontWeight: "bold", fill: { color: "#ece6d6" } };

monthCalendar.freezePanes.freezeRows(1);
calendar.freezePanes.freezeRows(1);
postingTexts.freezePanes.freezeRows(1);

await fs.mkdir(outputDir, { recursive: true });

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const calendarCheck = await workbook.inspect({
  kind: "table",
  range: "Kalender!A1:E4",
  include: "values",
  tableMaxRows: 4,
  tableMaxCols: 5,
});
console.log(calendarCheck.ndjson);

const postingTextCheck = await workbook.inspect({
  kind: "table",
  range: "Posting Texte!A1:F5",
  include: "values",
  tableMaxRows: 5,
  tableMaxCols: 6,
});
console.log(postingTextCheck.ndjson);

const overviewPreview = await workbook.render({ sheetName: "Übersicht", range: "A1:F10", scale: 1 });
await fs.writeFile(
  path.join(outputDir, "morrow-instagram-content-plan-overview-preview.png"),
  Buffer.from(await overviewPreview.arrayBuffer()),
);

const calendarPreview = await workbook.render({ sheetName: "Kalender", range: "A1:E4", scale: 1 });
await fs.writeFile(
  path.join(outputDir, "morrow-instagram-content-plan-calendar-preview.png"),
  Buffer.from(await calendarPreview.arrayBuffer()),
);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outputDir, "morrow-instagram-content-plan-3-monate.xlsx"));
console.log(path.join(outputDir, "morrow-instagram-content-plan-3-monate.xlsx"));
