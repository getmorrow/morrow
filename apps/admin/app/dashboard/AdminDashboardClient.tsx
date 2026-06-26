"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@morrow/supabase";

type AdminProfile = {
  email: string;
  role: string;
  status: string;
  name: string | null;
};

type LeadRow = {
  id: string;
  type: "guest" | "owner" | "experience";
  status: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  package_slug: string | null;
  created_at: string;
  payload: Record<string, unknown>;
};

type BookingRow = {
  id: string;
  status: string;
  payment_status: string;
  created_at: string;
  payload: Record<string, unknown>;
};

type SimpleRow = {
  id: string;
  name?: string;
  slug?: string;
  status?: string;
  location?: string;
  payload?: Record<string, unknown>;
};

type AdminTaskRow = {
  id: string;
  title: string;
  reference_type: string;
  reference_id: string;
  reference_label: string | null;
  due_at: string | null;
  status: string;
  priority: string;
  note: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type SupportRow = {
  id: string;
  lead_id: string | null;
  category: string;
  message: string;
  status: string;
  urgency: string | null;
  created_at: string;
  payload: Record<string, unknown>;
};

type CommunicationEventRow = {
  id: string;
  lead_id: string | null;
  booking_id: string | null;
  channel: string;
  direction: string;
  event_type: string;
  subject: string | null;
  body: string | null;
  actor: string | null;
  status: string;
  created_at: string;
};

type DashboardData = {
  profile: AdminProfile;
  leads: LeadRow[];
  bookings: BookingRow[];
  packages: SimpleRow[];
  properties: SimpleRow[];
  tasks: AdminTaskRow[];
  supportMessages: SupportRow[];
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: DashboardData }
  | { status: "error"; message: string };

type DetailSelection =
  | { type: "lead"; id: string }
  | { type: "booking"; id: string }
  | { type: "support"; id: string }
  | null;

const leadQuickStatuses = ["In Prüfung", "Kontaktiert", "Kein Interesse"] as const;
const bookingStatuses = ["Bezahlt", "Vor Anreise", "Aktiv", "Abgeschlossen", "Storniert"] as const;
const supportStatuses = ["open", "in_progress", "closed"] as const;
const taskStatuses = ["open", "in_progress", "done"] as const;

function paymentStatusForBooking(status: string) {
  return ["Bezahlt", "Vor Anreise", "Aktiv", "Abgeschlossen"].includes(status)
    ? "bezahlt"
    : "offen";
}

function getPayloadText(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value: string | null) {
  if (!value) return "ohne Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function supportStatusLabel(status: string) {
  const labels: Record<string, string> = {
    open: "Offen",
    in_progress: "In Klärung",
    closed: "Erledigt",
  };

  return labels[status] || status;
}

function supportUrgencyLabel(urgency: string | null) {
  const labels: Record<string, string> = {
    low: "Normal",
    normal: "Normal",
    medium: "Mittel",
    high: "Dringend",
    urgent: "Dringend",
  };

  return urgency ? labels[urgency] || urgency : "Normal";
}

function taskStatusLabel(status: string) {
  const labels: Record<string, string> = {
    open: "Offen",
    in_progress: "In Arbeit",
    done: "Erledigt",
  };

  return labels[status] || status;
}

function taskPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
  };

  return labels[priority] || priority;
}

function taskReferenceLabel(type: string) {
  const labels: Record<string, string> = {
    lead: "Anfrage",
    booking: "Buchung",
    package: "Auszeit",
    property: "Unterkunft",
    owner: "Eigentümer",
    experience: "Erlebnis",
    experienceProvider: "Erlebnisanbieter",
    localPlace: "Vor Ort",
    support: "Support",
  };

  return labels[type] || type;
}

function getOpenLeads(leads: LeadRow[]) {
  return leads.filter((lead) => !["Bezahlt", "Abgeschlossen", "Kein Interesse"].includes(lead.status));
}

function getLeadLabel(lead: LeadRow) {
  return (
    lead.name ||
    getPayloadText(lead.payload, ["name", "fullName", "email"]) ||
    lead.email ||
    lead.type
  );
}

function getBookingLabel(booking: BookingRow) {
  return (
    getPayloadText(booking.payload, ["packageName", "stayName", "guestName", "customerName"]) ||
    booking.status
  );
}

function getSupportLabel(support: SupportRow) {
  return (
    getPayloadText(support.payload, ["subject", "title", "supportName", "categoryLabel"]) ||
    support.category ||
    "Supportfall"
  );
}

function getSupportContactLabel(support: SupportRow) {
  return (
    getPayloadText(support.payload, ["guestName", "customerName", "name", "leadName"]) ||
    getPayloadText(support.payload, ["email", "phone"]) ||
    "Gast"
  );
}

function getSupportRelationId(support: SupportRow, kind: "lead" | "booking") {
  const keys = kind === "lead" ? ["leadId", "lead_id"] : ["bookingId", "booking_id"];
  return getPayloadText(support.payload, keys) || (kind === "lead" ? support.lead_id : null);
}

function getInternalNote(payload: Record<string, unknown>) {
  return getPayloadText(payload, ["internalNote", "note", "notes"]) || "";
}

function taskTimingLabel(task: AdminTaskRow) {
  if (task.status === "done") return "erledigt";
  if (!task.due_at) return "ohne Datum";
  if (task.due_at < todayIsoDate()) return "überfällig";
  if (task.due_at === todayIsoDate()) return "heute";
  return formatShortDate(task.due_at);
}

function monitoringItems(data: DashboardData) {
  const items: Array<{
    id: string;
    label: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }> = [];

  data.packages.forEach((item) => {
    if (!item.status || item.status === "draft") {
      items.push({
        id: `package-status-${item.id}`,
        label: "Auszeit",
        title: item.name || item.id,
        description: "Status, Veröffentlichung und Gastansicht prüfen.",
        severity: "medium",
      });
    }
  });

  data.properties.forEach((item) => {
    if (!item.status || item.status === "draft") {
      items.push({
        id: `property-status-${item.id}`,
        label: "Unterkunft",
        title: item.name || item.id,
        description: "Objektdaten, Regeln, Check-in und Rechte prüfen.",
        severity: "medium",
      });
    }
  });

  data.bookings.forEach((booking) => {
    if (booking.status === "Reserviert" || booking.payment_status !== "bezahlt") {
      items.push({
        id: `booking-payment-${booking.id}`,
        label: "Buchung",
        title: getBookingLabel(booking),
        description: "Zahlung, Bestätigung und Gästebereich-Freigabe prüfen.",
        severity: "high",
      });
    }
  });

  data.supportMessages
    .filter((support) => support.status !== "closed")
    .forEach((support) => {
      items.push({
        id: `support-${support.id}`,
        label: "Support",
        title: getSupportContactLabel(support),
        description: `${getSupportLabel(support)} · ${supportUrgencyLabel(support.urgency)}`,
        severity: support.urgency === "high" || support.urgency === "urgent" ? "high" : "medium",
      });
    });

  return items.sort((a, b) => {
    const weight = { high: 0, medium: 1, low: 2 };
    return weight[a.severity] - weight[b.severity] || a.title.localeCompare(b.title);
  });
}

export function AdminDashboardClient() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          router.replace("/");
          return;
        }

        const profileResult = await supabase.rpc("get_morrow_admin_profile");

        if (profileResult.error || !profileResult.data) {
          await supabase.auth.signOut();
          router.replace("/");
          return;
        }

        const [leadsResult, bookingsResult, packagesResult, propertiesResult, tasksResult, supportResult] =
          await Promise.all([
            supabase
              .from("leads")
              .select("id,type,status,name,email,phone,package_slug,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase
              .from("bookings")
              .select("id,status,payment_status,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(30),
            supabase.from("packages").select("id,name,slug,status,location,payload").order("name"),
            supabase.from("properties").select("id,name,status,location,payload").order("name"),
            supabase
              .from("admin_tasks")
              .select("id,title,reference_type,reference_id,reference_label,due_at,status,priority,note,payload,created_at")
              .order("due_at", { ascending: true, nullsFirst: false })
              .order("created_at", { ascending: false })
              .limit(40),
            supabase
              .from("support_messages")
              .select("id,lead_id,category,message,status,urgency,created_at,payload")
              .order("created_at", { ascending: false })
              .limit(20),
          ]);

        if (!isMounted) return;

        const firstError =
          leadsResult.error ||
          bookingsResult.error ||
          packagesResult.error ||
          propertiesResult.error ||
          tasksResult.error ||
          supportResult.error;

        if (firstError) {
          setState({
            status: "error",
            message: "Die Admin-Daten konnten nicht geladen werden.",
          });
          return;
        }

        setState({
          status: "ready",
          data: {
            profile: profileResult.data as AdminProfile,
            leads: (leadsResult.data ?? []) as LeadRow[],
            bookings: (bookingsResult.data ?? []) as BookingRow[],
            packages: (packagesResult.data ?? []) as SimpleRow[],
            properties: (propertiesResult.data ?? []) as SimpleRow[],
            tasks: (tasksResult.data ?? []) as AdminTaskRow[],
            supportMessages: (supportResult.data ?? []) as SupportRow[],
          },
        });
      } catch {
        if (!isMounted) return;
        setState({
          status: "error",
          message: "Die Admin-Daten konnten nicht geladen werden.",
        });
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (state.status === "loading") {
    return (
      <main className="admin-shell">
        <div className="admin-center-state">
          <p className="admin-eyebrow">Morrow Admin</p>
          <h1>Zugang wird geprüft.</h1>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="admin-shell">
        <div className="admin-center-state">
          <p className="admin-eyebrow">Morrow Admin</p>
          <h1>{state.message}</h1>
          <button className="admin-button secondary" onClick={handleLogout} type="button">
            Zurück zum Login
          </button>
        </div>
      </main>
    );
  }

  return <AdminDashboardView data={state.data} onLogout={handleLogout} />;
}

function AdminDashboardView({
  data: initialData,
  onLogout,
}: {
  data: DashboardData;
  onLogout: () => void;
}) {
  const [dataState, setDataState] = useState(initialData);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [selection, setSelection] = useState<DetailSelection>(null);
  const [communicationEvents, setCommunicationEvents] = useState<CommunicationEventRow[]>([]);
  const [drawerNote, setDrawerNote] = useState("");
  const [drawerMessage, setDrawerMessage] = useState<string | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const data = dataState;
  const openLeads = useMemo(() => getOpenLeads(data.leads), [data.leads]);
  const paidBookings = data.bookings.filter((booking) => booking.payment_status === "bezahlt");
  const openSupport = data.supportMessages.filter((message) => message.status !== "closed");
  const activeTasks = data.tasks.filter((task) => task.status !== "done");
  const dueTasks = activeTasks.filter((task) => task.due_at && task.due_at <= todayIsoDate());
  const monitoring = monitoringItems(data);
  const displayName = data.profile.name || data.profile.email;
  const selectedLead = selection?.type === "lead"
    ? data.leads.find((lead) => lead.id === selection.id) ?? null
    : null;
  const selectedBooking = selection?.type === "booking"
    ? data.bookings.find((booking) => booking.id === selection.id) ?? null
    : null;
  const selectedSupport = selection?.type === "support"
    ? data.supportMessages.find((support) => support.id === selection.id) ?? null
    : null;

  useEffect(() => {
    if (!selection) {
      setCommunicationEvents([]);
      setDrawerNote("");
      setDrawerMessage(null);
      return;
    }

    const currentPayload = selection.type === "lead"
      ? data.leads.find((lead) => lead.id === selection.id)?.payload
      : selection.type === "booking"
        ? data.bookings.find((booking) => booking.id === selection.id)?.payload
        : data.supportMessages.find((support) => support.id === selection.id)?.payload;

    setDrawerNote(currentPayload ? getInternalNote(currentPayload) : "");
    setDrawerMessage(null);

    let isMounted = true;
    const activeSelection = selection;

    async function loadEvents() {
      setIsDrawerLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const query = supabase
          .from("communication_events")
          .select("id,lead_id,booking_id,channel,direction,event_type,subject,body,actor,status,created_at")
          .order("created_at", { ascending: false })
          .limit(40);
        const selectedSupportCase = activeSelection.type === "support"
          ? data.supportMessages.find((support) => support.id === activeSelection.id)
          : null;
        const supportLeadId = selectedSupportCase
          ? getSupportRelationId(selectedSupportCase, "lead")
          : null;
        const supportBookingId = selectedSupportCase
          ? getSupportRelationId(selectedSupportCase, "booking")
          : null;
        const { data: events, error } = activeSelection.type === "lead"
          ? await query.eq("lead_id", activeSelection.id)
          : activeSelection.type === "booking"
            ? await query.eq("booking_id", activeSelection.id)
            : supportLeadId && supportBookingId
              ? await query.or(`lead_id.eq.${supportLeadId},booking_id.eq.${supportBookingId}`)
              : supportLeadId
                ? await query.eq("lead_id", supportLeadId)
                : supportBookingId
                  ? await query.eq("booking_id", supportBookingId)
                  : await query.eq("event_type", `support:${activeSelection.id}`);

        if (!isMounted) return;
        if (error) {
          setDrawerMessage("Historie konnte nicht geladen werden.");
          setCommunicationEvents([]);
          return;
        }

        setCommunicationEvents((events ?? []) as CommunicationEventRow[]);
      } catch {
        if (!isMounted) return;
        setDrawerMessage("Historie konnte nicht geladen werden.");
        setCommunicationEvents([]);
      } finally {
        if (isMounted) setIsDrawerLoading(false);
      }
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [selection, data.leads, data.bookings, data.supportMessages]);

  async function writeAuditLog({
    action,
    entityType,
    entityId,
    entityLabel,
    payload,
  }: {
    action: string;
    entityType: string;
    entityId: string;
    entityLabel: string;
    payload: Record<string, unknown>;
  }) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("admin_audit_logs").insert({
      actor_email: data.profile.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_label: entityLabel,
      payload,
    });
  }

  async function updateLeadStatus(lead: LeadRow, status: string) {
    const actionKey = `lead-${lead.id}-${status}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        ...lead.payload,
        status,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("leads")
        .update({
          status,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lead.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        leads: current.leads.map((item) =>
          item.id === lead.id ? { ...item, status, payload } : item,
        ),
      }));

      await writeAuditLog({
        action: "lead_status_updated",
        entityType: "lead",
        entityId: lead.id,
        entityLabel: getLeadLabel(lead),
        payload: { from: lead.status, to: status },
      });

      setActionMessage("Anfrage aktualisiert.");
    } catch {
      setActionMessage("Die Anfrage konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function reserveLead(lead: LeadRow) {
    const actionKey = `lead-${lead.id}-reserve`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const packageItem = data.packages.find(
        (item) => item.slug === lead.package_slug || item.id === lead.package_slug,
      );
      const now = new Date().toISOString();
      const leadPayload = {
        ...lead.payload,
        status: "Reserviert",
        updatedAt: now,
      };
      const bookingPayload = {
        ...lead.payload,
        id: lead.id,
        leadId: lead.id,
        customerName: getLeadLabel(lead),
        email: lead.email,
        phone: lead.phone,
        packageId: packageItem?.id ?? lead.package_slug,
        packageSlug: packageItem?.slug ?? lead.package_slug,
        packageName: packageItem?.name ?? lead.package_slug ?? "Auszeit",
        status: "Reserviert",
        paymentStatus: "offen",
        createdAt: now,
        updatedAt: now,
      };

      const leadResult = await supabase
        .from("leads")
        .update({
          status: "Reserviert",
          payload: leadPayload,
          updated_at: now,
        })
        .eq("id", lead.id);

      if (leadResult.error) throw leadResult.error;

      const bookingResult = await supabase.from("bookings").upsert({
        id: lead.id,
        lead_id: lead.id,
        package_id: packageItem?.id ?? lead.package_slug,
        status: "Reserviert",
        payment_status: "offen",
        payload: bookingPayload,
        updated_at: now,
      });

      if (bookingResult.error) throw bookingResult.error;

      setDataState((current) => {
        const bookingRow: BookingRow = {
          id: lead.id,
          status: "Reserviert",
          payment_status: "offen",
          created_at: now,
          payload: bookingPayload,
        };

        return {
          ...current,
          leads: current.leads.map((item) =>
            item.id === lead.id ? { ...item, status: "Reserviert", payload: leadPayload } : item,
          ),
          bookings: current.bookings.some((booking) => booking.id === lead.id)
            ? current.bookings.map((booking) => (booking.id === lead.id ? bookingRow : booking))
            : [bookingRow, ...current.bookings],
        };
      });

      await writeAuditLog({
        action: "lead_reserved",
        entityType: "booking",
        entityId: lead.id,
        entityLabel: getLeadLabel(lead),
        payload: { leadId: lead.id, packageId: packageItem?.id ?? lead.package_slug },
      });

      setActionMessage("Reservierung angelegt.");
    } catch {
      setActionMessage("Die Reservierung konnte nicht angelegt werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateBookingStatus(booking: BookingRow, status: string) {
    const actionKey = `booking-${booking.id}-${status}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const paymentStatus = paymentStatusForBooking(status);
      const payload = {
        ...booking.payload,
        status,
        paymentStatus,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          payment_status: paymentStatus,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        bookings: current.bookings.map((item) =>
          item.id === booking.id
            ? { ...item, status, payment_status: paymentStatus, payload }
            : item,
        ),
      }));

      await writeAuditLog({
        action: "booking_status_updated",
        entityType: "booking",
        entityId: booking.id,
        entityLabel: getBookingLabel(booking),
        payload: { from: booking.status, to: status, paymentStatus },
      });

      setActionMessage("Buchung aktualisiert.");
    } catch {
      setActionMessage("Die Buchung konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function saveDrawerNote() {
    if (!selection) return;

    const actionKey = `drawer-note-${selection.type}-${selection.id}`;
    setPendingAction(actionKey);
    setDrawerMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const isLead = selection.type === "lead";
      const isBooking = selection.type === "booking";
      const currentEntity = isLead
        ? data.leads.find((lead) => lead.id === selection.id)
        : isBooking
          ? data.bookings.find((booking) => booking.id === selection.id)
          : data.supportMessages.find((support) => support.id === selection.id);

      if (!currentEntity) throw new Error("Missing entity");

      const payload = {
        ...currentEntity.payload,
        internalNote: drawerNote,
        updatedAt: new Date().toISOString(),
      };
      const table = isLead ? "leads" : isBooking ? "bookings" : "support_messages";
      const { error } = await supabase
        .from(table)
        .update({ payload, updated_at: new Date().toISOString() })
        .eq("id", selection.id);

      if (error) throw error;

      const supportCase = !isLead && !isBooking ? currentEntity as SupportRow : null;
      const supportLeadId = supportCase ? getSupportRelationId(supportCase, "lead") : null;
      const supportBookingId = supportCase ? getSupportRelationId(supportCase, "booking") : null;
      const eventResult = await supabase
        .from("communication_events")
        .insert({
          lead_id: isLead ? selection.id : supportLeadId,
          booking_id: isBooking ? selection.id : supportBookingId,
          channel: "note",
          direction: "internal",
          event_type: "note",
          subject: isLead || isBooking ? "Interne Notiz" : "Interne Support-Notiz",
          body: drawerNote || "Notiz aktualisiert.",
          actor: data.profile.email,
          status: "recorded",
          payload: {
            source: "next-admin",
            entityType: selection.type,
            entityId: selection.id,
          },
        })
        .select("id,lead_id,booking_id,channel,direction,event_type,subject,body,actor,status,created_at")
        .single();

      if (eventResult.error) throw eventResult.error;

      setDataState((current) => ({
        ...current,
        leads: isLead
          ? current.leads.map((lead) => (lead.id === selection.id ? { ...lead, payload } : lead))
          : current.leads,
        bookings: isLead || !isBooking
          ? current.bookings
          : current.bookings.map((booking) =>
              booking.id === selection.id ? { ...booking, payload } : booking,
            ),
        supportMessages: isLead || isBooking
          ? current.supportMessages
          : current.supportMessages.map((support) =>
              support.id === selection.id ? { ...support, payload } : support,
            ),
      }));
      setCommunicationEvents((current) => [
        eventResult.data as CommunicationEventRow,
        ...current,
      ]);

      await writeAuditLog({
        action: "internal_note_updated",
        entityType: selection.type,
        entityId: selection.id,
        entityLabel: isLead
          ? getLeadLabel(currentEntity as LeadRow)
          : isBooking
            ? getBookingLabel(currentEntity as BookingRow)
            : getSupportLabel(currentEntity as SupportRow),
        payload: { noteLength: drawerNote.length },
      });

      setDrawerMessage("Notiz gespeichert.");
    } catch {
      setDrawerMessage("Notiz konnte nicht gespeichert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateSupportStatus(support: SupportRow, status: string) {
    const actionKey = `support-${support.id}-${status}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        ...support.payload,
        status,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("support_messages")
        .update({
          status,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", support.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        supportMessages: current.supportMessages.map((item) =>
          item.id === support.id ? { ...item, status, payload } : item,
        ),
      }));

      await writeAuditLog({
        action: "support_status_updated",
        entityType: "support",
        entityId: support.id,
        entityLabel: getSupportLabel(support),
        payload: { from: support.status, to: status },
      });

      setActionMessage("Supportfall aktualisiert.");
    } catch {
      setActionMessage("Der Supportfall konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateTaskStatus(task: AdminTaskRow, status: string) {
    const actionKey = `task-${task.id}-${status}`;
    setPendingAction(actionKey);
    setActionMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        ...task.payload,
        status,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("admin_tasks")
        .update({
          status,
          payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        tasks: current.tasks.map((item) =>
          item.id === task.id ? { ...item, status, payload } : item,
        ),
      }));

      await writeAuditLog({
        action: "task_status_updated",
        entityType: "admin_task",
        entityId: task.id,
        entityLabel: task.title,
        payload: { from: task.status, to: status },
      });

      setActionMessage("Aufgabe aktualisiert.");
    } catch {
      setActionMessage("Die Aufgabe konnte nicht aktualisiert werden.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="admin-shell admin-dashboard">
      <header className="admin-header">
        <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
          <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
        </a>
        <nav aria-label="Admin Navigation">
          <a href="#anfragen">Anfragen</a>
          <a href="#buchungen">Buchungen</a>
          <a href="#aufgaben">Aufgaben</a>
          <a href="#support">Support</a>
          <a href="#bestand">Bestand</a>
          <button onClick={onLogout} type="button">
            Abmelden
          </button>
        </nav>
      </header>

      <section className="admin-hero">
        <p className="admin-eyebrow">Morrow Admin</p>
        <h1>Guten Überblick, {displayName}.</h1>
        <p>
          Diese Next-Version bildet den neuen operativen Kern ab: erst lesen,
          dann Schritt für Schritt die geprüften Prototyp-Funktionen migrieren.
        </p>
        {actionMessage ? <p className="admin-action-message">{actionMessage}</p> : null}
      </section>

      <section className="admin-metrics" aria-label="Kennzahlen">
        <article>
          <span>Offene Anfragen</span>
          <strong>{openLeads.length}</strong>
          <p>{data.leads.length} insgesamt geladen</p>
        </article>
        <article>
          <span>Buchungen</span>
          <strong>{data.bookings.length}</strong>
          <p>{paidBookings.length} bezahlt markiert</p>
        </article>
        <article>
          <span>Heute fällig</span>
          <strong>{dueTasks.length}</strong>
          <p>{activeTasks.length} aktive Aufgaben</p>
        </article>
        <article>
          <span>Monitoring</span>
          <strong>{monitoring.length}</strong>
          <p>{openSupport.length} offene Supportfälle</p>
        </article>
      </section>

      <section className="admin-grid" id="aufgaben">
        <article className="admin-card">
          <p className="admin-eyebrow">Aufgaben</p>
          <h2>Heute im Blick</h2>
          <div className="admin-list">
            {(dueTasks.length ? dueTasks : activeTasks.slice(0, 6)).map((task) => (
              <article className="admin-list-item" key={task.id}>
                <div>
                  <small>
                    {taskTimingLabel(task)} · {taskPriorityLabel(task.priority)}
                  </small>
                  <strong>{task.title}</strong>
                  <em>
                    {taskReferenceLabel(task.reference_type)} · {task.reference_label || task.reference_id}
                  </em>
                </div>
                <div className="admin-row-actions">
                  {taskStatuses.map((status) => (
                    <button
                      disabled={pendingAction === `task-${task.id}-${status}`}
                      key={status}
                      onClick={() => updateTaskStatus(task, status)}
                      type="button"
                    >
                      {taskStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {activeTasks.length === 0 ? (
              <p className="admin-drawer-message">Keine offenen Aufgaben vorhanden.</p>
            ) : null}
          </div>
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Monitoring</p>
          <h2>Fehlende Daten und Risiken</h2>
          <div className="admin-list">
            {monitoring.slice(0, 8).map((item) => (
              <article className="admin-list-item" key={item.id}>
                <div>
                  <small>{item.label} · {item.severity === "high" ? "hoch" : "prüfen"}</small>
                  <strong>{item.title}</strong>
                  <em>{item.description}</em>
                </div>
              </article>
            ))}
            {monitoring.length === 0 ? (
              <p className="admin-drawer-message">Keine akuten Monitoringhinweise vorhanden.</p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="anfragen">
        <article className="admin-card">
          <p className="admin-eyebrow">Anfragen</p>
          <h2>Neueste Kontakte</h2>
          <div className="admin-list">
            {data.leads.slice(0, 8).map((lead) => (
              <article className="admin-list-item" key={lead.id}>
                <div>
                  <small>{formatDate(lead.created_at)}</small>
                  <strong>{getLeadLabel(lead)}</strong>
                  <em>{lead.status}</em>
                </div>
                <div className="admin-row-actions">
                  <button onClick={() => setSelection({ type: "lead", id: lead.id })} type="button">
                    Details
                  </button>
                  {leadQuickStatuses.map((status) => (
                    <button
                      disabled={pendingAction === `lead-${lead.id}-${status}`}
                      key={status}
                      onClick={() => updateLeadStatus(lead, status)}
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                  {lead.type === "guest" ? (
                    <button
                      disabled={pendingAction === `lead-${lead.id}-reserve`}
                      onClick={() => reserveLead(lead)}
                      type="button"
                    >
                      Reservieren
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="admin-card" id="buchungen">
          <p className="admin-eyebrow">Buchungen</p>
          <h2>Aktuelle Aufenthalte</h2>
          <div className="admin-list">
            {data.bookings.slice(0, 8).map((booking) => (
              <article className="admin-list-item" key={booking.id}>
                <div>
                  <small>{formatDate(booking.created_at)}</small>
                  <strong>{getBookingLabel(booking)}</strong>
                  <em>
                    {booking.status} · {booking.payment_status}
                  </em>
                </div>
                <div className="admin-row-actions">
                  <button
                    onClick={() => setSelection({ type: "booking", id: booking.id })}
                    type="button"
                  >
                    Details
                  </button>
                  {bookingStatuses.map((status) => (
                    <button
                      disabled={pendingAction === `booking-${booking.id}-${status}`}
                      key={status}
                      onClick={() => updateBookingStatus(booking, status)}
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="support">
        <article className="admin-card admin-card-wide">
          <p className="admin-eyebrow">Gästesupport</p>
          <h2>Nachrichten aus dem Gästebereich</h2>
          <p>
            Hier landen Fragen und Probleme aus der Gäste-App. Jeder Fall bleibt mit
            der passenden Buchung oder Anfrage verbunden.
          </p>
          <div className="admin-list">
            {data.supportMessages.length ? (
              data.supportMessages.slice(0, 10).map((support) => (
                <article className="admin-list-item" key={support.id}>
                  <div>
                    <small>
                      {formatDate(support.created_at)} · {supportUrgencyLabel(support.urgency)}
                    </small>
                    <strong>{getSupportContactLabel(support)}</strong>
                    <em>
                      {getSupportLabel(support)} · {supportStatusLabel(support.status)}
                    </em>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      onClick={() => setSelection({ type: "support", id: support.id })}
                      type="button"
                    >
                      Details
                    </button>
                    {supportStatuses.map((status) => (
                      <button
                        disabled={pendingAction === `support-${support.id}-${status}`}
                        key={status}
                        onClick={() => updateSupportStatus(support, status)}
                        type="button"
                      >
                        {supportStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Supportnachrichten vorhanden.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-grid" id="bestand">
        <article className="admin-card">
          <p className="admin-eyebrow">Auszeiten</p>
          <h2>Angebote im System</h2>
          <div className="admin-list">
            {data.packages.map((packageItem) => (
              <span key={packageItem.id}>
                <strong>{packageItem.name || packageItem.id}</strong>
                <em>{packageItem.status || "ohne Status"}</em>
              </span>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <p className="admin-eyebrow">Objekte</p>
          <h2>Unterkünfte und Bestand</h2>
          <div className="admin-list">
            {data.properties.map((property) => (
              <span key={property.id}>
                <strong>{property.name || property.id}</strong>
                <em>{property.status || "ohne Status"}</em>
              </span>
            ))}
          </div>
        </article>
      </section>
      <AdminDetailDrawer
        booking={selectedBooking}
        communicationEvents={communicationEvents}
        isLoading={isDrawerLoading}
        message={drawerMessage}
        note={drawerNote}
        lead={selectedLead}
        onClose={() => setSelection(null)}
        onNoteChange={setDrawerNote}
        onSaveNote={saveDrawerNote}
        pending={Boolean(pendingAction?.startsWith("drawer-note"))}
        support={selectedSupport}
      />
    </main>
  );
}

function AdminDetailDrawer({
  booking,
  communicationEvents,
  isLoading,
  lead,
  message,
  note,
  onClose,
  onNoteChange,
  onSaveNote,
  pending,
  support,
}: {
  booking: BookingRow | null;
  communicationEvents: CommunicationEventRow[];
  isLoading: boolean;
  lead: LeadRow | null;
  message: string | null;
  note: string;
  onClose: () => void;
  onNoteChange: (value: string) => void;
  onSaveNote: () => void;
  pending: boolean;
  support: SupportRow | null;
}) {
  if (!lead && !booking && !support) return null;

  const title = lead
    ? getLeadLabel(lead)
    : booking
      ? getBookingLabel(booking)
      : getSupportContactLabel(support as SupportRow);
  const status = lead
    ? lead.status
    : booking
      ? `${booking.status} · ${booking.payment_status}`
      : `${getSupportLabel(support as SupportRow)} · ${supportStatusLabel((support as SupportRow).status)}`;
  const payload = lead?.payload ?? booking?.payload ?? support?.payload ?? {};
  const email = lead?.email || getPayloadText(payload, ["email"]);
  const phone = lead?.phone || getPayloadText(payload, ["phone"]);
  const packageName =
    getPayloadText(payload, ["packageName", "packageTitle", "stayName", "packageSlug"]) ||
    lead?.package_slug;
  const selectedDate = getPayloadText(payload, [
    "selectedDate",
    "dateLabel",
    "travelDate",
    "arrivalDate",
    "bookingDate",
  ]);
  const drawerType = lead ? "Anfrage" : booking ? "Buchung" : "Support";
  const supportMessage = support?.message || getPayloadText(payload, ["message", "note"]);
  const supportCategory = support?.category || getPayloadText(payload, ["category", "categoryLabel"]);

  return (
    <div className="admin-drawer-layer" role="presentation">
      <button className="admin-drawer-backdrop" onClick={onClose} type="button" />
      <aside className="admin-drawer" aria-label="Details">
        <header>
          <div>
            <p className="admin-eyebrow">{drawerType}</p>
            <h2>{title}</h2>
            <span>{status}</span>
          </div>
          <button aria-label="Details schließen" onClick={onClose} type="button">
            Schließen
          </button>
        </header>

        <section className="admin-drawer-grid">
          <article>
            <small>E-Mail</small>
            <strong>
              {email ? <a href={`mailto:${email}`}>{email}</a> : "nicht angegeben"}
            </strong>
          </article>
          <article>
            <small>Telefon</small>
            <strong>
              {phone ? <a href={`tel:${phone}`}>{phone}</a> : "nicht angegeben"}
            </strong>
          </article>
          <article>
            <small>{support ? "Kategorie" : "Auszeit"}</small>
            <strong>{support ? supportCategory || "Allgemein" : packageName || "nicht zugeordnet"}</strong>
          </article>
          <article>
            <small>{support ? "Dringlichkeit" : "Termin"}</small>
            <strong>{support ? supportUrgencyLabel(support.urgency) : selectedDate || "offen"}</strong>
          </article>
        </section>

        {supportMessage ? (
          <section className="admin-drawer-section">
            <p className="admin-eyebrow">Nachricht</p>
            <article className="admin-drawer-note-card">
              <p>{supportMessage}</p>
            </article>
          </section>
        ) : null}

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Interne Notiz</p>
          <textarea
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Gespräch, nächster Schritt oder wichtige Einschätzung festhalten."
            rows={5}
            value={note}
          />
          <button className="admin-button" disabled={pending} onClick={onSaveNote} type="button">
            {pending ? "Speichern" : "Notiz speichern"}
          </button>
          {message ? <p className="admin-drawer-message">{message}</p> : null}
        </section>

        <section className="admin-drawer-section">
          <p className="admin-eyebrow">Historie</p>
          {isLoading ? <p className="admin-drawer-message">Historie wird geladen.</p> : null}
          <div className="admin-timeline">
            {communicationEvents.length ? (
              communicationEvents.map((event) => (
                <article key={event.id}>
                  <small>{formatDate(event.created_at)}</small>
                  <strong>{event.subject || event.event_type}</strong>
                  <p>{event.body || `${event.channel} · ${event.direction}`}</p>
                </article>
              ))
            ) : (
              <p className="admin-drawer-message">Noch keine Historie vorhanden.</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
