import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { initGame } from '../lib/gameLogic'
import '../game.css'

export const Route = createFileRoute('/game')({
  component: GameRoom,
})

function GameRoom() {
  const [mode, setMode] = useState<{ time: number | null, lives: number, name: string } | null>(null);

  useEffect(() => {
    if (mode) {
      const cleanup = initGame({ timeLimit: mode.time, maxLives: mode.lives });
      return cleanup;
    }
  }, [mode]);

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#08071a] flex flex-col items-center justify-center font-mono p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 max-w-2xl w-full text-center">
          <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            INICIAR PROTOCOLO
          </h1>
          <p className="text-slate-400 mb-10 text-sm tracking-widest uppercase">Selecione o nível de segurança do sistema</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setMode({ time: null, lives: 3, name: 'ZEN' })} className="group relative p-6 border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/40 hover:border-cyan-400 rounded-xl transition-all text-left overflow-hidden">
              <div className="text-cyan-400 font-bold text-xl mb-1 group-hover:scale-105 transition-transform">🧠 Zen </div>
              <div className="text-slate-400 text-sm">Sem limite de tempo. Pense o quanto quiser. (3 Vidas)</div>
            </button>
            
            <button onClick={() => setMode({ time: 30, lives: 3, name: 'NORMAL' })} className="group relative p-6 border border-green-500/30 bg-green-950/20 hover:bg-green-900/40 hover:border-green-400 rounded-xl transition-all text-left">
              <div className="text-green-400 font-bold text-xl mb-1 group-hover:scale-105 transition-transform">⏱️ Normal</div>
              <div className="text-slate-400 text-sm">30 segundos por porta. O padrão. (3 Vidas)</div>
            </button>
            
            <button onClick={() => setMode({ time: 10, lives: 3, name: 'HARD' })} className="group relative p-6 border border-orange-500/30 bg-orange-950/20 hover:bg-orange-900/40 hover:border-orange-400 rounded-xl transition-all text-left">
              <div className="text-orange-400 font-bold text-xl mb-1 group-hover:scale-105 transition-transform">🔥 Hard Mode</div>
              <div className="text-slate-400 text-sm">10 segundos. Apenas para quem domina a lógica. (3 Vidas)</div>
            </button>

            <button onClick={() => setMode({ time: 5, lives: 2, name: 'NIGHTMARE' })} className="group relative p-6 border border-red-500/30 bg-red-950/20 hover:bg-red-900/40 hover:border-red-500 rounded-xl transition-all text-left">
              <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
              <div className="text-red-500 font-bold text-xl mb-1 group-hover:scale-105 transition-transform relative z-10">💀 Pesadelo</div>
              <div className="text-slate-400 text-sm relative z-10">5 SEGUNDOS. Margem de erro quase nula. (2 Vidas)</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container bg-[#08071a] text-slate-200 min-h-screen flex flex-col font-sans">
      <header className="flex flex-wrap gap-4 items-center justify-between p-4 border-b border-cyan-500/10 bg-white/5">
        <div className="font-mono text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-bold">
          ⚔ Masmorra da Lógica <span className="text-sm font-normal text-slate-500">[{mode.name}]</span>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-center"><div className="font-mono text-xl font-bold text-cyan-400" id="h-score">0</div><div className="text-xs text-slate-500 uppercase">Pontos</div></div>
          <div className="text-center"><div className="font-mono text-xl font-bold text-cyan-400" id="h-lives">❤❤❤</div><div className="text-xs text-slate-500 uppercase">Vidas</div></div>
          <div className="text-center"><div className="font-mono text-xl font-bold text-cyan-400" id="h-rooms">1/10</div><div className="text-xs text-slate-500 uppercase">Salas</div></div>
        </div>
      </header>
      
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div id="map-wrap" className="relative p-4 flex-none w-full md:w-auto flex justify-center overflow-x-auto">
          <canvas id="map" width="760" height="510" className="block rounded-xl border border-cyan-500/10 max-w-full"></canvas>
        </div>
        
        <aside className="flex-1 w-full md:min-w-[260px] md:max-w-[320px] p-5 flex flex-col gap-4 border-l border-white/5 overflow-y-auto">
          <div className="bg-white/5 border border-cyan-500/20 rounded-xl p-5">
            <div className="font-mono text-lg font-bold text-cyan-400 mb-3" id="side-room">INÍCIO</div>
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Tokens da Sala</div>
            <div className="flex gap-3" id="side-tokens"></div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Portas disponíveis</div>
            <div id="door-list"></div>
          </div>
          <div className="text-sm text-slate-300 p-3 bg-white/5 rounded-lg border-l-2 border-purple-500">
            {mode.time ? `Você tem ${mode.time}s para hackear cada porta.` : "Analise a lógica com calma para hackear a porta."}
          </div>
        </aside>
      </main>

      {/* Modal com BARRA DE TEMPO ADICIONADA */}
      <div id="modal" className="hidden fixed inset-0 bg-black/70 backdrop-blur-md z-50 items-center justify-center p-4">
        <div className="bg-[#0f0e2a] border border-cyan-500/20 rounded-2xl p-6 sm:p-10 max-w-[440px] w-full text-center shadow-[0_0_60px_rgba(0,245,255,0.1)] relative overflow-hidden">
          
          {/* Barra de Tempo */}
          <div id="m-timer-wrapper" className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 hidden">
            <div id="m-timer-bar" className="h-full bg-cyan-400 w-full transition-all ease-linear"></div>
          </div>

          <h2 id="m-from-to" className="text-slate-400 font-mono mb-2 mt-2">INÍCIO → Sala A</h2>
          <div id="m-formula" className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent my-4 font-mono">P∧Q</div>
          <div id="m-pqr" className="flex flex-wrap gap-2 sm:gap-4 justify-center my-4"></div>
          <div className="text-slate-400 mb-6 text-sm sm:text-base">Este selo é VERDADEIRO ou FALSO?</div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className="px-6 py-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-black font-bold hover:scale-105 transition-transform" onClick={() => (window as any).answer(true)}>✓ VERDADEIRO</button>
            <button className="px-6 py-3 rounded-full bg-gradient-to-br from-red-400 to-red-700 text-white font-bold hover:scale-105 transition-transform" onClick={() => (window as any).answer(false)}>✗ FALSO</button>
          </div>
          <div id="modal-feedback" className="mt-5 font-bold min-h-[1.5rem]"></div>
          <button id="modal-close-btn" className="mt-4 px-6 py-2 border border-slate-700 text-slate-400 rounded-full hover:border-purple-500 hover:text-purple-300 transition-colors" onClick={() => (window as any).closeModal()}>Fechar</button>
        </div>
      </div>

      <div id="win" className="hidden fixed inset-0 bg-black/85 backdrop-blur-md z-[60] items-center justify-center flex-col text-center p-4">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-yellow-400 to-amber-500 bg-clip-text text-transparent">Sistema Hackeado!</h1>
        <p id="win-msg" className="text-slate-400 my-4 text-lg">Você concluiu a masmorra no modo {mode.name}.</p>
        <div className="flex gap-4 mt-2">
           <button className="px-8 py-3 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-black font-bold" onClick={() => (window as any).resetGame()}>Tentar Novamente</button>
           <button className="px-8 py-3 rounded-full border border-slate-500 text-slate-300 font-bold hover:bg-slate-800" onClick={() => window.location.reload()}>Trocar Modo</button>
        </div>
      </div>
    </div>
  )
}