import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/social/instagram/stills");
const carouselDir = path.join(root, "public/social/instagram/carousels");
const dataDir = path.join(root, "data/social");
const docsDir = path.join(root, "docs/social");

const brand = {
  offblack: "#181715",
  offwhite: "#ece6d6",
  paper: "#fffdf8",
  mist: "#f7f4eb",
  sage: "#706b3f",
  clay: "#75491f",
  sand: "#d8cfbc",
};

const pillars = {
  brand: "Brand Trust",
  family: "Family Escape",
  couple: "Couple Reset",
  spo: "SPO Orientierung",
  care: "Morrow Care",
  conversion: "Anfrage",
};

const posts = [
  {
    id: "01",
    date: "2026-05-18",
    time: "19:30",
    pillar: pillars.brand,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-hero-people-boardwalk.png",
    headline: "Auszeiten, die schon vor der Anreise ruhiger werden.",
    kicker: "Morrow in SPO",
    layout: "photo",
    caption:
      "Manchmal beginnt Erholung nicht erst am Meer. Sondern in dem Moment, in dem nicht mehr alles selbst sortiert werden muss.\n\nMorrow kuratiert Auszeiten in Sankt Peter-Ording: besondere Unterkuenfte, lokale Momente und persoenliche Vorbereitung in einem Aufenthalt.\n\nFuer Familien. Fuer Paare. Fuer alle, die weniger suchen und besser ankommen wollen.\n\n#Morrow #SanktPeterOrding #NordseeAuszeit #KuratierteAuszeit #SPO",
  },
  {
    id: "02",
    date: "2026-05-20",
    time: "12:15",
    pillar: pillars.spo,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-local-orientation.png",
    headline: "Sankt Peter-Ording ist weit. Genau deshalb braucht es gute Orientierung.",
    kicker: "Ort mit Ruhe",
    layout: "split",
    caption:
      "SPO ist kein Ort fuer hektisches Abhaken. Es ist ein Ort fuer Wind, Weite, lange Wege zum Strand und Entscheidungen, die leichter werden, wenn jemand sie vorsortiert.\n\nBei Morrow denken wir Unterkunft, Rhythmus und lokale Empfehlungen zusammen, damit aus einem Aufenthalt eine stimmige Auszeit wird.\n\n#SanktPeterOrding #SPO #Nordseeurlaub #Reiseplanung #Morrow",
  },
  {
    id: "03",
    date: "2026-05-24",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    headline: "Weniger Optionen. Mehr Ankommen.",
    kicker: "Morrow Prinzip",
    layout: "quote",
    caption:
      "Nicht jede Reise wird besser, wenn man mehr Auswahl hat.\n\nUnser Ansatz: wenige, sorgfaeltig kuratierte Auszeiten statt endloser Vergleichssuche. Mit Unterkunft, Ort, Erlebnis und Betreuung, die zusammenpassen.\n\nDas ist ruhiger. Persoenlicher. Und oft genau das, was vor einem freien Wochenende wirklich fehlt.\n\n#MindfulTravel #Nordsee #Auszeit #Morrow #SlowTravel",
  },
  {
    id: "04",
    date: "2026-05-25",
    time: "19:30",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-family.png",
    headline: "Familienurlaub wird leichter, wenn nicht alles gleichzeitig entschieden werden muss.",
    kicker: "Family Escape",
    layout: "photo",
    caption:
      "Mit Kindern ist Urlaub oft dann gut, wenn die grossen Dinge vorbereitet sind und genug Raum fuer kleine Momente bleibt.\n\nUnsere Family Escape denkt genau das zusammen: eine passende Unterkunft, SPO-Weite, ein naturnahes Erlebnis und Empfehlungen, die den Tag nicht voller, sondern einfacher machen.\n\n#Familienurlaub #SanktPeterOrdingMitKindern #NordseeMitKindern #Morrow #FamilyEscape",
  },
  {
    id: "05",
    date: "2026-05-27",
    time: "12:15",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-family-wide-beach.png",
    headline: "Der beste Familientag in SPO hat selten zu viele Punkte.",
    kicker: "Mit Kindern",
    layout: "checklist",
    points: ["Ein Strandabschnitt, der passt", "Ein Plan B bei Wind und Wetter", "Eine Unterkunft, die Pausen ernst nimmt", "Ein Erlebnis, das nicht ueberfordert"],
    caption:
      "Familienurlaub in SPO muss nicht voll sein, um sich reich anzufuehlen.\n\nOft reichen ein guter Strandanker, ein realistischer Tagesrhythmus und ein Moment, der allen in Erinnerung bleibt. Genau diese Auswahl ist Teil unserer kuratierten Auszeiten.\n\n#SPOmitKindern #Familienauszeit #Nordseeurlaub #SanktPeterOrding #Morrow",
  },
  {
    id: "06",
    date: "2026-05-31",
    time: "09:30",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-family-watt.png",
    headline: "Watt, Wind, Sand: manchmal ist das Programm schon da.",
    kicker: "Naturmoment",
    layout: "photo",
    caption:
      "Kinder brauchen nicht immer mehr Programm. Manchmal reicht ein weiter Himmel, nasser Sand unter den Fuessen und genug Zeit, um einfach zu schauen.\n\nMorrow plant nicht jeden Moment durch. Wir schaffen die Bedingungen, damit gute Momente leichter passieren.\n\n#Wattenmeer #NordseeMitKindern #SanktPeterOrding #Familienurlaub #Morrow",
  },
  {
    id: "07",
    date: "2026-06-01",
    time: "19:30",
    pillar: pillars.couple,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-couple.png",
    headline: "Eine Auszeit zu zweit darf leise beginnen.",
    kicker: "Couple Reset",
    layout: "photo",
    caption:
      "Nicht jeder Paarurlaub braucht grosse Gesten. Manchmal geht es um zwei freie Tage, weniger Alltag im Kopf und einen Ort, der Abstand schafft.\n\nUnsere Couple Reset Auszeiten verbinden ruhige Unterkunft, lokale Empfehlungen und genug offene Zeit fuer Spaziergaenge, Dinner oder einfach Nichtstun.\n\n#AuszeitZuZweit #Paarurlaub #SanktPeterOrding #NordseeAuszeit #Morrow",
  },
  {
    id: "08",
    date: "2026-06-03",
    time: "12:15",
    pillar: pillars.couple,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-couple-table-moment.png",
    headline: "Gute Paarzeit entsteht nicht aus Perfektion. Sondern aus Raum.",
    kicker: "Zu zweit",
    layout: "split",
    caption:
      "Ein ruhiger Tisch. Ein Spaziergang ohne Ziel. Ein Abend, der nicht zwischen Buchungsseiten und Restaurantrecherche zerfaellt.\n\nMorrow bereitet vor, damit vor Ort mehr Platz fuer das bleibt, weswegen man losfaehrt: Zeit miteinander.\n\n#Paarzeit #SPO #NordseeZuZweit #SlowTravel #Morrow",
  },
  {
    id: "09",
    date: "2026-06-07",
    time: "09:30",
    pillar: pillars.couple,
    format: "Single Still",
    headline: "Nicht romantischer. Echter.",
    kicker: "Morrow Stimme",
    layout: "quote",
    caption:
      "Wir glauben nicht an inszenierte Romantik.\n\nWir glauben an warme Orte, gute Vorbereitung, ehrliche Naehe und diesen Moment, in dem beide merken: Es war richtig, kurz rauszufahren.\n\n#RomantischesWochenende #SanktPeterOrding #PaarurlaubNordsee #Morrow #Auszeit",
  },
  {
    id: "10",
    date: "2026-06-08",
    time: "19:30",
    pillar: pillars.spo,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-final-boardwalk.png",
    headline: "SPO ist kein Ziel fuer Eile.",
    kicker: "Nordsee Rhythmus",
    layout: "photo",
    caption:
      "Der Weg durch die Duenen. Der erste Blick auf das Wasser. Der Wind, der lauter ist als der Kalender.\n\nSankt Peter-Ording wirkt, wenn man ihm Zeit laesst. Unsere Auszeiten sind darauf gebaut: weniger Druck, mehr Rhythmus.\n\n#SanktPeterOrding #Nordsee #Duenen #AuszeitAmMeer #Morrow",
  },
  {
    id: "11",
    date: "2026-06-10",
    time: "12:15",
    pillar: pillars.spo,
    format: "Single Still",
    headline: "Vier Fragen, bevor du SPO buchst.",
    kicker: "Kurz vor der Planung",
    layout: "checklist",
    points: ["Welcher Strandabschnitt passt zu euch?", "Braucht ihr Ruhe, Erlebnis oder beides?", "Wie viel Planung wollt ihr wirklich vor Ort machen?", "Welche Unterkunft macht Pausen leicht?"],
    caption:
      "SPO kann sehr unterschiedlich wirken, je nachdem, wie man reist.\n\nFamilien brauchen andere Wege als Paare. Ein kurzer Reset braucht andere Anker als eine Ferienwoche. Deshalb beginnt Morrow nicht mit hundert Optionen, sondern mit den richtigen Fragen.\n\n#Reiseplanung #SPOtipps #SanktPeterOrding #Nordseeurlaub #Morrow",
  },
  {
    id: "12",
    date: "2026-06-14",
    time: "09:30",
    pillar: pillars.care,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-arrival-detail.png",
    headline: "Ankommen ist ein Detailgefuehl.",
    kicker: "Vorbereitet",
    layout: "split",
    caption:
      "Ein guter Aufenthalt fuehlt sich nicht zufaellig leicht an.\n\nEr entsteht aus kleinen vorbereiteten Dingen: klare Informationen, passende Empfehlungen, sinnvolle Wege und ein Ansprechpartner, wenn vor Ort doch etwas offen ist.\n\n#Hospitality #Ankommen #NordseeAuszeit #Morrow #SanktPeterOrding",
  },
  {
    id: "13",
    date: "2026-06-15",
    time: "19:30",
    pillar: pillars.care,
    format: "Single Still",
    headline: "Wir kuratieren nicht mehr. Wir kuratieren besser.",
    kicker: "Qualitaet & Care",
    layout: "quote",
    caption:
      "Kuratieren heisst fuer uns nicht, moeglichst viel schoen zu nennen.\n\nEs heisst: auswaehlen, weglassen, zusammenfuehren und Verantwortung fuer das Gefuehl des Aufenthalts uebernehmen.\n\nSo entsteht aus Unterkunft, Ort und Erlebnis eine Auszeit.\n\n#Kuration #TravelBrand #Morrow #Nordsee #Hospitality",
  },
  {
    id: "14",
    date: "2026-06-17",
    time: "12:15",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-family-stay-arrival.png",
    headline: "Familienunterkunft ist mehr als Bettenzahl.",
    kicker: "Stay",
    layout: "split",
    caption:
      "Mit Kindern zaehlt nicht nur, wie viele Personen schlafen koennen.\n\nWichtig ist, ob Ankommen leicht wird, Pausen funktionieren, Wege kurz genug sind und der Ort nicht staendig neue Entscheidungen verlangt.\n\nGenau darauf achten wir bei Morrow Auszeiten.\n\n#Familienunterkunft #NordseeMitKindern #SPO #Morrow #UrlaubMitKindern",
  },
  {
    id: "15",
    date: "2026-06-21",
    time: "09:30",
    pillar: pillars.couple,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-couple-beach-walk.png",
    headline: "Der schoenste Plan ist manchmal ein freier Nachmittag.",
    kicker: "Paarzeit",
    layout: "photo",
    caption:
      "Wir planen Auszeiten nicht, damit jede Stunde gefuellt ist.\n\nWir planen sie, damit freie Zeit nicht leer wirkt: mit passender Unterkunft, guter Orientierung und wenigen Ankern, die den Aufenthalt tragen.\n\n#AuszeitZuZweit #SanktPeterOrding #NordseeZuZweit #Morrow #SlowTravel",
  },
  {
    id: "16",
    date: "2026-06-22",
    time: "19:30",
    pillar: pillars.spo,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-image-set.png",
    headline: "Strand ist in SPO nicht einfach Strand.",
    kicker: "Lokale Orientierung",
    layout: "photo",
    caption:
      "Ording, Bad, Boehl, Dorf/Suedstrand: SPO hat unterschiedliche Strandgefuehle.\n\nWer mit Kindern reist, sucht oft andere Wege und Pausen als ein Paar auf kurzer Auszeit. Deshalb gehoert lokale Orientierung bei Morrow zum Angebot, nicht zum Nachrecherchieren.\n\n#SPO #SanktPeterOrding #Strandurlaub #Nordsee #Morrow",
  },
  {
    id: "17",
    date: "2026-06-24",
    time: "12:15",
    pillar: pillars.spo,
    format: "Single Still",
    headline: "Bei Wind wird SPO nicht schlechter. Nur ehrlicher.",
    kicker: "Nordsee Wetter",
    layout: "quote",
    caption:
      "Nordsee ist nicht Kulisse. Sie ist Wetter, Licht, Wind, Sand und manchmal ein Planwechsel.\n\nGute Auszeiten rechnen damit. Sie brauchen warme Rueckzugsorte, flexible Empfehlungen und genug Gelassenheit fuer das, was der Tag mitbringt.\n\n#NordseeWetter #SanktPeterOrding #AuszeitAmMeer #Morrow #SPO",
  },
  {
    id: "18",
    date: "2026-06-28",
    time: "09:30",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-local-family-orientation.png",
    headline: "Ein guter Familientag braucht eine Richtung, keinen Stundenplan.",
    kicker: "Family Rhythmus",
    layout: "split",
    caption:
      "Der Unterschied ist klein, aber wichtig.\n\nEin Stundenplan macht eng. Eine gute Richtung gibt Sicherheit. Bei Morrow geht es um diesen ruhigen Rahmen: vorbereitet genug, damit ihr vor Ort freier seid.\n\n#Familienurlaub #SPOmitKindern #NordseeFamilie #Morrow #UrlaubOhneStress",
  },
  {
    id: "19",
    date: "2026-06-29",
    time: "19:30",
    pillar: pillars.conversion,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-family-final-moment.png",
    headline: "Family Escape: fuer Familien, die weniger planen und mehr draussen sein wollen.",
    kicker: "Auszeit ansehen",
    layout: "photo",
    caption:
      "Unsere Family Escape ist fuer Familien gedacht, die SPO nicht aus einer langen Liste zusammensuchen moechten.\n\nUnterkunft, Naturmoment, lokale Orientierung und persoenliche Vorbereitung kommen zusammen, damit aus ein paar Tagen am Meer eine echte gemeinsame Zeit wird.\n\nAnfragen sind persoenlich und unverbindlich.\n\n#FamilyEscape #FamilienurlaubSPO #NordseeMitKindern #Morrow #SanktPeterOrding",
  },
  {
    id: "20",
    date: "2026-07-01",
    time: "12:15",
    pillar: pillars.conversion,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-couple-dunes-rest.png",
    headline: "Couple Reset: fuer zwei, die wieder etwas Luft brauchen.",
    kicker: "Auszeit ansehen",
    layout: "photo",
    caption:
      "Eine kurze Auszeit zu zweit muss nicht kompliziert sein.\n\nMorrow verbindet ruhige Unterkunft, SPO-Gefuehl und passende Empfehlungen zu einem Aufenthalt, der nicht nach Arbeit vor dem Urlaub klingt.\n\nWenn ihr ein Wochenende oder ein paar Tage am Meer plant: schreibt uns oder stellt eine Anfrage.\n\n#CoupleReset #PaarurlaubNordsee #AuszeitZuZweit #SanktPeterOrding #Morrow",
  },
  {
    id: "21",
    date: "2026-07-05",
    time: "09:30",
    pillar: pillars.care,
    format: "Single Still",
    headline: "Was Morrow anders macht: Wir denken den Aufenthalt zusammen.",
    kicker: "Nicht nur Unterkunft",
    layout: "checklist",
    points: ["Ausgewaehlte Unterkunft", "Lokales Erlebnis", "Ruhiger Tagesrhythmus", "Persoenliche Betreuung"],
    caption:
      "Morrow ist keine weitere Seite mit Ferienwohnungen.\n\nWir denken aus Sicht der Gaeste: Was braucht dieser Aufenthalt, damit er sich gut anfuehlt? Daraus entsteht die Auszeit, nicht nur die Buchung.\n\n#Morrow #Hospitality #KuratierteReisen #NordseeAuszeit #SPO",
  },
  {
    id: "22",
    date: "2026-07-06",
    time: "19:30",
    pillar: pillars.spo,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-hero-people-table.png",
    headline: "Lokale Empfehlungen sind nur gut, wenn sie zu euch passen.",
    kicker: "Vor Ort",
    layout: "split",
    caption:
      "Nicht jede Empfehlung ist fuer jede Reise richtig.\n\nMit Kindern, zu zweit, bei Regen, in der Nebensaison, mit Hund oder ohne Auto: gute Orientierung entsteht aus Kontext. Deshalb kuratiert Morrow nicht abstrakt, sondern passend zur Auszeit.\n\n#SPOEmpfehlungen #SanktPeterOrding #Nordseeurlaub #Morrow #TravelTips",
  },
  {
    id: "23",
    date: "2026-07-08",
    time: "12:15",
    pillar: pillars.family,
    format: "Single Still",
    headline: "Kinder erinnern sich selten an perfekte Planung.",
    kicker: "Familienzeit",
    layout: "quote",
    caption:
      "Sie erinnern sich an Wind im Gesicht, nasse Schuhe, warmes Licht in der Unterkunft und daran, dass niemand den ganzen Tag aufs Handy schauen musste.\n\nDas ist der Punkt unserer Family-Auszeiten: Vorbereitung, die vor Ort leichter macht.\n\n#Familienzeit #NordseeMitKindern #Morrow #SanktPeterOrding #UrlaubMitKindern",
  },
  {
    id: "24",
    date: "2026-07-12",
    time: "09:30",
    pillar: pillars.couple,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-couple-wide-boardwalk.png",
    headline: "Zwei Tage koennen reichen, wenn sie gut vorbereitet sind.",
    kicker: "Kurz raus",
    layout: "photo",
    caption:
      "Ein Wochenende am Meer muss nicht gross werden, um zu wirken.\n\nWenn Unterkunft, Ankommen, Essen, Wege und Rhythmus vorbereitet sind, bleibt mehr von dem uebrig, wofuer ihr losfahrt: Zeit zu zweit.\n\n#WochenendeAmMeer #Paarurlaub #SPO #Morrow #NordseeAuszeit",
  },
  {
    id: "25",
    date: "2026-07-13",
    time: "19:30",
    pillar: pillars.care,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-interior.png",
    headline: "Rueckzug ist Teil des Erlebnisses.",
    kicker: "Unterkunft",
    layout: "split",
    caption:
      "Eine gute Unterkunft ist nicht nur der Ort zwischen zwei Aktivitaeten.\n\nSie ist der warme Rueckzug nach Wind, Strand und vielen Eindruecken. Deshalb gehoert sie bei Morrow zur Auszeit selbst, nicht nur zur Logistik.\n\n#Ferienunterkunft #Nordseeurlaub #Morrow #SPO #Auszeit",
  },
  {
    id: "26",
    date: "2026-07-15",
    time: "12:15",
    pillar: pillars.spo,
    format: "Single Still",
    headline: "Was wir fuer SPO immer mitdenken.",
    kicker: "Morrow Check",
    layout: "checklist",
    points: ["Wind und Wetter", "Wege zum Strand", "Pausen im Tagesrhythmus", "Alter und Anlass der Gaeste", "Gute Momente statt voller Listen"],
    caption:
      "Ein Aufenthalt in SPO wird besser, wenn man den Ort ernst nimmt.\n\nWeite, Wind und Strandwege sind kein Nebensatz. Sie praegen den Rhythmus. Genau deshalb planen wir Auszeiten nicht aus dem Katalog, sondern vom Aufenthalt her.\n\n#SanktPeterOrding #SPO #NordseePlanung #Morrow #Auszeit",
  },
  {
    id: "27",
    date: "2026-07-19",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    headline: "Eine schoene Zeit ist kein Zufall.",
    kicker: "Morrow",
    layout: "quote",
    caption:
      "Sie entsteht aus Auswahl, Vorbereitung und dem Gefuehl, dass jemand mitgedacht hat.\n\nDas ist die Idee hinter Morrow: kuratierte Auszeiten an besonderen Orten am Wasser.\n\n#Morrow #KuratierteAuszeit #Nordsee #SanktPeterOrding #Hospitality",
  },
  {
    id: "28",
    date: "2026-07-20",
    time: "19:30",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-family-arrival-dunes.png",
    headline: "Ankommen mit Kindern braucht weniger Reibung.",
    kicker: "Family Anreise",
    layout: "photo",
    caption:
      "Nach der Anreise muss nicht sofort das naechste To-do warten.\n\nEine gute Familienauszeit laesst Raum zum Auspacken, Runterkommen, Rausgehen und langsam in den Ort finden. Diese ersten Stunden sind oft entscheidender, als man vorher denkt.\n\n#Familienurlaub #Ankommen #SanktPeterOrding #Morrow #NordseeMitKindern",
  },
  {
    id: "29",
    date: "2026-07-22",
    time: "12:15",
    pillar: pillars.couple,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-couple-arrival-detail.png",
    headline: "Ein Paarwochenende sollte nicht mit Recherche anfangen.",
    kicker: "Vorbereitet",
    layout: "split",
    caption:
      "Restaurant suchen, Wellness pruefen, Strandabschnitt vergleichen, Unterkunft sortieren: Schon die Planung kann sich wie Arbeit anfuehlen.\n\nMorrow nimmt euch diese erste Sortierung ab und laesst genug Luft fuer eigene Entscheidungen.\n\n#Paarwochenende #NordseeZuZweit #SPO #Morrow #AuszeitZuZweit",
  },
  {
    id: "30",
    date: "2026-07-26",
    time: "09:30",
    pillar: pillars.spo,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-hero.png",
    headline: "Der Ort darf den Takt vorgeben.",
    kicker: "SPO",
    layout: "photo",
    caption:
      "In Sankt Peter-Ording ist der schoenste Takt oft nicht der eigene Kalender.\n\nEs sind Tide, Wind, Licht, Hunger, muede Beine und der Moment, in dem der Strand ploetzlich weit genug wirkt.\n\n#SPO #Nordsee #SanktPeterOrding #SlowTravel #Morrow",
  },
  {
    id: "31",
    date: "2026-07-27",
    time: "19:30",
    pillar: pillars.conversion,
    format: "Single Still",
    headline: "So funktioniert eine Morrow Anfrage.",
    kicker: "Ganz einfach",
    layout: "checklist",
    points: ["Auszeit auswaehlen", "Wunschzeitraum senden", "Persoenliche Rueckmeldung erhalten", "Aufenthalt gemeinsam finalisieren"],
    caption:
      "Morrow ist persoenlich angelegt.\n\nIhr sendet eine Anfrage, wir pruefen Verfuegbarkeit und passendste Optionen, und daraus entsteht ein Aufenthalt, der nicht anonym aus einem Warenkorb kommt.\n\n#Morrow #AuszeitPlanen #SanktPeterOrding #Nordseeurlaub #Anfrage",
  },
  {
    id: "32",
    date: "2026-07-29",
    time: "12:15",
    pillar: pillars.care,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-family-testimonial-arrival.png",
    headline: "Vertrauen entsteht, wenn Vorbereitung sichtbar wird.",
    kicker: "Care",
    layout: "split",
    caption:
      "Gerade bei einem neuen Account ist Vertrauen wichtig.\n\nDarum zeigen wir bei Morrow nicht nur schoene Motive, sondern auch, wie wir denken: sorgfaeltig, lokal, ruhig und mit Blick auf echte Aufenthalte.\n\n#TravelBrand #Morrow #SPO #NordseeAuszeit #Vertrauen",
  },
  {
    id: "33",
    date: "2026-08-02",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    headline: "Fuer Familien. Fuer Paare. Fuer Orte am Wasser.",
    kicker: "Morrow Richtung",
    layout: "quote",
    caption:
      "Morrow startet in Sankt Peter-Ording und waechst von dort aus weiter an besondere Orte am Wasser.\n\nImmer mit derselben Idee: weniger beliebige Auswahl, mehr sorgfaeltig vorbereitete Auszeiten.\n\n#Morrow #Nordsee #SanktPeterOrding #AuszeitAmWasser #KuratierteReisen",
  },
  {
    id: "34",
    date: "2026-08-03",
    time: "19:30",
    pillar: pillars.conversion,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-final-family.png",
    headline: "Wenn ihr im Sommer noch eine ruhige Familienauszeit sucht.",
    kicker: "Family Escape",
    layout: "photo",
    caption:
      "Unsere Family Escape ist fuer Familien gedacht, die SPO mit weniger Planungsdruck erleben moechten.\n\nSchreibt uns fuer Verfuegbarkeit, passende Zeitraeume und die Frage, ob diese Auszeit zu euch passt.\n\n#FamilyEscape #FamilienurlaubSPO #NordseeMitKindern #Morrow #SommerAnDerNordsee",
  },
  {
    id: "35",
    date: "2026-08-05",
    time: "12:15",
    pillar: pillars.conversion,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-couple-testimonial-beach-a.png",
    headline: "Wenn ihr zu zweit kurz raus wollt, aber nicht wieder alles selbst planen moechtet.",
    kicker: "Couple Reset",
    layout: "photo",
    caption:
      "Ein paar Tage am Meer koennen viel veraendern, wenn sie nicht schon vorab nach Arbeit klingen.\n\nUnsere Couple Reset Auszeiten verbinden ruhige Unterkunft, SPO-Rhythmus und persoenliche Vorbereitung. Fuer zwei, die wieder etwas Luft brauchen.\n\n#CoupleReset #AuszeitZuZweit #PaarurlaubNordsee #SanktPeterOrding #Morrow",
  },
  {
    id: "36",
    date: "2026-08-09",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-hero-people-boardwalk.png",
    headline: "Morrow ist fuer alle, die nicht nur wegfahren wollen, sondern gut ankommen.",
    kicker: "Weiter geht es",
    layout: "photo",
    caption:
      "Die ersten Wochen hier sind unser Auftakt.\n\nWir teilen Orte, Auszeiten, Gedanken und kleine Orientierung fuer Sankt Peter-Ording. Ruhig, persoenlich und mit dem Anspruch, dass Reisen wieder leichter werden darf.\n\nFolgt Morrow, wenn ihr Auszeiten am Wasser sucht, die vorbereitet wirken, ohne durchgeplant zu sein.\n\n#Morrow #NordseeAuszeit #SanktPeterOrding #SlowTravel #KuratierteAuszeiten",
  },
  {
    id: "37",
    date: "2026-08-10",
    time: "19:30",
    pillar: pillars.spo,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-b-empty-boardwalk-bag.png",
    headline: "Was tun, wenn SPO euch mit Regen begruesst?",
    kicker: "Nordsee Wetter",
    layout: "checklist",
    points: ["Erst ankommen, nicht umplanen", "Kurzer Duenenweg statt voller Ausflug", "Warmer Tisch am Nachmittag", "Ein guter Plan B reicht"],
    slides: [
      { title: "Regen ist kein Fehler im Plan", body: "An der Nordsee gehoert Wetter zum Aufenthalt. Gut ist, wenn es euch nicht komplett aus dem Rhythmus bringt." },
      { title: "Kurz raus bleibt wichtig", body: "Ein kleiner Weg an die Luft reicht oft, damit der Tag nicht nach Warten klingt." },
      { title: "Innen braucht es Waerme", body: "Tee, ein guter Tisch, Rueckzug und genug Raum fuer muede Stimmung." },
      { title: "Morrow denkt Plan B mit", body: "Nicht als Aktivitaetenliste, sondern als ruhige Alternative, die zu euch passt." },
    ],
    caption:
      "Regen macht eine Auszeit nicht schlechter. Er zeigt nur schneller, ob sie gut vorbereitet ist.\n\nBei Morrow denken wir Wetter nicht als Stoerung, sondern als Teil von SPO: mit kurzen Wegen, passenden Pausen und Alternativen, die den Tag nicht ueberladen.\n\n#SPOBeiRegen #NordseeWetter #SanktPeterOrding #Morrow #Reiseplanung",
  },
  {
    id: "38",
    date: "2026-08-12",
    time: "12:15",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-a-family-breakfast-interior.png",
    headline: "Der erste Morgen entscheidet oft den ganzen Familienrhythmus.",
    kicker: "Family Alltag",
    layout: "split",
    caption:
      "Familienurlaub beginnt nicht erst am Strand.\n\nOft entscheidet der erste Morgen: Gibt es genug Ruhe? Sind die Wege klar? Muss direkt etwas organisiert werden? Genau diese kleinen Reibungen nehmen wir ernst.\n\n#Familienurlaub #NordseeMitKindern #Morrow #SanktPeterOrding #Ankommen",
  },
  {
    id: "39",
    date: "2026-08-16",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-b-coastal-house-evening.png",
    headline: "Manchmal ist Luxus einfach: nicht mehr suchen muessen.",
    kicker: "Morrow Prinzip",
    layout: "quote",
    caption:
      "Luxus muss nicht laut sein.\n\nManchmal ist er ein gut vorbereiteter Ort, eine klare Empfehlung, ein erster Abend ohne Recherche und das Gefuehl, dass jemand vorher mitgedacht hat.\n\n#Morrow #SlowTravel #NordseeAuszeit #KuratierteReisen #Hospitality",
  },
  {
    id: "40",
    date: "2026-08-17",
    time: "19:30",
    pillar: pillars.spo,
    format: "Carousel",
    asset: "public/brand/generated/morrow-spo-local-orientation.png",
    headline: "SPO ohne Auto: schoen, aber nicht ueberall gleich leicht.",
    kicker: "Vor Ort",
    layout: "split",
    slides: [
      { title: "Wege entscheiden mit", body: "SPO ist weitlaeufig. Ohne Auto zaehlen Unterkunftslage, Tagesrhythmus und realistische Entfernungen." },
      { title: "Nicht jeder Plan passt", body: "Was auf der Karte nah wirkt, kann mit Kindern, Wind oder Gepaeck anders sein." },
      { title: "Gute Vorbereitung spart Energie", body: "Vorab sortierte Wege machen den Aufenthalt leichter, ohne ihn zu verplanen." },
      { title: "Morrow denkt Mobilitaet mit", body: "Damit vor Ort nicht jede Entscheidung neu beginnt." },
    ],
    caption:
      "SPO ohne Auto kann wunderbar sein. Aber es braucht ehrliche Orientierung.\n\nWelche Wege sind realistisch? Was liegt wirklich nah? Wo wird ein kurzer Ausflug ploetzlich aufwendig? Genau solche Fragen gehoeren fuer uns zur Vorbereitung.\n\n#SPOOhneAuto #SanktPeterOrding #Nordseeurlaub #Morrow #Reiseplanung",
  },
  {
    id: "41",
    date: "2026-08-19",
    time: "12:15",
    pillar: pillars.couple,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-a-couple-tea-table.png",
    headline: "Ein guter Abend braucht nicht viel. Nur keinen Suchstress.",
    kicker: "Zu zweit",
    layout: "photo",
    caption:
      "Manchmal entscheidet ein Abend mehr als ein ganzer Plan.\n\nEin ruhiger Tisch, ein kurzer Spaziergang, ein Ort, der schon passt. Paarzeit wird leichter, wenn nicht erst vor Ort alles verglichen werden muss.\n\n#Paarzeit #AuszeitZuZweit #SPO #NordseeZuZweit #Morrow",
  },
  {
    id: "42",
    date: "2026-08-23",
    time: "09:30",
    pillar: pillars.care,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    headline: "Was wir vor einer Empfehlung pruefen.",
    kicker: "Morrow Check",
    layout: "checklist",
    points: ["Passt es zum Anlass?", "Passt es zum Wetter?", "Passt es zu Wegen und Energie?", "Passt es wirklich zu euch?"],
    slides: [
      { title: "Nicht alles ist fuer alle gut", body: "Eine Empfehlung wird erst wertvoll, wenn Anlass, Stimmung und Reiseform mitgedacht sind." },
      { title: "Wetter veraendert Entscheidungen", body: "Wind, Regen oder Sonne machen denselben Ort sehr unterschiedlich." },
      { title: "Wege sind Teil der Qualitaet", body: "Eine gute Idee ist nur gut, wenn sie vor Ort leicht erreichbar bleibt." },
      { title: "Morrow kuratiert im Kontext", body: "Nicht allgemeine Tipps. Sondern passende Orientierung." },
    ],
    caption:
      "Eine Empfehlung ist schnell gegeben. Eine passende Empfehlung braucht mehr Sorgfalt.\n\nBei Morrow pruefen wir nicht nur, ob etwas schoen ist, sondern ob es zu Anlass, Wetter, Wegen und Gaesten passt.\n\n#MorrowCare #SPOEmpfehlungen #SanktPeterOrding #KuratierteAuszeit #Hospitality",
  },
  {
    id: "43",
    date: "2026-08-24",
    time: "19:30",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-family-plan-boardwalk.png",
    headline: "Wenn Kinder muede werden, zeigt sich die Qualitaet der Planung.",
    kicker: "Familienzeit",
    layout: "quote",
    caption:
      "Gute Familienauszeiten erkennt man nicht nur an den schoenen Momenten.\n\nMan erkennt sie auch daran, was passiert, wenn jemand muede ist, Hunger hat oder der Wind lauter wird als der Plan. Genau dafuer braucht es Ruhe im System.\n\n#Familienurlaub #NordseeMitKindern #Morrow #SPOmitKindern #ReisenMitKindern",
  },
  {
    id: "44",
    date: "2026-08-26",
    time: "12:15",
    pillar: pillars.spo,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-a-empty-boardwalk-pfahlbau.png",
    headline: "SPO hat mehrere Orte. Jeder passt anders.",
    kicker: "Ortsteile",
    layout: "split",
    slides: [
      { title: "Ording", body: "Weit, offen, ikonisch. Gut fuer das grosse Strandgefuehl." },
      { title: "Bad", body: "Zentraler, mit mehr Infrastruktur und kuerzeren Entscheidungen." },
      { title: "Boehl", body: "Ruhiger, weiter, oft gut fuer langsamere Tage." },
      { title: "Dorf und Sued", body: "Praktisch, wenn Alltag, Essen und kleine Wege leichter sein sollen." },
    ],
    caption:
      "SPO ist nicht ein Strandgefuehl. SPO sind mehrere Rhythmen.\n\nJe nachdem, ob ihr mit Kindern reist, zu zweit kommt, Ruhe sucht oder viel draussen sein wollt, passt ein anderer Anker besser.\n\n#SanktPeterOrding #SPOtipps #Nordseeurlaub #Morrow #Ortskenntnis",
  },
  {
    id: "45",
    date: "2026-08-30",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-b-empty-boardwalk-bag.png",
    headline: "Nicht jeder freie Tag muss voll werden.",
    kicker: "Morrow Stimme",
    layout: "photo",
    caption:
      "Freie Zeit wird nicht automatisch besser, wenn man sie fuellt.\n\nManchmal braucht sie nur einen guten Ort, einen klaren Anfang und genug Luft, damit der Tag selbst entstehen darf.\n\n#SlowTravel #NordseeAuszeit #Morrow #SanktPeterOrding #Auszeit",
  },
  {
    id: "46",
    date: "2026-08-31",
    time: "19:30",
    pillar: pillars.couple,
    format: "Carousel",
    asset: "public/brand/generated/morrow-article-couple-wide-boardwalk.png",
    headline: "Drei Dinge, die Paarzeit in SPO leichter machen.",
    kicker: "Paarzeit",
    layout: "checklist",
    points: ["Ein ruhiger erster Abend", "Ein Weg ohne Ziel", "Ein Tisch, der schon passt"],
    slides: [
      { title: "1. Nicht direkt weiterplanen", body: "Ankommen darf der erste Programmpunkt sein." },
      { title: "2. Rausgehen ohne Ziel", body: "Ein weiter Weg durch Wind und Duenen reicht oft." },
      { title: "3. Den Abend vorbereiten", body: "Gute Empfehlung statt spontaner Vergleichssuche." },
      { title: "Mehr Raum fuer euch", body: "Morrow sortiert vor, damit vor Ort weniger offen bleibt." },
    ],
    caption:
      "Paarzeit wird nicht besser, wenn sie perfekter geplant ist.\n\nSie wird besser, wenn die richtigen Dinge vorbereitet sind und dazwischen genug Raum bleibt.\n\n#Paarurlaub #AuszeitZuZweit #SanktPeterOrding #Morrow #CoupleReset",
  },
  {
    id: "47",
    date: "2026-09-02",
    time: "12:15",
    pillar: pillars.spo,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-final-boardwalk.png",
    headline: "Der Weg zum Strand ist in SPO Teil des Erlebnisses.",
    kicker: "SPO Detail",
    layout: "quote",
    caption:
      "In SPO ist der Weg zum Strand selten nur ein Weg.\n\nEr ist Wind, Blick, Erwartung, manchmal Geduld und oft der Moment, in dem der Alltag leiser wird.\n\n#SanktPeterOrding #Nordsee #Duenenweg #Morrow #SlowTravel",
  },
  {
    id: "48",
    date: "2026-09-06",
    time: "09:30",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-b-mother-child-map-dunes.png",
    headline: "Ein guter Familienplan hat Luecken.",
    kicker: "Family Rhythmus",
    layout: "split",
    caption:
      "Mit Kindern braucht ein guter Plan nicht mehr Punkte. Er braucht bessere Luecken.\n\nZeit fuer Umwege. Zeit fuer Hunger. Zeit fuer Wind. Zeit dafuer, dass nicht alles so laeuft, wie man dachte.\n\n#Familienurlaub #ReisenMitKindern #NordseeMitKindern #Morrow #SPO",
  },
  {
    id: "49",
    date: "2026-09-07",
    time: "19:30",
    pillar: pillars.care,
    format: "Carousel",
    asset: "public/brand/generated/morrow-spo-arrival-detail.png",
    headline: "Was Ankommen leichter macht.",
    kicker: "Ankunft",
    layout: "checklist",
    points: ["Klare erste Information", "Ein realistischer erster Abend", "Weniger offene Entscheidungen", "Ein Ansprechpartner"],
    slides: [
      { title: "Nicht alles auf spaeter schieben", body: "Die erste Stunde entscheidet oft, ob Ankommen ruhig wird." },
      { title: "Der erste Abend darf einfach sein", body: "Nicht direkt Restaurantsuche, Einkauf und Wege klaeren." },
      { title: "Informationen muessen sortiert sein", body: "Zu viel ist nicht besser. Das Passende zaehlt." },
      { title: "Menschliche Rueckmeldung", body: "Wenn etwas offen ist, sollte jemand da sein." },
    ],
    caption:
      "Ankommen ist kein Zufall.\n\nEs entsteht aus vielen kleinen Dingen, die vorher geklaert wurden: was zuerst wichtig ist, was warten kann und wo ihr euch melden koennt.\n\n#Ankommen #Hospitality #Morrow #NordseeAuszeit #SanktPeterOrding",
  },
  {
    id: "50",
    date: "2026-09-09",
    time: "12:15",
    pillar: pillars.spo,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-b-breakfast-map-detail.png",
    headline: "SPO wirkt anders, wenn man nicht erst vor Ort sortieren muss.",
    kicker: "Orientierung",
    layout: "photo",
    caption:
      "Die schoensten Orte helfen wenig, wenn man sie erst im Urlaub vergleichen muss.\n\nMorrow sortiert vor: nicht alles, sondern das, was zu eurer Auszeit passt.\n\n#SPOtipps #SanktPeterOrding #Reiseplanung #Morrow #Nordseeurlaub",
  },
  {
    id: "51",
    date: "2026-09-13",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-a-couple-boardwalk-dusk.png",
    headline: "Auszeit ist kein Ortswechsel. Auszeit ist ein anderes Tempo.",
    kicker: "Morrow Prinzip",
    layout: "quote",
    caption:
      "Man kann wegfahren und trotzdem im gleichen Tempo bleiben.\n\nUnsere Auszeiten sind darauf gebaut, dass der Ort, die Unterkunft und die Vorbereitung zusammen ein anderes Gefuehl moeglich machen.\n\n#Auszeit #SlowTravel #Morrow #Nordsee #SanktPeterOrding",
  },
  {
    id: "52",
    date: "2026-09-14",
    time: "19:30",
    pillar: pillars.family,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-b-father-child-beach.png",
    headline: "Vier kleine Momente, die Familienurlaub tragen.",
    kicker: "Mit Kindern",
    layout: "checklist",
    points: ["Der erste Blick aufs Wasser", "Ein Snack ohne Eile", "Ein Plan B ohne Drama", "Ein Abend, der frueh genug endet"],
    slides: [
      { title: "Der erste Blick aufs Wasser", body: "Manchmal reicht ein einziger Moment, um anzukommen." },
      { title: "Ein Snack ohne Eile", body: "Kleine Pausen halten den Tag zusammen." },
      { title: "Plan B ohne Drama", body: "Wenn Wetter oder Stimmung kippen, sollte nicht alles neu anfangen." },
      { title: "Ein ruhiger Abend", body: "Familienurlaub gewinnt oft durch weniger, nicht durch mehr." },
    ],
    caption:
      "Familienurlaub lebt nicht nur von grossen Ausfluegen.\n\nOft sind es die kleinen Momente, die den Tag gut machen: ein Blick, eine Pause, ein einfacher Abend und das Gefuehl, nicht alles steuern zu muessen.\n\n#Familienurlaub #SPOmitKindern #NordseeMitKindern #Morrow #FamilyEscape",
  },
  {
    id: "53",
    date: "2026-09-16",
    time: "12:15",
    pillar: pillars.couple,
    format: "Single Still",
    asset: "public/brand/generated/morrow-article-couple-arrival-detail.png",
    headline: "Kurz weg funktioniert nur, wenn Ankommen schnell leicht wird.",
    kicker: "Short Reset",
    layout: "split",
    caption:
      "Bei zwei oder drei Tagen zaehlt jede offene Entscheidung mehr.\n\nDeshalb denken wir kurze Auszeiten besonders sorgfaeltig: Anreise, erster Abend, Wege, Essen, Rueckzug und ein Moment draussen.\n\n#Kurztrip #Paarurlaub #NordseeZuZweit #Morrow #SanktPeterOrding",
  },
  {
    id: "54",
    date: "2026-09-20",
    time: "09:30",
    pillar: pillars.spo,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-hero.png",
    headline: "Nebensaison ist kein Kompromiss.",
    kicker: "SPO ruhiger",
    layout: "photo",
    caption:
      "Wenn SPO leerer wird, wird vieles deutlicher: Wind, Weite, Wege und dieser ruhige Abstand zum Alltag.\n\nGerade in der Nebensaison koennen Auszeiten besonders gut funktionieren, wenn sie passend vorbereitet sind.\n\n#Nebensaison #SanktPeterOrding #NordseeAuszeit #Morrow #SlowTravel",
  },
  {
    id: "55",
    date: "2026-09-21",
    time: "19:30",
    pillar: pillars.care,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    headline: "Vorbereitung soll man nicht merken. Nur fuehlen.",
    kicker: "Care",
    layout: "quote",
    caption:
      "Gute Vorbereitung draengt sich nicht in den Vordergrund.\n\nSie sorgt dafuer, dass der Aufenthalt leichter wirkt: weniger offene Fragen, bessere Entscheidungen und ein ruhiger Anfang.\n\n#MorrowCare #Hospitality #NordseeAuszeit #SanktPeterOrding #Morrow",
  },
  {
    id: "56",
    date: "2026-09-23",
    time: "12:15",
    pillar: pillars.spo,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-a-empty-boardwalk-pfahlbau.png",
    headline: "Drei SPO-Fehler, die ihr leicht vermeiden koennt.",
    kicker: "SPO Guide",
    layout: "checklist",
    points: ["Wege unterschaetzen", "Zu viel in einen Tag legen", "Wetter wie Stoerung behandeln"],
    slides: [
      { title: "1. Wege unterschaetzen", body: "SPO ist weit. Entfernung fuehlt sich mit Wind, Kindern oder Gepaeck anders an." },
      { title: "2. Zu viel planen", body: "Der Ort wirkt besser, wenn nicht jeder Tag voll ist." },
      { title: "3. Wetter falsch denken", body: "Wind und Regen gehoeren nicht gegen den Plan. Sie gehoeren in den Plan." },
      { title: "Besser: Rhythmus planen", body: "Morrow denkt Aufenthalt vom Gefuehl vor Ort her." },
    ],
    caption:
      "SPO ist kein Ort fuer Ueberplanung.\n\nWer Wege, Wetter und Pausen ernst nimmt, erlebt den Ort meistens leichter. Genau deshalb beginnt gute Orientierung vor der Anreise.\n\n#SPOtipps #SanktPeterOrding #Nordseeurlaub #Morrow #Reiseplanung",
  },
  {
    id: "57",
    date: "2026-09-27",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    asset: "public/brand/generated/social/morrow-social-set-b-coastal-house-evening.png",
    headline: "Ein Ort wird besser, wenn man ihn nicht nur bucht.",
    kicker: "Morrow",
    layout: "split",
    caption:
      "Buchen ist nur ein Teil der Reise.\n\nWas einen Aufenthalt wirklich praegt, sind die Entscheidungen davor: welche Unterkunft, welcher Rhythmus, welche Wege, welche Momente und wie viel offen bleiben darf.\n\n#Morrow #KuratierteAuszeit #Nordsee #SanktPeterOrding #Hospitality",
  },
  {
    id: "58",
    date: "2026-09-28",
    time: "19:30",
    pillar: pillars.family,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-family-testimonial-dunes-second-family.png",
    headline: "Manchmal ist der beste Familienmoment der, der nicht geplant war.",
    kicker: "Familienzeit",
    layout: "photo",
    caption:
      "Nicht jeder gute Moment braucht einen Programmpunkt.\n\nManchmal reicht ein Weg durch die Duenen, ein bisschen Wind und genug Zeit, damit Kinder den Ort selbst entdecken koennen.\n\n#Familienzeit #NordseeMitKindern #SanktPeterOrding #Morrow #FamilyEscape",
  },
  {
    id: "59",
    date: "2026-09-30",
    time: "12:15",
    pillar: pillars.conversion,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    headline: "Wann eine Morrow Auszeit zu euch passt.",
    kicker: "Anfrage",
    layout: "checklist",
    points: ["Ihr wollt weniger Recherche", "Ihr sucht einen passenden Ort", "Ihr moechtet persoenliche Vorbereitung", "Ihr wollt nicht anonym buchen"],
    slides: [
      { title: "Wenn Auswahl zu viel wird", body: "Morrow ist fuer Menschen, die nicht noch mehr Optionen brauchen, sondern bessere Orientierung." },
      { title: "Wenn der Ort passen soll", body: "Unterkunft, Lage und Rhythmus muessen zusammen wirken." },
      { title: "Wenn Vorbereitung wichtig ist", body: "Gerade bei Familien und kurzen Paar-Auszeiten zaehlt jedes Detail." },
      { title: "Dann fragt uns an", body: "Persoenlich, ruhig und unverbindlich." },
    ],
    caption:
      "Eine Morrow Auszeit passt zu euch, wenn ihr nicht einfach irgendwo buchen wollt.\n\nSondern wenn Unterkunft, Ort, Empfehlungen und Vorbereitung zusammen gedacht werden sollen.\n\n#Morrow #AuszeitPlanen #SanktPeterOrding #Nordseeurlaub #Anfrage",
  },
  {
    id: "60",
    date: "2026-10-04",
    time: "09:30",
    pillar: pillars.brand,
    format: "Single Still",
    asset: "public/brand/generated/morrow-spo-final-boardwalk.png",
    headline: "Weiter raus. Ruhiger ankommen.",
    kicker: "Morrow",
    layout: "quote",
    caption:
      "Morrow bleibt eine Einladung, Reisen wieder leichter zu denken.\n\nWeniger vergleichen. Besser vorbereiten. Ruhiger ankommen. Am Wasser, wo der Abstand zum Alltag etwas einfacher wird.\n\n#Morrow #NordseeAuszeit #SlowTravel #SanktPeterOrding #AuszeitAmWasser",
  },
];

const extraLaunchPosts = [
  {
    id: "N01",
    pillar: pillars.brand,
    format: "Carousel",
    asset: "public/brand/generated/morrow-spo-arrival-detail.png",
    headline: "Was ist Morrow?",
    kicker: "Kurz erklaert",
    layout: "checklist",
    points: ["Kuratierte Auszeiten in SPO", "Unterkunft, Ort und Erlebnis zusammengedacht", "Weniger Recherche vor der Reise", "Persoenliche Vorbereitung statt anonymer Buchung"],
    slides: [
      { title: "Kein endloser Katalog", body: "Morrow zeigt nicht alles. Sondern das, was zu eurer Auszeit passt." },
      { title: "SPO als Ausgangspunkt", body: "Wind, Weite, Wege und Unterkunft werden zusammen gedacht." },
      { title: "Fuer Familien und Paare", body: "Mit mehr Ruhe vor der Reise und weniger offenen Fragen vor Ort." },
      { title: "Kuratieren heisst Verantwortung", body: "Wir waehlen aus, fragen nach und bereiten vor." },
    ],
    caption:
      "Morrow ist fuer alle, die nicht einfach nur eine Unterkunft suchen.\n\nWir kuratieren Auszeiten in Sankt Peter-Ording: Unterkunft, Ort, Rhythmus und Empfehlungen werden so vorbereitet, dass aus freien Tagen echte Ankunft wird.\n\n#Morrow #SanktPeterOrding #NordseeAuszeit #KuratierteAuszeit #SPO",
  },
  {
    id: "N02",
    pillar: pillars.brand,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-b-empty-boardwalk-bag.png",
    headline: "Fuer wen Morrow nicht passt.",
    kicker: "Klarheit",
    layout: "checklist",
    points: ["Wenn ihr maximale Auswahl wollt", "Wenn nur der niedrigste Preis zaehlt", "Wenn ihr alles spontan entscheiden moechtet", "Wenn persoenliche Vorbereitung egal ist"],
    slides: [
      { title: "Nicht fuer Vergleichssuche", body: "Morrow ist kein Portal mit hundert fast gleichen Optionen." },
      { title: "Nicht fuer lauter, schneller, voller", body: "Unsere Auszeiten sind ruhig, bewusst und nicht ueberfuellt geplant." },
      { title: "Nicht fuer anonyme Buchung", body: "Wir wollen verstehen, was zu euch und eurer Reise passt." },
      { title: "Gut, wenn ihr weniger suchen wollt", body: "Und mehr Vertrauen in eine kuratierte Auswahl haben moechtet." },
    ],
    caption:
      "Morrow passt nicht zu jeder Reise. Und das ist gut so.\n\nWir sind richtig fuer euch, wenn ihr weniger vergleichen, besser vorbereitet ankommen und eine Auszeit moechten, die nicht nur gebucht, sondern kuratiert ist.\n\n#Morrow #SlowTravel #NordseeAuszeit #SanktPeterOrding #KuratierteReise",
  },
  {
    id: "N03",
    pillar: pillars.family,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-b-father-child-beach.png",
    headline: "SPO-Packliste fuer Familien.",
    kicker: "Mit Kindern",
    layout: "checklist",
    points: ["Windfest statt nur wetterfest", "Schuhe fuer Sand, Watt und Wege", "Snacks fuer lange Strandwege", "Ein Plan B, bevor Stimmung kippt"],
    slides: [
      { title: "Wind ist der Normalfall", body: "Morgen kann sich anders anfuehlen als Mittag. Schichten helfen." },
      { title: "Die Wege sind lang", body: "Nicht jeder Strandmoment beginnt direkt am Parkplatz." },
      { title: "Pausen retten Tage", body: "Snacks, warme Sachen und ein kurzer Rueckzug sind keine Nebensache." },
      { title: "Plan B vorher klaeren", body: "Wenn Regen kommt, sollte nicht der ganze Tag neu erfunden werden." },
    ],
    caption:
      "SPO mit Kindern ist wunderschoen. Aber selten ganz leicht, wenn man es wie einen normalen Strandort plant.\n\nWind, Wege, Wetter und Pausen gehoeren dazu. Genau deshalb denken wir diese Details bei Family Escape Auszeiten mit.\n\n#SPOmitKindern #Familienurlaub #NordseeMitKindern #Packliste #Morrow",
  },
  {
    id: "N04",
    pillar: pillars.family,
    format: "Carousel",
    asset: "public/brand/generated/morrow-spo-family-watt.png",
    headline: "Ein Familientag in SPO ohne zu viel Programm.",
    kicker: "Tagesrhythmus",
    layout: "checklist",
    points: ["Ein klarer Start", "Ein weiter Draußen-Moment", "Eine echte Pause", "Ein frueher, ruhiger Abend"],
    slides: [
      { title: "Vormittag: ein Anker", body: "Ein Strandabschnitt, ein Weg, ein Naturmoment. Nicht fuenf Ziele." },
      { title: "Mittag: Pause ernst nehmen", body: "Familientage werden besser, wenn nicht alle dauernd durchhalten muessen." },
      { title: "Nachmittag: offen lassen", body: "Oft entsteht der beste Moment, wenn nicht alles gefuellt ist." },
      { title: "Abend: frueh genug runterfahren", body: "Ein guter Familienurlaub muss nicht jeden Tag gross enden." },
    ],
    caption:
      "Familienurlaub wird selten besser, wenn jeder Tag voll ist.\n\nEin guter SPO-Tag braucht Orientierung, Pausen und genug Luft. Genau daraus entsteht oft das Gefuehl, wirklich weg gewesen zu sein.\n\n#Familienauszeit #SPOmitKindern #Nordseeurlaub #Morrow #FamilyEscape",
  },
  {
    id: "N05",
    pillar: pillars.couple,
    format: "Carousel",
    asset: "public/brand/generated/morrow-article-couple-wide-boardwalk.png",
    headline: "Ein Wochenende zu zweit in SPO.",
    kicker: "Couple Reset",
    layout: "checklist",
    points: ["Freitag: nicht sofort weiterplanen", "Samstag: ein weiter Weg", "Samstagabend: ein Tisch, der passt", "Sonntag: langsam zurueck"],
    slides: [
      { title: "Freitag", body: "Ankommen, Tasche abstellen, raus aus dem Alltag. Kein Entscheidungsabend." },
      { title: "Samstag", body: "Ein Weg durch Duenen und Wind reicht oft mehr als ein voller Plan." },
      { title: "Samstagabend", body: "Gute Empfehlung statt spontaner Restaurantrecherche." },
      { title: "Sonntag", body: "Nicht hetzen. Eine gute Auszeit braucht einen weichen Abschluss." },
    ],
    caption:
      "Ein Wochenende zu zweit muss nicht spektakulaer sein.\n\nEs muss leicht genug beginnen, Raum lassen und nicht schon bei der Planung wieder nach Arbeit klingen.\n\n#AuszeitZuZweit #Paarurlaub #SanktPeterOrding #CoupleReset #Morrow",
  },
  {
    id: "N06",
    pillar: pillars.care,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    headline: "Was in einer Morrow Auszeit vorbereitet ist.",
    kicker: "Morrow Care",
    layout: "checklist",
    points: ["Passende Unterkunft", "Realistischer Tagesrhythmus", "Lokale Empfehlungen", "Ansprechbarkeit vor Ort"],
    slides: [
      { title: "Unterkunft", body: "Nicht nur schoen, sondern passend zu Reiseart, Pausen und Wegen." },
      { title: "Rhythmus", body: "Familien und Paare brauchen unterschiedliche Arten von Leichtigkeit." },
      { title: "Empfehlungen", body: "Weniger Listen, mehr Auswahl mit Kontext." },
      { title: "Care", body: "Wenn etwas offen ist, soll nicht wieder alles bei euch liegen." },
    ],
    caption:
      "Vorbereitung soll nicht nach Aufwand aussehen. Sie soll sich vor Ort leicht anfuehlen.\n\nDarum denken wir Unterkunft, Rhythmus, Empfehlungen und Care zusammen.\n\n#MorrowCare #Hospitality #NordseeAuszeit #SanktPeterOrding #Morrow",
  },
  {
    id: "N07",
    pillar: pillars.spo,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-b-empty-boardwalk-bag.png",
    headline: "SPO bei Regen: 24 Stunden ohne schlechte Laune.",
    kicker: "Plan B",
    layout: "checklist",
    points: ["Kurz raus statt gar nicht raus", "Warmer Tisch am Nachmittag", "Unterkunft als Pause nutzen", "Nur einen festen Moment planen"],
    slides: [
      { title: "Nicht alles umwerfen", body: "Regen ist in SPO kein Ausnahmezustand. Er braucht nur ein anderes Tempo." },
      { title: "Kurz raus", body: "Ein kleiner Duenenweg kann mehr bringen als ein voller Ersatzplan." },
      { title: "Warm werden", body: "Ein guter Tisch am Nachmittag veraendert den ganzen Tag." },
      { title: "Weniger ist besser", body: "Bei Regen reicht oft ein starker Anker statt vier Programmpunkte." },
    ],
    caption:
      "SPO bei Regen kann schoen sein, wenn man nicht erst im Regen anfangen muss zu suchen.\n\nEin guter Plan B ist nicht voll. Er ist ruhig, realistisch und schnell greifbar.\n\n#SPObeiRegen #SanktPeterOrding #Nordseeurlaub #Regenplan #Morrow",
  },
  {
    id: "N08",
    pillar: pillars.spo,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-a-empty-boardwalk-pfahlbau.png",
    headline: "Ortsgefuehl statt Geheimtipps.",
    kicker: "SPO ehrlich",
    layout: "split",
    slides: [
      { title: "Nicht alles muss Geheimtipp sein", body: "Manchmal ist der richtige Ort wichtiger als der unbekannte." },
      { title: "SPO ist kein einzelnes Gefuehl", body: "Bad, Ording, Boehl und Dorf haben unterschiedliche Rhythmen." },
      { title: "Kontext vor Liste", body: "Eine Empfehlung hilft nur, wenn sie zu eurem Tag passt." },
      { title: "Morrow sortiert vor", body: "Damit ihr nicht vor Ort mit zehn offenen Tabs anfangt." },
    ],
    caption:
      "Nicht jeder gute Ort muss ein Geheimtipp sein.\n\nEntscheidend ist, ob er zu eurem Rhythmus passt: mit Kindern, zu zweit, bei Wind, bei Regen, fuer kurze Wege oder fuer Weite.\n\n#SPOtipps #SanktPeterOrding #Nordsee #Morrow #Reiseplanung",
  },
  {
    id: "N09",
    pillar: pillars.care,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-b-breakfast-map-detail.png",
    headline: "Warum wir nicht 100 Unterkuenfte zeigen.",
    kicker: "Kuration",
    layout: "checklist",
    points: ["Mehr Auswahl macht nicht automatisch leichter", "Reiseart zaehlt mehr als Filter", "Pausen, Wege und Stimmung gehoeren dazu", "Weglassen ist Teil der Qualitaet"],
    slides: [
      { title: "Auswahl kann laut werden", body: "Zu viele Optionen fuehlen sich schnell wieder wie Arbeit an." },
      { title: "Filter reichen nicht", body: "Familienpause, Paarzeit und Wetterrhythmus sieht man nicht in jedem Suchfeld." },
      { title: "Weglassen ist Arbeit", body: "Gute Kuration heisst auch: Dinge bewusst nicht empfehlen." },
      { title: "Mehr Vertrauen", body: "Am Ende soll nicht die groesste Liste gewinnen, sondern die passendste Auszeit." },
    ],
    caption:
      "Wir glauben nicht, dass eine Reise besser wird, wenn man nur mehr Auswahl bekommt.\n\nMorrow kuratiert bewusst. Damit ihr nicht alles vergleichen muesst, sondern besser versteht, was wirklich zu euch passt.\n\n#Kuration #SlowTravel #Morrow #NordseeAuszeit #SanktPeterOrding",
  },
  {
    id: "N10",
    pillar: pillars.conversion,
    format: "Carousel",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    headline: "Was nach eurer Anfrage passiert.",
    kicker: "Anfrage",
    layout: "checklist",
    points: ["Ihr beschreibt eure Auszeit", "Wir pruefen, was passt", "Ihr bekommt eine persoenliche Rueckmeldung", "Erst dann wird es konkret"],
    slides: [
      { title: "1. Anfrage", body: "Ihr sagt uns, worum es geht: Familie, Paarzeit, Zeitraum, Wunschgefuehl." },
      { title: "2. Pruefung", body: "Wir schauen, welche Auszeit wirklich passt und was realistisch ist." },
      { title: "3. Rueckmeldung", body: "Ihr bekommt keine anonyme Liste, sondern eine sortierte Empfehlung." },
      { title: "4. Entscheidung", body: "Wenn es passt, gehen wir gemeinsam in die konkrete Vorbereitung." },
    ],
    caption:
      "Eine Morrow Anfrage ist kein Buchungsformular, das euch direkt in den naechsten Funnel schiebt.\n\nSie ist der Anfang einer passenden Auswahl. Erst verstehen, dann empfehlen.\n\n#Morrow #Anfrage #NordseeAuszeit #SanktPeterOrding #KuratierteAuszeit",
  },
];

const launchOrder = [
  "01",
  "N01",
  "21",
  "19",
  "20",
  "31",
  "N10",
  "11",
  "N03",
  "05",
  "N04",
  "08",
  "N05",
  "12",
  "16",
  "37",
  "42",
  "N02",
  "N06",
  "N07",
  "N08",
  "N09",
];

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildSchedule(count) {
  const slots = [{ date: "2026-05-22", time: "19:30" }];
  const date = new Date("2026-05-24T12:00:00");
  const timeByDay = new Map([
    [0, "09:30"],
    [1, "19:30"],
    [3, "12:15"],
  ]);

  while (slots.length < count) {
    const day = date.getDay();
    if (timeByDay.has(day)) {
      slots.push({ date: isoDate(date), time: timeByDay.get(day) });
    }
    date.setDate(date.getDate() + 1);
  }

  return slots;
}

function buildLaunchPosts() {
  const pool = [...posts, ...extraLaunchPosts];
  const byId = new Map(pool.map((post) => [post.id, post]));
  const ordered = [
    ...launchOrder.map((id) => byId.get(id)).filter(Boolean),
    ...pool.filter((post) => !launchOrder.includes(post.id)),
  ];
  const schedule = buildSchedule(ordered.length);

  return ordered.map((post, index) => ({
    ...post,
    sourceId: post.id,
    id: String(index + 1).padStart(2, "0"),
    date: schedule[index].date,
    time: schedule[index].time,
  }));
}

const upgrades = {
  "01": {
    headline: "Auszeit beginnt vor der Anreise.",
    format: "Single Still",
    contentRole: "Brand opener",
  },
  "02": {
    headline: "SPO ist weit. Genau deshalb braucht ihr Orientierung.",
    format: "Carousel",
    contentRole: "Saveable orientation",
    asset: "public/brand/generated/social/morrow-social-set-b-empty-boardwalk-bag.png",
    slides: [
      { title: "Warum SPO Vorbereitung braucht", body: "Strandwege, Wetter, Ortsteile und Tagesrhythmus verändern, wie leicht sich ein Aufenthalt anfühlt." },
      { title: "Für Familien", body: "Kurze Wege, Pausen und ein Plan B sind oft wichtiger als die längste Aktivitätenliste." },
      { title: "Für Paare", body: "Wenige gute Anker reichen: ruhige Unterkunft, Spaziergang, Dinner oder Wellness, genug freie Zeit." },
      { title: "Morrow denkt das zusammen", body: "Unterkunft, Ort, Erlebnis und Betreuung werden nicht getrennt geplant, sondern als Auszeit." },
    ],
  },
  "03": {
    headline: "Weniger suchen. Besser ankommen.",
    format: "Single Still",
    contentRole: "Brand belief",
    asset: "public/brand/generated/social/morrow-social-set-a-empty-boardwalk-pfahlbau.png",
  },
  "04": {
    headline: "Familienurlaub wird leichter, wenn weniger offen ist.",
    format: "Single Still",
    contentRole: "Family promise",
  },
  "05": {
    headline: "Vier Dinge, die Familienurlaub in SPO leichter machen.",
    format: "Carousel",
    contentRole: "Family save post",
    asset: "public/brand/generated/social/morrow-social-set-a-family-dunes-wide.png",
    slides: [
      { title: "1. Ein Strandabschnitt, der passt", body: "Mit Kindern ist nicht jeder Strandmoment gleich. Wege, Wind und Pausen entscheiden mit." },
      { title: "2. Ein Plan B bei Wetter", body: "Nordsee bleibt Nordsee. Eine gute Auszeit rechnet mit Wind, Regen und müden Kindern." },
      { title: "3. Eine Unterkunft, die Pausen trägt", body: "Nicht nur Bettenzahl zählt. Wichtig ist, ob Ankommen, Essen und Rückzug leicht werden." },
      { title: "4. Ein Erlebnis, das nicht überfordert", body: "Ein guter Moment reicht oft mehr als ein voller Tagesplan." },
    ],
  },
  "06": {
    headline: "Manchmal ist das Programm schon da.",
    format: "Single Still",
    contentRole: "Family emotion",
  },
  "07": {
    headline: "Eine Auszeit zu zweit darf leise beginnen.",
    format: "Single Still",
    contentRole: "Couple emotion",
  },
  "08": {
    headline: "Paarzeit braucht Raum, nicht Perfektion.",
    format: "Carousel",
    contentRole: "Couple save post",
    asset: "public/brand/generated/morrow-article-couple-dunes-rest.png",
    slides: [
      { title: "Raum für Ankommen", body: "Nicht direkt weiterplanen. Erst auspacken, Tee, Meerluft, kurzer Weg raus." },
      { title: "Raum für Nähe", body: "Ein Spaziergang ohne Ziel kann mehr tun als ein überfülltes Programm." },
      { title: "Raum für gute Abende", body: "Dinner, Wellness oder einfach ein ruhiger Tisch: vorbereitet, aber nicht inszeniert." },
      { title: "Morrow bereitet vor", body: "Damit eure Zeit nicht mit Recherche beginnt." },
    ],
  },
  "09": {
    headline: "Nicht romantischer. Echter.",
    format: "Single Still",
    contentRole: "Couple belief",
    asset: "public/brand/generated/social/morrow-social-set-a-couple-boardwalk-dusk.png",
  },
  "10": {
    headline: "SPO ist kein Ziel für Eile.",
    format: "Single Still",
    contentRole: "Place emotion",
  },
  "11": {
    headline: "Vier Fragen, bevor ihr SPO bucht.",
    format: "Carousel",
    contentRole: "Planning save post",
    asset: "public/brand/generated/social/morrow-social-set-b-breakfast-map-detail.png",
    slides: [
      { title: "Welcher Strand passt zu euch?", body: "Ording, Bad, Böhl und Dorf/Süd fühlen sich unterschiedlich an." },
      { title: "Braucht ihr Ruhe, Erlebnis oder beides?", body: "Ein Familienaufenthalt braucht andere Anker als ein Wochenende zu zweit." },
      { title: "Wie viel wollt ihr vor Ort planen?", body: "Je weniger Recherche im Urlaub, desto leichter fühlt sich die Auszeit an." },
      { title: "Welche Unterkunft macht Pausen leicht?", body: "Rückzug ist kein Detail. Er ist Teil des Aufenthalts." },
    ],
  },
  "12": {
    headline: "Ankommen ist ein Detailgefühl.",
    format: "Single Still",
    contentRole: "Care trust",
  },
  "13": {
    headline: "Kuratieren heißt: bewusst weglassen.",
    format: "Carousel",
    contentRole: "Morrow method",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    slides: [
      { title: "Nicht alles zeigen", body: "Mehr Auswahl ist nicht automatisch mehr Sicherheit." },
      { title: "Das Passende verbinden", body: "Unterkunft, Ort, Erlebnis und Betreuung müssen zusammen wirken." },
      { title: "Verantwortung übernehmen", body: "Eine Auszeit ist erst gut, wenn sie sich vor Ort leicht anfühlt." },
    ],
  },
  "14": {
    headline: "Familienunterkunft ist mehr als Bettenzahl.",
    format: "Carousel",
    contentRole: "Family stay education",
    slides: [
      { title: "Pausen", body: "Kann der Tag leicht unterbrochen werden, ohne dass alles kippt?" },
      { title: "Ankommen", body: "Funktioniert der erste Abend ruhig, auch wenn alle müde sind?" },
      { title: "Wege", body: "Sind Strand, Essen und kleine Erledigungen realistisch erreichbar?" },
      { title: "Rückzug", body: "Hat jeder genug Raum, wenn der Tag voll war?" },
    ],
  },
  "15": {
    headline: "Der schönste Plan: ein freier Nachmittag.",
    format: "Single Still",
    contentRole: "Couple emotion",
    asset: "public/brand/generated/social/morrow-social-set-b-couple-beach-path.png",
  },
  "16": {
    headline: "Strand ist in SPO nicht einfach Strand.",
    format: "Carousel",
    contentRole: "Local authority",
    slides: [
      { title: "Ording", body: "Weit, offen, ikonisch. Gut, wenn ihr das große SPO-Gefühl sucht." },
      { title: "Bad", body: "Zentraler, mit Seebrücke und mehr Infrastruktur in der Nähe." },
      { title: "Böhl", body: "Ruhiger, weiter, oft ein guter Anker für langsamere Tage." },
      { title: "Dorf/Süd", body: "Praktisch, wenn Wege und kleine Entscheidungen leicht bleiben sollen." },
    ],
  },
  "17": {
    headline: "Bei Wind wird SPO ehrlicher.",
    format: "Single Still",
    contentRole: "Place belief",
    asset: "public/brand/generated/social/morrow-social-set-b-empty-boardwalk-bag.png",
  },
  "18": {
    headline: "Richtung statt Stundenplan.",
    format: "Carousel",
    contentRole: "Family rhythm",
    slides: [
      { title: "Morgens langsam", body: "Kein Druck, sofort alles zu schaffen." },
      { title: "Ein guter Draußen-Moment", body: "Strand, Watt oder Dünen reichen oft als Tagesanker." },
      { title: "Pausen ernst nehmen", body: "Eine gute Familienauszeit hat Lücken, nicht nur Programmpunkte." },
    ],
  },
  "19": {
    headline: "Family Escape: weniger planen, mehr draußen sein.",
    format: "Single Still",
    contentRole: "Family conversion",
  },
  "20": {
    headline: "Couple Reset: wieder etwas Luft brauchen.",
    format: "Single Still",
    contentRole: "Couple conversion",
  },
  "21": {
    headline: "Was Morrow anders macht.",
    format: "Carousel",
    contentRole: "Morrow explainer",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    slides: [
      { title: "Ausgewählte Unterkunft", body: "Nicht beliebig, sondern passend zur Auszeit." },
      { title: "Lokales Erlebnis", body: "Ein Moment, der den Ort spürbar macht." },
      { title: "Ruhiger Rhythmus", body: "Vorbereitet genug, damit vor Ort Luft bleibt." },
      { title: "Persönliche Betreuung", body: "Ein Ansprechpartner statt anonymer Buchungslogik." },
    ],
  },
  "22": {
    headline: "Empfehlungen sind nur gut, wenn sie zu euch passen.",
    format: "Carousel",
    contentRole: "Local recommendation",
    asset: "public/brand/generated/social/morrow-social-set-b-mother-child-map-dunes.png",
    slides: [
      { title: "Mit Kindern", body: "Kürzere Wege, Pausen, wetterfeste Alternativen." },
      { title: "Zu zweit", body: "Ruhige Abende, Spaziergänge, gute Zeitfenster." },
      { title: "Mit Hund", body: "Strandregeln, Wege und Rückzugsorte müssen mitgedacht werden." },
      { title: "In der Nebensaison", body: "Weniger Betrieb, mehr Ruhe, andere Öffnungszeiten." },
    ],
  },
  "23": {
    headline: "Kinder erinnern sich selten an perfekte Planung.",
    format: "Single Still",
    contentRole: "Family share post",
    asset: "public/brand/generated/social/morrow-social-set-b-father-child-beach.png",
  },
  "24": {
    headline: "Zwei Tage können reichen.",
    format: "Single Still",
    contentRole: "Couple short trip",
  },
  "25": {
    headline: "Rückzug ist Teil des Erlebnisses.",
    format: "Single Still",
    contentRole: "Stay trust",
  },
  "26": {
    headline: "Was wir für SPO immer mitdenken.",
    format: "Carousel",
    contentRole: "Morrow quality check",
    asset: "public/brand/generated/social/morrow-social-set-b-breakfast-map-detail.png",
    slides: [
      { title: "Wind und Wetter", body: "Nicht als Störung, sondern als Teil des Orts." },
      { title: "Wege zum Strand", body: "SPO fühlt sich anders an, wenn Wege zu lang oder unklar sind." },
      { title: "Pausen im Rhythmus", body: "Gute Aufenthalte brauchen Luft zwischen den Momenten." },
      { title: "Alter und Anlass", body: "Familie, Paarzeit, Hund oder Nebensaison verändern die Planung." },
    ],
  },
  "27": {
    headline: "Eine schöne Zeit ist kein Zufall.",
    format: "Single Still",
    contentRole: "Brand belief",
    asset: "public/brand/generated/social/morrow-social-set-b-coastal-house-evening.png",
  },
  "28": {
    headline: "Ankommen mit Kindern braucht weniger Reibung.",
    format: "Single Still",
    contentRole: "Family arrival",
  },
  "29": {
    headline: "Paarzeit sollte nicht mit Recherche anfangen.",
    format: "Carousel",
    contentRole: "Couple pain point",
    asset: "public/brand/generated/social/morrow-social-set-a-couple-tea-table.png",
    slides: [
      { title: "Nicht erst Restaurants suchen", body: "Ein guter Abend darf vorbereitet sein, ohne durchgeplant zu wirken." },
      { title: "Nicht Strandabschnitte vergleichen", body: "Wichtig ist, was zu Anlass, Wetter und Rhythmus passt." },
      { title: "Nicht Unterkunft allein denken", body: "Der Aufenthalt wirkt erst, wenn Rückzug und Ort zusammenpassen." },
      { title: "Morrow sortiert vor", body: "Damit ihr vor Ort eigene Zeit habt." },
    ],
  },
  "30": {
    headline: "Der Ort darf den Takt vorgeben.",
    format: "Single Still",
    contentRole: "Place emotion",
  },
  "31": {
    headline: "So funktioniert eine Morrow Anfrage.",
    format: "Carousel",
    contentRole: "Conversion explainer",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    slides: [
      { title: "1. Auszeit auswählen", body: "Family Escape, Couple Reset oder ein passender Aufenthalt am Wasser." },
      { title: "2. Wunschzeitraum senden", body: "Kurz, persönlich und unverbindlich." },
      { title: "3. Rückmeldung bekommen", body: "Wir prüfen Verfügbarkeit und passende Optionen." },
      { title: "4. Gemeinsam finalisieren", body: "Aus Anfrage wird ein vorbereiteter Aufenthalt." },
    ],
  },
  "32": {
    headline: "Vertrauen entsteht, wenn Vorbereitung sichtbar wird.",
    format: "Carousel",
    contentRole: "Trust builder",
    asset: "public/brand/generated/social/morrow-social-set-a-arrival-bag-detail.png",
    slides: [
      { title: "Klare Informationen", body: "Damit Ankommen nicht mit offenen Fragen beginnt." },
      { title: "Passende Empfehlungen", body: "Nicht allgemein, sondern passend zur Auszeit." },
      { title: "Sinnvolle Wege", body: "Vor Ort zählt, was wirklich leicht erreichbar ist." },
      { title: "Ein Ansprechpartner", body: "Menschliche Betreuung statt anonymer Buchungslogik." },
    ],
  },
  "33": {
    headline: "Für Familien. Für Paare. Für Orte am Wasser.",
    format: "Single Still",
    contentRole: "Brand direction",
    asset: "public/brand/generated/social/morrow-social-set-b-couple-beach-path.png",
  },
  "34": {
    headline: "Noch eine ruhige Familienauszeit im Sommer?",
    format: "Single Still",
    contentRole: "Family conversion",
  },
  "35": {
    headline: "Kurz raus. Ohne alles selbst zu planen.",
    format: "Single Still",
    contentRole: "Couple conversion",
  },
  "36": {
    headline: "Nicht nur wegfahren. Gut ankommen.",
    format: "Single Still",
    contentRole: "Brand closer",
  },
};

const germanReplacements = [
  ["Ausgewaehlte", "Ausgewählte"],
  ["ausgewaehlte", "ausgewählte"],
  ["Auszeiten", "Auszeiten"],
  ["Ankuenfte", "Ankünfte"],
  ["Oeffentlich", "Öffentlich"],
  ["erklaert", "erklärt"],
  ["Erklaert", "Erklärt"],
  ["Unterkuenfte", "Unterkünfte"],
  ["Unterkunft", "Unterkunft"],
  ["persoenliche", "persönliche"],
  ["Persoenliche", "Persönliche"],
  ["persoenlich", "persönlich"],
  ["Persoenlich", "Persönlich"],
  ["schoenste", "schönste"],
  ["schoene", "schöne"],
  ["schoen", "schön"],
  ["Schoene", "Schöne"],
  ["fuer", "für"],
  ["Fuer", "Für"],
  ["ueber", "über"],
  ["Ueber", "Über"],
  ["waehlen", "wählen"],
  ["auswaehlen", "auswählen"],
  ["auswaehlt", "auswählt"],
  ["zurueck", "zurück"],
  ["Zurueck", "Zurück"],
  ["Rueckzug", "Rückzug"],
  ["Rueckmeldung", "Rückmeldung"],
  ["fuehlt", "fühlt"],
  ["anzufuehlen", "anzufühlen"],
  ["anfuehlen", "anfühlen"],
  ["Fuehlt", "Fühlt"],
  ["Gefuehl", "Gefühl"],
  ["Gefuehle", "Gefühle"],
  ["Wunschgefuehl", "Wunschgefühl"],
  ["Detailgefuehl", "Detailgefühl"],
  ["Tagesgefuehl", "Tagesgefühl"],
  ["Fuesse", "Füße"],
  ["Fuessen", "Füßen"],
  ["Spaziergaenge", "Spaziergänge"],
  ["zerfaellt", "zerfällt"],
  ["losfaehrt", "losfährt"],
  ["Naehe", "Nähe"],
  ["zufaellig", "zufällig"],
  ["Qualitaet", "Qualität"],
  ["moeglichst", "möglichst"],
  ["zusammenfuehren", "zusammenführen"],
  ["heisst", "heißt"],
  ["Strandgefuehle", "Strandgefühle"],
  ["gehoert", "gehört"],
  ["Gaeste", "Gäste"],
  ["Aktivitaeten", "Aktivitäten"],
  ["Eindruecken", "Eindrücken"],
  ["praegen", "prägen"],
  ["naechste", "nächste"],
  ["Naechstes", "Nächstes"],
  ["pruefen", "prüfen"],
  ["Pruefung", "Prüfung"],
  ["Pruefen", "Prüfen"],
  ["Verfuegbarkeit", "Verfügbarkeit"],
  ["draussen", "draußen"],
  ["Saeule", "Säule"],
  ["Beitraege", "Beiträge"],
  ["braeuchte", "bräuchte"],
  ["moechte", "möchte"],
  ["moechtet", "möchtet"],
  ["moechten", "möchten"],
  ["koennen", "können"],
  ["koennte", "könnte"],
  ["duerfen", "dürfen"],
  ["duerft", "dürft"],
  ["genug", "genug"],
  ["gross", "groß"],
  ["grosse", "große"],
  ["Gross", "Groß"],
  ["laesst", "lässt"],
  ["laenger", "länger"],
  ["haeufig", "häufig"],
  ["Haeufig", "Häufig"],
  ["staendig", "ständig"],
  ["wuerde", "würde"],
  ["veraendern", "verändern"],
  ["Zeit Raeume", "Zeiträume"],
  ["Zeitraeume", "Zeiträume"],
  ["gefuellt", "gefüllt"],
  ["uebrig", "übrig"],
  ["muede", "müde"],
  ["ploetzlich", "plötzlich"],
  ["waere", "wäre"],
  ["haette", "hätte"],
  ["fuenf", "fünf"],
  ["Fuenf", "Fünf"],
  ["Baender", "Bänder"],
  ["Duenen", "Dünen"],
  ["Duene", "Düne"],
  ["Boehl", "Böhl"],
  ["Suedstrand", "Südstrand"],
  ["sorgfaeltig", "sorgfältig"],
  ["Sorgfaeltig", "Sorgfältig"],
  ["abhaeken", "abhaken"],
  ["haelt", "hält"],
  ["erzaehlt", "erzählt"],
  ["zaehlt", "zählt"],
  ["zaehlen", "zählen"],
  ["waechst", "wächst"],
  ["laengste", "längste"],
  ["laeuft", "läuft"],
  ["veraendert", "verändert"],
  ["gehoeren", "gehören"],
  ["klaeren", "klären"],
  ["klaert", "klärt"],
  ["geklaert", "geklärt"],
  ["stoeren", "stören"],
  ["Stoerung", "Störung"],
  ["muesst", "müsst"],
  ["muessen", "müssen"],
  ["frueh", "früh"],
  ["fuehlen", "fühlen"],
  ["begruesst", "begrüßt"],
  ["Ortsgefuehl", "Ortsgefühl"],
  ["Strandgefuehl", "Strandgefühl"],
  ["weitlaeufig", "weitläufig"],
  ["unnoetig", "unnötig"],
  ["spektakulaer", "spektakulär"],
  ["Waerme", "Wärme"],
  ["groesste", "größte"],
  ["kuerzeren", "kürzeren"],
  ["Sued", "Süd"],
  ["Mobilitaet", "Mobilität"],
  ["Luecken", "Lücken"],
  ["fuellt", "füllt"],
  ["spaeter", "später"],
  ["koennt", "könnt"],
  ["moeglich", "möglich"],
  ["draengt", "drängt"],
  ["Ausfluegen", "Ausflügen"],
  ["unterschaetzen", "unterschätzen"],
  ["Gepaeck", "Gepäck"],
  ["praegt", "prägt"],
  ["Weiter geht es", "Weiter geht es"],
];

function germanize(value) {
  if (typeof value !== "string") return value;
  return germanReplacements.reduce((text, [from, to]) => text.replaceAll(from, to), value);
}

function publicPillarName(value) {
  const label = germanize(value);
  return {
    "Brand Trust": "Vertrauen",
    "Morrow Care": "Vorbereitung",
  }[label] || label;
}

function publicKickerName(value) {
  const label = germanize(value);
  return {
    "Morrow Check": "Sorgfältig geprüft",
    "Morrow Care": "Gut vorbereitet",
    "Morrow Prinzip": "Weniger suchen",
    "Morrow Stimme": "Ruhiger reisen",
    "Morrow Richtung": "Orte am Wasser",
    "Family Rhythmus": "Mit Kindern",
    "Family Anreise": "Ankommen mit Kindern",
    "Family Alltag": "Erster Morgen",
    "Short Reset": "Kurz raus",
    "SPO Guide": "SPO besser planen",
    "Care": "Vorbereitung",
    "Stay": "Unterkunft",
  }[label] || label;
}

function localizePost(post) {
  const templateByLayout = {
    quote: "Styleguide Foto-Zitatkarte",
    photo: "Styleguide Story Photo",
    split: "Styleguide Editorial Look",
    checklist: "Styleguide Photo Poster",
  };

  const upgradedPost = {
    ...post,
    ...(upgrades[post.sourceId || post.id] || {}),
  };

  return {
    ...upgradedPost,
    styleguideTemplate: templateByLayout[post.layout] || "Styleguide Social",
    pillar: publicPillarName(upgradedPost.pillar),
    format: germanize(upgradedPost.format),
    headline: germanize(upgradedPost.headline),
    kicker: publicKickerName(upgradedPost.kicker),
    caption: germanize(upgradedPost.caption),
    points: upgradedPost.points?.map(germanize),
    slides: upgradedPost.slides?.map((slide, index) => ({
      title: germanize(slide.title),
      body: germanize(slide.body),
      support: supportLines(
        {
          ...upgradedPost,
          pillar: germanize(upgradedPost.pillar),
          headline: germanize(upgradedPost.headline),
        },
        {
          title: germanize(slide.title),
          body: germanize(slide.body),
        },
        index,
      ).map(([label, value]) => [germanize(label), germanize(value)]),
    })),
  };
}

const uniqueAssetOverridesById = {
  "06": "public/brand/generated/social/unique/morrow-ig-unique-21-hand-place-card.png",
  "07": "public/brand/generated/social/unique/morrow-ig-unique-05-itinerary-cup-window.png",
  "12": "public/brand/generated/social/unique/morrow-ig-unique-03-couple-dune-bench.png",
  "14": "public/brand/generated/social/unique/morrow-ig-unique-01-arrival-bag-room.png",
  "17": "public/brand/generated/social/unique/morrow-ig-unique-33-linen-towels-key.png",
  "18": "public/brand/generated/social/unique/morrow-ig-unique-29-living-room-dune-window.png",
  "19": "public/brand/generated/social/unique/morrow-ig-unique-18-key-tray-detail.png",
  "20": "public/brand/generated/social/unique/morrow-ig-unique-34-empty-posts-beach-path.png",
  "22": "public/brand/generated/social/unique/morrow-ig-unique-37-breakfast-setting-two.png",
  "23": "public/brand/generated/social/unique/morrow-ig-unique-22-boardwalk-pfahlbau-grey.png",
  "24": "public/brand/generated/social/unique/morrow-ig-unique-06-wide-beach-pfahlbau.png",
  "26": "public/brand/generated/social/unique/morrow-ig-unique-02-family-boardwalk-sea.png",
  "30": "public/brand/generated/social/unique/morrow-ig-unique-27-shell-key-note.png",
  "33": "public/brand/generated/social/unique/morrow-ig-unique-30-wooden-stairs-sea.png",
  "36": "public/brand/generated/social/unique/morrow-ig-unique-12-mother-child-dune-sea.png",
  "37": "public/brand/generated/social/unique/morrow-ig-unique-13-couple-waterline-walk.png",
  "39": "public/brand/generated/social/unique/morrow-ig-unique-38-dune-fence-horizon.png",
  "44": "public/brand/generated/social/unique/morrow-ig-unique-14-cups-book-window.png",
  "45": "public/brand/generated/social/unique/morrow-ig-unique-08-couple-boardwalk-rain.png",
  "48": "public/brand/generated/social/unique/morrow-ig-unique-04-empty-rain-boardwalk.png",
  "50": "public/brand/generated/social/unique/morrow-ig-unique-17-coastal-house-evening.png",
  "52": "public/brand/generated/social/unique/morrow-ig-unique-23-couple-dinner-table.png",
  "54": "public/brand/generated/social/unique/morrow-ig-unique-15-dune-path-sea.png",
  "55": "public/brand/generated/social/unique/morrow-ig-unique-19-empty-beach-footprints.png",
  "56": "public/brand/generated/social/unique/morrow-ig-unique-40-couple-reading-sofa.png",
  "57": "public/brand/generated/social/unique/morrow-ig-unique-16-bicycles-dune-path.png",
  "58": "public/brand/generated/social/unique/morrow-ig-unique-07-family-dunes-after-rain.png",
  "59": "public/brand/generated/social/unique/morrow-ig-unique-10-rain-boots-entry.png",
  "60": "public/brand/generated/social/unique/morrow-ig-unique-20-family-dune-picnic.png",
  "61": "public/brand/generated/social/unique/morrow-ig-unique-28-couple-dune-edge.png",
  "62": "public/brand/generated/social/unique/morrow-ig-unique-31-family-breakfast-table.png",
  "64": "public/brand/generated/social/unique/morrow-ig-unique-09-family-breakfast-window.png",
  "65": "public/brand/generated/social/unique/morrow-ig-unique-32-couple-cups-window.png",
  "66": "public/brand/generated/social/unique/morrow-ig-unique-36-family-bag-boardwalk.png",
  "67": "public/brand/generated/social/unique/morrow-ig-unique-35-couple-boardwalk-edge.png",
  "69": "public/brand/generated/social/unique/morrow-ig-unique-24-family-shoes-threshold.png",
  "70": "public/brand/generated/social/unique/morrow-ig-unique-25-family-low-tide-walk.png",
};

function applyUniqueAssetOverride(post) {
  return {
    ...post,
    asset: uniqueAssetOverridesById[post.id] || post.asset,
  };
}

function weekdayName(date) {
  return new Intl.DateTimeFormat("de-DE", { weekday: "long" }).format(new Date(`${date}T12:00:00`));
}

function shortDate(date) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function longDate(date) {
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const dataUrlCache = new Map();

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".ttf") return "font/ttf";
  return "image/png";
}

function dataUrl(filePath) {
  if (!dataUrlCache.has(filePath)) {
    const data = readFileSync(filePath).toString("base64");
    dataUrlCache.set(filePath, `data:${mimeType(filePath)};base64,${data}`);
  }
  return dataUrlCache.get(filePath);
}

function relAsset(asset) {
  return asset ? dataUrl(path.join(root, asset)) : "";
}

function firstSentence(text = "") {
  const clean = text.replace(/\s+/g, " ").trim();
  const match = clean.match(/^(.+?[.!?])(?:\s|$)/);
  return match ? match[1] : clean;
}

function editorialNotes(post) {
  if (post.slides?.length) {
    const limit = post.headline.length > 62 ? 2 : 3;
    return post.slides
      .slice(0, limit)
      .map((slide) => slide.title.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  const paragraphs = (post.caption || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const candidates = paragraphs
    .map(firstSentence)
    .filter((line) => line && line !== post.headline && line.length <= 120);

  return candidates.slice(0, post.headline.length > 62 ? 1 : 2);
}

function postHtml(post) {
  const logo = dataUrl(path.join(root, "public/brand/logos/wordmark/morrow-logomark-offblack.svg"));
  const logoLight = dataUrl(path.join(root, "public/brand/logos/wordmark/morrow-logomark-offwhite.svg"));
  const image = relAsset(post.asset);
  const hasImage = Boolean(post.asset);
  const points = (post.points || []).map((point) => `<li>${esc(point)}</li>`).join("");
  const isPhoto = post.layout === "photo";
  const isSplit = post.layout === "split";
  const isChecklist = post.layout === "checklist";
  const isQuote = post.layout === "quote";
  const headlineClass = post.headline.length > 72 ? " headline-long" : "";
  const notes = editorialNotes(post).map((note) => `<div class="note">${esc(note)}</div>`).join("");
  const notesHtml = notes ? `<div class="editorial-notes">${notes}</div>` : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: Hanken;
        src: url("${dataUrl(path.join(root, "public/fonts/HankenGrotesk-VariableFont_wght.ttf"))}");
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: ${brand.offwhite}; font-family: Hanken, Arial, sans-serif; }
      .frame {
        position: relative;
        width: 1080px;
        height: 1350px;
        overflow: hidden;
        background: ${brand.offwhite};
        color: ${brand.offblack};
      }
      .grain {
        position: absolute;
        inset: 0;
        opacity: .12;
        background-image:
          radial-gradient(circle at 20% 30%, rgba(24,23,21,.12) 0 1px, transparent 1px),
          radial-gradient(circle at 70% 60%, rgba(117,73,31,.10) 0 1px, transparent 1px);
        background-size: 18px 18px, 23px 23px;
        pointer-events: none;
      }
      .brand {
        position: absolute;
        z-index: 4;
        left: 72px;
        top: 64px;
        width: 148px;
      }
      .brand.light { filter: none; }
      .kicker {
        font-size: 24px;
        line-height: 1;
        font-weight: 640;
        color: ${brand.sage};
        margin-bottom: 26px;
        display: none;
      }
      .headline {
        font-size: 54px;
        line-height: 1.04;
        font-weight: 660;
        max-width: 812px;
        letter-spacing: 0;
      }
      .social-frame {
        position: absolute;
        inset: 54px;
        border: 2px solid rgba(24,23,21,.68);
        border-radius: 42px;
        overflow: hidden;
      }
      .photo-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .photo .shade {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(24,23,21,.18), rgba(24,23,21,.08) 42%, rgba(24,23,21,.68));
      }
      .photo .brand { width: 154px; }
      .photo .copy {
        position: absolute;
        left: 72px;
        right: 72px;
        bottom: 104px;
        color: ${brand.offwhite};
        z-index: 3;
      }
      .photo .kicker { color: rgba(236,230,214,.86); }
      .photo .headline {
        max-width: 790px;
        font-size: 62px;
        line-height: 1;
        font-weight: 680;
        text-transform: none;
        text-shadow: 0 2px 24px rgba(24,23,21,.18);
      }
      .quote .copy {
        position: absolute;
        left: 78px;
        right: 78px;
        bottom: 132px;
        z-index: 3;
      }
      .quote {
        background: ${brand.clay};
      }
      .quote .quote-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .quote .shade {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(24,23,21,.06), rgba(24,23,21,.12) 44%, rgba(24,23,21,.62)),
          linear-gradient(90deg, rgba(24,23,21,.34), rgba(24,23,21,.04) 58%);
      }
      .quote .brand { display: none; }
      .quote .kicker { color: rgba(236,230,214,.82); }
      .quote .mark {
        display: none;
      }
      .quote .headline {
        font-size: 54px;
        line-height: 1.06;
        max-width: 760px;
        font-weight: 680;
        color: ${brand.offwhite};
        text-transform: none;
      }
      .quote .poster-wordmark {
        position: absolute;
        left: 50%;
        bottom: 76px;
        width: 112px;
        transform: translateX(-50%);
        opacity: .84;
        z-index: 5;
      }
      .split {
        background: ${brand.offblack};
      }
      .split .brand { display: none; }
      .split .image {
        position: absolute;
        inset: 0;
        height: auto;
        border-radius: 0;
        overflow: hidden;
        border: 0;
      }
      .split .image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .split .image::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(24,23,21,.06), rgba(24,23,21,.08) 38%, rgba(24,23,21,.64)),
          linear-gradient(90deg, rgba(24,23,21,.42), rgba(24,23,21,.04) 58%);
      }
      .split .copy {
        position: absolute;
        left: 72px;
        right: 72px;
        bottom: 126px;
        width: auto;
        z-index: 3;
        color: ${brand.offwhite};
      }
      .split .kicker { color: rgba(236,230,214,.88); text-align: center; margin-bottom: 0; }
      .split .headline {
        position: static;
        font-size: 58px;
        line-height: 1.02;
        max-width: 780px;
        text-align: left;
        text-transform: none;
        color: ${brand.offwhite};
        text-shadow: 0 2px 24px rgba(24,23,21,.22);
      }
      .split .headline-long {
        font-size: 50px;
        line-height: 1.07;
      }
      .editorial-notes {
        display: grid;
        gap: 8px;
        max-width: 760px;
        margin-top: 24px;
      }
      .note {
        border-top: 1px solid rgba(236,230,214,.34);
        padding-top: 10px;
        font-size: 25px;
        line-height: 1.18;
        font-weight: 560;
        color: rgba(236,230,214,.92);
        text-shadow: 0 2px 18px rgba(24,23,21,.18);
      }
      .quote .editorial-notes {
        max-width: 720px;
      }
      .split .poster-wordmark {
        position: absolute;
        left: 50%;
        bottom: 58px;
        width: 112px;
        transform: translateX(-50%);
        opacity: .84;
        z-index: 5;
      }
      .split .block {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 52%;
        background: ${brand.clay};
      }
      .checklist .copy {
        position: absolute;
        inset: 0;
        z-index: 3;
      }
      .checklist .brand { display: none; }
      .checklist .weekday {
        display: none;
      }
      .checklist .headline {
        position: absolute;
        left: 110px;
        right: 110px;
        top: 108px;
        font-size: 48px;
        line-height: 1.07;
        font-weight: 680;
        max-width: none;
        margin: 0;
        color: ${brand.clay};
        text-align: left;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 18px;
      }
      li {
        border-top: 1px solid rgba(117,73,31,.22);
        padding-top: 12px;
        font-size: 25px;
        line-height: 1.08;
        font-weight: 520;
        max-width: 830px;
        color: ${brand.clay};
      }
      .checklist .tile {
        position: absolute;
        left: 104px;
        top: 320px;
        right: 104px;
        height: 470px;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid rgba(117,73,31,.28);
        background-image: url("${image}");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
      .checklist ul {
        position: absolute;
        left: 110px;
        right: 110px;
        top: 852px;
        gap: 12px;
        counter-reset: poster-points;
      }
      .checklist li {
        display: grid;
        grid-template-columns: 34px 1fr;
        column-gap: 12px;
        align-items: start;
        font-size: 27px;
        line-height: 1.13;
      }
      .checklist li::before {
        counter-increment: poster-points;
        content: counter(poster-points, decimal-leading-zero);
        font-size: 18px;
        line-height: 1;
        font-weight: 760;
        color: rgba(117,73,31,.72);
        padding-top: 4px;
      }
      .checklist .poster-wordmark {
        position: absolute;
        left: 50%;
        bottom: 58px;
        width: 112px;
        transform: translateX(-50%);
        opacity: .82;
      }
    </style>
  </head>
  <body>
    <main class="frame ${esc(post.layout)}">
      ${
        isPhoto && hasImage
          ? `<img class="photo-img" src="${image}" /><div class="shade"></div><img class="brand light" src="${logoLight}" /><section class="copy"><div class="kicker">${esc(post.kicker)}</div><div class="headline">${esc(post.headline)}</div></section>`
          : ""
      }
      ${
        isSplit
          ? `<section class="copy"><div class="kicker">${esc(post.kicker)}</div><div class="headline${headlineClass}">${esc(post.headline)}</div>${notesHtml}</section><div class="image">${hasImage ? `<img src="${image}" />` : `<div class="block"></div>`}</div><img class="poster-wordmark" src="${logoLight}" />`
          : ""
      }
      ${
        isQuote
          ? `${hasImage ? `<img class="quote-img" src="${image}" /><div class="shade"></div>` : ""}<div class="social-frame"></div><div class="mark"></div><section class="copy"><div class="kicker">${esc(post.kicker)}</div><div class="headline">${esc(post.headline)}</div>${notesHtml}</section><img class="poster-wordmark" src="${logoLight}" />`
          : ""
      }
      ${
        isChecklist
          ? `<div class="social-frame"></div><section class="copy"><div class="weekday">${esc(post.kicker || post.pillar)}</div><div class="headline">${esc(post.headline)}</div><ul>${points}</ul></section><div class="tile"></div><img class="poster-wordmark" src="${logo}" />`
          : ""
      }
      <div class="grain"></div>
    </main>
  </body>
</html>`;
}

function supportLines(post, slide, index) {
  const text = `${post.headline} ${slide.title} ${slide.body}`.toLowerCase();
  const pillar = post.pillar;

  const byKeyword = [
    {
      test: ["anfrage", "rueckmeldung", "rückmeldung", "finalisieren"],
      lines: [
        ["Warum wichtig", "Neue Gaeste muessen verstehen, was als Naechstes passiert."],
        ["Morrow Blick", "Erst einordnen, dann empfehlen. Keine anonyme Sofortbuchung."],
        ["Merken", "Gute Anfrage senkt Aufwand, weil sie die richtigen Fragen frueh klaert."],
      ],
    },
    {
      test: ["packliste", "wind", "wetter", "regen", "plan b", "schichten"],
      lines: [
        ["Warum wichtig", "SPO veraendert sich schnell: Wind, Wege und Wetter gehoeren zum Ort."],
        ["Morrow Blick", "Ein guter Plan B ist ruhig, nah und ohne neue Recherche machbar."],
        ["Merken", "Nicht mehr Programm hilft, sondern ein realistischer Rhythmus."],
      ],
    },
    {
      test: ["familie", "kind", "pause", "snack", "mittag", "abend"],
      lines: [
        ["Warum wichtig", "Mit Kindern entscheidet oft die Pause, nicht der Programmpunkt."],
        ["Morrow Blick", "Wir achten auf Wege, Rueckzug und Tagesenergie statt nur auf Bettenzahl."],
        ["Merken", "Ein guter Familientag hat Anker, aber nicht zu viele Verpflichtungen."],
      ],
    },
    {
      test: ["paar", "zweit", "freitag", "samstag", "sonntag", "naehe", "nähe"],
      lines: [
        ["Warum wichtig", "Paarzeit kippt schnell, wenn sie schon bei der Planung anstrengend wird."],
        ["Morrow Blick", "Wir bereiten genug vor, damit vor Ort Raum und Ruhe bleiben."],
        ["Merken", "Nicht Perfektion macht es wertvoll, sondern ein leichter gemeinsamer Rhythmus."],
      ],
    },
    {
      test: ["strand", "ording", "bad", "boehl", "böhl", "dorf", "sued", "süd", "wege"],
      lines: [
        ["Warum wichtig", "SPO ist weitlaeufig. Der falsche Anker macht gute Tage unnoetig schwer."],
        ["Morrow Blick", "Wir denken Ortsteil, Wege und Tagesform zusammen."],
        ["Merken", "Eine Empfehlung ist nur gut, wenn sie zu eurem konkreten Tag passt."],
      ],
    },
    {
      test: ["unterkunft", "katalog", "auswahl", "kuration", "kuratieren", "empfehlung"],
      lines: [
        ["Warum wichtig", "Mehr Auswahl macht Urlaub nicht automatisch leichter."],
        ["Morrow Blick", "Wir lassen bewusst weg, was nicht zum Anlass, Ort oder Rhythmus passt."],
        ["Merken", "Qualitaet entsteht durch Kontext, nicht durch die laengste Liste."],
      ],
    },
  ];

  const matched = byKeyword.find((group) => group.test.some((keyword) => text.includes(keyword)));
  if (matched) return matched.lines;

  const fallbackByPillar = {
    [pillars.family]: [
      ["Warum wichtig", "Familienurlaub braucht klare Anker und genug Luft dazwischen."],
      ["Morrow Blick", "Wir planen nicht voller, sondern leichter."],
      ["Merken", "Der beste Moment ist oft der, der nicht erzwungen werden muss."],
    ],
    [pillars.couple]: [
      ["Warum wichtig", "Kurze Auszeiten muessen schnell leicht werden."],
      ["Morrow Blick", "Weniger Recherche, mehr gemeinsame Zeit."],
      ["Merken", "Ein guter Tag braucht nicht viele Entscheidungen."],
    ],
    [pillars.spo]: [
      ["Warum wichtig", "SPO ist kein kompakter Badeort, sondern ein Ort mit Rhythmus."],
      ["Morrow Blick", "Wir uebersetzen Weite, Wetter und Wege in gute Entscheidungen."],
      ["Merken", "Orientierung macht den Ort entspannter."],
    ],
    [pillars.care]: [
      ["Warum wichtig", "Gute Vorbereitung sieht man oft erst, wenn nichts hakt."],
      ["Morrow Blick", "Wir klaeren Details, bevor sie vor Ort stoeren."],
      ["Merken", "Care heisst: Ihr muesst nicht alles selbst tragen."],
    ],
    [pillars.conversion]: [
      ["Warum wichtig", "Eine Anfrage soll leicht und unverbindlich starten."],
      ["Morrow Blick", "Wir pruefen Passung, bevor es konkret wird."],
      ["Merken", "Erst verstehen, dann anbieten."],
    ],
  };

  return fallbackByPillar[pillar] || [
    ["Warum wichtig", "Eine gute Auszeit beginnt mit weniger offenen Fragen."],
    ["Morrow Blick", "Ort, Unterkunft und Rhythmus muessen zusammenpassen."],
    ["Merken", "Weniger suchen. Besser ankommen."],
  ];
}

function slideHtml(post, slide, index, total) {
  const image = relAsset(post.asset || "public/brand/generated/social/morrow-social-set-b-empty-boardwalk-bag.png");
  const logo = dataUrl(path.join(root, "public/brand/logos/wordmark/morrow-logomark-offblack.svg"));
  const logoLight = dataUrl(path.join(root, "public/brand/logos/wordmark/morrow-logomark-offwhite.svg"));
  const isLightSlide = index % 2 === 0;
  const supporting = slide.support || supportLines(post, slide, index).map(([label, value]) => [germanize(label), germanize(value)]);
  const supportHtml = supporting
    .map(([, value]) => `<div class="support-row"><div class="support-copy">${esc(value)}</div></div>`)
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: Hanken;
        src: url("${dataUrl(path.join(root, "public/fonts/HankenGrotesk-VariableFont_wght.ttf"))}");
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: ${brand.offwhite}; font-family: Hanken, Arial, sans-serif; }
      .frame {
        position: relative;
        width: 1080px;
        height: 1350px;
        overflow: hidden;
        background: ${index % 2 === 0 ? brand.offwhite : brand.clay};
        color: ${index % 2 === 0 ? brand.clay : brand.offwhite};
      }
      .card {
        position: absolute;
        inset: 54px;
        border: 2px solid ${index % 2 === 0 ? "rgba(117,73,31,.62)" : "rgba(236,230,214,.72)"};
        border-radius: 42px;
      }
      .pillar {
        display: none;
      }
      .photo {
        position: absolute;
        top: 88px;
        left: 86px;
        right: 86px;
        height: 330px;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid ${index % 2 === 0 ? "rgba(117,73,31,.24)" : "rgba(236,230,214,.28)"};
        background-image: url("${image}");
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      }
      .photo::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent, rgba(24,23,21,.12));
      }
      .title {
        position: absolute;
        left: 86px;
        right: 86px;
        top: 482px;
        font-size: 52px;
        line-height: 1.04;
        font-weight: 700;
        letter-spacing: 0;
      }
      .body {
        position: absolute;
        left: 90px;
        right: 120px;
        top: 640px;
        font-size: 31px;
        line-height: 1.2;
        font-weight: 520;
      }
      .support {
        position: absolute;
        left: 86px;
        right: 86px;
        top: 792px;
        display: grid;
        gap: 12px;
      }
      .support-row {
        display: grid;
        grid-template-columns: 1fr;
        padding-top: 14px;
        border-top: 1px solid ${index % 2 === 0 ? "rgba(117,73,31,.28)" : "rgba(236,230,214,.30)"};
      }
      .support-label {
        display: none;
      }
      .support-copy {
        font-size: 28px;
        line-height: 1.2;
        font-weight: 500;
      }
      .footer {
        position: absolute;
        left: 50%;
        bottom: 62px;
        width: 112px;
        transform: translateX(-50%);
        opacity: .84;
      }
      .grain {
        position: absolute;
        inset: 0;
        opacity: .10;
        background-image: radial-gradient(circle at 20% 30%, rgba(24,23,21,.12) 0 1px, transparent 1px);
        background-size: 18px 18px;
      }
    </style>
  </head>
  <body>
    <main class="frame">
      <div class="card"></div>
      <div class="pillar">${esc(post.pillar)}</div>
      <div class="photo"></div>
      <div class="title">${esc(slide.title)}</div>
      <div class="body">${esc(slide.body)}</div>
      <div class="support">${supportHtml}</div>
      <img class="footer" src="${isLightSlide ? logo : logoLight}" />
      <div class="grain"></div>
    </main>
  </body>
</html>`;
}

function markdown() {
  const rows = localizedPosts
    .map((post) => {
      const filename = post.slides?.length
        ? `public/social/instagram/carousels/morrow-instagram-${post.id}/`
        : `public/social/instagram/stills/morrow-instagram-${post.id}.png`;
      return `| ${post.date} | ${post.time} | ${post.pillar} | ${post.format} | ${post.headline} | \`${filename}\` |`;
    })
    .join("\n");

  const details = localizedPosts
    .map((post) => {
      const filename = `morrow-instagram-${post.id}.png`;
      const carouselPath = post.slides?.length ? `public/social/instagram/carousels/morrow-instagram-${post.id}/` : "";
      return `### ${post.id}. ${post.date} um ${post.time} - ${post.pillar}

**Creative:** \`public/social/instagram/stills/${filename}\`  
${carouselPath ? `**Carousel:** \`${carouselPath}\`  \n` : ""}**Format:** ${post.format}  
**Headline im Still:** ${post.headline}

**Caption zum Kopieren:**
\`\`\`text
${post.caption}
\`\`\`
`;
    })
    .join("\n");

  return germanize(`# Morrow Instagram Content-Plan

Zeitraum: ${longDate(localizedPosts[0].date)} bis ${longDate(localizedPosts[localizedPosts.length - 1].date)}  
Frequenz: Launch am Freitag, danach 3 Feed-Posts pro Woche: Montag 19:30, Mittwoch 12:15 und Sonntag 09:30.  
Creative-Format: 1080 x 1350 px, damit die Feed-Posts auf Instagram mehr Fläche bekommen.
Ausgangslage: neuer Account ohne Reichweite. Ziel ist ein ruhiger Vertrauensaufbau, sichtbare Markenwelt und organische Signale, ohne dass der Kanal eintönig wird.

## Leitplanken

- Morrow spricht ruhig, sicher, inspirierend und konkret.
- Oeffentlich immer \`Auszeit\` oder \`Auszeiten\`, nicht \`Paket\`.
- Feed-Mix: Vertrauen, SPO-Orientierung, Family Escape, Couple Reset, Vorbereitung und weiche Anfrageposts.
- Creatives orientieren sich an der Social-Media-Seite des Styleguides: Foto-Zitatkarte, Story-Fotokarte, Editorial-Look-Karte und Foto-Poster.
- Verwendet werden Offwhite, Offblack, Clay/Brown und Sage/Olive, Hanken Grotesk, Wortmarke und Morrow-Fotografie.
- Keine generische Booking-, SaaS- oder Influencer-Optik.
- Upload-Texte sind bewusst nicht hashtag-ueberladen. Bei null Reichweite zaehlen Wiedererkennbarkeit, Speichern, Teilen und Profilvertrauen mehr als kurzfristige Reichweiten-Tricks.

## Wochenrhythmus

Montagabend: emotionaler oder angebotsnaher Vertrauenspost.  
Mittwochmittag: Orientierung, Checkliste, lokaler Nutzen.  
Sonntagmorgen: ruhiger Save-/Share-Post mit Auszeit-Gefuehl.

## Kalender

| Datum | Uhrzeit | Saeule | Format | Thema | Still |
| --- | --- | --- | --- | --- | --- |
${rows}

## Beitraege

${details}
`);
}

await fs.rm(outDir, { recursive: true, force: true });
await fs.rm(carouselDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(carouselDir, { recursive: true });
await fs.mkdir(dataDir, { recursive: true });
await fs.mkdir(docsDir, { recursive: true });

const launchPosts = buildLaunchPosts();
const localizedPosts = launchPosts.map(localizePost).map(applyUniqueAssetOverride);

await fs.writeFile(path.join(dataDir, "instagram-first-3-months-2026.json"), JSON.stringify(localizedPosts, null, 2));
await fs.writeFile(path.join(docsDir, "INSTAGRAM_FIRST_3_MONTHS_2026.md"), markdown());

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

for (const post of localizedPosts) {
  await page.setContent(postHtml(post), { waitUntil: "networkidle" });
  const coverPath = path.join(outDir, `morrow-instagram-${post.id}.png`);
  await page.screenshot({ path: coverPath, clip: { x: 0, y: 0, width: 1080, height: 1350 } });

  if (post.slides?.length) {
    const postCarouselDir = path.join(carouselDir, `morrow-instagram-${post.id}`);
    await fs.mkdir(postCarouselDir, { recursive: true });
    await fs.copyFile(coverPath, path.join(postCarouselDir, `morrow-instagram-${post.id}-slide-01.png`));
    for (const [index, slide] of post.slides.entries()) {
      await page.setContent(slideHtml(post, slide, index, post.slides.length + 1), { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(postCarouselDir, `morrow-instagram-${post.id}-slide-${String(index + 2).padStart(2, "0")}.png`),
        clip: { x: 0, y: 0, width: 1080, height: 1350 },
      });
    }
  }
}

await browser.close();

console.log(`Rendered ${localizedPosts.length} Instagram covers.`);
console.log(path.join(docsDir, "INSTAGRAM_FIRST_3_MONTHS_2026.md"));
