import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import mazeCore from '../assets/maze-core.jpg'
import { getPlayer, setPlayer, getScores, ScoreEntry } from '../lib/gameLogic'

export const Route = createFileRoute('/')({
  component: Index,
  head: () => ({
    meta: [
      { title: 'Escape[C]ode — Escape Room' },
      {
        name: 'description',
        content:
          'Um labirinto procedural em C onde lógica de programação destrava cada porta. Ponteiros, recursão e bitwise contra o relógio.',
      },
    ],
  }),
})

function Index() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState<string>('')
  const [inputVal, setInputVal]   = useState<string>('')
  const [showInput, setShowInput] = useState<boolean>(false)
  const [inputErr, setInputErr]   = useState<string>('')
  const [scores, setScores]       = useState<ScoreEntry[]>([])

  useEffect(() => {
    const saved = getPlayer()
    if (saved) setNickname(saved)
    setScores(getScores())
  }, [])

  function handleStart() {
    if (nickname) {
      navigate({ to: '/game' })
    } else {
      setShowInput(true)
    }
  }

  function handleConfirmNick() {
    const trimmed = inputVal.trim()
    if (!trimmed) { setInputErr('Digite um nickname válido.'); return }
    if (trimmed.length < 2) { setInputErr('Mínimo de 2 caracteres.'); return }
    if (trimmed.length > 16) { setInputErr('Máximo de 16 caracteres.'); return }
    setPlayer(trimmed)
    setNickname(trimmed)
    setShowInput(false)
    setInputErr('')
    navigate({ to: '/game' })
  }

  return (
    <div className="scanline-effect relative min-h-screen overflow-hidden bg-brand-bg text-slate-400 selection:bg-brand-primary selection:text-black">
      <div className="grid-bg absolute inset-0" />

      {/* ── Nav ──────────────────────────────────────────────────── */}
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

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <main id="hero" className="relative z-10 pb-20 pt-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-12">

          {/* Left Column */}
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

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-400">
              Um <span className="text-white">escape room</span> escrito em puro C.
              Atravesse um labirinto procedural onde cada porta é um{' '}
              <span className="font-mono text-brand-primary">gate lógico</span>.
              Manipule ponteiros, resolva fechaduras bitwise e sobreviva às armadilhas da recursão.
            </p>

            {/* Nickname indicator */}
            {nickname && (
              <div className="mb-4 flex items-center gap-3 font-mono text-sm">
                <div className="size-2 rounded-full bg-brand-success shadow-[0_0_8px_#00FF94]" />
                <span className="text-slate-500">OPERADOR IDENTIFICADO:</span>
                <span className="font-bold text-brand-primary">{nickname}</span>
                <button
                  onClick={() => { setInputVal(''); setShowInput(true) }}
                  className="ml-2 text-[10px] text-slate-600 underline underline-offset-2 hover:text-slate-400 transition-colors"
                >
                  alterar
                </button>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                id="btn-execute"
                onClick={handleStart}
                className="group relative cursor-pointer overflow-hidden bg-brand-primary px-10 py-5 text-sm font-bold uppercase tracking-tighter text-black"
              >
                <div className="absolute inset-0 translate-y-full bg-white transition-transform duration-300 group-hover:translate-y-0" />
                <span className="relative z-10">Execute_Binary</span>
              </button>
            </div>

            {/* Nickname input panel */}
            {showInput && (
              <div className="mt-6 border border-brand-primary/30 bg-black/60 p-6 backdrop-blur-md">
                <div className="mb-3 font-mono text-xs uppercase tracking-widest text-brand-primary/70">
                  // IDENTIFICAÇÃO DO OPERADOR
                </div>
                <p className="mb-4 text-sm text-slate-400">
                  Informe seu <span className="text-white">nickname</span> para registrar sua pontuação no sistema.
                </p>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-brand-primary/60 text-sm">
                      {'>'}
                    </span>
                    <input
                      id="input-nickname"
                      type="text"
                      maxLength={16}
                      value={inputVal}
                      onChange={e => { setInputVal(e.target.value); setInputErr('') }}
                      onKeyDown={e => { if (e.key === 'Enter') handleConfirmNick() }}
                      placeholder="OPERADOR_01"
                      autoFocus
                      className="w-full border border-brand-primary/30 bg-brand-primary/5 py-3 pl-8 pr-4 font-mono text-sm text-white placeholder-slate-600 outline-none focus:border-brand-primary focus:bg-brand-primary/10 transition-all"
                    />
                  </div>
                  <button
                    id="btn-confirm-nick"
                    onClick={handleConfirmNick}
                    className="bg-brand-primary px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black hover:bg-white transition-colors"
                  >
                    CONFIRMAR
                  </button>
                </div>
                {inputErr && (
                  <p className="mt-2 font-mono text-xs text-brand-accent">{inputErr}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column — Hero Visual */}
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
                    <span className="animate-pulse">SCANNING...</span>
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

      {/* ── Dashlog / Leaderboard ─────────────────────────────── */}
      <section className="relative z-10 pb-24 px-6 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-brand-border" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-primary/60">
              // DASHBOARD LOG — HISTÓRICO DE OPERADORES
            </span>
            <div className="h-px flex-1 bg-brand-border" />
          </div>

          {scores.length === 0 ? (
            <div className="border border-dashed border-brand-border bg-black/20 px-8 py-12 text-center font-mono">
              <div className="mb-2 text-2xl">📡</div>
              <div className="text-sm text-slate-600 tracking-widest uppercase">
                SISTEMA LIMPO // NENHUM OPERADOR LOGADO
              </div>
              <div className="mt-2 text-[11px] text-slate-700">
                Execute o binário para registrar sua primeira sessão.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-[10px] uppercase tracking-[0.2em] text-slate-600">
                    <th className="pb-3 text-left w-12">RANK</th>
                    <th className="pb-3 text-left">OPERADOR</th>
                    <th className="pb-3 text-right">PONTOS</th>
                    <th className="pb-3 text-center">SALAS</th>
                    <th className="pb-3 text-center">STATUS</th>
                    <th className="pb-3 text-right">DATA</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr
                      key={i}
                      className="border-b border-brand-border/40 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="py-3 text-slate-600 text-xs">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td className="py-3 font-bold text-white tracking-wide">
                        {s.nickname}
                      </td>
                      <td className="py-3 text-right font-bold text-brand-primary">
                        {s.score.toLocaleString()}
                      </td>
                      <td className="py-3 text-center text-slate-400">
                        {s.rooms}/10
                      </td>
                      <td className="py-3 text-center">
                        {s.won ? (
                          <span className="inline-block rounded-sm border border-brand-success/40 bg-brand-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-success">
                            SOBREVIVENTE
                          </span>
                        ) : (
                          <span className="inline-block rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                            EJETADO
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right text-slate-600 text-xs">
                        {s.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}