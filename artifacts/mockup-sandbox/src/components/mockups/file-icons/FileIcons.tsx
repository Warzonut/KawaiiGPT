
type FileIcon = {
  ext: string;
  label: string;
  color: string;
  bg: string;
  content: React.ReactNode;
};

function FileIconSVG({
  color,
  bg,
  content,
  size = 48,
}: {
  color: string;
  bg: string;
  content: React.ReactNode;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
    >
      {/* File body */}
      <path
        d="M10 4h20l10 10v30H10V4z"
        fill={bg}
        opacity="0.15"
      />
      <path
        d="M10 4h20l10 10v30H10V4z"
        fill={bg}
        opacity="0.08"
      />
      {/* File body solid */}
      <path
        d="M10 4h20l10 10v30H10V4z"
        fill="#1e1e2e"
      />
      {/* Folded corner */}
      <path
        d="M30 4l10 10H30V4z"
        fill={color}
        opacity="0.6"
      />
      {/* Corner fold line */}
      <path
        d="M30 4l10 10H30V4z"
        fill={color}
        opacity="0.4"
      />
      {/* Top border accent */}
      <rect x="10" y="4" width="20" height="2" rx="1" fill={color} opacity="0.4" />
      {/* Left border accent */}
      <rect x="10" y="4" width="2" height="40" rx="1" fill={color} opacity="0.3" />
      {/* Content label */}
      {content}
    </svg>
  );
}

function HtmlIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#e44d26" bg="#e44d26" size={size} content={
      <text x="14" y="34" fontSize="11" fontWeight="700" fill="#e44d26" fontFamily="monospace">HTML</text>
    } />
  );
}

function CssIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#2965f1" bg="#2965f1" size={size} content={
      <text x="16" y="34" fontSize="11" fontWeight="700" fill="#2965f1" fontFamily="monospace">CSS</text>
    } />
  );
}

function JsIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#f7df1e" bg="#f7df1e" size={size} content={
      <text x="18" y="34" fontSize="11" fontWeight="700" fill="#f7df1e" fontFamily="monospace">JS</text>
    } />
  );
}

function TsIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#3178c6" bg="#3178c6" size={size} content={
      <text x="18" y="34" fontSize="11" fontWeight="700" fill="#3178c6" fontFamily="monospace">TS</text>
    } />
  );
}

function JsxIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#61dafb" bg="#61dafb" size={size} content={
      <text x="14" y="34" fontSize="10" fontWeight="700" fill="#61dafb" fontFamily="monospace">JSX</text>
    } />
  );
}

function TsxIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#61dafb" bg="#61dafb" size={size} content={
      <text x="13" y="34" fontSize="10" fontWeight="700" fill="#61dafb" fontFamily="monospace">TSX</text>
    } />
  );
}

function PyIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#3572A5" bg="#3572A5" size={size} content={
      <text x="19" y="34" fontSize="11" fontWeight="700" fill="#3572A5" fontFamily="monospace">PY</text>
    } />
  );
}

function JsonIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#f5a623" bg="#f5a623" size={size} content={
      <text x="11" y="34" fontSize="9.5" fontWeight="700" fill="#f5a623" fontFamily="monospace">JSON</text>
    } />
  );
}

function MdIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#519aba" bg="#519aba" size={size} content={
      <text x="18" y="34" fontSize="11" fontWeight="700" fill="#519aba" fontFamily="monospace">MD</text>
    } />
  );
}

function SvgIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#ffb13b" bg="#ffb13b" size={size} content={
      <text x="16" y="34" fontSize="11" fontWeight="700" fill="#ffb13b" fontFamily="monospace">SVG</text>
    } />
  );
}

function RustIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#ce422b" bg="#ce422b" size={size} content={
      <text x="13" y="34" fontSize="10" fontWeight="700" fill="#ce422b" fontFamily="monospace">RS</text>
    } />
  );
}

function GoIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#00acd7" bg="#00acd7" size={size} content={
      <text x="18" y="34" fontSize="11" fontWeight="700" fill="#00acd7" fontFamily="monospace">GO</text>
    } />
  );
}

function ShIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#4eaa25" bg="#4eaa25" size={size} content={
      <text x="18" y="34" fontSize="11" fontWeight="700" fill="#4eaa25" fontFamily="monospace">SH</text>
    } />
  );
}

function EnvIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#ecd53f" bg="#ecd53f" size={size} content={
      <text x="11" y="34" fontSize="9.5" fontWeight="700" fill="#ecd53f" fontFamily="monospace">ENV</text>
    } />
  );
}

function YamlIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#cb171e" bg="#cb171e" size={size} content={
      <text x="10" y="34" fontSize="9" fontWeight="700" fill="#cb171e" fontFamily="monospace">YAML</text>
    } />
  );
}

function SqlIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#dad8d8" bg="#dad8d8" size={size} content={
      <text x="16" y="34" fontSize="10" fontWeight="700" fill="#c5a0ff" fontFamily="monospace">SQL</text>
    } />
  );
}

function VueIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#42b883" bg="#42b883" size={size} content={
      <text x="13" y="34" fontSize="10" fontWeight="700" fill="#42b883" fontFamily="monospace">VUE</text>
    } />
  );
}

function GitIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#f14e32" bg="#f14e32" size={size} content={
      <text x="16" y="34" fontSize="10" fontWeight="700" fill="#f14e32" fontFamily="monospace">GIT</text>
    } />
  );
}

function DockerIcon({ size }: { size?: number }) {
  return (
    <FileIconSVG color="#2496ed" bg="#2496ed" size={size} content={
      <text x="10" y="30" fontSize="7.5" fontWeight="700" fill="#2496ed" fontFamily="monospace">DOCK</text>
    } />
  );
}

type IconEntry = {
  label: string;
  filename: string;
  icon: React.ComponentType<{ size?: number }>;
};

const icons: IconEntry[] = [
  { label: "HTML", filename: "index.html", icon: HtmlIcon },
  { label: "CSS", filename: "styles.css", icon: CssIcon },
  { label: "JavaScript", filename: "app.js", icon: JsIcon },
  { label: "TypeScript", filename: "main.ts", icon: TsIcon },
  { label: "JSX", filename: "App.jsx", icon: JsxIcon },
  { label: "TSX", filename: "App.tsx", icon: TsxIcon },
  { label: "Python", filename: "main.py", icon: PyIcon },
  { label: "JSON", filename: "package.json", icon: JsonIcon },
  { label: "Markdown", filename: "README.md", icon: MdIcon },
  { label: "SVG", filename: "icon.svg", icon: SvgIcon },
  { label: "Rust", filename: "main.rs", icon: RustIcon },
  { label: "Go", filename: "main.go", icon: GoIcon },
  { label: "Shell", filename: "deploy.sh", icon: ShIcon },
  { label: "Env", filename: ".env", icon: EnvIcon },
  { label: "YAML", filename: "config.yml", icon: YamlIcon },
  { label: "SQL", filename: "query.sql", icon: SqlIcon },
  { label: "Vue", filename: "App.vue", icon: VueIcon },
  { label: "Git", filename: ".gitignore", icon: GitIcon },
  { label: "Docker", filename: "Dockerfile", icon: DockerIcon },
];

export function FileIcons() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#12121a",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: "32px 40px",
        color: "#cdd6f4",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: "#cdd6f4", margin: 0, marginBottom: 4 }}>
          File Icons
        </h1>
        <p style={{ fontSize: 12, color: "#6c7086", margin: 0 }}>
          VS Code-style file type icons
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
          gap: "8px",
        }}
      >
        {icons.map(({ label, filename, icon: Icon }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "12px 8px",
              borderRadius: 8,
              background: "#1e1e2e",
              border: "1px solid #313244",
              cursor: "default",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = "#24273a";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#45475a";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = "#1e1e2e";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#313244";
            }}
          >
            <Icon size={44} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#cdd6f4", textAlign: "center" }}>
              {label}
            </span>
            <span
              style={{
                fontSize: 9,
                color: "#6c7086",
                textAlign: "center",
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {filename}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #313244" }}>
        <p style={{ fontSize: 11, color: "#45475a", margin: 0, textAlign: "center" }}>
          Large size preview
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {[HtmlIcon, CssIcon, JsIcon, TsIcon, JsxIcon, TsxIcon].map((Icon, i) => (
            <Icon key={i} size={72} />
          ))}
        </div>
      </div>
    </div>
  );
}
