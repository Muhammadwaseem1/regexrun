"use client";

interface Row {
  token: string;
  meaning: string;
}

const groups: { title: string; rows: Row[] }[] = [
  {
    title: "character classes",
    rows: [
      { token: ".", meaning: "any char (except newline, unless /s)" },
      { token: "\\w", meaning: "word char [A-Za-z0-9_]" },
      { token: "\\W", meaning: "non-word char" },
      { token: "\\d", meaning: "digit [0-9]" },
      { token: "\\D", meaning: "non-digit" },
      { token: "\\s", meaning: "whitespace (space, tab, newline)" },
      { token: "\\S", meaning: "non-whitespace" },
      { token: "[abc]", meaning: "any of a, b, or c" },
      { token: "[^abc]", meaning: "anything except a, b, c" },
      { token: "[a-z]", meaning: "range a through z" },
    ],
  },
  {
    title: "quantifiers",
    rows: [
      { token: "*", meaning: "0 or more" },
      { token: "+", meaning: "1 or more" },
      { token: "?", meaning: "0 or 1 (optional)" },
      { token: "{n}", meaning: "exactly n" },
      { token: "{n,}", meaning: "n or more" },
      { token: "{n,m}", meaning: "between n and m" },
      { token: "*?", meaning: "lazy 0+ (smallest match)" },
      { token: "+?", meaning: "lazy 1+" },
    ],
  },
  {
    title: "anchors & groups",
    rows: [
      { token: "^", meaning: "start of string (or line in /m)" },
      { token: "$", meaning: "end of string (or line in /m)" },
      { token: "\\b", meaning: "word boundary" },
      { token: "\\B", meaning: "non-word boundary" },
      { token: "(...)", meaning: "capture group" },
      { token: "(?:...)", meaning: "non-capturing group" },
      { token: "(?<name>...)", meaning: "named capture" },
      { token: "(?=...)", meaning: "lookahead" },
      { token: "(?!...)", meaning: "negative lookahead" },
      { token: "(?<=...)", meaning: "lookbehind" },
      { token: "(?<!...)", meaning: "negative lookbehind" },
    ],
  },
  {
    title: "in replacement",
    rows: [
      { token: "$&", meaning: "the whole match" },
      { token: "$1, $2, …", meaning: "capture group n" },
      { token: "$<name>", meaning: "named capture" },
      { token: "$`", meaning: "text before match" },
      { token: "$'", meaning: "text after match" },
      { token: "$$", meaning: "a literal $" },
    ],
  },
];

export default function CheatSheet() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="text-xs uppercase tracking-wider text-muted mb-2">{g.title}</div>
          <ul className="space-y-1.5">
            {g.rows.map((r) => (
              <li key={r.token} className="flex gap-3 text-sm leading-snug">
                <code className="font-mono text-accent2 shrink-0 min-w-[70px]">{r.token}</code>
                <span className="text-ink/80">{r.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
