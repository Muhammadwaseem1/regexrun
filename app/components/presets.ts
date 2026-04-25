export interface Preset {
  name: string;
  description: string;
  pattern: string;
  flags: string[];
  sample?: string;
}

export const PRESETS: Preset[] = [
  {
    name: "email",
    description: "Common email address",
    pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+",
    flags: ["g", "i"],
    sample:
      "Contact: jane.doe@example.com or hi+test@regexrun.dev. Junk: not-an@-email and root@localhost.",
  },
  {
    name: "url",
    description: "http(s) URL",
    pattern: "https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#\\[\\]@!$&'()*+,;=.]+",
    flags: ["g", "i"],
    sample:
      "Try https://regexrun.dev, http://example.org/path?x=1, and an invalid one: htps://nope.",
  },
  {
    name: "ipv4",
    description: "IPv4 address (rough)",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    flags: ["g"],
    sample: "Servers: 10.0.0.1, 192.168.1.42, 8.8.8.8 and the bogus one 999.0.0.1.",
  },
  {
    name: "phone",
    description: "Loose phone number (US/intl)",
    pattern: "\\+?\\d[\\d\\s\\-().]{7,}\\d",
    flags: ["g"],
    sample: "Call 415-867-5309, +44 20 7946 0958, or (212) 555 1212.",
  },
  {
    name: "hex color",
    description: "3- or 6-digit hex color",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    flags: ["g"],
    sample: "Palette: #fff, #0f1117, #6c63ff, not-a-color: #zzz",
  },
  {
    name: "uuid",
    description: "UUID v1–v5",
    pattern:
      "\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\\b",
    flags: ["g"],
    sample:
      "UUIDs:\n- 550e8400-e29b-41d4-a716-446655440000\n- 123e4567-e89b-12d3-a456-426614174000\nnot a uuid: 1234-abcd",
  },
  {
    name: "iso date",
    description: "YYYY-MM-DD",
    pattern: "\\b(\\d{4})-(\\d{2})-(\\d{2})\\b",
    flags: ["g"],
    sample: "Logs from 2026-04-25 and 2025-12-31. Skipping 26/04/26.",
  },
  {
    name: "slug",
    description: "URL slug",
    pattern: "[a-z0-9]+(?:-[a-z0-9]+)*",
    flags: ["g"],
    sample: "Posts: hello-world, getting-started-with-regex, /not_a_slug, BadSlug",
  },
  {
    name: "markdown link",
    description: "Markdown [text](url)",
    pattern: "\\[([^\\]]+)\\]\\(([^)]+)\\)",
    flags: ["g"],
    sample: "Here is [a link](https://regexrun.dev) and another [docs](/docs/intro).",
  },
  {
    name: "html tag",
    description: "Opening HTML tag",
    pattern: "<([a-zA-Z][\\w-]*)([^>]*)>",
    flags: ["g"],
    sample: '<div class="card"><p data-x="1">hello</p><br/></div>',
  },
  {
    name: "whitespace",
    description: "Repeated whitespace",
    pattern: "\\s+",
    flags: ["g"],
    sample: "collapse    these    spaces  please",
  },
  {
    name: "non-ascii",
    description: "Anything outside basic ASCII",
    pattern: "[^\\x00-\\x7F]+",
    flags: ["g"],
    sample: "café, naïve, façade, emoji ✨ and 你好",
  },
];
