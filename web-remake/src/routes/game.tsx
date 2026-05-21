import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { initGame } from '../lib/gameLogic'
import '../game.css'

export const Route = createFileRoute('/game')({
  component: GameRoom,
})

function GameRoom() {
  useEffect(() => {
    initGame();
  }, []);

  return (
    <div className="game-container bg-[#08071a] text-slate-200 min-h-screen flex flex-col font-sans">
      <header className="flex items-center justify-between p-4 border-b border-cyan-500/10 bg-white/5">
        <div className="font-mono text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-bold">
          ⚔ Masmorra da Lógica
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-center"><div className="font-mono text-xl font-bold text-cyan-400" id="h-score">0</div><div className="text-xs text-slate-500 uppercase">Pontos</div></div>
          <div className="text-center"><div className="font-mono text-xl font-bold text-cyan-400" id="h-lives">❤❤❤</div><div className="text-xs text-slate-500 uppercase">Vidas</div></div>
          <div className="text-center"><div className="font-mono text-xl font-bold text-cyan-400" id="h-rooms">1/10</div><div className="text-xs text-slate-500 uppercase">Salas</div></div>
        </div>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        <div id="map-wrap" className="relative p-4 flex-none">
          {/* O Canvas onde a mágica do jogo acontece */}
          <canvas id="map" width="760" height="510" className="block rounded-xl border border-cyan-500/10"></canvas>
        </div>
        
        <aside className="flex-1 min-w-[260px] max-w-[320px] p-5 flex flex-col gap-4 border-l border-white/5 overflow-y-auto">
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
            Clique numa porta para avaliar o seu selo lógico e passar para a próxima sala.
          </div>
        </aside>
      </main>

      {/* Os modais do jogo ficam invisíveis até o JavaScript ativá-los pela classe "show" */}
      <div id="modal" className="hidden fixed inset-0 bg-black/70 backdrop-blur-md z-50 items-center justify-center">
        <div className="bg-[#0f0e2a] border border-cyan-500/20 rounded-2xl p-10 max-w-[440px] w-[90%] text-center shadow-[0_0_60px_rgba(0,245,255,0.1)]">
          <h2 id="m-from-to" className="text-slate-400 font-mono mb-2">INÍCIO → Sala A</h2>
          <div id="m-formula" className="text-4xl font-black bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent my-4 font-mono">P∧Q</div>
          <div id="m-pqr" className="flex gap-4 justify-center my-4"></div>
          <div className="text-slate-400 mb-6">Este selo é VERDADEIRO ou FALSO?</div>
          <div className="flex gap-4 justify-center">
            {/* Como as funções answer e closeModal estão no arquivo vanilla, vamos chamá-las de forma global se necessário, ou convertê-las. Para o jogo original funcionar sem dor de cabeça, mantenha o onClick global chamando window.answer */}
            <button className="px-8 py-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-black font-bold hover:scale-105 transition-transform" onClick={() => (window as any).answer(true)}>✓ VERDADEIRO</button>
            <button className="px-8 py-3 rounded-full bg-gradient-to-br from-red-400 to-red-700 text-white font-bold hover:scale-105 transition-transform" onClick={() => (window as any).answer(false)}>✗ FALSO</button>
          </div>
          <div id="modal-feedback" className="mt-5 font-bold min-h-[1.5rem]"></div>
          <button id="modal-close-btn" className="mt-4 px-6 py-2 border border-slate-700 text-slate-400 rounded-full hover:border-purple-500 hover:text-purple-300 transition-colors" onClick={() => (window as any).closeModal()}>Fechar</button>
        </div>
      </div>

      <div id="win" className="hidden fixed inset-0 bg-black/85 backdrop-blur-md z-[60] items-center justify-center flex-col text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-5xl font-black bg-gradient-to-br from-yellow-400 to-amber-500 bg-clip-text text-transparent">Masmorra Conquistada!</h1>
        <p id="win-msg" className="text-slate-400 my-4 text-lg">Você resolveu todos os selos lógicos!</p>
        <button className="px-10 py-4 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-black font-bold" onClick={() => (window as any).resetGame()}>Jogar Novamente</button>
      </div>
    </div>
  )
}