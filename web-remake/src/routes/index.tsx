import { createFileRoute } from "@tanstack/react-router";
import mazeCore from "../assets/maze-core.jpg";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Escape[C]ode — Escape Room" },
      {
        name: "description",
        content:
          "Um labirinto procedural em C onde lógica de programação destrava cada porta. Ponteiros, recursão e bitwise contra o relógio.",
      },
    ],
  }),
});

const REPO_URL = "https://github.com/Ruan-M-Oliveira/Escape-Room";

function Index() {
  return (
    <div className="scanline-effect relative min-h-screen overflow-hidden bg-brand-bg text-slate-400 selection:bg-brand-primary selection:text-black">
      <div className="grid-bg absolute inset-0" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between border-b border-brand-border bg-brand-bg/80 px-6 py-5 backdrop-blur-md sm:px-10">
        <div className="flex items-center gap-4">
          <div className="group relative">
            <div className="absolute -inset-1 bg-brand-primary opacity-20 blur transition-opacity group-hover:opacity-40" />
            <div className="relative flex size-10 items-center justify-center border border-brand-primary/50 bg-black">
              <div className="flex size-5 rotate-45 items-center justify-center border-2 border-brand-primary">
                <div className="size-1 animate-ping bg-brand-accent" />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold leading-none tracking-tighter text-white">
              ESCAPE[C]ODE
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-primary/60">
              Kernel_v.1.0.4
            </span>
          </div>
        </div>

        <div className="hidden flex-col items-end font-mono text-[10px] sm:flex">
          <div className="flex items-center gap-2">
            <span className="text-brand-success">ONLINE</span>
            <div className="size-1.5 rounded-full bg-brand-success shadow-[0_0_8px_#00FF94]" />
          </div>
          <span className="text-slate-600">LATENCY: 14MS</span>
        </div>
      </nav>

      {/* Hero */}
      <main id="hero" className="relative z-10 pb-32 pt-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="border border-brand-accent/30 bg-brand-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-tighter text-brand-accent">
                CRITICAL_ERROR
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Memory address 0x00F5FF overflow detected
              </span>
            </div>

            <h1 className="mb-8 font-display text-6xl font-bold leading-[0.85] tracking-tighter text-white sm:text-7xl lg:text-8xl">
              DEBUG OU
              <br />
              <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                DESCONECTE.
              </span>
            </h1>

            <p className="mb-12 max-w-xl text-lg leading-relaxed text-slate-400">
              Um <span className="text-white">escape room</span> escrito em puro C.
              Atravesse um labirinto procedural onde cada porta é um{" "}
              <span className="font-mono text-brand-primary">gate lógico</span>.
              Manipule ponteiros, resolva fechaduras bitwise e sobreviva às armadilhas da recursão.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/game"
                className="group relative cursor-pointer overflow-hidden bg-brand-primary px-10 py-5 text-sm font-bold uppercase tracking-tighter text-black"
              >
                <div className="absolute inset-0 translate-y-full bg-white transition-transform duration-300 group-hover:translate-y-0" />
                <span className="relative z-10">Execute_Binary</span>
              </Link>
              
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="flex cursor-pointer items-center gap-3 border border-brand-border px-10 py-5 text-sm font-bold uppercase tracking-tighter text-white transition-all hover:bg-brand-border"
              >
                Clonar_Repositório
                <span className="text-brand-primary">→</span>
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative lg:col-span-5">
            <div className="absolute -inset-10 rounded-full bg-brand-primary/5 blur-[120px]" />
            <div className="relative border border-brand-border bg-brand-surface p-1">
              <div className="absolute right-0 top-0 z-10 flex gap-1 p-4">
                <div className="size-2 bg-slate-800" />
                <div className="size-2 bg-slate-800" />
                <div className="size-2 animate-pulse bg-brand-accent" />
              </div>
              <div className="relative aspect-square overflow-hidden border border-brand-border bg-black">
                <img
                  src={mazeCore}
                  alt="Visualização macro do núcleo do labirinto em cyan neon"
                  width={1024}
                  height={1024}
                  className="size-full object-cover opacity-80 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-brand-primary/70">
                    <span>CORE_VISUALIZER</span>
                    <span className="animate-pulse">SCANNING…</span>
                  </div>
                  <div className="relative h-0.5 w-full overflow-hidden bg-brand-border">
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-brand-primary [animation:scan-bar_2.4s_linear_infinite]" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between border-t border-brand-border p-4 font-mono text-[10px] text-slate-600">
                <span>FRAME_BUFFER: ACTIVE</span>
                <span>RENDER: ASCII_LOW</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}