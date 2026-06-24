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
  audience: Audience;
  location: string;
  lead: string;
};
