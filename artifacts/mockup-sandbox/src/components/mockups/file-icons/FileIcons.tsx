
/* Uses actual SVGs from material-icon-theme npm package (copied to public/icons/) */

type IconEntry = {
  label: string;
  filename: string;
  icon: string; // SVG filename (without extension)
  ext?: string; // file extension shown in badge
};

const webIcons: IconEntry[] = [
  { label: "HTML", filename: "index.html", icon: "html", ext: "html" },
  { label: "CSS", filename: "styles.css", icon: "css", ext: "css" },
  { label: "JavaScript", filename: "app.js", icon: "javascript", ext: "js" },
  { label: "TypeScript", filename: "main.ts", icon: "typescript", ext: "ts" },
  { label: "JSX / TSX", filename: "App.jsx", icon: "react", ext: "jsx" },
  { label: "Sass", filename: "styles.scss", icon: "sass", ext: "scss" },
  { label: "Less", filename: "styles.less", icon: "less", ext: "less" },
  { label: "Vue", filename: "App.vue", icon: "vue", ext: "vue" },
  { label: "Svelte", filename: "App.svelte", icon: "svelte", ext: "svelte" },
  { label: "GraphQL", filename: "schema.graphql", icon: "graphql", ext: "gql" },
  { label: "SVG", filename: "icon.svg", icon: "svg", ext: "svg" },
  { label: "XML", filename: "data.xml", icon: "xml", ext: "xml" },
];

const frameworkIcons: IconEntry[] = [
  { label: "Angular", filename: "app.component.ts", icon: "angular" },
  { label: "Astro", filename: "index.astro", icon: "astro", ext: "astro" },
  { label: "Next.js", filename: "page.tsx", icon: "next" },
  { label: "Nuxt", filename: "nuxt.config.ts", icon: "nuxt" },
  { label: "Vite", filename: "vite.config.ts", icon: "vite" },
  { label: "Webpack", filename: "webpack.config.js", icon: "webpack" },
  { label: "Jest", filename: "app.test.ts", icon: "jest", ext: "test" },
  { label: "Vitest", filename: "vitest.config.ts", icon: "vitest" },
  { label: "ESLint", filename: ".eslintrc.json", icon: "eslint" },
  { label: "Prettier", filename: ".prettierrc", icon: "prettier" },
  { label: "Deno", filename: "main.ts", icon: "deno" },
  { label: "Bun", filename: "bun.lockb", icon: "bun" },
];

const systemsIcons: IconEntry[] = [
  { label: "Python", filename: "main.py", icon: "python", ext: "py" },
  { label: "Java", filename: "Main.java", icon: "java", ext: "java" },
  { label: "C++", filename: "main.cpp", icon: "cpp", ext: "cpp" },
  { label: "C#", filename: "Program.cs", icon: "csharp", ext: "cs" },
  { label: "Go", filename: "main.go", icon: "go", ext: "go" },
  { label: "Rust", filename: "main.rs", icon: "rust", ext: "rs" },
  { label: "Kotlin", filename: "Main.kt", icon: "kotlin", ext: "kt" },
  { label: "Swift", filename: "App.swift", icon: "swift", ext: "swift" },
  { label: "Ruby", filename: "app.rb", icon: "ruby", ext: "rb" },
  { label: "PHP", filename: "index.php", icon: "php", ext: "php" },
  { label: "Scala", filename: "Main.scala", icon: "scala", ext: "scala" },
  { label: "Dart", filename: "main.dart", icon: "dart", ext: "dart" },
  { label: "Lua", filename: "script.lua", icon: "lua", ext: "lua" },
  { label: "Haskell", filename: "Main.hs", icon: "haskell", ext: "hs" },
  { label: "F#", filename: "Program.fs", icon: "fsharp", ext: "fs" },
  { label: "Julia", filename: "main.jl", icon: "julia", ext: "jl" },
  { label: "Zig", filename: "main.zig", icon: "zig", ext: "zig" },
  { label: "Solidity", filename: "Contract.sol", icon: "solidity", ext: "sol" },
  { label: "Assembly", filename: "main.asm", icon: "assembly", ext: "asm" },
  { label: "Elixir", filename: "app.ex", icon: "elixir", ext: "ex" },
  { label: "Erlang", filename: "main.erl", icon: "erlang", ext: "erl" },
  { label: "Clojure", filename: "core.clj", icon: "clojure", ext: "clj" },
  { label: "Elm", filename: "Main.elm", icon: "elm", ext: "elm" },
  { label: "CoffeeScript", filename: "app.coffee", icon: "coffee", ext: "coffee" },
];

const configIcons: IconEntry[] = [
  { label: "JSON", filename: "package.json", icon: "json", ext: "json" },
  { label: "YAML", filename: "config.yml", icon: "yaml", ext: "yml" },
  { label: "TOML", filename: "Cargo.toml", icon: "toml", ext: "toml" },
  { label: "Markdown", filename: "README.md", icon: "markdown", ext: "md" },
  { label: "SQL / DB", filename: "query.sql", icon: "database", ext: "sql" },
  { label: "CMake", filename: "CMakeLists.txt", icon: "cmake" },
  { label: "Makefile", filename: "Makefile", icon: "makefile" },
  { label: "tsconfig", filename: "tsconfig.json", icon: "tsconfig" },
];

const infraIcons: IconEntry[] = [
  { label: "Docker", filename: "Dockerfile", icon: "docker" },
  { label: "Kubernetes", filename: "deployment.yaml", icon: "kubernetes" },
  { label: "Terraform", filename: "main.tf", icon: "terraform", ext: "tf" },
  { label: "Helm", filename: "Chart.yaml", icon: "helm" },
  { label: "Nginx", filename: "nginx.conf", icon: "nginx" },
  { label: "Firebase", filename: "firebase.json", icon: "firebase" },
  { label: "Supabase", filename: "supabase.ts", icon: "supabase" },
  { label: "Git", filename: ".gitignore", icon: "git" },
  { label: "Shell", filename: "deploy.sh", icon: "console", ext: "sh" },
  { label: "PowerShell", filename: "run.ps1", icon: "powershell", ext: "ps1" },
  { label: "npm", filename: "package.json", icon: "npm" },
  { label: "Yarn", filename: "yarn.lock", icon: "yarn" },
  { label: "pnpm", filename: "pnpm-lock.yaml", icon: "pnpm" },
  { label: "Bun", filename: "bun.lockb", icon: "bun" },
];

function IconCard({ label, filename, icon, ext }: IconEntry) {
  return (
    <div
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
        position: "relative",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = "#1e1e2e";
        el.style.borderColor = "#585b70";
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = "#181825";
        el.style.borderColor = "#313244";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <img
        src={`/__mockup/icons/${icon}.svg`}
        alt={label}
        width={44}
        height={44}
        style={{ imageRendering: "crisp-edges" }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#cdd6f4",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
      {ext && (
        <span
          style={{
            fontSize: 9,
            color: "#585b70",
            fontFamily: "monospace",
            background: "#11111b",
            padding: "1px 5px",
            borderRadius: 3,
            letterSpacing: 0.5,
          }}
        >
          .{ext}
        </span>
      )}
      {!ext && (
        <span
          style={{
            fontSize: 9,
            color: "#585b70",
            fontFamily: "monospace",
          }}
        >
          {filename}
        </span>
      )}
    </div>
  );
}

const sections = [
  { title: "Web", icons: webIcons },
  { title: "Frameworks & Runtimes", icons: frameworkIcons },
  { title: "Systems & Backend", icons: systemsIcons },
  { title: "Config & Data", icons: configIcons },
  { title: "DevOps & Infrastructure", icons: infraIcons },
];

const totalIcons = sections.reduce((sum, s) => sum + s.icons.length, 0);

export function FileIcons() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1e1e2e",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: "28px 32px 40px",
        color: "#cdd6f4",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="/__mockup/icons/javascript.svg"
          width={24}
          height={24}
          alt=""
          style={{ opacity: 0.6 }}
        />
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: "#cdd6f4", margin: 0, lineHeight: 1 }}>
            material-icon-theme
          </h1>
          <p style={{ fontSize: 11, color: "#6c7086", margin: "3px 0 0", fontFamily: "monospace" }}>
            npm install material-icon-theme · {totalIcons} icons
          </p>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#6c7086",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 12,
              paddingBottom: 6,
              borderBottom: "1px solid #313244",
            }}
          >
            {section.title}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
              gap: 8,
            }}
          >
            {section.icons.map((entry) => (
              <IconCard key={entry.label} {...entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
