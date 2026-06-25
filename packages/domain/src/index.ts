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
  description: string;
  category: string;
  excerpt: string;
  href: string;
  image: string;
  author: string;
  publishedAt: string;
  readingTime: string;
  audience: "families" | "couples" | "both";
  relatedStaySlugs: string[];
  sections: {
    title: string;
    body: string;
  }[];
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

export const experiencePartnersPageContent = {
  hero: {
    kicker: "Für Erlebnispartner",
    title: "Lokale Erlebnisse, die aus Aufenthalten echte Auszeiten machen.",
    text:
      "Morrow sucht ausgewählte Anbieter in Sankt Peter-Ording und Umgebung, deren Erlebnisse zu Familien, Paaren und dem Gefühl von gut vorbereiteter Zeit am Meer passen.",
    image: "/brand/generated/morrow-spo-local-orientation.png",
    imageAlt: "Lokaler Orientierungsmoment in Sankt Peter-Ording",
    note:
      "Nicht jedes Angebot muss groß sein. Wichtig ist, dass es persönlich, verlässlich und passend zum Ort ist.",
  },
  principles: [
    {
      title: "Kuratiert statt beliebig",
      text:
        "Wir nehmen nicht jede Aktivität auf, sondern wählen Erlebnisse aus, die zu einer konkreten Auszeit passen.",
    },
    {
      title: "Passend für Familien oder Paare",
      text:
        "Ein Erlebnis soll helfen, dass Gäste leichter ankommen, weniger planen müssen und den Ort intensiver erleben.",
    },
    {
      title: "Persönlich vorbereitet",
      text:
        "Termine, Kapazitäten, Ablauf und Erwartungen sollen klar sein, bevor Gäste vor Ort sind.",
    },
  ],
  fit: {
    kicker: "Was zu Morrow passt",
    title: "Wir suchen keine Masse. Wir suchen verlässliche Momente.",
    text:
      "Morrow verbindet Unterkunft, Erlebnis und Orientierung. Dafür brauchen wir lokale Partner, die nicht nur eine Leistung anbieten, sondern ein gutes Aufenthaltsgefühl mittragen.",
    items: [
      {
        title: "Natur und Küste",
        text:
          "Watt, Strand, Dünen, Wind und Weite: Erlebnisse, die den Ort spürbar machen.",
      },
      {
        title: "Ruhe und Wohlgefühl",
        text:
          "Yoga, Wellness, Kochen, kleine Rituale oder besondere Abende für bewusste Paarzeit.",
      },
      {
        title: "Familienfreundliche Erlebnisse",
        text:
          "Angebote, die Kinder einbeziehen und Eltern entlasten, ohne den Tag zu überladen.",
      },
      {
        title: "Gastronomie und Genuss",
        text:
          "Restaurants, Cafés und Gastgeber, die zu einem vorbereiteten Abend oder besonderen Moment passen.",
      },
    ],
  },
  collaboration: {
    kicker: "Zusammenarbeit",
    title: "Ein Erlebnis wird bei Morrow Teil einer Auszeit.",
    text:
      "Wir denken Erlebnisse nicht als lose Empfehlung, sondern als passenden Baustein für einen Aufenthalt. Deshalb schauen wir gemeinsam, für welche Zielgruppe, welchen Anlass und welche Saison dein Angebot sinnvoll ist.",
    image: "/brand/generated/morrow-spo-hero-people-table.png",
    imageAlt: "Menschen teilen einen ruhigen Moment an einem Tisch",
    steps: [
      {
        title: "Angebot verstehen",
        text:
          "Was bietest du an, für wen passt es und welche Voraussetzungen braucht es vor Ort?",
      },
      {
        title: "Auszeit zuordnen",
        text:
          "Wir prüfen, ob dein Erlebnis eher zu Familien, Paaren, Nebensaison oder besonderen Anlässen passt.",
      },
      {
        title: "Verlässlich einbinden",
        text:
          "Wenn es passt, klären wir Ablauf, Kontaktweg, Kapazität und die wichtigsten Informationen für Gäste.",
      },
    ],
  },
  request: {
    kicker: "Kooperation",
    title: "Erlebnis oder Ort vorschlagen",
    text:
      "Erzähl uns kurz, was du anbietest und warum es zu einer Auszeit in Sankt Peter-Ording passen könnte. Wir melden uns persönlich, wenn wir eine sinnvolle Verbindung sehen.",
    fields: [
      "Name",
      "E-Mail",
      "Telefon",
      "Name des Angebots",
      "Kategorie",
      "Ort",
      "Website oder Profil optional",
      "Für wen geeignet?",
      "Nachricht optional",
    ],
  },
  faqs: [
    {
      question: "Muss mein Angebot buchbar sein?",
      answer:
        "Nicht zwingend. Manche Partner sind feste Erlebnisbausteine, andere werden als kuratierte Empfehlung vor Ort sichtbar. Wichtig ist, dass die Informationen verlässlich sind.",
    },
    {
      question: "Ist Morrow eine klassische Vermittlungsplattform?",
      answer:
        "Nein. Morrow kuratiert Auszeiten. Ein Erlebnis wird nur aufgenommen, wenn es zu Zielgruppe, Ort, Saison und Aufenthaltsgefühl passt.",
    },
    {
      question: "Welche Anbieter passen besonders gut?",
      answer:
        "Lokale Anbieter mit persönlicher Qualität: Natur, Familienmomente, Paarzeit, Wellness, Gastronomie, kleine besondere Orte und verlässliche Services.",
    },
    {
      question: "Was passiert nach meiner Nachricht?",
      answer:
        "Wir schauen uns dein Angebot an und melden uns persönlich, wenn es für eine bestehende oder kommende Auszeit interessant ist.",
    },
  ],
} as const;

export const guideArticles: GuideArticle[] = [
  {
    "slug": "sankt-peter-ording-mit-kindern",
    "title": "Sankt Peter-Ording mit Kindern: entspannte Ideen für Familien",
    "description": "Ein ruhiger Familien-Ratgeber für SPO: Strand, Wetter, Watt, Essen, Wege, Saison und Planung ohne zu viel Programm.",
    "category": "Familienurlaub",
    "excerpt": "Ein ruhiger Familien-Ratgeber für SPO: Strand, Wetter, Watt, Essen, Wege, Saison und Planung ohne zu viel Programm.",
    "href": "/ratgeber/sankt-peter-ording-mit-kindern",
    "image": "/brand/generated/morrow-spo-family-watt.png",
    "author": "Morrow Redaktion",
    "publishedAt": "2026-05-13",
    "readingTime": "9 Min. Lesezeit",
    "audience": "families",
    "relatedStaySlugs": [
      "family-escape"
    ],
    "sections": [
      {
        "title": "Die kurze Antwort",
        "body": "Sankt Peter-Ording ist mit Kindern dann besonders angenehm, wenn ihr nicht jeden Tag neu planen müsst. Der Ort bringt viel mit: breite Strände, Watt, Dünen, Pfahlbauten, wetterfeste Ideen und genug Raum für unterschiedliche Familienrhythmen. Entscheidend ist, den Aufenthalt nicht als Liste von Ausflügen zu sehen, sondern Unterkunft, Strandbereich, Wetter, Essen und ein passendes Erlebnis gut zusammenzubringen."
      },
      {
        "title": "Warum Sankt Peter-Ording für Familien gut funktioniert",
        "body": "Sankt Peter-Ording ist für Familien stark, weil der Ort nicht eng wirkt. Der Strand ist weit, die Wege am Wasser sind lang, die Dünen geben Ruhe und das Watt macht Natur direkt erlebbar. Kinder können rennen, buddeln, Muscheln sammeln, Spuren suchen oder einfach mit Wind und Sand beschäftigt sein. Eltern müssen dadurch nicht jeden Moment künstlich füllen.\n\nWer nach „Sankt Peter-Ording mit Kindern“, „SPO Familienurlaub“ oder „Nordseeurlaub mit Kindern“ sucht, sucht meist keine endlose Liste. Die eigentliche Frage lautet: Wie wird der Urlaub schön, ohne dass wir vorher alles selbst zusammensuchen müssen? Genau dafür braucht es einen einfachen Rahmen aus Unterkunft, Strandrhythmus, Pausen, Essen und einem Erlebnis, das wirklich zum Alter der Kinder passt."
      },
      {
        "title": "Welche Strandbereiche mit Kindern sinnvoll sind",
        "body": "In Sankt Peter-Ording verändert der Strandbereich den ganzen Tag. Ording fühlt sich weit und lebendig an, Bad ist durch Seebrücke, Promenade, Dünen-Hus und Dünen-Therme praktisch, Böhl wirkt ruhiger und bodenständiger. Auch Dorf/Süd und Ording-Nord können je nach Unterkunft, Wetter und Tagesziel passend sein.\n\nFür Familien zählt weniger, welcher Abschnitt am bekanntesten ist. Wichtiger ist: Wie kommt ihr hin? Wie weit ist der Weg mit Kindern, Tasche, Sandspielzeug oder Kinderwagen? Gibt es Toiletten, Essen, einen warmen Rückzugsort oder eine einfache Pause in der Nähe?\n\nVor dem Strandtag helfen diese Fragen:\n- Soll der Tag einfach und kurzwegig sein oder bewusst weit und frei?\n- Braucht ihr Toiletten, Essen oder eine wetterfeste Option in der Nähe?\n- Ist der Strandabschnitt für Kleinkind, Schulkind oder Teenager passend?\n- Passt der Bereich zum Wetter, Wind und zur Tagesform?\n- Wollt ihr spielen, spazieren, Watt entdecken oder einen Pfahlbau besuchen?\n\nEin guter Strandtag in SPO entsteht selten durch viel Programm. Er entsteht, wenn der Ortsteil zum Tag passt und ihr nicht schon am Morgen zu viele Entscheidungen treffen müsst."
      },
      {
        "title": "Watt, Dünen und Natur mit Kindern erleben",
        "body": "Viele Familien fahren wegen des Strandes nach SPO. In Erinnerung bleibt aber oft die Natur: das Watt bei Ebbe, die Dünenwege, der Wind, die Pfahlbauten, Vögel, Salzwiesen und das Gefühl, dass der Horizont weiter ist als im Alltag. Für Kinder ist das kein theoretisches Naturerlebnis. Sie sehen Spuren im Watt, finden Muscheln, merken den Wasserstand und spüren, wie schnell sich Wetter und Licht verändern.\n\nEine Wattwanderung, eine Naturführung, ein Besuch im Nationalpark-Haus oder ein einfacher Dünenmoment kann viel stärker sein als ein voller Ausflugstag. Wichtig ist nur, dass das Erlebnis altersgerecht bleibt. Für kleinere Kinder darf es kurz und greifbar sein. Für Schulkinder darf es mehr Entdecken geben. Für Teenager darf es etwas Besonderes oder Aktiveres sein.\n\nDer beste Naturmoment ist nicht der längste. Es ist der, bei dem alle mitkommen und niemand das Gefühl hat, nur ein Programmpunkt zu sein."
      },
      {
        "title": "Was tun bei schlechtem Wetter in SPO?",
        "body": "Nordseeurlaub mit Kindern braucht immer einen Plan B. Wind, Regen und schnelle Wetterwechsel gehören zu Sankt Peter-Ording dazu. Das muss den Urlaub nicht schlechter machen. Stressig wird es nur, wenn ihr erst im Regen anfangen müsst zu suchen.\n\nFür Schlechtwetter in SPO können diese Ideen funktionieren:\n- Dünen-Therme oder ein warmer Badetag im Ortsteil Bad\n- Erlebnis-Hus mit Spiel-, Bewegungs- und Familienangeboten\n- Nationalpark-Haus oder Schutzstation Wattenmeer, wenn Natur trotzdem Thema bleiben soll\n- ein kurzer Café- oder Restaurantbesuch statt langer Suche am Abend\n- ein ruhiger Nachmittag in der Unterkunft mit Spielen, Lesen oder gemeinsamem Kochen\n- ein kurzer Spaziergang in wetterfester Kleidung, wenn alle noch raus möchten\n\nWichtig ist die Haltung: schlechtes Wetter muss nicht den Tag bestimmen. Es ändert nur den Rhythmus. Wer vorher ein bis zwei realistische Alternativen kennt, bleibt entspannter."
      },
      {
        "title": "Essen gehen mit Kindern: lieber vorbereitet als spontan gestresst",
        "body": "Die Essensfrage entscheidet im Familienurlaub oft mehr, als man vorher denkt. Nach Strand, Wind und vielen Eindrücken sind Kinder müde, Eltern auch. Dann wird die spontane Suche schnell anstrengend: Wo ist noch Platz? Was ist kinderfreundlich? Wie weit ist es? Müssen wir reservieren? Gibt es eine einfache Lösung, wenn niemand mehr diskutieren möchte?\n\nFür Sankt Peter-Ording mit Kindern ist es sinnvoll, den ersten Abend und einen Schlechtwetterabend vorzubereiten. Das muss nicht besonders aufwendig sein. Manchmal reicht eine gute, nahe Option, ein Restaurant mit Reservierung oder die Entscheidung, bewusst in der Unterkunft zu essen.\n\nGute Familienplanung bedeutet hier nicht, jeden Abend festzulegen. Sie nimmt nur die Reibung aus den Momenten, in denen alle eigentlich ankommen wollen."
      },
      {
        "title": "Unterkunft mit Kindern: worauf ihr achten solltet",
        "body": "Eine Familienunterkunft in Sankt Peter-Ording ist mehr als ein Schlafplatz. Sie ist Rückzugsort, Frühstücksort, Schlechtwetterbasis, Sand- und Jackenstation und der Ort, an dem Kinder nach einem langen Tag wieder runterkommen. Deshalb reicht es nicht, nur auf Betten, Quadratmeter oder schöne Fotos zu achten.\n\nDiese Fragen helfen bei der Auswahl:\n- Gibt es genug Schlafplätze für eure tatsächliche Familienkonstellation?\n- Sind Küche, Essbereich und Wohnbereich alltagstauglich?\n- Sind Strand, Einkaufen, Essen und Erlebnis sinnvoll erreichbar?\n- Gibt es Platz für nasse Kleidung, Sandspielzeug, Kinderwagen oder Taschen?\n- Fühlt sich die Unterkunft ruhig genug an, um wirklich Pause zu machen?\n- Passt die Schlüsselübergabe zur Anreise mit Kindern?\n\nEine schöne Unterkunft allein macht noch keine entspannte Auszeit. Aber die falsche Unterkunft kann sehr viel Reibung erzeugen. Darum sollte sie zum geplanten Aufenthalt passen, nicht nur gut aussehen."
      },
      {
        "title": "Mit Kleinkind, Schulkind oder Teenager: Alter macht einen Unterschied",
        "body": "SPO mit Kindern ist nicht für jede Familie gleich. Mit Kleinkindern zählen kurze Wege, klare Pausen, einfache Essenslösungen und ein Rückzugsort, der wirklich funktioniert. Schulkinder haben oft Lust auf Watt, Tiere, Strandspiele, kleine Aufgaben und sichtbare Natur. Teenager brauchen mehr Eigenraum, manchmal WLAN, manchmal ein aktiveres Erlebnis und nicht jeden Tag ein Familienprogramm.\n\nDeshalb ist die bessere Frage nicht: Was kann man in Sankt Peter-Ording mit Kindern machen? Sondern: Was passt gerade zu unserer Familie?\n\nEin guter Familienurlaub nimmt das Alter der Kinder ernst. Er verbindet nicht möglichst viele Empfehlungen, sondern die richtigen wenigen."
      },
      {
        "title": "Saison, Ferienzeit und Veranstaltungen",
        "body": "Sankt Peter-Ording fühlt sich je nach Saison anders an. In den Sommerferien sind die Tage lang, Strand und Außenbereiche stehen im Mittelpunkt, und der Ort ist lebendiger. In der Nebensaison wird es ruhiger, rauer und oft entspannter. Dann gewinnen Spaziergänge, Unterkunft, warme Pausen, Naturmomente und gute Schlechtwetterideen an Bedeutung.\n\nVeranstaltungen, Wochenmarkt, lokale Feste, Sportevents, Bastelaktionen oder saisonale Angebote können einen Aufenthalt bereichern. Sie sollten aber nicht das Grundgerüst eurer Reise sein. Besser ist: Unterkunft, Strandrhythmus und ein passendes Erlebnis stehen. Alles Weitere ergänzt den Aufenthalt, wenn es wirklich passt.\n\nSo bleibt der Familienurlaub flexibel, ohne beliebig zu werden."
      },
      {
        "title": "Eine einfache Checkliste für Familienurlaub in SPO",
        "body": "Eine gute Vorbereitung für Sankt Peter-Ording mit Kindern muss nicht groß sein. Sie sollte nur die Fragen beantworten, die vor Ort sonst Stress erzeugen.\n\nVor der Reise klären:\n- Welcher Strandbereich passt zu Alter, Wetter und Mobilität der Kinder?\n- Welche Schlechtwetter-Idee ist realistisch und nicht zu weit weg?\n- Welches lokale Erlebnis passt wirklich zur Familie?\n- Was ist die einfache Essenslösung für den ersten Abend?\n- Wie weit sind Unterkunft, Strand, Einkauf und Erlebnis voneinander entfernt?\n- Wie funktioniert Anreise und Schlüsselübergabe?\n- Was darf bewusst ungeplant bleiben?\n\nDer beste Familienurlaub fühlt sich nicht wie ein Projektplan an. Er fühlt sich vorbereitet an, ohne eng zu werden."
      },
      {
        "title": "Häufige Fragen zu Sankt Peter-Ording mit Kindern",
        "body": "Ist Sankt Peter-Ording für Familien mit kleinen Kindern geeignet?\nJa, wenn Unterkunft, Wege und Strandbereich bewusst gewählt werden. Gerade mit kleinen Kindern sind kurze Entscheidungen, Pausen und einfache Abläufe wichtiger als viele Programmpunkte.\n\nWas kann man in SPO mit Kindern machen?\nStrandtage, Watt entdecken, Dünenwege, Pfahlbauten, Naturführungen, Radfahren, Spielplätze, Dünen-Therme, Erlebnis-Hus und kleine Ausflüge auf Eiderstedt passen gut. Entscheidend ist, nicht zu viel in einen Tag zu legen.\n\nWelcher Strandabschnitt ist mit Kindern gut?\nDas hängt von Alter, Unterkunft, Wetter und Tagesziel ab. Böhl kann ruhiger wirken, Bad ist praktisch durch Promenade und Angebote, Ording ist weitläufig und lebendiger. Der beste Abschnitt ist der, der zu eurem Tag passt.\n\nBraucht man in Sankt Peter-Ording mit Kindern ein Auto?\nDas hängt von Unterkunft, Saison und geplanten Wegen ab. Für Familien ist vor allem wichtig, dass Strand, Einkaufen, Essen und Erlebnis nicht jeden Tag neu organisiert werden müssen.\n\nWas ist bei Nordseeurlaub mit Kindern besonders wichtig?\nWetterfeste Kleidung, flexible Tagesplanung, ein guter Rückzugsort und realistische Erwartungen. Die Nordsee ist nicht immer glatt und sonnig. Genau diese Mischung aus Wind, Weite und Natur macht SPO besonders."
      },
      {
        "title": "Wann Morrow sinnvoll wird",
        "body": "Morrow wird sinnvoll, wenn ihr Lust auf Sankt Peter-Ording habt, aber nicht Unterkunft, Erlebnis, Essensideen, Wetteralternativen und passende Abläufe einzeln zusammensuchen möchtet. Eine kuratierte Auszeit verbindet ein ausgewähltes Objekt, ein lokales Erlebnis, Empfehlungen vor Ort und persönliche Orientierung.\n\nDas ist kein starres Familienprogramm. Es ist ein ruhiger Rahmen, der euch Entscheidungen abnimmt und trotzdem genug freie Zeit lässt. So kann sich ein kurzer Aufenthalt nach mehr anfühlen: ankommen, rausgehen, gemeinsam essen, schlafen, wieder ans Meer und nicht ständig neu überlegen, was als Nächstes passt."
      }
    ]
  },
  {
    "slug": "auszeit-zu-zweit-in-sankt-peter-ording",
    "title": "Auszeit zu zweit in Sankt Peter-Ording: ruhige Orte und besondere Erlebnisse",
    "description": "Ein Ratgeber für Paarzeit an der Nordsee: Strand, Wellness, Dinner, Unterkunft, Anlass und ruhige Planung in SPO.",
    "category": "Paar-Auszeit",
    "excerpt": "Ein Ratgeber für Paarzeit an der Nordsee: Strand, Wellness, Dinner, Unterkunft, Anlass und ruhige Planung in SPO.",
    "href": "/ratgeber/auszeit-zu-zweit-in-sankt-peter-ording",
    "image": "/brand/generated/morrow-article-couple-beach-walk.png",
    "author": "Morrow Redaktion",
    "publishedAt": "2026-05-13",
    "readingTime": "8 Min. Lesezeit",
    "audience": "couples",
    "relatedStaySlugs": [
      "couple-reset"
    ],
    "sections": [
      {
        "title": "Die kurze Antwort",
        "body": "Eine Auszeit zu zweit in Sankt Peter-Ording funktioniert besonders gut, wenn sie nicht wie ein vollgepackter Kurzurlaub geplant wird. SPO bietet Weite, Nordsee, Dünen, ruhige Wege, Pfahlbauten, Wellness, Thalasso und gute Abende zu zweit. Entscheidend ist, dass Unterkunft, Anlass, Wetter, Strandrhythmus und ein bis zwei passende Erlebnisse zusammenpassen, damit die gemeinsame Zeit nicht erst vor Ort organisiert werden muss."
      },
      {
        "title": "Warum Sankt Peter-Ording für Paare gut funktioniert",
        "body": "Sankt Peter-Ording ist kein lauter City-Trip und kein Ort, an dem man möglichst viele Sehenswürdigkeiten abhaken muss. Genau darin liegt die Stärke für Paare. Der breite Strand, die Dünen, der Blick über das Wattenmeer und das raue Nordseewetter schaffen Abstand vom Alltag. Wer beruflich eingespannt ist, privat viel organisiert oder einfach wieder mehr Ruhe miteinander sucht, findet in SPO ein Tempo, das langsamer wirkt als der normale Alltag.\n\nViele suchen nach Begriffen wie „Auszeit zu zweit Sankt Peter-Ording“, „romantisches Wochenende SPO“, „Paarurlaub Nordsee“ oder „Wellness zu zweit Sankt Peter-Ording“. Hinter diesen Suchanfragen steckt meist nicht nur der Wunsch nach einem Hotel oder einer Ferienwohnung. Es geht um Zeit füreinander, weniger Entscheidungen, gute Stimmung, verlässliche Qualität und das Gefühl, dass die gemeinsame Reise wirklich gut wird."
      },
      {
        "title": "Für welche Anlässe eine Auszeit zu zweit passt",
        "body": "Eine Paar-Auszeit in Sankt Peter-Ording kann sehr unterschiedliche Gründe haben. Manche Paare planen einen Jahrestag, ein Geburtstagswochenende oder eine kleine Überraschung. Andere wollen nach einer anstrengenden Arbeitsphase raus, nach privaten Belastungen wieder durchatmen oder einfach für ein paar Tage erleben, wie es sich anfühlt, nicht funktionieren zu müssen.\n\nTypische Anlässe für eine Auszeit zu zweit an der Nordsee:\n- Jahrestag oder Hochzeitstag\n- Geburtstag oder Überraschungsreise\n- kurzer Abstand vom Arbeitsalltag\n- ruhige Zeit nach einer stressigen privaten Phase\n- gemeinsame Zeit ohne großen Anlass\n- Paarzeit mit Hund, wenn Unterkunft und Ablauf passen\n\nWichtig ist: Nicht jeder Anlass braucht ein großes Programm. Oft reicht ein Ort, der Abstand schafft, eine Unterkunft, die sich gut anfühlt, ein besonderer Abend und genug freie Zeit am Wasser."
      },
      {
        "title": "Strand, Dünen und Spaziergänge zu zweit",
        "body": "SPO lebt von Wegen, die nicht kompliziert sein müssen. Ein Spaziergang am Strand, ein Weg durch die Dünen, der Blick von der Seebrücke oder ein Abend an einem Pfahlbau können mehr Wirkung haben als ein durchgeplanter Ausflug. Für Paare geht es oft nicht darum, möglichst viel zu sehen, sondern wieder ins Gespräch zu kommen oder gemeinsam still sein zu können.\n\nDie Strandabschnitte haben unterschiedliche Stimmungen. Ording wirkt weit und lebendig, Bad ist nah an Promenade, Seebrücke und Wellnessangeboten, Böhl ist ruhiger und bodenständiger. Je nach Jahreszeit, Wetter und Unterkunft kann ein anderer Bereich besser passen. Genau deshalb ist es sinnvoll, nicht nur „SPO Strand“ zu suchen, sondern den Tag bewusst zu wählen: weiter Spaziergang, Sonnenuntergang, kurzer Weg nach dem Dinner oder ruhiger Morgen am Wasser."
      },
      {
        "title": "Wellness, Thalasso und Ruhe in SPO",
        "body": "Für viele Paare gehört Wellness zu einer Auszeit an der Nordsee dazu. Sankt Peter-Ording ist für Thalasso, Meerwasser, Salz, Schlick und nordseeorientierte Erholung bekannt. Im Ortsteil Bad liegen mit der Dünen-Therme und dem Gesundheits- und Wellnesszentrum wichtige Anlaufpunkte für Sauna, Wasser, Anwendungen oder entspannte Zeit zu zweit. Auch ein Privat Spa für zwei kann für besondere Anlässe interessant sein, wenn es zum Budget und zur Stimmung passt.\n\nWellness sollte aber nicht zum Pflichtprogramm werden. Gute Paarzeit entsteht nicht dadurch, dass jeder Slot gefüllt ist. Eine Anwendung, ein ruhiger Sauna-Moment oder ein warmer Ort nach einem windigen Strandspaziergang reichen oft aus, wenn davor und danach genug Luft bleibt."
      },
      {
        "title": "Dinner, Abende und kleine Rituale",
        "body": "Ein gutes Abendessen kann eine Paar-Auszeit stark prägen. Nach einem Tag am Wasser will man nicht noch lange suchen, vergleichen und diskutieren. Gerade bei einem Jahrestag, Geburtstag oder einer Überraschung ist es hilfreich, vorher zu wissen, welcher Abend etwas besonderer sein darf und welcher Abend bewusst leicht bleibt.\n\nFür Paare in Sankt Peter-Ording können diese Abendideen gut funktionieren:\n- ruhiges Dinner mit Reservierung statt spontaner Suche\n- Spaziergang zum Sonnenuntergang vor oder nach dem Essen\n- Pfahlbau, Strandbar oder Restaurant mit Nordseegefühl\n- gemeinsames Kochen in der Unterkunft\n- ein Abend ohne Programm, aber mit guter Vorbereitung\n\nDie beste Abendplanung ist nicht steif. Sie nimmt nur die Reibung heraus, damit der Abend nicht aus Recherche besteht."
      },
      {
        "title": "Welche Unterkunft für Paare sinnvoll ist",
        "body": "Bei einer Auszeit zu zweit ist die Unterkunft mehr als ein Ort zum Schlafen. Sie entscheidet mit darüber, ob man wirklich runterkommt. Eine gute Unterkunft für Paare in SPO muss nicht groß sein, aber sie sollte ruhig, warm, gepflegt und passend gelegen sein. Manche Paare möchten nah an Bad, Promenade, Wellness und Restaurants sein. Andere suchen mehr Rückzug, Dünengefühl und Abstand.\n\nWichtige Fragen für eine Unterkunft zu zweit in Sankt Peter-Ording:\n- Fühlt sich der Ort ruhig genug an?\n- Gibt es einen schönen Bereich für Frühstück, Abend oder Rückzug?\n- Sind Strand, Dinner, Wellness oder Spaziergänge sinnvoll erreichbar?\n- Passt die Ausstattung zum Anlass?\n- Ist Hund optional möglich, wenn das relevant ist?\n- Wirkt die Unterkunft wie Teil der Auszeit oder nur wie eine Schlafmöglichkeit?\n\nGerade bei Paaren ist die Atmosphäre entscheidend. Eine Unterkunft kann funktional richtig sein und sich trotzdem nicht nach Auszeit anfühlen."
      },
      {
        "title": "Mit Hund zu zweit nach Sankt Peter-Ording",
        "body": "Für manche Paare gehört der Hund zur Auszeit dazu. Sankt Peter-Ording kann dafür gut funktionieren, wenn Unterkunft, Strandregeln, Wege und Tagesrhythmus vorher bedacht werden. Wichtig ist, nicht nur nach „hund erlaubt“ zu filtern, sondern zu prüfen, ob der Aufenthalt wirklich bequem bleibt: Wo kann der Hund mit? Wie weit sind die Wege? Gibt es genug ruhige Zeiten? Passt das Erlebnis zum Hund oder braucht es Alternativen?\n\nEine Paar-Auszeit mit Hund sollte nicht komplizierter werden als eine Reise ohne Hund. Sie braucht nur mehr Vorausdenken. Wenn Unterkunft und Ablauf passen, kann der Hund sogar Teil dieses ruhigeren Rhythmus sein: Strandspaziergang, Pause, Abend in der Unterkunft, kurzer Weg am Morgen."
      },
      {
        "title": "Saison und Nebensaison für Paare",
        "body": "Sankt Peter-Ording fühlt sich je nach Saison sehr unterschiedlich an. Im Sommer sind die Tage lang, Strand und Außenbereiche stehen im Vordergrund, und der Ort ist lebendiger. Für Paare kann das schön sein, wenn sie genau diese Energie suchen. In der Nebensaison wird SPO ruhiger, rauer und oft intimer. Dann werden Wind, Wellness, Spaziergänge, warme Abende und eine gute Unterkunft wichtiger.\n\nFür eine Auszeit zu zweit ist die Nebensaison oft besonders passend. Der Ort wirkt weniger voll, die Wege fühlen sich weiter an, und man muss nicht jeden Moment mit Aktivität füllen. Wer Ruhe sucht, sollte deshalb nicht nur nach Hauptsaison denken. Gerade Herbst, Winter und Frühling können für Paarzeit an der Nordsee sehr stark sein."
      },
      {
        "title": "Eine einfache Checkliste für Paarzeit in SPO",
        "body": "Wenn ihr eine Auszeit zu zweit in Sankt Peter-Ording plant, helfen wenige klare Entscheidungen mehr als lange Listen. Gute Vorbereitung bedeutet nicht, jeden Moment zu planen. Sie bedeutet, dass die wichtigsten Dinge vorab zusammenpassen.\n\nVor der Reise klären:\n- Warum fahrt ihr weg: Anlass, Erholung, Überraschung oder einfach Abstand?\n- Welche Unterkunft fühlt sich nach Rückzug an?\n- Welcher Strandbereich passt zu Stimmung und Jahreszeit?\n- Wollt ihr Wellness, Thalasso, Dinner oder lieber viel freie Zeit?\n- Gibt es einen Abend, der besonders werden soll?\n- Muss Hund optional mitgedacht werden?\n- Was darf bewusst ungeplant bleiben?\n\nEine gute Paar-Auszeit lässt Luft. Sie gibt nur genug Rahmen, damit Erholung nicht erst durch Organisation entsteht."
      },
      {
        "title": "Häufige Fragen zur Auszeit zu zweit in Sankt Peter-Ording",
        "body": "Ist Sankt Peter-Ording romantisch?\nJa, wenn man Romantik nicht als Kitsch versteht. SPO ist romantisch durch Weite, Wind, Strand, Dünen, Sonnenuntergänge, Pfahlbauten, ruhige Wege und gute Momente zu zweit.\n\nWas kann man in SPO zu zweit machen?\nSpaziergänge am Strand, Wellness oder Thalasso, Sauna, Dinner, Sonnenuntergang, Pfahlbauten besuchen, durch die Dünen laufen, gemeinsam kochen oder einen ruhigen Tag in der Unterkunft verbringen.\n\nEignet sich SPO für ein romantisches Wochenende?\nJa, besonders wenn Unterkunft, Abendplanung und ein passendes Erlebnis vorher bedacht sind. Der Aufenthalt sollte nicht zu voll werden, damit genug gemeinsame Zeit bleibt.\n\nKann man eine Auszeit zu zweit mit Hund planen?\nJa, wenn Unterkunft, Strandregeln und Wege passen. Hund optional sollte früh geklärt werden, weil nicht jede Unterkunft oder jedes Erlebnis dafür geeignet ist.\n\nWann ist die beste Zeit für Paarurlaub in Sankt Peter-Ording?\nSommer funktioniert gut für lange Tage und Strand. Herbst, Winter und Frühling sind oft stärker für Ruhe, Wellness, Spaziergänge und Abstand vom Alltag."
      },
      {
        "title": "Wann Morrow sinnvoll wird",
        "body": "Wenn ihr Sankt Peter-Ording zu zweit erleben möchtet, aber nicht Unterkunft, Wellness, Dinner, Strandrhythmus und passende Empfehlungen einzeln zusammensuchen wollt, kann eine kuratierte Auszeit helfen. Morrow denkt Unterkunft, lokales Erlebnis, Empfehlungen und persönliche Orientierung zusammen. Nicht als starres Romantikprogramm, sondern als ruhiger Rahmen für Paare, die ankommen, abschalten und wieder mehr gemeinsame Zeit spüren möchten."
      }
    ]
  },
  {
    "slug": "was-kann-man-in-sankt-peter-ording-machen",
    "title": "Was kann man in Sankt Peter-Ording machen? Erlebnisse für Familien und Paare",
    "description": "Ein Ratgeber für SPO-Erlebnisse: Strand, Watt, Pfahlbauten, Wellness, Essen, Schlechtwetter und ruhige Planung.",
    "category": "Orientierung",
    "excerpt": "Ein Ratgeber für SPO-Erlebnisse: Strand, Watt, Pfahlbauten, Wellness, Essen, Schlechtwetter und ruhige Planung.",
    "href": "/ratgeber/was-kann-man-in-sankt-peter-ording-machen",
    "image": "/brand/generated/morrow-spo-image-set.png",
    "author": "Morrow Redaktion",
    "publishedAt": "2026-05-13",
    "readingTime": "9 Min. Lesezeit",
    "audience": "both",
    "relatedStaySlugs": [
      "family-escape",
      "couple-reset"
    ],
    "sections": [
      {
        "title": "Die kurze Antwort",
        "body": "In Sankt Peter-Ording kann man viel machen: Strandtage, Watt, Dünenwege, Pfahlbauten, Radfahren, Naturführungen, Wellness, Thalasso, gutes Essen und wetterfeste Familienangebote. Entscheidend ist aber nicht die längste Liste. Ein guter Aufenthalt entsteht, wenn Erlebnis, Unterkunft, Wetter, Wege und Anlass zusammenpassen."
      },
      {
        "title": "Warum SPO-Erlebnisse anders gedacht werden sollten",
        "body": "Wer nach „Was kann man in Sankt Peter-Ording machen?“ sucht, bekommt schnell viele einzelne Vorschläge. Das hilft nur bedingt. Familien brauchen andere Antworten als Paare. Ein sonniger Sommertag braucht andere Ideen als ein windiger Herbsttag. Eine Unterkunft in Bad verändert die Planung anders als ein ruhiger Rückzugsort näher an Böhl oder Ording.\n\nDeshalb ist die bessere Frage: Was passt zu diesem Aufenthalt? Für Morrow sind Erlebnisse keine losen Aktivitäten, sondern Teile einer Auszeit. Sie sollen den Aufenthalt leichter machen, nicht voller."
      },
      {
        "title": "Strand, Dünen und Pfahlbauten",
        "body": "Der Strand ist in Sankt Peter-Ording nicht einfach Kulisse. Er prägt den Tag. Die Weite, der Wind, die Pfahlbauten, die langen Wege und der Blick über das Wasser geben dem Aufenthalt seinen Rhythmus. Manchmal reicht schon ein Spaziergang, ein Strandkorb, ein Abend am Wasser oder ein kurzer Weg durch die Dünen, um wirklich anzukommen.\n\nFür Familien kann der Strand Bewegungsraum sein. Für Paare kann er Abstand vom Alltag schaffen. Für beide gilt: Der beste Strandmoment ist nicht automatisch der längste. Er ist der, der zur Tagesform, zum Wetter und zur Unterkunft passt."
      },
      {
        "title": "Watt und Natur erleben",
        "body": "Das Wattenmeer macht SPO besonders. Bei Ebbe verändert sich die Landschaft sichtbar, Kinder entdecken Spuren, Muscheln und Wasserläufe, Erwachsene merken oft erst dort, wie weit der Alltag weg ist. Eine Wattwanderung, eine Naturführung, ein Besuch im Nationalpark-Haus oder ein ruhiger Dünenmoment können stärker wirken als ein voller Ausflugstag.\n\nWichtig ist die Passung:\n- Für Familien muss das Erlebnis altersgerecht und nicht zu lang sein.\n- Für Paare darf es ruhiger, stiller oder besonderer wirken.\n- Bei Wind und Wetter braucht es realistische Kleidung und eine Alternative.\n- Der Weg zum Treffpunkt sollte zur Unterkunft passen.\n\nNatur in SPO funktioniert am besten, wenn sie nicht als Pflichtprogramm geplant wird. Sie darf Teil des Tages werden."
      },
      {
        "title": "Erlebnisse für Familien",
        "body": "Familien brauchen in SPO vor allem Erlebnisse, die nicht zu kompliziert werden. Watt, Reiten, Naturzeit, Spielorte, Strand, kleine Ausflüge oder ein wetterfester Nachmittag können gut funktionieren. Entscheidend ist, dass Kinder mitkommen und Eltern nicht ständig organisieren müssen.\n\nTypische Familienideen in SPO:\n- altersgerechte Watt- oder Naturführung\n- Ponyreiten oder ein kleiner Ausritt, wenn es passt\n- Strandtag mit klarer Essens- und Pausenidee\n- Dünen-Therme oder Erlebnis-Hus bei schlechtem Wetter\n- einfache Restaurantoption für den ersten Abend\n- kurzer Ausflug auf Eiderstedt, wenn der Tag dafür Raum lässt\n\nNicht jede Familie braucht das gleiche Erlebnis. Mit Kleinkindern zählen kurze Wege und Pausen. Mit Schulkindern darf es mehr Entdecken sein. Mit Teenagern braucht es oft mehr Eigenraum und weniger Programm."
      },
      {
        "title": "Erlebnisse für Paare",
        "body": "Für Paare ist ein gutes Erlebnis oft leiser. Wellness, Thalasso, Yoga, ein ruhiges Dinner, Sonnenuntergang, gemeinsames Kochen oder ein langer Spaziergang können reichen, wenn der Rahmen stimmt. Gerade bei Jahrestag, Geburtstag oder einer kleinen Überraschung geht es weniger um Spektakel als um das Gefühl: Wir haben Zeit füreinander.\n\nGute Paarzeit in SPO kann so aussehen:\n- Wellness oder Sauna nach einem windigen Strandspaziergang\n- Dinner mit Reservierung statt spontaner Suche\n- Sonnenuntergang am Wasser\n- ruhiger Morgen ohne festen Plan\n- gemeinsames Kochen oder Private Cooking, wenn es zum Anlass passt\n- Unterkunft, die wirklich Rückzug ermöglicht\n\nDas Erlebnis sollte nicht den Aufenthalt dominieren. Es sollte ihm einen besonderen Moment geben."
      },
      {
        "title": "Was tun bei schlechtem Wetter?",
        "body": "Schlechtes Wetter gehört zur Nordsee. Ein Aufenthalt in SPO wird nicht schlechter, nur weil Wind oder Regen kommen. Er wird stressig, wenn man erst dann anfängt zu suchen. Darum lohnt sich ein Plan B schon vor der Anreise.\n\nWetterfeste Ideen sind zum Beispiel Dünen-Therme, Erlebnis-Hus, Nationalpark-Haus, ein Café, ein Restaurant mit Reservierung, ein warmer Unterkunftsnachmittag oder ein kurzer Spaziergang mit guter Kleidung. Für Paare können Wellness und ein vorbereiteter Abend besonders gut funktionieren. Für Familien ist wichtig, dass die Idee nicht zu weit weg und nicht zu aufwendig ist."
      },
      {
        "title": "Essen, Abende und kleine Pausen",
        "body": "Viele Aufenthalte kippen nicht wegen des großen Programms, sondern wegen kleiner Reibungen: Hunger nach dem Strand, müde Kinder, volle Restaurants, unklare Wege oder ein Abend, der plötzlich wieder Recherche wird. Deshalb gehören Essen und Pausen zu den wichtigsten Erlebnisbausteinen.\n\nFür Familien ist der erste Abend entscheidend. Für Paare kann ein besonderer Abend den ganzen Aufenthalt prägen. Für beide Zielgruppen gilt: Es muss nicht jeder Abend geplant sein. Aber ein bis zwei gute Entscheidungen vorab nehmen sehr viel Druck aus der Auszeit."
      },
      {
        "title": "Eine einfache Checkliste für Aktivitäten in SPO",
        "body": "Bevor ihr euch für Aktivitäten in Sankt Peter-Ording entscheidet, helfen wenige Fragen mehr als lange Listen.\n\nVor der Auswahl klären:\n- Reist ihr als Familie, Paar oder mit Hund?\n- Soll das Erlebnis aktiv, ruhig, naturbezogen oder wetterfest sein?\n- Wie weit ist der Weg von der Unterkunft?\n- Passt das Erlebnis zum Alter der Kinder oder zum Anlass der Reise?\n- Braucht ihr Reservierung, passende Kleidung oder einen Plan B?\n- Gibt es danach genug freie Zeit?\n- Wird der Aufenthalt dadurch leichter oder nur voller?\n\nDie beste Aktivität ist die, die den Tag stimmiger macht."
      },
      {
        "title": "Häufige Fragen zu Aktivitäten in Sankt Peter-Ording",
        "body": "Was muss man in Sankt Peter-Ording gemacht haben?\nEin Strandmoment, ein Weg durch die Dünen, ein Blick auf die Pfahlbauten und je nach Wetter eine Watt- oder Naturzeit gehören zu den stärksten Erlebnissen. Pflichtprogramm sollte daraus trotzdem nicht werden.\n\nWas kann man in SPO mit Kindern machen?\nStrand, Watt, Naturführung, Reiten, Spielangebote, Dünen-Therme, Erlebnis-Hus, kurze Ausflüge und einfache Essenspausen passen gut, wenn sie altersgerecht geplant sind.\n\nWas kann man in SPO zu zweit machen?\nSpaziergänge, Wellness, Thalasso, Dinner, Sonnenuntergang, ruhige Unterkunftszeit und kleine besondere Momente funktionieren besonders gut.\n\nWas macht man bei Regen in Sankt Peter-Ording?\nDünen-Therme, Erlebnis-Hus, Nationalpark-Haus, Cafés, Restaurants, Wellness und ein vorbereiteter Unterkunftsnachmittag sind gute Optionen.\n\nBraucht man für Aktivitäten in SPO ein Auto?\nDas hängt von Unterkunft, Saison und Erlebnis ab. Wichtig ist, Wege nicht zu unterschätzen und Aktivitäten nicht isoliert von der Unterkunft zu planen."
      },
      {
        "title": "Wann Morrow sinnvoll wird",
        "body": "Morrow wird sinnvoll, wenn ihr nicht nur wissen wollt, was man in Sankt Peter-Ording machen kann, sondern was wirklich zu euch passt. Eine kuratierte Auszeit verbindet Unterkunft, lokales Erlebnis, Empfehlungen und Orientierung vor Ort. So entsteht kein voller Aktivitätenplan, sondern ein Aufenthalt, der vorbereitet wirkt und trotzdem frei bleibt."
      }
    ]
  },
  {
    "slug": "schlechtes-wetter-sankt-peter-ording-mit-kindern",
    "title": "Schlechtes Wetter in Sankt Peter-Ording mit Kindern: ruhige Ideen für Regentage",
    "description": "Was Familien in SPO bei Regen, Wind und rauem Nordseewetter machen können, ohne dass der Urlaub stressig wird.",
    "category": "Familienurlaub",
    "excerpt": "Was Familien in SPO bei Regen, Wind und rauem Nordseewetter machen können, ohne dass der Urlaub stressig wird.",
    "href": "/ratgeber/schlechtes-wetter-sankt-peter-ording-mit-kindern",
    "image": "/brand/generated/morrow-article-family-stay-arrival.png",
    "author": "Morrow Redaktion",
    "publishedAt": "2026-05-13",
    "readingTime": "8 Min. Lesezeit",
    "audience": "families",
    "relatedStaySlugs": [
      "family-escape"
    ],
    "sections": [
      {
        "title": "Die kurze Antwort",
        "body": "Schlechtes Wetter in Sankt Peter-Ording ist mit Kindern gut machbar, wenn ihr nicht erst im Regen suchen müsst. Dünen-Therme, Erlebnis-Hus, Nationalpark-Haus, warme Pausen, kurze Spaziergänge, einfache Essenslösungen und eine gute Unterkunft helfen, den Tag ruhig zu halten."
      },
      {
        "title": "Warum Regen in SPO nicht das Problem ist",
        "body": "Nordseeurlaub bedeutet Wetterwechsel. Wind, Regen und graue Tage gehören zu Sankt Peter-Ording dazu. Für Familien wird das erst dann anstrengend, wenn der Tag keine Richtung hat: alle sind nass, niemand weiß wohin, Hunger kommt dazu und die nächste Entscheidung fühlt sich plötzlich groß an.\n\nEin guter Schlechtwettertag braucht nicht viele Attraktionen. Er braucht zwei bis drei realistische Möglichkeiten, kurze Wege und eine Unterkunft, die als Rückzugsort funktioniert."
      },
      {
        "title": "Dünen-Therme und warme Wasserzeit",
        "body": "Die Dünen-Therme im Ortsteil Bad ist für viele Familien eine naheliegende Idee, wenn Wind und Regen den Strandtag verändern. Wasser, Wärme und Bewegung können genau das sein, was Kinder brauchen, ohne dass der Tag kompliziert wird.\n\nWichtig ist, den Besuch nicht als Rettungsplan in letzter Sekunde zu sehen. Wenn ihr vorher wisst, wann so ein warmer Badetag sinnvoll wäre, fühlt sich Regen weniger wie eine Störung an."
      },
      {
        "title": "Erlebnis-Hus und wetterfeste Familienzeit",
        "body": "Das Erlebnis-Hus kann für Familien interessant sein, wenn Kinder Bewegung brauchen und draußen gerade wenig geht. Je nach Alter der Kinder kann so ein Ort einen rauen Nachmittag auffangen. Entscheidend ist auch hier die Erwartung: Es muss nicht der Höhepunkt des Urlaubs sein. Es darf einfach helfen, den Rhythmus zu halten.\n\nGerade mit kleineren Kindern ist eine wetterfeste Option in der Nähe oft wertvoller als ein großer Ausflug."
      },
      {
        "title": "Nationalpark-Haus, Wattwissen und kleine Entdeckungen",
        "body": "Wenn das Wetter nicht zum langen Strandtag passt, kann Natur trotzdem Thema bleiben. Nationalpark-Haus, Schutzstation Wattenmeer oder eine kurze, passende Naturidee bringen Kindern näher, warum SPO besonders ist: Ebbe und Flut, Vögel, Watt, Salzwiesen und der Wechsel der Landschaft.\n\nFür Kinder ist das stärker, wenn es greifbar bleibt. Lieber eine kurze, gute Entdeckung als ein zu langer Programmpunkt."
      },
      {
        "title": "Unterkunft als echter Rückzugsort",
        "body": "Bei schlechtem Wetter zeigt sich, ob eine Unterkunft wirklich zur Familie passt. Gibt es Platz zum Essen, Spielen, Lesen, Trocknen und Runterkommen? Funktioniert die Küche für einen einfachen Abend? Gibt es genug Ruhe, wenn alle nach einem nassen Vormittag wieder ankommen?\n\nEine schöne Unterkunft ist bei Nordseeurlaub mit Kindern nicht nur Schlafplatz. Sie ist Plan B, Pausenraum und der Ort, an dem aus schlechtem Wetter kein schlechter Tag wird."
      },
      {
        "title": "Kurzer Strandmoment statt voller Ausflug",
        "body": "Nicht jeder Regentag muss drinnen stattfinden. Manchmal ist ein kurzer Spaziergang mit guter Kleidung genau richtig: raus, Wind spüren, einmal ans Wasser, dann wieder warm werden. Für Kinder kann das viel besser funktionieren als ein langer Ausflug, der am Ende alle müde macht.\n\nDie Frage ist nicht: Können wir trotzdem an den Strand? Sondern: Wie kurz, einfach und realistisch darf der Strandmoment heute sein?"
      },
      {
        "title": "Essen und Pausen vorher denken",
        "body": "Schlechtwettertage werden oft durch Essen kompliziert. Nach einem nassen Vormittag will niemand lange suchen. Eine vorbereitete Idee für Mittag, Café, Abendessen oder einen einfachen Unterkunftsabend nimmt Druck heraus.\n\nGerade der erste Abend und ein möglicher Regentag sollten nicht komplett offen sein. Das macht den Aufenthalt nicht steif, sondern leichter."
      },
      {
        "title": "Eine einfache Checkliste für Regentage in SPO",
        "body": "Ein guter Plan B bleibt klein und realistisch.\n\nVor der Reise klären:\n- Welche warme Option passt zum Alter der Kinder?\n- Welche Idee ist nah genug an der Unterkunft?\n- Was ist die einfache Essenslösung für einen nassen Tag?\n- Gibt es Kleidung für kurzen Strand trotz Regen?\n- Funktioniert die Unterkunft als Pausenort?\n- Welche Aktivität ist wirklich wetterfest?\n- Was darf an diesem Tag bewusst ausfallen?\n\nSo bleibt schlechtes Wetter ein anderer Rhythmus und nicht das Ende des Urlaubsgefühls."
      },
      {
        "title": "Häufige Fragen zu schlechtem Wetter in SPO mit Kindern",
        "body": "Was kann man bei Regen in Sankt Peter-Ording mit Kindern machen?\nDünen-Therme, Erlebnis-Hus, Nationalpark-Haus, Cafés, Restaurants, kurze Spaziergänge und ruhige Unterkunftszeit sind gute Optionen.\n\nIst SPO bei schlechtem Wetter für Familien geeignet?\nJa, wenn Unterkunft, Wege und Plan B vorher bedacht sind. Ohne Vorbereitung kann die spontane Suche anstrengend werden.\n\nMuss man bei Regen immer drinnen bleiben?\nNein. Ein kurzer Strandmoment mit guter Kleidung kann schön sein, solange er realistisch bleibt.\n\nWelche Rolle spielt die Unterkunft bei schlechtem Wetter?\nEine große. Sie wird Rückzugsort, Spielort, Essensort und Pausenraum. Deshalb sollte sie nicht nur nach Fotos ausgewählt werden.\n\nWie plant man Regentage ohne zu viel Programm?\nMit ein bis zwei nahen Optionen, einer Essensidee und genug freier Zeit."
      },
      {
        "title": "Wann Morrow sinnvoll wird",
        "body": "Morrow wird sinnvoll, wenn ihr nicht erst bei Regen überlegen wollt, was jetzt passt. Eine kuratierte Familien-Auszeit denkt Unterkunft, Erlebnis, Wetteralternativen und Empfehlungen zusammen. So bleibt auch ein rauer Nordseetag Teil der Auszeit."
      }
    ]
  },
  {
    "slug": "wattwanderung-sankt-peter-ording-kinder",
    "title": "Wattwanderung in Sankt Peter-Ording mit Kindern: worauf Familien achten sollten",
    "description": "Ein ruhiger Ratgeber für Watt, Natur und Familienzeit in SPO: Alter, Dauer, Wetter, Kleidung und passende Erwartungen.",
    "category": "Familienurlaub",
    "excerpt": "Ein ruhiger Ratgeber für Watt, Natur und Familienzeit in SPO: Alter, Dauer, Wetter, Kleidung und passende Erwartungen.",
    "href": "/ratgeber/wattwanderung-sankt-peter-ording-kinder",
    "image": "/brand/generated/morrow-article-family-watt-rest.png",
    "author": "Morrow Redaktion",
    "publishedAt": "2026-05-13",
    "readingTime": "8 Min. Lesezeit",
    "audience": "families",
    "relatedStaySlugs": [
      "family-escape"
    ],
    "sections": [
      {
        "title": "Die kurze Antwort",
        "body": "Eine Wattwanderung in Sankt Peter-Ording kann mit Kindern sehr besonders sein, wenn sie altersgerecht, wetterpassend und nicht zu lang geplant ist. Wichtig sind ein seriöser Anbieter, passende Kleidung, klare Treffpunkte, realistische Dauer und genug Ruhe davor und danach."
      },
      {
        "title": "Warum Watt für Kinder so stark sein kann",
        "body": "Das Watt ist für Kinder kein abstraktes Naturthema. Es ist Boden unter den Füßen, Wasserläufe, Spuren, Muscheln, kleine Tiere, Wind, Weite und die sichtbare Veränderung durch Ebbe und Flut. Genau deshalb bleibt eine gute Wattzeit oft stärker in Erinnerung als ein voller Ausflugstag.\n\nFür Familien geht es nicht darum, möglichst viel Wissen mitzunehmen. Es geht darum, dass Kinder Natur erleben und Eltern sich sicher fühlen."
      },
      {
        "title": "Ab welchem Alter eine Wattwanderung passt",
        "body": "Das passende Alter hängt weniger von einer Zahl ab als von Dauer, Wetter, Strecke und Kind. Kleinere Kinder brauchen kurze, greifbare Erlebnisse. Schulkinder können oft mehr entdecken und Fragen stellen. Teenager brauchen manchmal einen besonderen Zugang, damit es nicht wie Pflichtprogramm wirkt.\n\nVor der Buchung hilft die Frage: Wird unser Kind mitgehen können, ohne dass der Tag danach kippt?"
      },
      {
        "title": "Geführte Wattwanderung statt auf eigene Faust",
        "body": "Das Wattenmeer ist wunderschön, aber kein Ort für spontane Experimente. Wasserstände, Wetter, Untergrund und Orientierung verändern sich. Für Familien ist eine geführte Wattwanderung oder eine passende Naturführung deshalb die bessere Wahl.\n\nEin guter Anbieter erklärt nicht nur Fakten. Er gibt Sicherheit, wählt eine passende Route und hält die Gruppe so, dass Kinder mitkommen."
      },
      {
        "title": "Dauer, Treffpunkt und Wege realistisch planen",
        "body": "Viele Familien unterschätzen nicht die Wattwanderung selbst, sondern alles drumherum: Anfahrt, Parkplatz, Weg zum Treffpunkt, Wartezeit, nasse Kleidung, Hunger danach und Rückweg zur Unterkunft. Genau dort entsteht Stress.\n\nDarum sollte die Wattzeit nicht allein betrachtet werden. Sie muss zum Tagesrhythmus passen: vorher nicht zu viel, danach eine einfache Pause, Essen oder ein ruhiger Abend."
      },
      {
        "title": "Kleidung und Wetter",
        "body": "Watt und Nordsee bedeuten Wetter. Wind, Sonne, Regen und Temperatur können sich anders anfühlen als erwartet. Je nach Jahreszeit und Anbieter können barfuß, alte Schuhe, Gummistiefel oder wetterfeste Kleidung sinnvoll sein. Wichtig ist, die Hinweise des Anbieters ernst zu nehmen.\n\nFür Kinder sollte Kleidung nicht nur „richtig“, sondern bequem genug sein. Wenn alle frieren oder reiben, wird aus Natur schnell Geduldstest."
      },
      {
        "title": "Was Kinder im Watt entdecken können",
        "body": "Spuren, Muscheln, kleine Tiere, Wasserläufe, Priele, Vögel, Salzwiesen und der Wechsel zwischen Ebbe und Flut machen das Watt lebendig. Kinder verstehen Natur oft über konkrete Dinge. Sie müssen nicht alles erklärt bekommen. Manchmal reicht ein guter Moment, eine Frage oder ein Fund.\n\nEine gute Wattwanderung lässt Raum für genau diese kleinen Entdeckungen."
      },
      {
        "title": "Wenn Watt nicht passt: Alternativen",
        "body": "Nicht jeder Termin, jedes Wetter oder jedes Kind passt zur Wattwanderung. Das ist kein Problem. Alternativen können ein Besuch im Nationalpark-Haus, eine kurze Naturführung, ein Dünenweg, ein Strandmoment bei Ebbe oder eine ruhigere Familienzeit sein.\n\nEine kuratierte Auszeit muss nicht an einem einzelnen Erlebnis hängen. Sie sollte Alternativen kennen, damit der Aufenthalt trotzdem stimmig bleibt."
      },
      {
        "title": "Eine einfache Checkliste für Watt mit Kindern",
        "body": "Vor einer Wattwanderung helfen wenige klare Fragen.\n\nVor der Buchung klären:\n- Ist der Anbieter für Familien und Kinder geeignet?\n- Passt die Dauer zum Alter der Kinder?\n- Wie kommt ihr entspannt zum Treffpunkt?\n- Welche Kleidung wird empfohlen?\n- Was passiert bei Wetterwechsel?\n- Gibt es danach eine einfache Essens- oder Pausenidee?\n- Passt das Erlebnis zum restlichen Tag?\n\nSo wird Watt nicht zum Programmpunkt, sondern zu einem guten Familienmoment."
      },
      {
        "title": "Häufige Fragen zur Wattwanderung mit Kindern in SPO",
        "body": "Kann man in Sankt Peter-Ording mit Kindern Wattwandern?\nJa, wenn die Wattwanderung geführt, altersgerecht und passend zum Wetter geplant ist.\n\nSollte man mit Kindern allein ins Watt gehen?\nFür Familien ist eine geführte Tour die sichere und sinnvollere Wahl, weil Wasserstände, Wetter und Orientierung wichtig sind.\n\nWas braucht man für eine Wattwanderung mit Kindern?\nDas hängt von Jahreszeit und Anbieter ab. Wichtig sind passende Kleidung, klare Treffpunktinfos, genug Zeit und eine Pause danach.\n\nWas tun, wenn das Wetter nicht passt?\nDann sind Nationalpark-Haus, Naturführung, Dünenweg oder ein ruhiger Unterkunftstag gute Alternativen.\n\nWie lange sollte eine Wattwanderung mit Kindern dauern?\nSo kurz, dass Kinder neugierig bleiben und der Tag danach nicht überladen ist. Die passende Dauer hängt vom Alter und Anbieter ab."
      },
      {
        "title": "Wann Morrow sinnvoll wird",
        "body": "Morrow wird sinnvoll, wenn eine Wattwanderung nicht isoliert gebucht werden soll, sondern zum ganzen Aufenthalt passen muss. Unterkunft, Termin, Wetter, Wege, Essen und Familienrhythmus werden zusammen gedacht. So wird aus einem Naturerlebnis eine stimmige Auszeit."
      }
    ]
  }
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
