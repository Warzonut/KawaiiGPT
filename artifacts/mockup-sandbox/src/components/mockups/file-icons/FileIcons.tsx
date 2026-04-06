
/* Material Icon Theme-style VS Code file icons */

function FileShape({
  size = 56,
  foldColor = "#90a4ae",
  bodyColor = "#eceff1",
  borderColor = "#b0bec5",
  children,
}: {
  size?: number;
  foldColor?: string;
  bodyColor?: string;
  borderColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
    >
      {/* File body */}
      <path
        d="M8 4 L36 4 L48 16 L48 52 L8 52 Z"
        fill={bodyColor}
        stroke={borderColor}
        strokeWidth="1"
      />
      {/* Fold triangle */}
      <path
        d="M36 4 L48 16 L36 16 Z"
        fill={foldColor}
      />
      {/* Fold border line */}
      <path
        d="M36 4 L36 16 L48 16"
        stroke={borderColor}
        strokeWidth="1"
        fill="none"
      />
      {/* Content area */}
      {children}
    </svg>
  );
}

/* ---- Individual Icons ---- */

function HtmlIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fff3e0" borderColor="#ffcc80" foldColor="#ffb74d">
      {/* HTML5 logo - shield shape */}
      <g transform="translate(28, 33)">
        <polygon
          points="0,-14 -10,-10 -8,10 0,14 8,10 10,-10"
          fill="#e44d26"
        />
        <polygon
          points="0,-14 0,-10 7,-8 6,6 0,8"
          fill="#f16529"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="8"
          fontWeight="900"
          fill="white"
          fontFamily="Arial, sans-serif"
          letterSpacing="-0.5"
        >5</text>
      </g>
    </FileShape>
  );
}

function CssIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e3f2fd" borderColor="#90caf9" foldColor="#64b5f6">
      {/* CSS3 badge */}
      <g transform="translate(28, 33)">
        <polygon
          points="0,-14 -10,-10 -8,10 0,14 8,10 10,-10"
          fill="#2965f1"
        />
        <polygon
          points="0,-14 0,-10 7,-8 6,6 0,8"
          fill="#264de4"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="8"
          fontWeight="900"
          fill="white"
          fontFamily="Arial, sans-serif"
          letterSpacing="-0.5"
        >3</text>
      </g>
    </FileShape>
  );
}

function JsIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fffde7" borderColor="#fff176" foldColor="#ffee58">
      {/* JS logo - yellow square with JS */}
      <rect x="13" y="20" width="26" height="26" rx="2" fill="#f7df1e" />
      <text x="17" y="41" fontSize="13" fontWeight="700" fill="#333" fontFamily="Arial, sans-serif">JS</text>
    </FileShape>
  );
}

function TsIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e3f2fd" borderColor="#90caf9" foldColor="#64b5f6">
      {/* TS logo - blue square with TS */}
      <rect x="13" y="20" width="26" height="26" rx="2" fill="#3178c6" />
      <text x="14.5" y="41" fontSize="13" fontWeight="700" fill="white" fontFamily="Arial, sans-serif">TS</text>
    </FileShape>
  );
}

function JsxIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e0f7fa" borderColor="#80deea" foldColor="#4dd0e1">
      {/* React atom */}
      <g transform="translate(28, 34)">
        <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.5" fill="none" />
        <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.5" fill="none" transform="rotate(60)" />
        <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.5" fill="none" transform="rotate(120)" />
        <circle cx="0" cy="0" r="2.5" fill="#61dafb" />
      </g>
    </FileShape>
  );
}

function TsxIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e8eaf6" borderColor="#9fa8da" foldColor="#7986cb">
      {/* React atom in TypeScript blue */}
      <g transform="translate(28, 34)">
        <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#3178c6" strokeWidth="1.5" fill="none" />
        <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#3178c6" strokeWidth="1.5" fill="none" transform="rotate(60)" />
        <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#3178c6" strokeWidth="1.5" fill="none" transform="rotate(120)" />
        <circle cx="0" cy="0" r="2.5" fill="#3178c6" />
      </g>
    </FileShape>
  );
}

function PyIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e8f5e9" borderColor="#a5d6a7" foldColor="#66bb6a">
      {/* Python logo - two interlinked snakes */}
      <g transform="translate(28, 33)">
        {/* Blue snake body */}
        <path
          d="M-6,-12 Q-6,-16 -2,-16 L2,-16 Q6,-16 6,-12 L6,-2 Q6,2 2,2 L-2,2 Q-6,2 -6,-2 Z"
          fill="#3572A5"
        />
        {/* Yellow snake body */}
        <path
          d="M-6,2 Q-6,-2 -2,-2 L2,-2 Q6,-2 6,2 L6,12 Q6,16 2,16 L-2,16 Q-6,16 -6,12 Z"
          fill="#FFE873"
        />
        {/* Eye */}
        <circle cx="-2" cy="-9" r="1.5" fill="white" />
        <circle cx="2" cy="9" r="1.5" fill="#3572A5" />
        {/* Connector detail */}
        <rect x="-2" y="-1" width="4" height="2" fill="#b8d4e8" />
      </g>
    </FileShape>
  );
}

function JsonIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fff8e1" borderColor="#ffe082" foldColor="#ffca28">
      {/* Curly braces */}
      <text x="28" y="38" textAnchor="middle" fontSize="22" fontWeight="300" fill="#f5a623" fontFamily="monospace">{`{}`}</text>
    </FileShape>
  );
}

function MdIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e8eaf6" borderColor="#9fa8da" foldColor="#7986cb">
      {/* Markdown M↓ symbol */}
      <text x="28" y="34" textAnchor="middle" fontSize="14" fontWeight="700" fill="#519aba" fontFamily="Arial, sans-serif">M</text>
      {/* Down arrow */}
      <g transform="translate(28, 42)">
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#519aba" strokeWidth="2.5" strokeLinecap="round" />
        <polyline points="-4,1 0,5 4,1" stroke="#519aba" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </FileShape>
  );
}

function SvgIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fff8e1" borderColor="#ffe082" foldColor="#ffca28">
      {/* Bezier curve pen tip */}
      <g transform="translate(28, 33)">
        <path d="M-12,-8 C-4,-14 4,-14 12,-8 C4,-2 -4,-2 -12,-8 Z" fill="none" stroke="#ffb13b" strokeWidth="2" />
        <circle cx="-12" cy="-8" r="2.5" fill="#ffb13b" />
        <circle cx="12" cy="-8" r="2.5" fill="#ffb13b" />
        <path d="M-6,2 L6,2 L0,12 Z" fill="#ffb13b" />
        <line x1="-6" y1="2" x2="-10" y2="-5" stroke="#ffb13b" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="6" y1="2" x2="10" y2="-5" stroke="#ffb13b" strokeWidth="1.5" strokeDasharray="2,2" />
      </g>
    </FileShape>
  );
}

function RustIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fbe9e7" borderColor="#ffab91" foldColor="#ff7043">
      {/* Rust gear wheel */}
      <g transform="translate(28, 33)">
        <circle cx="0" cy="0" r="10" fill="none" stroke="#ce422b" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="5" fill="#ce422b" />
        {/* Gear teeth */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect
            key={i}
            x="-2"
            y="-13"
            width="4"
            height="5"
            rx="1"
            fill="#ce422b"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="3" fill="white" />
      </g>
    </FileShape>
  );
}

function GoIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e0f7fa" borderColor="#80deea" foldColor="#4dd0e1">
      {/* Go text logo */}
      <text x="28" y="40" textAnchor="middle" fontSize="18" fontWeight="700" fill="#00acd7" fontFamily="Arial, sans-serif">Go</text>
    </FileShape>
  );
}

function ShIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e8f5e9" borderColor="#a5d6a7" foldColor="#66bb6a">
      {/* Terminal prompt */}
      <text x="14" y="36" fontSize="14" fontWeight="700" fill="#4eaa25" fontFamily="monospace">$_</text>
    </FileShape>
  );
}

function EnvIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fffde7" borderColor="#fff176" foldColor="#ffee58">
      {/* Gear/settings icon */}
      <g transform="translate(28, 33)">
        <circle cx="0" cy="0" r="7" fill="none" stroke="#ecd53f" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="3" fill="#ecd53f" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <rect
            key={i}
            x="-2"
            y="-11"
            width="4"
            height="4"
            rx="1"
            fill="#ecd53f"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
    </FileShape>
  );
}

function YamlIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fce4ec" borderColor="#f48fb1" foldColor="#f06292">
      {/* YAML text */}
      <text x="28" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="#cb171e" fontFamily="Arial, sans-serif">YAML</text>
    </FileShape>
  );
}

function SqlIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#ede7f6" borderColor="#b39ddb" foldColor="#9575cd">
      {/* Database cylinder */}
      <g transform="translate(28, 32)">
        <ellipse cx="0" cy="-8" rx="10" ry="4" fill="#7c4dff" />
        <rect x="-10" y="-8" width="20" height="14" fill="#7c4dff" />
        <ellipse cx="0" cy="6" rx="10" ry="4" fill="#651fff" />
        <ellipse cx="0" cy="-3" rx="10" ry="4" fill="none" stroke="#b39ddb" strokeWidth="1" strokeDasharray="3,3" />
      </g>
    </FileShape>
  );
}

function VueIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e8f5e9" borderColor="#a5d6a7" foldColor="#66bb6a">
      {/* Vue.js V logo */}
      <g transform="translate(28, 30)">
        {/* Outer V */}
        <polygon points="-14,-10 -7,10 0,-2 7,10 14,-10 10,-10 7,-4 0,6 -7,-4 -10,-10" fill="#42b883" />
        {/* Inner V */}
        <polygon points="-7,-4 -3,6 0,0 3,6 7,-4 4,-4 0,2 -4,-4" fill="#35495e" />
      </g>
    </FileShape>
  );
}

function GitIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fbe9e7" borderColor="#ffab91" foldColor="#ff7043">
      {/* Git branch icon */}
      <g transform="translate(28, 33)">
        <circle cx="0" cy="-10" r="3" fill="#f14e32" />
        <circle cx="8" cy="2" r="3" fill="#f14e32" />
        <circle cx="0" cy="12" r="3" fill="#f14e32" />
        <line x1="0" y1="-7" x2="0" y2="9" stroke="#f14e32" strokeWidth="2" strokeLinecap="round" />
        <path d="M0,-5 Q8,-5 8,-1" stroke="#f14e32" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </FileShape>
  );
}

function DockerIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e3f2fd" borderColor="#90caf9" foldColor="#64b5f6">
      {/* Docker whale simplified */}
      <g transform="translate(28, 33)">
        {/* Whale body */}
        <ellipse cx="0" cy="4" rx="12" ry="8" fill="#2496ed" />
        {/* Container stack */}
        <rect x="-8" y="-10" width="6" height="4" rx="1" fill="#2496ed" />
        <rect x="-1" y="-10" width="6" height="4" rx="1" fill="#2496ed" />
        <rect x="-8" y="-5" width="6" height="4" rx="1" fill="#2496ed" />
        <rect x="-1" y="-5" width="6" height="4" rx="1" fill="#2496ed" />
        {/* Spout */}
        <path d="M8,-4 Q12,-8 10,-12" stroke="#2496ed" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </FileShape>
  );
}

function CppIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#e3f2fd" borderColor="#90caf9" foldColor="#64b5f6">
      <text x="28" y="39" textAnchor="middle" fontSize="12" fontWeight="800" fill="#00599c" fontFamily="Arial, sans-serif">C++</text>
    </FileShape>
  );
}

function RubyIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fce4ec" borderColor="#f48fb1" foldColor="#f06292">
      {/* Ruby gem */}
      <g transform="translate(28, 33)">
        <polygon points="0,-12 8,-4 6,10 -6,10 -8,-4" fill="#cc342d" />
        <polygon points="0,-12 8,-4 0,-2 -8,-4" fill="#e05252" />
        <polygon points="-8,-4 0,-2 -6,10" fill="#a72322" />
        <polygon points="8,-4 6,10 0,-2" fill="#a72322" />
      </g>
    </FileShape>
  );
}

function JavaIcon({ size }: { size?: number }) {
  return (
    <FileShape size={size} bodyColor="#fff3e0" borderColor="#ffcc80" foldColor="#ffb74d">
      {/* Coffee cup for Java */}
      <g transform="translate(28, 33)">
        <path d="M-8,-10 L-8,8 Q-8,12 -4,12 L4,12 Q8,12 8,8 L8,-10 Z" fill="#e76f00" />
        <path d="M8,0 Q14,0 14,4 Q14,8 8,8" stroke="#e76f00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Steam */}
        <path d="M-4,-12 Q-2,-16 -4,-20" stroke="#e76f00" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="2,2" />
        <path d="M4,-12 Q6,-16 4,-20" stroke="#e76f00" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="2,2" />
      </g>
    </FileShape>
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
  { label: "C++", filename: "main.cpp", icon: CppIcon },
  { label: "Ruby", filename: "app.rb", icon: RubyIcon },
  { label: "Java", filename: "Main.java", icon: JavaIcon },
];

export function FileIcons() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1e1e2e",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: "32px 36px",
        color: "#cdd6f4",
      }}
    >
      <div style={{ marginBottom: 28, borderBottom: "1px solid #313244", paddingBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect width="16" height="16" rx="3" fill="#89b4fa" opacity="0.2" />
            <rect x="3" y="4" width="5" height="6" rx="1" fill="#89b4fa" />
            <rect x="9" y="4" width="4" height="1.5" rx="0.5" fill="#89b4fa" />
            <rect x="9" y="6.5" width="4" height="1.5" rx="0.5" fill="#89b4fa" />
          </svg>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: "#cdd6f4", margin: 0 }}>
            Material File Icons
          </h1>
        </div>
        <p style={{ fontSize: 11, color: "#6c7086", margin: 0, paddingLeft: 26 }}>
          vscode-material-icon-theme style · {icons.length} icons
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: "10px",
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
              padding: "14px 8px 10px",
              borderRadius: 8,
              background: "#181825",
              border: "1px solid #313244",
              cursor: "default",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = "#1e1e2e";
              el.style.borderColor = "#45475a";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = "#181825";
              el.style.borderColor = "#313244";
              el.style.transform = "translateY(0)";
            }}
          >
            <Icon size={52} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#cdd6f4", textAlign: "center", lineHeight: 1.2 }}>
              {label}
            </span>
            <span
              style={{
                fontSize: 9,
                color: "#585b70",
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

      {/* Large preview row */}
      <div style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid #313244" }}>
        <p style={{ fontSize: 10, color: "#45475a", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1 }}>
          Full-size preview
        </p>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[HtmlIcon, CssIcon, JsIcon, TsIcon, JsxIcon, TsxIcon, PyIcon, VueIcon].map((Icon, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Icon size={72} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
