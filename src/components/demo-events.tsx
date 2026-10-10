"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { StoredDemoEvent } from "@/lib/server/demo-repositories";

type EventResponse = { events?: StoredDemoEvent[]; storage?: string; error?: string };

export function DemoEventsPage() {
  const [events, setEvents] = useState<StoredDemoEvent[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/demo/events", { cache: "no-store" });
      const result = await response.json() as EventResponse;
      if (!response.ok) throw new Error(result.error ?? "Impossible de charger les événements.");
      setEvents(result.events ?? []);
      setStatus(`Stockage temporaire en mémoire · ${result.events?.length ?? 0} événement(s)`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Impossible de charger les événements.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function clearEvents() {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/demo/events", { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Impossible de vider les événements.");
      setEvents([]);
      setStatus("Les événements temporaires de cette instance ont été supprimés.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Impossible de vider les événements.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="page-width section-page">
    <div className="breadcrumb"><Link href="/">Accueil</Link> / Inspection de la démo</div>
    <div className="demo-events-heading"><div><span className="eyebrow">OUTIL DE DÉVELOPPEMENT</span><h1>Événements de démonstration</h1><p>Événements front et serveur collectés temporairement sur cette instance.</p></div><div><button className="button button-secondary" onClick={() => void refresh()} disabled={busy}>Actualiser</button> <button className="button button-primary" onClick={() => void clearEvents()} disabled={busy || events.length === 0}>Vider la liste</button></div></div>
    <p className="demo-events-status" role="status">{busy ? "Chargement…" : status}</p>
    {events.length === 0 ? <div className="empty-state"><h2>Aucun événement pour le moment</h2><p>Consultez le catalogue ou recherchez un produit pour générer les événements de démo.</p><Link className="button button-primary" href="/categories">Parcourir le catalogue</Link></div> : <div className="demo-event-list">{events.map((record) => <article className="demo-event-card" key={record.id}><header><strong>{record.event.type}</strong><time dateTime={record.receivedAt}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(record.receivedAt))}</time><span>Envoi externe : {record.externalDelivery}</span></header><pre>{JSON.stringify(record.event, null, 2)}</pre></article>)}</div>}
    <p className="demo-disclaimer"><strong>À savoir :</strong> ce stockage est volatil et limité au processus serveur. Les événements sont automatiquement bornés, les e-mails/téléphones détectés sont masqués et aucun Adobe SDK n’est configuré.</p>
  </div>;
}
