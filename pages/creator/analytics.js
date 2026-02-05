// pages/creator/analytics.js

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CreatorAnalytics() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    if (!user) return;

    loadAnalytics();

    const channel = supabase
      .channel("creator-analytics-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "public_donations",
        },
        loadAnalytics
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  /* ---------------- LOAD DATA ---------------- */
  async function loadAnalytics() {
    if (!user) return;

    setLoading(true);

    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", user.id);

    const { data: donationData } = await supabase
      .from("public_donations")
      .select("*, projects!inner(owner_id, title)")
      .eq("projects.owner_id", user.id);

    setProjects(projectData || []);
    setDonations(donationData || []);
    setLoading(false);
  }

  /* ---------------- METRICS ---------------- */

  const totalEarnings = useMemo(
    () => donations.reduce((s, d) => s + d.amount, 0),
    [donations]
  );

  const earningsByDate = useMemo(() => {
    return Object.values(
      donations.reduce((acc, d) => {
        const date = new Date(d.created_at).toLocaleDateString();

        acc[date] = acc[date] || { date, amount: 0 };
        acc[date].amount += d.amount;

        return acc;
      }, {})
    );
  }, [donations]);

  const fundingByProject = useMemo(() => {
    return projects.map((p) => ({
      name: p.title,
      amount: p.pledged || 0,
    }));
  }, [projects]);

  const donorsByProject = useMemo(() => {
    return Object.values(
      donations.reduce((acc, d) => {
        const title = d.projects?.title || "Unknown";

        acc[title] = acc[title] || { name: title, donors: 0 };
        acc[title].donors += 1;

        return acc;
      }, {})
    );
  }, [donations]);

  const topProject = useMemo(() => {
    if (!fundingByProject.length) return "—";

    return [...fundingByProject].sort((a, b) => b.amount - a.amount)[0].name;
  }, [fundingByProject]);

  /* ---------------- PREMIUM PDF EXPORT ---------------- */

  async function exportPDF() {
    try {
      const res = await fetch("/api/export-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalEarnings,
          totalDonations: donations.length,
          projectCount: projects.length,
          topProject,
          earningsByDate,
          fundingByProject,
          donorsByProject,
        }),
      });

      if (!res.ok) throw new Error("PDF failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "fundora-premium-report.pdf";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF export failed");
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto p-6 space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">
            Creator Analytics 📊
          </h1>

          <button
            onClick={exportPDF}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white text-sm"
          >
            Export Premium Report
          </button>
        </div>

        {loading && (
          <p className="text-slate-400">Loading analytics...</p>
        )}

        {!loading && (
          <>
            {/* SUMMARY */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat title="Total Earnings" value={`₹${totalEarnings}`} />
              <Stat title="Total Donations" value={donations.length} />
              <Stat title="Projects" value={projects.length} />
              <Stat title="Top Project" value={topProject} />
            </div>

            {/* EARNINGS OVER TIME */}
            <ChartBox title="Earnings Over Time">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsByDate}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            {/* FUNDING BY PROJECT */}
            <ChartBox title="Funding by Project">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fundingByProject}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            {/* DONORS BY PROJECT */}
            <ChartBox title="Donors per Project">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={donorsByProject}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="donors" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function Stat({ title, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
