"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, type Preset } from "./presets";
import CheatSheet from "./CheatSheet";

type Flag = "g" | "i" | "m" | "s" | "u" | "y";
const ALL_FLAGS: Flag[] = ["g", "i", "m", "s", "u", "y"];

type Mode = "match" | "replace" | "split";

const DEFAULT_PATTERN = "\\b(\\w+)@(\\w+\\.\\w+)\\b";
const DEFAULT_TEST = `regexrun is a quiet little playground.

Drop in some text and a pattern.
Try emails like jane.doe@example.com or hi@regexrun.dev.
Or numbers: 415-867-5309, +44 20 7946 0958.
Visit https://regexrun.dev or http://example.org/path?x=1.

You can use capture groups, lookaheads, and the usual flags.
g = global, i = ignore case, m = multiline, s = dotall.`;

interface Match {
  index: number;
  end: number;
  text: string;
  groups: string[];
  named: Record<string, string>;
}

function safeBuild(pattern: string, flags: string): { re: RegExp | null; error: string | null } {
  if (!pattern) return { re: null, error: null };
  try {
    return { re: new RegExp(pattern, flags), error: null };
  } catch (e) {
    return { re: null, error: (e as Error).message };
  }
}

function findMatches(re: RegExp | null, text: string): Match[] {
  if (!re || !text) return [];
  const out: Match[] = [];
  // Force global iteration regardless of original flags so we always find all matches
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  let g: RegExp;
  try {
    g = new RegExp(re.source, flags);
  } catch {
    return [];
  }
  let m: RegExpExecArray | null;
  let safety = 0;
  while ((m = g.exec(text)) !== null) {
    safety++;
    if (safety > 50000) break;
    const groups = m.slice(1).map((x) => (x === undefined ? "" : String(x)));
    const named: Record<string, string> = {};
    if (m.groups) {
      for (const k of Object.keys(m.groups)) named[k] = m.groups[k] ?? "";
    }
    out.push({
      index: m.index,
      end: m.index + m[0].length,
      text: m[0],
      groups,
      named,
    });
    // Avoid infinite loop on zero-length matches
    if (m.index === g.lastIndex) g.lastIndex++;
  }
  return out;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlight(text: string, matches: Match[]): string {
  if (!matches.length) return escapeHtml(text);
  const parts: string[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.index < cursor) return; // overlap guard
    parts.push(escapeHtml(text.slice(cursor, m.index)));
    const cls = i % 2 === 0 ? "match" : "match match-alt";
    parts.push(`<mark class="${cls}" data-i="${i}">${escapeHtml(m.text)}</mark>`);
    cursor = m.end;
  });
  parts.push(escapeHtml(text.slice(cursor)));
  return parts.join("");
}

function applyReplace(re: RegExp | null, text: string, replacement: string): string {
  if (!re) return text;
  try {
    const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
    const g = new RegExp(re.source, flags);
    return text.replace(g, replacement);
  } catch {
    return text;
  }
}

function applySplit(re: RegExp | null, text: string): string[] {
  if (!re) return [text];
  try {
    return text.split(re);
  } catch {
    return [text];
  }
}

function timeAgo(ms: number) {
  if (ms < 1) return "<1 ms";
  if (ms < 10) return ms.toFixed(2) + " ms";
  return Math.round(ms) + " ms";
}

export default function RegexPlayground() {
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [flags, setFlags] = useState<Set<Flag>>(new Set<Flag>(["g"]));
  const [test, setTest] = useState(DEFAULT_TEST);
  const [mode, setMode] = useState<Mode>("match");
  const [replacement, setReplacement] = useState("$1 [at] $2");
  const [copied, setCopied] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [openSheet, setOpenSheet] = useState(false);

  // Hydrate from URL hash on mount (utf8-safe base64)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash;
    if (!h || h.length < 2) return;
    try {
      const raw = atob(decodeURIComponent(h.slice(1)));
      const json = decodeURIComponent(
        raw
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(json);
      if (typeof decoded.p === "string") setPattern(decoded.p);
      if (Array.isArray(decoded.f))
        setFlags(new Set(decoded.f.filter((x: string) => ALL_FLAGS.includes(x as Flag))));
      if (typeof decoded.t === "string") setTest(decoded.t);
      if (decoded.m === "match" || decoded.m === "replace" || decoded.m === "split")
        setMode(decoded.m);
      if (typeof decoded.r === "string") setReplacement(decoded.r);
    } catch {
      /* ignore */
    }
  }, []);

  const flagsStr = useMemo(() => Array.from(flags).join(""), [flags]);
  const built = useMemo(() => safeBuild(pattern, flagsStr), [pattern, flagsStr]);

  const { matches, elapsed } = useMemo(() => {
    const t0 = performance.now();
    const ms = findMatches(built.re, test);
    return { matches: ms, elapsed: performance.now() - t0 };
  }, [built.re, test]);

  const replaced = useMemo(
    () => (mode === "replace" ? applyReplace(built.re, test, replacement) : ""),
    [built.re, test, replacement, mode]
  );
  const splitParts = useMemo(
    () => (mode === "split" ? applySplit(built.re, test) : []),
    [built.re, test, mode]
  );

  const highlighted = useMemo(() => highlight(test, matches), [test, matches]);

  function toggleFlag(f: Flag) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  function loadPreset(p: Preset) {
    setPattern(p.pattern);
    setFlags(new Set(p.flags as Flag[]));
    if (p.sample) setTest(p.sample);
    setMode("match");
  }

  function copy(label: string, value: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 1100);
    });
  }

  function shareLink() {
    if (typeof window === "undefined") return "";
    const payload = {
      p: pattern,
      f: Array.from(flags),
      t: test,
      m: mode,
      r: replacement,
    };
    // utf8-safe base64
    const utf8 = encodeURIComponent(JSON.stringify(payload)).replace(
      /%([0-9A-F]{2})/g,
      (_, hex) => String.fromCharCode(parseInt(hex, 16))
    );
    const hash = encodeURIComponent(btoa(utf8));
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    return url;
  }

  const literal = `/${pattern || ""}/${flagsStr}`;
  const jsString = `new RegExp(${JSON.stringify(pattern || "")}, ${JSON.stringify(flagsStr)})`;
  const pyString = `re.compile(r"""${pattern.replace(/"""/g, '\\"\\"\\"')}""")`;

  return (
    <main className="min-h-screen">
      <div className="headerglow">
        <header className="max-w-6xl mx-auto px-5 pt-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent2 grid place-items-center text-white font-mono font-bold shadow-glow">
              {"/.*/"}
            </div>
            <div>
              <h1 className="text-xl tracking-tight font-semibold">regexrun</h1>
              <p className="text-xs text-muted -mt-0.5">a quiet little regex playground</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn"
              onClick={() => copy("share", shareLink())}
              title="Copy a sharable link with your current pattern + text"
            >
              {copied === "share" ? "link copied" : "share"}
            </button>
            <a
              className="btn"
              href="https://github.com/Muhammadwaseem1/regexrun"
              target="_blank"
              rel="noreferrer"
            >
              github
            </a>
          </div>
        </header>
      </div>

      <section className="max-w-6xl mx-auto px-5 pb-20 space-y-5">
        {/* Pattern row */}
        <div className="card p-4 fade-in">
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <span>pattern</span>
            <span className="text-muted/60">{built.error ? " · invalid" : ` · ${matches.length} match${matches.length === 1 ? "" : "es"} · ${timeAgo(elapsed)}`}</span>
            <span className="ml-auto flex items-center gap-1">
              <button className="chip" onClick={() => copy("literal", literal)}>{copied === "literal" ? "copied" : "/.../" }</button>
              <button className="chip" onClick={() => copy("js", jsString)}>{copied === "js" ? "copied" : "JS"}</button>
              <button className="chip" onClick={() => copy("py", pyString)}>{copied === "py" ? "copied" : "Py"}</button>
            </span>
          </div>
          <div className="flex items-stretch gap-2">
            <span className="grid place-items-center px-2 text-muted font-mono">/</span>
            <input
              spellCheck={false}
              className="field flex-1"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="enter a regular expression…"
            />
            <span className="grid place-items-center px-2 text-muted font-mono">/</span>
            <div className="flex items-center gap-1">
              {ALL_FLAGS.map((f) => (
                <button
                  key={f}
                  className={`chip ${flags.has(f) ? "active" : ""}`}
                  onClick={() => toggleFlag(f)}
                  title={
                    f === "g"
                      ? "global — find all matches"
                      : f === "i"
                      ? "case-insensitive"
                      : f === "m"
                      ? "multiline — ^ and $ match line breaks"
                      : f === "s"
                      ? "dotall — . matches newlines"
                      : f === "u"
                      ? "unicode"
                      : "sticky"
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {built.error && (
            <div className="mt-3 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 font-mono">
              {built.error}
            </div>
          )}
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-1 px-1">
          {(["match", "replace", "split"] as Mode[]).map((m) => (
            <button
              key={m}
              className={`tab ${mode === m ? "active" : ""}`}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Test text + live highlight */}
          <div className="lg:col-span-3 card p-4 fade-in">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted">test text</div>
              <div className="flex items-center gap-1">
                <button className="chip" onClick={() => setTest("")}>clear</button>
                <button className="chip" onClick={() => copy("test", test)}>{copied === "test" ? "copied" : "copy"}</button>
              </div>
            </div>
            <div className="relative">
              <textarea
                spellCheck={false}
                className="field min-h-[260px] resize-y leading-6"
                value={test}
                onChange={(e) => setTest(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted mt-3 mb-1">live preview</div>
            <pre
              className="code leading-6 max-h-[280px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: highlighted || `<span class="text-muted">no text&nbsp;<span class="caret">▍</span></span>` }}
            />
          </div>

          {/* Right-hand panel — varies by mode */}
          <div className="lg:col-span-2 space-y-5">
            {mode === "match" && (
              <div className="card p-4 fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted">matches</div>
                  <div className="text-xs text-muted">{matches.length}</div>
                </div>
                {matches.length === 0 ? (
                  <div className="text-sm text-muted py-6 text-center">
                    no matches yet — try a different pattern
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-[560px] overflow-auto pr-1">
                    {matches.slice(0, 200).map((m, i) => (
                      <li
                        key={i}
                        className={`card-2 p-3 transition-all ${hoverIdx === i ? "ring-1 ring-accent/50" : ""}`}
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                      >
                        <div className="flex items-center justify-between text-[11px] text-muted mb-1">
                          <span>match {i + 1}</span>
                          <span>
                            [{m.index}, {m.end})
                          </span>
                        </div>
                        <div className="font-mono text-sm break-all text-ink">{m.text || <span className="italic text-muted">(empty)</span>}</div>
                        {m.groups.length > 0 && (
                          <div className="mt-2 grid grid-cols-1 gap-1">
                            {m.groups.map((g, gi) => (
                              <div key={gi} className="flex items-center gap-2 text-xs">
                                <span className="text-muted w-10 shrink-0">${gi + 1}</span>
                                <span className="font-mono break-all text-ink/90">{g || <span className="italic text-muted">(empty)</span>}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {Object.keys(m.named).length > 0 && (
                          <div className="mt-2 grid grid-cols-1 gap-1">
                            {Object.entries(m.named).map(([k, v]) => (
                              <div key={k} className="flex items-center gap-2 text-xs">
                                <span className="text-accent2 w-20 shrink-0 truncate">?&lt;{k}&gt;</span>
                                <span className="font-mono break-all text-ink/90">{v || <span className="italic text-muted">(empty)</span>}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                    {matches.length > 200 && (
                      <li className="text-xs text-muted text-center py-2">
                        showing first 200 of {matches.length} matches
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

            {mode === "replace" && (
              <div className="card p-4 fade-in">
                <div className="text-xs text-muted mb-2">replacement</div>
                <input
                  spellCheck={false}
                  className="field"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="$1, $2 reference capture groups"
                />
                <div className="flex items-center justify-between text-xs text-muted mt-4 mb-1">
                  <span>result</span>
                  <button className="chip" onClick={() => copy("replaced", replaced)}>
                    {copied === "replaced" ? "copied" : "copy"}
                  </button>
                </div>
                <pre className="code leading-6 max-h-[420px] overflow-auto whitespace-pre-wrap">{replaced || " "}</pre>
              </div>
            )}

            {mode === "split" && (
              <div className="card p-4 fade-in">
                <div className="flex items-center justify-between text-xs text-muted mb-2">
                  <span>parts</span>
                  <span>{splitParts.length}</span>
                </div>
                <ul className="space-y-1 max-h-[520px] overflow-auto">
                  {splitParts.map((p, i) => (
                    <li key={i} className="card-2 px-3 py-2 text-sm font-mono break-all">
                      <span className="text-muted text-xs mr-2">[{i}]</span>
                      {p === "" ? <span className="italic text-muted">(empty)</span> : p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Presets */}
            <div className="card p-4 fade-in">
              <div className="text-xs text-muted mb-2">presets</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    className="chip"
                    onClick={() => loadPreset(p)}
                    title={p.description}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cheat sheet */}
        <div className="card overflow-hidden">
          <button
            className="w-full px-4 py-3 flex items-center justify-between text-sm"
            onClick={() => setOpenSheet((x) => !x)}
          >
            <span className="text-ink/90">cheat sheet</span>
            <span className="text-xs text-muted">{openSheet ? "hide" : "show"}</span>
          </button>
          {openSheet && (
            <div className="border-t border-border px-4 py-4 fade-in">
              <CheatSheet />
            </div>
          )}
        </div>

        <footer className="text-center text-xs text-muted pt-2">
          built for late saturday-night debugging · everything runs in your browser
        </footer>
      </section>
    </main>
  );
}
