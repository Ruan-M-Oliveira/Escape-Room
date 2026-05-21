import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { initGame, getPlayer } from '../lib/gameLogic'
import '../game.css'

export const Route = createFileRoute('/game')({
  component: GameRoom,
})

function GameRoom() {
  const nickname = getPlayer() || 'ANÔNIMO'
  const cleanupRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    const cleanup = initGame()
    cleanupRef.current = cleanup ?? undefined
    return () => {
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  return (
    <div className="game-shell">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="game-header">
        <div className="game-logo">
          <div className="logo-icon">
            <div className="logo-diamond">
              <div className="logo-ping" />
            </div>
          </div>
          <span className="logo-text">ESCAPE[C]ODE</span>
        </div>

        <div className="hud-center">
          <div className="hud-box">
            <div className="hud-val" id="h-score">0</div>
            <div className="hud-lbl">Pontos</div>
          </div>
          <div className="hud-sep" />
          <div className="hud-box">
            <div className="hud-val hud-lives" id="h-lives">❤️❤️❤️</div>
            <div className="hud-lbl">Vidas</div>
          </div>
          <div className="hud-sep" />
          <div className="hud-box">
            <div className="hud-val" id="h-rooms">1/10</div>
            <div className="hud-lbl">Salas</div>
          </div>
        </div>

        <div className="header-right">
          <div className="operator-tag">
            <span className="op-label">OPERADOR</span>
            <span className="op-name" id="h-player">{nickname}</span>
          </div>
          <Link to="/" className="btn-exit">↩ SAIR</Link>
        </div>
      </header>

      {/* ── Game Body ───────────────────────────────────────────── */}
      <main className="game-body">

        {/* Canvas map */}
        <div className="map-panel">
          <div className="map-scanline-top">
            <span>DUNGEON_MAP.EXE</span>
            <span className="blink-dot">■</span>
          </div>
          <div className="map-wrap">
            <canvas id="map" width="960" height="560" className="game-canvas" />
          </div>
          <div className="map-footer">
            <span>FRAME_BUFFER: ACTIVE</span>
            <span>RENDER: ASCII_LOW</span>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="game-aside">

          {/* Current room card */}
          <div className="aside-card">
            <div className="aside-label">SALA ATUAL</div>
            <div className="aside-room-name" id="side-room">INÍCIO</div>
            <div className="aside-sublabel">TOKENS DA SALA</div>
            <div className="tokens-row" id="side-tokens" />
          </div>

          {/* Doors */}
          <div className="aside-section">
            <div className="aside-label">PORTAS DISPONÍVEIS</div>
            <div id="door-list" />
          </div>

          {/* Tip */}
          <div className="aside-tip">
            <span className="tip-icon">💡</span>
            Clique numa porta para avaliar o seu selo lógico e passar para a próxima sala.
          </div>

          {/* Legend */}
          <div className="aside-legend">
            <div className="legend-item">
              <span className="legend-dot green" />
              <span>P ∧ Q = P E Q</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot cyan" />
              <span>¬P ∨ R = NÃO P OU R</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot purple" />
              <span>P ↔ Q = P SE E SÓ SE Q</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot yellow" />
              <span>P → Q = P IMPLICA Q</span>
            </div>
          </div>
        </aside>
      </main>

      {/* ── Door Modal ──────────────────────────────────────────── */}
      <div id="modal" className="overlay-modal">
        <div className="modal-box">
          <h2 id="m-from-to" className="modal-route">INÍCIO → Sala A</h2>
          <div id="m-formula" className="modal-formula">P ∧ Q</div>
          <div id="m-pqr" className="modal-pqr" />
          <p className="modal-question">Este selo é <strong>VERDADEIRO</strong> ou <strong>FALSO</strong>?</p>
          <div className="modal-btns">
            <button
              id="btn-verdadeiro"
              className="btn-true"
              onClick={() => (window as any).answer(true)}
            >
              ✓ VERDADEIRO
            </button>
            <button
              id="btn-falso"
              className="btn-false"
              onClick={() => (window as any).answer(false)}
            >
              ✗ FALSO
            </button>
          </div>
          <div id="modal-feedback" className="modal-feedback" />
          <button
            id="modal-close-btn"
            className="btn-close-modal"
            onClick={() => (window as any).closeModal()}
          >
            Fechar
          </button>
        </div>
      </div>

      {/* ── Win Screen ──────────────────────────────────────────── */}
      <div id="win" className="overlay-end win-overlay">
        <div className="end-box">
          <div className="end-icon">🏆</div>
          <div className="end-badge win-badge">MISSÃO COMPLETA</div>
          <h1 className="end-title win-title">Masmorra Conquistada!</h1>
          <p className="end-subtitle">
            Operador: <span id="win-nickname" className="highlight-cyan">{nickname}</span>
          </p>
          <p id="win-msg" className="end-msg">Você resolveu todos os selos lógicos!</p>
          <div className="end-actions">
            <button
              className="btn-play-again"
              onClick={() => (window as any).resetGame()}
            >
              ↺ JOGAR NOVAMENTE
            </button>
            <Link to="/" className="btn-go-home">⌂ TELA INICIAL</Link>
          </div>
        </div>
      </div>

      {/* ── Game Over Screen ────────────────────────────────────── */}
      <div id="gameover" className="overlay-end lose-overlay">
        <div className="end-box">
          <div className="end-icon">💀</div>
          <div className="end-badge lose-badge">SISTEMA CORROMPIDO</div>
          <h1 className="end-title lose-title">Operador Ejetado!</h1>
          <p className="end-subtitle">
            Operador: <span id="go-nickname" className="highlight-red">{nickname}</span>
          </p>
          <div className="end-stats">
            <div className="stat-box">
              <div className="stat-val" id="go-score">0</div>
              <div className="stat-lbl">PONTOS</div>
            </div>
            <div className="stat-box">
              <div className="stat-val" id="go-rooms">0/10</div>
              <div className="stat-lbl">SALAS</div>
            </div>
          </div>
          <p className="end-msg lose-msg">Suas 3 vidas foram consumidas. O labirinto venceu.</p>
          <div className="end-actions">
            <button
              className="btn-play-again lose-btn"
              onClick={() => (window as any).resetGame()}
            >
              ↺ TENTAR NOVAMENTE
            </button>
            <Link to="/" className="btn-go-home">⌂ TELA INICIAL</Link>
          </div>
        </div>
      </div>
    </div>
  )
}