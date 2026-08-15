// LicenseBanner.jsx
// Banner fiksuar lart që lexon statusin real të abonimit nga tabela "clients"
// Vendose te layout-i kryesor (App.jsx / RootLayout), jashtë çdo faqeje specifike,
// që të shfaqet gjithmonë, pavarësisht se ku ndodhet përdoruesi në platformë.

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LicenseBanner() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    async function loadClient() {
      const clientId = localStorage.getItem("mani_client_id");
      if (!clientId) return; // super_admin s'ka client_id — banner nuk shfaqet

      const { data } = await supabase
        .from("clients")
        .select("name, status, plan, subscription_expires_at")
        .eq("id", clientId)
        .single();

      setClient(data);
    }
    loadClient();
  }, []);

  if (!client) return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(client.subscription_expires_at) - new Date()) / 86400000)
  );
  const isLow = daysLeft <= 7;
  const isBlocked = client.status === "blocked";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
        color: "#fff",
        background: isBlocked ? "#7c2d12" : "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: client.status === "active" ? "#10b981" : "#ef4444",
            }}
          />
          <strong>{client.name}</strong>
          <span
            style={{
              fontSize: "13px",
              padding: "2px 8px",
              borderRadius: "6px",
              background: client.status === "active" ? "#10b98122" : "#ef444422",
              color: client.status === "active" ? "#34d399" : "#f87171",
            }}
          >
            {client.status === "active" ? "Aktiv" : "I bllokuar"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontFamily: "monospace", color: isLow ? "#fdba74" : "#94a3b8" }}>
            {daysLeft} ditë të mbetura
          </span>
          <a
            href="/billing"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: "6px",
              background: "#3b82f6",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Menaxho Planin
          </a>
        </div>
      </div>

      {/* Overlay bllokues — mbulon gjithë aplikacionin nëse abonimi ka skaduar */}
      {isBlocked && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.92)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            color: "#fff",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Abonimi ka skaduar</h2>
          <p style={{ color: "#94a3b8", maxWidth: "360px" }}>
            Platforma është bllokuar për {client.name}. Rinovo planin për të vazhduar aksesin.
          </p>
          <a
            href="/billing"
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#3b82f6",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Paguaj Tani
          </a>
        </div>
      )}
    </div>
  );
}
