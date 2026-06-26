import { GuestStayClient } from "./GuestStayClient";

export default async function GuestStayPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ code?: string; view?: string }>;
}) {
  const { bookingId } = await params;
  const { code = "", view = "" } = await searchParams;

  return <GuestStayClient bookingId={bookingId} accessCode={code} initialView={view} />;
}
