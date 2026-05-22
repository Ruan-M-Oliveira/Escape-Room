import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { initGame } from '../lib/gameLogic'
import '../game.css'

export const Route = createFileRoute('/game')({
  component: GameRoom,
})

function GameRoom() {
  const [mode, setMode] = useState<{ time: number | null, lives: number, name: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode && canvasRef.current) {
      const cleanup = initGame({ timeLimit: mode.time, maxLives: mode.lives, modeName: mode.name }, canvasRef.current);
      return cleanup;
    }
  }, [mode]);

  const modes = [
    { time: null, lives: 6, name: 'RECRUTA' },
    { time: 45, lives: 4, name: 'ENGENHEIRO' },
    { time: 25, lives: 3, name: 'ESPECIALISTA' },
  ]

  if (!mode) {
    return (
      <div className="bg-[#08071a] text-slate-200 min-h-screen flex flex-col w-full overflow-hidden">
        <header className="h-[70px] flex items-center justify-between px-6 border-b border-cyan-500/20 bg-[#050414] shrink-0">
          <div className="font-mono text-lg text-cyan-400 font-bold">⚔ Masmorra da Lógica</div>
          <Link to="/" className="text-xs uppercase tracking-[0.3em] text-slate-400 hover:text-cyan-300 transition-colors">
            Voltar ao início
          </Link>
        </header>

        <main className="flex-1 px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[2rem] border border-cyan-500/20 bg-[#090816]/80 p-8 shadow-[0_0_80px_rgba(0,245,255,0.06)]">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white">Escolha seu desafio</h1>
                <p className="mt-3 max-w-2xl text-slate-400">
                  Selecione o modo de jogo antes de entrar no labirinto. Cada opção altera tempo, vidas e dificuldade das portas lógicas.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {modes.map(item => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setMode(item)}
                    className="group rounded-[1.5rem] border border-cyan-500/20 bg-white/5 p-6 text-left transition hover:border-cyan-300/40 hover:bg-cyan-500/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-[0.32em] text-slate-500">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.time ? `${item.time}s` : 'Sem limite'}
                      </span>
                    </div>
                    <div className="mt-4 text-3xl font-bold text-cyan-300">{item.lives} vidas</div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {item.time
                        ? 'Passe portas rapidamente antes do tempo acabar.'
                        : 'Jogue com calma e explore cada sala.'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="game-container bg-[#08071a] text-slate-200 min-h-screen flex flex-col font-sans w-full max-w-[100vw] overflow-x-hidden">
      
      <header className="flex flex-wrap gap-4 items-center justify-between p-4 border-b border-cyan-500/10 bg-[#050414] shadow-md z-20 relative">
        <div className="font-mono text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-bold">
          ⚔ Masmorra da Lógica <span className="text-sm font-normal text-slate-500 ml-2">[{mode.name}]</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-4 sm:gap-8 items-center bg-white/5 px-6 py-2 rounded-full border border-cyan-500/20">
            <div className="text-center"><div className="font-mono text-lg font-bold text-cyan-400 leading-tight" id="h-score">0</div><div className="text-[10px] text-slate-400 uppercase tracking-widest">Pontos</div></div>
            <div className="text-center"><div className="font-mono text-lg font-bold text-cyan-400 leading-tight" id="h-lives">❤❤❤</div><div className="text-[10px] text-slate-400 uppercase tracking-widest">Vidas</div></div>
            <div className="text-center"><div className="font-mono text-lg font-bold text-cyan-400 leading-tight" id="h-rooms">1/10</div><div className="text-[10px] text-slate-400 uppercase tracking-widest">Salas</div></div>
          </div>
          
          <button 
            onClick={() => {
              if(window.confirm('Atenção: Tem certeza que deseja abortar a missão atual? Todo o seu progresso será perdido.')) {
                if ((window as any).resetGame) (window as any).resetGame();
                setMode(null); 
              }
            }}
            className="px-4 py-2 bg-red-950/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs font-bold font-mono tracking-widest uppercase"
          >
            ABORTAR
          </button>
        </div>
      </header>
      
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden relative min-h-[calc(100vh-5.5rem)]">
        <div id="map-wrap" className="relative flex-1 flex items-center justify-center p-4 bg-[#0a081a] overflow-auto shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] min-h-[56vh] md:min-h-[64vh] lg:min-h-[72vh]">
          <canvas
            ref={canvasRef}
            id="map"
            className="block rounded-xl border border-cyan-500/20 w-full max-w-[1000px] max-h-[72vh] h-auto shadow-[0_0_40px_rgba(0,245,255,0.05)] cursor-pointer"
          ></canvas>
        </div>
        
        <aside className="w-full md:w-[280px] lg:w-[320px] flex-none p-6 flex flex-col gap-6 border-l border-cyan-500/10 bg-[#0d0a24] overflow-y-auto relative z-10 shadow-2xl">
          <div className="bg-[#120e2e] border border-cyan-500/20 rounded-xl p-5 shadow-lg">
            <div className="font-mono text-xl font-bold text-cyan-400 mb-4" id="side-room">INÍCIO</div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">Tokens da Sala Atual</div>
            <div className="flex gap-4" id="side-tokens"></div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">Portas disponíveis</div>
            <div id="door-list" className="flex flex-col gap-2"></div>
          </div>

          <div className="text-xs text-slate-400 p-4 bg-purple-900/10 rounded-lg border border-purple-500/20 mt-auto leading-relaxed">
            {mode.time ? `⏱️ PRESSÃO ATIVA: Tem ${mode.time}s para hackear a porta.` : "Analise a tabela com calma para encontrar o bypass correto."}
          </div>
        </aside>
      </main>

      <div id="modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 items-center justify-center p-4 transition-all duration-300" style={{ display: 'none' }}>
        <div className="bg-[#0f0e2a] border border-cyan-500/30 rounded-2xl p-8 sm:p-10 max-w-[480px] w-full text-center shadow-[0_0_80px_rgba(0,245,255,0.15)] relative overflow-hidden">
          
          <div id="m-timer-wrapper" className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800" style={{ display: 'none' }}>
            <div id="m-timer-bar" className="h-full bg-cyan-400 w-full transition-all ease-linear"></div>
          </div>

          <h2 id="m-from-to" className="text-slate-500 font-mono text-sm tracking-widest uppercase mb-2 mt-2">INÍCIO → Sala A</h2>
          <div id="m-formula" className="text-5xl sm:text-6xl font-black bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent my-6 font-mono drop-shadow-lg">P∧Q</div>
          
          <div className="bg-black/30 rounded-xl p-4 mb-6">
             <div id="m-pqr" className="flex flex-wrap gap-3 sm:gap-6 justify-center"></div>
          </div>

          <div className="text-slate-300 mb-6 font-medium">Este selo é VERDADEIRO ou FALSO?</div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex-1 px-6 py-4 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400 font-bold hover:bg-green-500 hover:text-black transition-all" onClick={() => (window as any).answer(true)}>✓ VERDADEIRO</button>
            <button className="flex-1 px-6 py-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all" onClick={() => (window as any).answer(false)}>✗ FALSO</button>
          </div>
          
          <div id="modal-feedback" className="mt-6 font-bold min-h-[1.5rem] text-lg"></div>
          <button id="modal-close-btn" className="mt-6 px-8 py-2 border border-slate-700 text-slate-400 rounded-full hover:bg-slate-800 hover:text-white transition-colors mx-auto" style={{ display: 'none' }} onClick={() => (window as any).closeModal()}>Fechar</button>
        </div>
      </div>

      <div id="win" className="fixed inset-0 bg-[#08071a]/95 backdrop-blur-md z-[60] items-center justify-center flex-col text-center p-6" style={{ display: 'none' }}>
        <div className="text-7xl mb-6 animate-bounce">🏆</div>
        <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-br from-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">Sistema Hackeado!</h1>
        <p id="win-msg" className="text-slate-400 mb-10 text-xl font-mono">Concluiu a masmorra no modo {mode.name}.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <button className="px-10 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20" onClick={() => {
             const winDiv = document.getElementById('win'); if(winDiv) winDiv.style.display = 'none';
             if ((window as any).resetGame) (window as any).resetGame();
           }}>Tentar Novamente</button>
           <button className="px-10 py-4 rounded-full border-2 border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors" onClick={() => setMode(null)}>Trocar Modo</button>
        </div>
      </div>
    </div>
  )
}