export const publicRoutes = {
  home: "/",
  stays: "/auszeiten",
  familyEscape: "/auszeiten/family-escape",
  coupleReset: "/auszeiten/couple-reset",
  owners: "/eigentuemer",
  partners: "/erlebnispartner",
  guides: "/ratgeber",
} as const;

export type PublicRoute = (typeof publicRoutes)[keyof typeof publicRoutes];

export type Audience = "families" | "couples";

export type StayTemplate = {
  slug: string;
  title: string;
  shortTitle: string;
  audience: Audience;
  location: string;
  promise: string;
  lead: string;
  href: PublicRoute;
  image: string;
};

export type StayDetail = StayTemplate & {
  heroTitle: string;
  heroLead: string;
  price: string;
  priceNote: string;
  dates: string[];
  maxGuests: number;
  dogOptional: boolean;
  heroGallery: {
    src: string;
    alt: string;
    label?: string;
  }[];
  included: string[];
  story: {
    kicker: string;
    title: string;
    text: string;
    cues: string[];
    image: string;
    imageAlt: string;
  };
  property: {
    kicker: string;
    title: string;
    text: string;
    facts: string[];
    image: string;
    imageAlt: string;
  };
  experience: {
    kicker: string;
    title: string;
    text: string;
    image: string;
    imageAlt: string;
    items: string[];
  };
  recommendations: {
    title: string;
    text: string;
  }[];
  request: {
    title: string;
    text: string;
    fields: string[];
  };
  faqs: {
    question: string;
    answer: string;
  }[];
};

export type GuideArticle = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  href: string;
  image: string;
};

export type HomePageMoment = {
  title: string;
  text: string;
};

export const navigationItems = [
  { label: "Auszeiten", href: publicRoutes.stays },
  { label: "Ratgeber", href: publicRoutes.guides },
  { label: "Für Eigentümer", href: publicRoutes.owners },
] as const;

export const stayTemplates: StayTemplate[] = [
  {
    slug: "family-escape",
    title: "Family Escape",
    shortTitle: "Für Familien",
    audience: "families",
    location: "Sankt Peter-Ording",
    promise: "Gemeinsame Zeit, ohne alles selbst zusammensuchen zu müssen.",
    lead:
      "Eine vorbereitete Auszeit für Familien, die raus ans Meer wollen und trotzdem genug freie Zeit behalten möchten.",
    href: publicRoutes.familyEscape,
    image: "/brand/generated/morrow-spo-family.png",
  },
  {
    slug: "couple-reset",
    title: "Couple Reset",
    shortTitle: "Für Paare",
    audience: "couples",
    location: "Sankt Peter-Ording",
    promise: "Raus aus dem Alltag, ankommen und wieder mehr voneinander spüren.",
    lead:
      "Eine ruhige Auszeit für Paare, die wenige Tage bewusst vorbereiten lassen und länger davon haben möchten.",
    href: publicRoutes.coupleReset,
    image: "/brand/generated/morrow-spo-couple.png",
  },
];

export const stayDetails: Record<string, StayDetail> = {
  "family-escape": {
    ...stayTemplates[0],
    heroTitle: "Vier Tage Nordsee, die sich nach echter Familienzeit anfühlen.",
    heroLead:
      "Unterkunft, Naturerlebnis und Orientierung vor Ort sind vorbereitet, damit ihr ankommt und nicht erst planen müsst.",
    price: "1.190 EUR",
    priceNote: "pro Aufenthalt, bis 4 Personen",
    dates: ["12.-16. August", "19.-23. August"],
    maxGuests: 4,
    dogOptional: true,
    heroGallery: [
      {
        src: "/brand/generated/morrow-spo-family.png",
        alt: "Familie geht gemeinsam durch die Dünen in Sankt Peter-Ording",
        label: "Familienzeit",
      },
      {
        src: "/brand/generated/morrow-spo-family-arrival.png",
        alt: "Familie kommt in einer vorbereiteten Unterkunft an",
        label: "Ankommen",
      },
      {
        src: "/brand/generated/morrow-spo-family-watt.png",
        alt: "Familie erlebt Watt, Wind und Weite an der Nordsee",
        label: "Naturmoment",
      },
    ],
    included: [
      "4 Nächte in einer ausgewählten Unterkunft",
      "1 lokales Erlebnis für die Familie",
      "kuratierte Empfehlungen für SPO",
      "persönlicher Ansprechpartner vor Ort",
      "Vorbereitung der wichtigsten Aufenthaltsinfos",
    ],
    story: {
      kicker: "Das Gefühl",
      title: "Ein paar Tage, die sich leichter anfühlen.",
      text:
        "Nicht alles suchen. Nicht alles abstimmen. Einfach wissen, dass Unterkunft, erster Naturmoment und Orientierung vor Ort zusammenpassen.",
      cues: ["Ankommen ohne Sucherei", "Raus ans Meer", "Zeit füreinander"],
      image: "/brand/generated/morrow-spo-family-plan-boardwalk.png",
      imageAlt: "Familie auf dem Weg durch die Dünen in Sankt Peter-Ording",
    },
    property: {
      kicker: "Unterkunft",
      title: "Euer Rückzugsort in SPO.",
      text:
        "Die Unterkunft ist bewusst als Basis für diese Auszeit gewählt: hell, ruhig und nah genug an Strand und Ortsleben, damit ihr nicht jeden Weg neu planen müsst.",
      facts: ["bis 4 Personen", "2 Schlafzimmer", "WLAN", "Hund optional"],
      image: "/brand/generated/morrow-spo-interior.png",
      imageAlt: "Heller Wohnbereich einer vorbereiteten Unterkunft",
    },
    experience: {
      kicker: "Erlebnis",
      title: "Ein Naturmoment, der zu euch passt.",
      text:
        "Wir planen keinen vollen Stundenplan. Zur Auszeit gehört ein bewusst ausgewählter Moment draußen: Watt, Wind, Weite und genug Ruhe, damit Kinder entdecken können und Eltern nicht organisieren müssen.",
      image: "/brand/generated/morrow-spo-final-boardwalk.png",
      imageAlt: "Blick durch die Dünen auf Strand und Pfahlbau in Sankt Peter-Ording",
      items: [
        "Wattwandern oder Naturzeit",
        "altersgerecht abgestimmt",
        "wetter- und terminabhängig geprüft",
      ],
    },
    recommendations: [
      {
        title: "Strandzeit ohne langes Suchen",
        text:
          "Wir geben euch eine passende Strandidee für euren Familientag: mit Blick auf Wege, Wind, Pausen und das Alter der Kinder.",
      },
      {
        title: "Plan B für raues Wetter",
        text:
          "Wenn der Nordseetag anders wird als gedacht, habt ihr keine neue Recherche vor euch, sondern vorbereitete Alternativen.",
      },
      {
        title: "Ein entspannter Abend",
        text:
          "Eine familienfreundliche Idee für den Abend, damit niemand nach der Anreise noch lange vergleichen oder diskutieren muss.",
      },
    ],
    request: {
      title: "Erst anfragen. Dann in Ruhe entscheiden.",
      text:
        "Erzählt uns kurz, welcher Termin zu euch passt. Wir schauen, ob Unterkunft, Erlebnis und eure Familie gut zusammenfinden.",
      fields: [
        "Name",
        "E-Mail",
        "Telefonnummer",
        "gewünschter Termin",
        "Erwachsene",
        "Kinder und Alter",
        "Hund optional",
        "WhatsApp-Zustimmung optional",
      ],
    },
    faqs: [
      {
        question: "Ist die Auszeit direkt buchbar?",
        answer:
          "Nein. Ihr fragt euren Wunschtermin an. Danach gleichen wir Unterkunft, Erlebnis und Verfügbarkeit persönlich ab, bevor ihr euch verbindlich entscheidet.",
      },
      {
        question: "Welche Unterkunft ist enthalten?",
        answer:
          "Die Unterkunft wird auf der Auszeit-Seite gezeigt. Wir wählen nur Objekte aus, die zum Gefühl der Auszeit passen und vorab terminlich geklärt sind.",
      },
      {
        question: "Was ist beim Erlebnis vorbereitet?",
        answer:
          "Das Erlebnis ist Teil der Auszeit. Vor der Zusage stimmen wir es passend zu Termin, Alter der Kinder und Verfügbarkeit des Anbieters ab.",
      },
      {
        question: "Kann ein Hund mitkommen?",
        answer:
          "Vielleicht. Gebt es einfach in der Anfrage an. Ob es passt, hängt von der Unterkunft und den Bedingungen vor Ort ab.",
      },
    ],
  },
  "couple-reset": {
    ...stayTemplates[1],
    heroTitle: "Ein paar Tage raus aus dem Alltag. Nur ihr zwei und die Nordsee.",
    heroLead:
      "Unterkunft, ruhiger Erlebnisbaustein und gute Empfehlungen sind vorbereitet, damit aus wenigen Tagen echte Paarzeit werden kann.",
    price: "890 EUR",
    priceNote: "pro Aufenthalt für 2 Personen",
    dates: ["12.-16. August", "19.-23. August"],
    maxGuests: 2,
    dogOptional: true,
    heroGallery: [
      {
        src: "/brand/generated/morrow-spo-couple.png",
        alt: "Paar sitzt bei Sonnenuntergang mit Blick auf die Nordsee",
        label: "Paarzeit",
      },
      {
        src: "/brand/generated/morrow-article-couple-arrival-detail.png",
        alt: "Ruhiger Ankommensmoment für eine Paar-Auszeit",
        label: "Ankommen",
      },
      {
        src: "/brand/generated/morrow-article-couple-table-moment.png",
        alt: "Paar teilt einen ruhigen Moment am Tisch",
        label: "Zeit zu zweit",
      },
    ],
    included: [
      "ruhige Unterkunft für 2 Personen",
      "1 Erlebnisbaustein für gemeinsame Zeit",
      "Dinner- und Spaziergangsempfehlungen",
      "persönliche Abstimmung vor Anreise",
      "vorbereitete Check-in-Informationen nach Buchung",
    ],
    story: {
      kicker: "Das Gefühl",
      title: "Kurz weg. Und trotzdem länger bei euch ankommen.",
      text:
        "Nicht noch eine Reise organisieren. Sondern Abstand bekommen, durchatmen und wieder spüren, wie gut gemeinsame Zeit sein kann.",
      cues: ["Abstand vom Alltag", "Zeit zu zweit", "Ruhig vorbereitet"],
      image: "/brand/generated/morrow-article-couple-beach-walk.png",
      imageAlt: "Paar läuft gemeinsam am Strand von Sankt Peter-Ording",
    },
    property: {
      kicker: "Unterkunft",
      title: "Ein ruhiger Rückzugsort für zwei.",
      text:
        "Die Unterkunft ist bewusst als ruhige Basis gewählt: nah am Wasser, reduziert im Gefühl und passend für zwei Menschen, die ein paar Tage Abstand suchen.",
      facts: ["2 Personen", "1 Schlafzimmer", "WLAN", "Hund optional"],
      image: "/brand/generated/morrow-spo-interior.png",
      imageAlt: "Ruhiger Wohnbereich einer vorbereiteten Unterkunft für zwei",
    },
    experience: {
      kicker: "Erlebnis",
      title: "Ein ruhiger Baustein, der euch näher ankommen lässt.",
      text:
        "Wellness, Yoga, gemeinsames Kochen oder ein besonderer Abend sollen nicht euren Aufenthalt füllen. Sie geben euch einen Anlass, bewusst Zeit miteinander zu verbringen.",
      image: "/brand/generated/morrow-article-couple-dunes-rest.png",
      imageAlt: "Paar ruht gemeinsam in den Dünen nahe der Nordsee",
      items: [
        "Wellness oder Yoga",
        "Dinner zu zweit",
        "nach Anlass und Termin abgestimmt",
      ],
    },
    recommendations: [
      {
        title: "Sonnenuntergangsspaziergang",
        text: "Ein ruhiger Weg am Wasser für Ankommen und Abstand.",
      },
      {
        title: "Dinner zu zweit",
        text: "Eine kuratierte Adresse für einen besonderen Abend ohne lange Recherche.",
      },
      {
        title: "Wellness-Zeit",
        text: "Eine Option für Entspannung, wenn sie zum Termin und zu eurem Anlass passt.",
      },
    ],
    request: {
      title: "Erst anfragen. Dann gemeinsam entscheiden.",
      text:
        "Erzählt uns kurz, welcher Termin und welcher Anlass zu euch passt. Wir schauen, ob Unterkunft, Erlebnis und euer Wunsch gut zusammenfinden.",
      fields: [
        "Name",
        "E-Mail",
        "Telefonnummer",
        "gewünschter Termin",
        "Anlass optional",
        "Hund optional",
        "WhatsApp-Zustimmung optional",
        "besondere Wünsche",
      ],
    },
    faqs: [
      {
        question: "Ist Couple Reset immer für zwei Personen?",
        answer:
          "Ja. Diese Auszeit ist auf zwei Personen ausgelegt. Hund ist je nach Unterkunft optional möglich.",
      },
      {
        question: "Kann die Auszeit ein Geschenk sein?",
        answer:
          "Ja. Ihr könnt den Anlass nennen, zum Beispiel Geburtstag, Jahrestag oder Überraschung.",
      },
      {
        question: "Welche Erlebnisse sind möglich?",
        answer:
          "Wir denken an ruhige Bausteine wie Wellness, Yoga, gemeinsames Kochen oder Dinner. Vor finaler Zusage prüfen wir, was zum Termin passt.",
      },
      {
        question: "Warum gibt es keinen direkten Checkout?",
        answer:
          "Weil diese Auszeit nicht aus einzelnen Bausteinen besteht. Wir prüfen persönlich, ob Termin, Unterkunft und Erlebnis zusammenpassen.",
      },
    ],
  },
};

export const staysPageContent = {
  hero: {
    kicker: "Auszeiten in Sankt Peter-Ording",
    title: "Zwei Wege ans Meer. Beide vorbereitet.",
    text:
      "Morrow startet bewusst mit zwei kuratierten Auszeiten: eine für Familien, eine für Paare. Nicht als endlose Auswahl, sondern als klarer Rahmen aus Unterkunft, Erlebnis und persönlicher Orientierung.",
    image: "/brand/generated/morrow-spo-hero-people-boardwalk.png",
    imageAlt: "Menschen gehen gemeinsam über einen Holzsteg zum Strand in Sankt Peter-Ording",
  },
  principles: [
    {
      title: "Weniger suchen",
      text:
        "Ihr müsst nicht Unterkunft, Erlebnis, Essen und erste Orientierung einzeln zusammensuchen.",
    },
    {
      title: "Passender Rahmen",
      text:
        "Jede Auszeit ist für eine Zielgruppe gedacht: Familienzeit oder ruhige Paarzeit.",
    },
    {
      title: "Persönlich geprüft",
      text:
        "Termine, Objekt und Erlebnis werden vor einer Zusage noch einmal abgestimmt.",
    },
  ],
  comparison: {
    kicker: "Welche Auszeit passt?",
    title: "Nicht mehr Optionen. Bessere Orientierung.",
    text:
      "Phase 1 ist bewusst klein. Ihr sollt schnell verstehen, ob Morrow zu eurer Art von Aufenthalt passt.",
  },
  finalCta: {
    kicker: "Nächster Schritt",
    title: "Wählt die Auszeit, die sich nach euch anfühlt.",
    text:
      "Danach fragt ihr einen der vorbereiteten Termine an. Die Anfrage ist noch keine Buchung.",
  },
} as const;

export const ownersPageContent = {
  hero: {
    kicker: "Für Eigentümer",
    title: "Mehr Ertrag aus deiner Ferienimmobilie. Ohne Blackbox.",
    text:
      "Morrow verbindet kuratierte Auszeiten für Gäste mit einem moderneren Vermietungsmodell: aktive Vermarktung, klare Objektpositionierung und transparente nächste Schritte statt passivem Listing.",
    image: "/brand/generated/morrow-spo-interior.png",
    imageAlt: "Ruhige Ferienunterkunft mit Blick in die Dünen",
    note:
      "Wir prüfen, welche Reiseanlässe, Zielgruppen und freien Zeiträume dein Objekt stärker machen können.",
  },
  principles: [
    {
      title: "Aktive Vermarktung statt Listing",
      text:
        "Dein Objekt soll nicht nur online stehen, sondern für passende Zielgruppen und Reiseanlässe sichtbar werden.",
    },
    {
      title: "Erlebniswelten aus Objektstärken",
      text:
        "Sauna, Hund, Kamin, Familie oder Nebensaison werden zu konkreten Aufenthaltsanlässen statt zu losen Ausstattungsmerkmalen.",
    },
    {
      title: "Transparenz für den nächsten Schritt",
      text:
        "Wir starten mit einer Einschätzung, wo Potenzial liegt und welches Modell für dein Objekt sinnvoll sein kann.",
    },
  ],
  value: {
    kicker: "Warum Morrow",
    title: "Der Unterschied liegt im Betrieb, nicht nur in der Provision.",
    text:
      "Viele gute Ferienimmobilien werden online wie austauschbare Unterkünfte gezeigt. Morrow denkt zuerst darüber nach, wie ein Objekt mehr Nachfrage, bessere Auslastung und klarere Gästeerwartungen erzeugen kann.",
    items: [
      {
        title: "Mehr Nettoertrag als Ziel",
        text:
          "Es geht nicht nur um Belegung, sondern darum, freie Zeiträume, Preise und Nachfrage so zu steuern, dass am Ende mehr übrig bleibt.",
      },
      {
        title: "Lücken sichtbar machen",
        text:
          "Freie Zeiträume sollen nicht einfach stehen bleiben, sondern als Anlass für passende Angebote und Kampagnen genutzt werden.",
      },
      {
        title: "Ein Objekt, mehrere Anlässe",
        text:
          "Aus demselben Objekt können Familienurlaub, Paar-Auszeit, Hundeurlaub oder Nebensaison-Angebote entstehen, wenn die Attribute stimmen.",
      },
      {
        title: "Transparenter arbeiten",
        text:
          "Langfristig sollen Eigentümer sehen, was passiert: Buchungen, Maßnahmen, Lücken, Objektstatus und Auszahlung nachvollziehbar an einem Ort.",
      },
    ],
  },
  model: {
    kicker: "Morrow Modell",
    title: "Aus Objektstärken werden buchbare Anlässe.",
    text:
      "Wir arbeiten nicht mit generischen Inseraten als Endpunkt. Wir erfassen, was ein Objekt besonders macht, verbinden es mit passenden Erlebniswelten und bauen daraus konkrete Aufenthaltsangebote.",
    steps: [
      {
        title: "Attribute erfassen",
        text:
          "Lage, Ausstattung, Atmosphäre, Regeln, Verfügbarkeiten und Zielgruppen werden strukturiert betrachtet.",
      },
      {
        title: "Erlebniswelten ableiten",
        text:
          "Aus den Stärken entstehen passende Anlässe wie Familienzeit, Paar-Auszeit, Hundeurlaub oder Nebensaison am Meer.",
      },
      {
        title: "Aktiv vermarkten",
        text:
          "Auszeit, Zielgruppe und freie Zeiträume werden so erzählt, dass Gäste schneller verstehen, warum genau dieses Objekt passt.",
      },
    ],
  },
  start: {
    kicker: "Zusammenarbeit",
    title: "Starte mit einer Ertragspotenzial-Analyse.",
    text:
      "Zum Start braucht es keine komplexe Integration. Wir schauen auf Objekt, aktuelle Vermietung, freie Zeiträume und mögliche Reiseanlässe. Danach ist klarer, welcher nächste Schritt sinnvoll ist.",
    image: "/brand/generated/morrow-spo-family-arrival.png",
    imageAlt: "Gäste kommen an einer vorbereiteten Unterkunft in Sankt Peter-Ording an",
    points: [
      "Objekt und aktuelle Vermietung ansehen",
      "Reiseanlässe und Lücken erkennen",
      "Pilot-Auszeit oder Vermietungsmodell prüfen",
    ],
  },
  request: {
    kicker: "Ertragspotenzial",
    title: "Ertragspotenzial prüfen",
    text:
      "Erzähle uns kurz, welches Objekt du hast und wie es aktuell vermietet wird. Die erste Einschätzung ist kostenlos und zeigt, ob dein Objekt grundsätzlich zu Morrow passen könnte.",
    fields: [
      "Name",
      "E-Mail",
      "Telefon",
      "Ort der Immobilie",
      "Art der Immobilie",
      "Anzahl Schlafplätze",
      "aktuelle Vermietung",
      "Link zum Objekt optional",
      "Nachricht optional",
    ],
  },
  faqs: [
    {
      question: "Muss ich exklusiv mit Morrow arbeiten?",
      answer:
        "Für den ersten Einstieg nicht zwingend. Wichtig ist, dass Verfügbarkeit, Qualität und Gästeerlebnis für eine konkrete Auszeit zuverlässig abgestimmt werden können.",
    },
    {
      question: "Welche Objekte sucht Morrow?",
      answer:
        "Objekte in Orten am Wasser, die zu Familien oder Paaren passen: gute Atmosphäre, klare Lage, verlässliche Ausstattung und genug Qualität, um Teil einer kuratierten Auszeit zu werden.",
    },
    {
      question: "Wer betreut die Gäste?",
      answer:
        "Morrow übernimmt die kuratierende Kommunikation rund um die Auszeit. Operative Details hängen davon ab, ob das Objekt über eine Agentur, selbst oder später direkt mit Morrow betreut wird.",
    },
    {
      question: "Was passiert nach der Anfrage?",
      answer:
        "Wir prüfen die Angaben, schauen auf Lage, Objektart, aktuelle Vermietung und mögliche Potenziale und melden uns persönlich mit einer ersten Einschätzung.",
    },
  ],
} as const;

export const guideArticles: GuideArticle[] = [
  {
    slug: "sankt-peter-ording-mit-kindern",
    title: "Sankt Peter-Ording mit Kindern",
    category: "Familienurlaub",
    excerpt:
      "Welche Strandbereiche, Wege und Entscheidungen Familien vor Ort wirklich entlasten.",
    href: "/ratgeber/sankt-peter-ording-mit-kindern",
    image: "/brand/generated/morrow-article-family-wide-beach.png",
  },
  {
    slug: "paarzeit-an-der-nordsee",
    title: "Paarzeit an der Nordsee",
    category: "Paar-Auszeit",
    excerpt:
      "Wie wenige gute Entscheidungen aus ein paar Tagen eine echte Unterbrechung des Alltags machen.",
    href: "/ratgeber/paarzeit-an-der-nordsee",
    image: "/brand/generated/morrow-article-couple-wide-boardwalk.png",
  },
  {
    slug: "urlaub-in-sankt-peter-ording-planen",
    title: "Urlaub in Sankt Peter-Ording planen",
    category: "Orientierung",
    excerpt:
      "Was vor der Anfrage wichtig ist und welche Fragen ihr nicht erst vor Ort klären solltet.",
    href: "/ratgeber/urlaub-in-sankt-peter-ording-planen",
    image: "/brand/generated/morrow-spo-local-orientation.png",
  },
];

export const homePageContent = {
  hero: {
    kicker: "Sankt Peter-Ording",
    title: "Urlaub am Meer, der sich von Anfang an vorbereitet anfühlt.",
    lead:
      "Ausgewählte Unterkunft, lokales Erlebnis und persönliche Betreuung. Damit aus wenigen Tagen in Sankt Peter-Ording eine vorbereitete Auszeit wird.",
    cues: ["Unterkunft", "Erlebnis", "Betreuung"],
    image: "/brand/generated/morrow-spo-hero-people-boardwalk.png",
    imageAlt: "Menschen gehen gemeinsam durch die Dünen in Sankt Peter-Ording",
    secondaryImage: "/brand/generated/morrow-spo-hero-people-table.png",
    secondaryImageAlt:
      "Familie teilt einen ruhigen Moment an einem Tisch in einer Unterkunft",
    detailImage: "/brand/generated/morrow-spo-arrival-detail.png",
    detailImageAlt: "Vorbereiteter Ankommensmoment in einer Unterkunft",
  },
  why: {
    kicker: "Warum Morrow",
    title:
      "Eine Plattform, die Auszeiten vorbereitet statt nur Unterkünfte zu listen.",
    items: [
      {
        title: "Kuratiert für Gäste",
        text:
          "Ihr seht konkrete Auszeiten mit Unterkunft, Erlebnis und Orientierung. Nicht hunderte Optionen, die ihr selbst zusammensuchen müsst.",
      },
      {
        title: "Aktiv für Eigentümer",
        text:
          "Gute Objekte werden nicht nur gelistet, sondern nach Zielgruppe, Reiseanlass und freier Zeit stärker positioniert.",
      },
      {
        title: "Geführt durch Morrow",
        text:
          "Anfragen, Aufenthalte und lokale Empfehlungen werden persönlich geprüft, damit aus Interesse ein stimmiger Aufenthalt wird.",
      },
    ],
  },
  stays: {
    kicker: "Auszeiten",
    title: "Zwei Auszeiten. Ein Ort. Alles vorbereitet.",
    text:
      "Für Familien, die leichter gemeinsame Zeit finden wollen. Für Paare, die kurz raus möchten und länger etwas davon haben.",
  },
  process: {
    kicker: "So funktioniert Morrow",
    title: "Wenige gute Entscheidungen. Mehr Raum für eure Zeit.",
    text:
      "Morrow nimmt nicht den ganzen Urlaub vorweg. Wir bereiten die wichtigen Dinge so vor, dass ihr leichter ankommt und vor Ort freier entscheiden könnt.",
    items: [
      {
        title: "Auszeit wählen",
        text:
          "Ihr entscheidet nach dem Gefühl: Familienzeit, Paarzeit oder später weitere Anlässe.",
      },
      {
        title: "Termin anfragen",
        text:
          "Ihr wählt einen vorbereiteten Zeitraum. Kein Kalenderstress, kein Direkt-Checkout.",
      },
      {
        title: "Persönlich abstimmen",
        text:
          "Wir prüfen Unterkunft, Erlebnis und offene Details und melden uns mit dem nächsten Schritt.",
      },
    ],
  },
  local: {
    kicker: "Lokal kuratiert",
    title: "SPO soll sich vorbereitet anfühlen.",
    text:
      "Der weite Strand, die Dünen, ein guter Abend, ein Plan für raues Wetter und Orte, die zu euch passen: Morrow verbindet lokale Entscheidungen zu einem Aufenthalt, der leichter beginnt.",
    image: "/brand/generated/morrow-spo-local-family-orientation.png",
    imageAlt:
      "Familie orientiert sich in Sankt Peter-Ording zwischen Dünen und Strand",
  },
  owners: {
    kicker: "Für Eigentümer",
    title: "Klassische Agenturen listen. Morrow vermarktet aktiver.",
    text:
      "Wir prüfen, welche Reiseanlässe zu deinem Objekt passen, wie freie Zeiträume besser sichtbar werden und welcher nächste Schritt zu mehr Nettoertrag führen kann.",
  },
  finalCta: {
    kicker: "Auszeit planen",
    title: "Wenn der Urlaub leicht beginnen soll, ist das der richtige Start.",
    text:
      "Seht euch die vorbereiteten Auszeiten an oder stellt uns ein Objekt vor, das zu Morrow passen könnte.",
  },
} as const;
