// LoginPage.jsx
// Faqja e hyrjes — lidhet me Supabase Auth dhe përcakton client_id automatikisht
// pas login-it, duke lexuar profilin e përdoruesit nga tabela "profiles".
//
// Kërkon: import { supabase } from "../lib/supabaseClient" (ose rrugën tënde reale)

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom"; // ose next/navigation nëse përdor Next.js

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Autentikimi bazë me Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ose fjalëkalim i pasaktë.");
      setLoading(false);
      return;
    }

    // 2. Merr profilin e përdoruesit (client_id, department) — kjo është
    //    momenti kur zbulohet automatikisht klubi i tij, pa zgjedhje manuale
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("client_id, department, full_name")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      setError("Llogaria s'ka profil të lidhur. Kontakto administratorin.");
      setLoading(false);
      return;
    }

    // 3. Nëse klienti (klubi) është i bllokuar, ndalo hyrjen këtu
    if (profile.client_id) {
      const { data: client } = await supabase
        .from("clients")
        .select("status")
        .eq("id", profile.client_id)
        .single();

      if (client?.status === "blocked") {
        setError("Abonimi i klubit ka skaduar. Kontakto administratorin për rinovim.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
    }

    // 4. Ruaj department + client_id lokalisht për ta përdorur në sidebar/routing
    //    (ose menaxhoji me Context/Zustand nëse platforma jote e ka tashmë)
    localStorage.setItem("mani_department", profile.department);
    if (profile.client_id) localStorage.setItem("mani_client_id", profile.client_id);

    setLoading(false);
    navigate("/dashboard"); // përshtat me rrugën reale të panelit
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Fjalëkalimi"
        required
      />
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Duke u kyçur..." : "Hyr në Platformë"}
      </button>
    </form>
  );
}

// SHËNIM: Stilizimin (CSS/Tailwind) mund ta marrësh nga demo-ja vizuale
// (mani-club-login-demo.jsx) dhe ta ngjisësh mbi këtë strukturë funksionale.
