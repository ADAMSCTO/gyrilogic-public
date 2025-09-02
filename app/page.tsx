"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type * as React from "react";

/**
 * API constant rule:
 * Build API from NEXT_PUBLIC_API_BASE or localStorage('dhll_api_base'),
 * then always use `API` (not API_BASE) in fetches.
 */
const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
  (typeof window !== "undefined" && window.localStorage.getItem("dhll_api_base")) ||
  "";
const API = (API_BASE || "").replace(/\/$/, "");

/** ---------- Ratings / Tone / Culture ---------- */
const RATING_LABELS = ["G (All ages)", "10+", "13+", "16+", "18+"] as const;
type RatingLabel = typeof RATING_LABELS[number];
const RATING_CODE: Record<RatingLabel, string> = {
  "G (All ages)": "G",
  "10+": "10+",
  "13+": "13+",
  "16+": "16+",
  "18+": "18+",
};
const RATING_ORDER: string[] = ["G", "10+", "13+", "16+", "18+"]; // for comparisons

const TONE_LABELS: { label: string; code: string }[] = [
  { label: "Friendly", code: "friendly" },
  { label: "Professional", code: "professional" },
  { label: "Poetic", code: "poetic" },
  { label: "Clear & Simple", code: "clear_simple" },
];

const CULTURE_LABELS: { label: string; code: string }[] = [
  { label: "Global Default", code: "global_default" },
  { label: "Latin American", code: "latam" },
  { label: "Middle Eastern", code: "mena" },
  { label: "East Asian", code: "easia" },
];

/** ---------- Parental Control (PIN) storage keys ---------- */
const PC_ENABLED_KEY = "dhll_parental_enabled";
const PC_PIN_SET_KEY = "dhll_parental_pin_set"; // boolean string
const PC_PIN_HASH_KEY = "dhll_parental_pin_hash";
const PC_MAX_RATING_KEY = "dhll_parental_max_rating"; // rating code (e.g., "13+")

/** Simple string hash (not security-grade; just to avoid plain text) */
function hash4(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return String(h);
}

/** Compare ratings by our fixed order */
function ratingLTE(aCode: string, bCode: string): boolean {
  return RATING_ORDER.indexOf(aCode) <= RATING_ORDER.indexOf(bCode);
}
/** Minimal normalize for /enhance response */
function normalizeEnhanceResponse(json: unknown): { output: string; duration_ms?: number } {
  const j = json as {
    output?: unknown;
    enriched?: unknown;
    result?: unknown;
    data?: { output?: unknown; enriched?: unknown };
    duration_ms?: unknown;
    meta?: { duration_ms?: unknown };
  } | null;

  const out =
    j?.output ??
    j?.enriched ??
    j?.result ??
    j?.data?.output ??
    j?.data?.enriched ??
    "";

  const durationRaw = (j?.duration_ms ?? j?.meta?.duration_ms) as unknown;
  const duration = typeof durationRaw === "number" ? durationRaw : undefined;

  return { output: String(out ?? ""), duration_ms: duration };
}

export default function Page() {
  // ---------- UI State ----------
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastDuration, setLastDuration] = useState<number | null>(null);

  // Options (collapsed by default)
  const [showOptions, setShowOptions] = useState(false);

  // Tone / Culture
  const [tone, setTone] = useState<string>(TONE_LABELS[0].code);
  const [culture, setCulture] = useState<string>(CULTURE_LABELS[0].code);

  // Age rating (default G)
  const [ratingLabel, setRatingLabel] = useState<RatingLabel>("G (All ages)");
  const ratingCode = RATING_CODE[ratingLabel];

  // Version info
  const [versionInfo, setVersionInfo] = useState<string>("");

  // ---------- Parental Control ----------
  const [pcEnabled, setPcEnabled] = useState<boolean>(true);
  const [pcMaxRatingCode, setPcMaxRatingCode] = useState<string>("G");
  const [, setPcPinSet] = useState<boolean>(false);

  // Load parental settings from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const en = window.localStorage.getItem(PC_ENABLED_KEY);
    const mx = window.localStorage.getItem(PC_MAX_RATING_KEY);
    const ps = window.localStorage.getItem(PC_PIN_SET_KEY);

    setPcEnabled(en ? en === "true" : true);
    setPcMaxRatingCode(mx || "G");
    setPcPinSet(ps ? ps === "true" : false);
  }, []);

  // Save parental settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PC_ENABLED_KEY, String(pcEnabled));
  }, [pcEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PC_MAX_RATING_KEY, pcMaxRatingCode);
  }, [pcMaxRatingCode]);

  // Version info
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!API) return; // no base -> skip
        const r = await fetch(`${API}/version`);
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        if (!cancelled) {
          const svc = j?.service ?? "dhll";
          const ver = j?.version ?? "";
          const sha = j?.sha ? ` · ${j.sha}` : "";
          setVersionInfo(`${svc} ${ver}${sha}`);
        }
      } catch {
        // non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setClipboard = useCallback(async (s: string) => {
    try {
      await navigator.clipboard.writeText(s);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, []);

  // === CONTINUES... (UI, buttons, enhance handler, watermark, footer)
  // Rating change with parental enforcement
  const handleRatingChange = useCallback(
    async (newLabel: RatingLabel) => {
      const newCode = RATING_CODE[newLabel];

      if (pcEnabled && !ratingLTE(newCode, pcMaxRatingCode)) {
        if (typeof window === "undefined") return;

        const pinSetFlag = window.localStorage.getItem(PC_PIN_SET_KEY) === "true";
        if (!pinSetFlag) {
          const pin1 = window.prompt("Set a parental control PIN (4 digits):") || "";
          if (!/^\d{4}$/.test(pin1)) {
            alert("PIN must be exactly 4 digits.");
            return;
          }
          const pin2 = window.prompt("Confirm the new PIN:") || "";
          if (pin1 !== pin2) {
            alert("PINs did not match. Rating unchanged.");
            return;
          }
          window.localStorage.setItem(PC_PIN_HASH_KEY, hash4(pin1));
          window.localStorage.setItem(PC_PIN_SET_KEY, "true");
          setPcPinSet(true);

          const maxIdx = RATING_ORDER.indexOf(newCode);
          const defaultMax = maxIdx >= 0 ? newCode : "G";
          setPcMaxRatingCode(defaultMax);
          window.localStorage.setItem(PC_MAX_RATING_KEY, defaultMax);

          alert(`Parental control enabled. Max rating set to ${defaultMax}.`);
          setRatingLabel(newLabel);
          return;
        } else {
          const pinTry = window.prompt("Enter parental control PIN to allow higher rating:") || "";
          const h = window.localStorage.getItem(PC_PIN_HASH_KEY) || "";
          if (hash4(pinTry) !== h) {
            alert("Incorrect PIN. Rating unchanged.");
            return;
          }
          const raise = window.confirm(
            `Allow "${newCode}" this time only?\n\nPress OK to allow once.\nPress Cancel to also raise the maximum cap to this level permanently.`
          );
          if (raise) {
            setRatingLabel(newLabel);
            return;
          } else {
            setPcMaxRatingCode(newCode);
            window.localStorage.setItem(PC_MAX_RATING_KEY, newCode);
            setRatingLabel(newLabel);
            return;
          }
        }
      } else {
        setRatingLabel(newLabel);
      }
    },
    [pcEnabled, pcMaxRatingCode]
  );

  const handleParentalToggle = useCallback(() => {
    if (!pcEnabled) {
      setPcEnabled(true);
      return;
    }
    if (typeof window === "undefined") return;
    const pinSetFlag = window.localStorage.getItem(PC_PIN_SET_KEY) === "true";
    if (pinSetFlag) {
      const pinTry = window.prompt("Enter parental control PIN to disable:") || "";
      const h = window.localStorage.getItem(PC_PIN_HASH_KEY) || "";
      if (hash4(pinTry) !== h) {
        alert("Incorrect PIN. Parental control remains enabled.");
        return;
      }
    }
    setPcEnabled(false);
  }, [pcEnabled]);

  const handleSetParentalMax = useCallback(() => {
    if (typeof window === "undefined") return;
    const pinSetFlag = window.localStorage.getItem(PC_PIN_SET_KEY) === "true";
    if (!pinSetFlag) {
      alert("Set a parental PIN first by raising the rating beyond the cap once.");
      return;
    }
    const pinTry = window.prompt("Enter parental control PIN to change maximum rating:") || "";
    const h = window.localStorage.getItem(PC_PIN_HASH_KEY) || "";
    if (hash4(pinTry) !== h) {
      alert("Incorrect PIN.");
      return;
    }
    const currentIdx = RATING_ORDER.indexOf(pcMaxRatingCode);
    const choices = RATING_ORDER.map((c, i) => `${i === currentIdx ? "• " : "  "}${c}`).join("\n");
    const newCap = window.prompt(
      `Set new maximum allowed rating (type exactly):\n${choices}`,
      pcMaxRatingCode
    ) || pcMaxRatingCode;
    if (!RATING_ORDER.includes(newCap)) {
      alert("Invalid rating code.");
      return;
    }
    setPcMaxRatingCode(newCap);
    window.localStorage.setItem(PC_MAX_RATING_KEY, newCap);
    if (!ratingLTE(RATING_CODE[ratingLabel], newCap)) {
      const idx = RATING_ORDER.indexOf(newCap);
      const lowered = (Object.keys(RATING_CODE) as RatingLabel[]).find(
        (lbl) => RATING_CODE[lbl] === RATING_ORDER[idx]
      );
      if (lowered) setRatingLabel(lowered);
    }
  }, [pcMaxRatingCode, ratingLabel]);

  // Enforce UI cap visually
  const ratingDisabled = useMemo(() => {
    const disabled: Record<RatingLabel, boolean> = {
      "G (All ages)": false,
      "10+": false,
      "13+": false,
      "16+": false,
      "18+": false,
    };
    if (!pcEnabled) return disabled;
    for (const lbl of RATING_LABELS) {
      const code = RATING_CODE[lbl];
      disabled[lbl] = !ratingLTE(code, pcMaxRatingCode);
    }
    return disabled;
  }, [pcEnabled, pcMaxRatingCode]);

  // Enhance handler
  const onEnhance = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    setOutput("");
    setLastDuration(null);
    try {
      const body = {
        text,
        mode: "advisory",
        context: {
          hints: {
            age_rating: ratingCode,
          },
          tone,
          culture,
        },
      };
      const r = await fetch(`${API}/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const { output: out, duration_ms } = normalizeEnhanceResponse(j);
      setOutput(out || "");
      if (duration_ms != null) setLastDuration(duration_ms);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [text, ratingCode, tone, culture]);

  const canRun = text.trim().length > 0 && !loading;

  const examples = [
    { label: "Wedding toast", text: "Please help me write a short, heartfelt wedding toast for my best friend." },
    { label: "Job application email", text: "Draft a brief, professional email to apply for a research assistant role." },
    { label: "Product tagline", text: "Create 5 concise taglines for a sustainable bamboo toothbrush brand." },
    { label: "Blog intro", text: "Write a friendly introduction for a blog post about mindful productivity." },
    { label: "Résumé bullet", text: "Rewrite this: Led team; finished project. Make it strong and quantified." },
    { label: "Meeting summary", text: "Summarize this 30-minute design review into 5 action items and owners." },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="w-full border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold">Gyrilogic</div>
          <div className="text-xs opacity-70">
            {versionInfo ? `Powered by ${versionInfo}` : "Powered by DHLL"}
            {lastDuration != null ? ` · Response in ${lastDuration}ms` : ""}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Input */}
        <div className="bg-white rounded-2xl shadow p-5 border">
          <label htmlFor="dhll-input" className="block text-sm font-medium mb-2">
            Enter your text or idea
          </label>
          <textarea
            id="dhll-input"
            className="w-full min-h-[140px] rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type or paste here…"
            value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setText(ex.text)}
                className="text-xs rounded-full border px-3 py-1 hover:bg-neutral-50"
                type="button"
                title={`Use example: ${ex.label}`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              id="enhance-btn"
              disabled={!canRun}
              onClick={onEnhance}
              className={`rounded-xl px-5 py-2 text-white ${canRun ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"}`}
            >
              {loading ? "Enhancing…" : "Enhance"}
            </button>
            <button
              type="button"
              onClick={() => {
                setText("");
                setOutput("");
                setErrorMsg(null);
                setLastDuration(null);
              }}
              className="rounded-xl border px-4 py-2 hover:bg-neutral-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowOptions((s) => !s)}
              className="ml-auto rounded-xl border px-4 py-2 hover:bg-neutral-50"
              aria-expanded={showOptions}
            >
              {showOptions ? "Hide options" : "Show options"}
            </button>
          </div>
        </div>

        {/* Options */}
        {showOptions && (
          <div className="bg-white rounded-2xl shadow p-5 border mt-4">
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Tone */}
              <div>
                <div className="text-sm font-medium mb-1">Tone</div>
                <select
                  className="w-full rounded-xl border px-3 py-2"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {TONE_LABELS.map((t) => (
                    <option key={t.code} value={t.code}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Culture */}
              <div>
                <div className="text-sm font-medium mb-1">Cultural context</div>
                <select
                  className="w-full rounded-xl border px-3 py-2"
                  value={culture}
                  onChange={(e) => setCulture(e.target.value)}
                >
                  {CULTURE_LABELS.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Age Rating */}
              <div>
                <div className="text-sm font-medium mb-1">Age rating</div>
                <select
                  className="w-full rounded-xl border px-3 py-2"
                  value={ratingLabel}
                  onChange={(e) => handleRatingChange(e.target.value as RatingLabel)}
                >
                  {RATING_LABELS.map((lbl) => (
                    <option
                      key={lbl}
                      value={lbl}
                      disabled={ratingDisabled[lbl]}
                    >
                      {lbl} {ratingDisabled[lbl] ? "(locked)" : ""}
                    </option>
                  ))}
                </select>
                <div className="text-xs mt-1 opacity-70">
                  Constrain content to the selected rating.
                </div>
              </div>
            </div>

            {/* Parental Controls */}
            <div className="mt-4 rounded-xl border p-3 bg-neutral-50">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pcEnabled}
                    onChange={handleParentalToggle}
                  />
                  <span className="text-sm font-medium">Parental control</span>
                </label>
                <span className="text-xs opacity-70">
                  {pcEnabled
                    ? `Enabled — max rating: ${pcMaxRatingCode}`
                    : "Disabled"}
                </span>
                <button
                  type="button"
                  onClick={handleSetParentalMax}
                  className="ml-auto rounded-lg border px-3 py-1.5 text-sm hover:bg-white"
                >
                  Set maximum rating
                </button>
              </div>
              <div className="text-xs opacity-70 mt-1">
                Tip: The first time you raise the rating beyond the cap, you’ll be asked to set a 4-digit PIN.
              </div>
            </div>
          </div>
        )}

        {/* Output */}
        <div className="bg-white rounded-2xl shadow p-5 border mt-4 relative">
          {/* Watermark when empty */}
          {!output && !loading && !errorMsg && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="opacity-40 text-sm italic select-none">
                applied Default Human Logic Layer result.
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="text-sm font-medium">Result</div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setClipboard(output)}
                disabled={!output}
                className={`rounded-xl border px-3 py-1.5 text-sm ${output ? "hover:bg-neutral-50" : "opacity-50 cursor-not-allowed"}`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="min-h-[180px] whitespace-pre-wrap">
            {errorMsg ? (
              <div className="text-red-600 text-sm">{errorMsg}</div>
            ) : loading ? (
              <div className="text-sm opacity-70">Working…</div>
            ) : (
              output
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-4xl px-4 py-6 text-xs opacity-70">
        <div className="flex flex-wrap items-center gap-2">
          <span>For general audiences. Safety first.</span>
          <span className="ml-auto">
            {versionInfo ? `Powered by ${versionInfo}` : "Powered by DHLL"}
          </span>
        </div>
      </footer>
    </div>
  );
}
