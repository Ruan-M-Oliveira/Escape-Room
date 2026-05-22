export interface Room {
  id: string;
  name: string;
  col: number;
  row: number;
  P: boolean;
  Q: boolean;
  R: boolean;
  type: 'start' | 'normal' | 'end';
}

export interface Door {
  from: string;
  to: string;
  formula: string;
  dir: 'h' | 'v';
}

declare global {
  interface Window {
    answer: (userSays: boolean) => void;
    closeModal: () => void;
    resetGame: () => void;
  }
}

// ==========================================
// SISTEMA DE LEADERBOARD E JOGADOR
// ==========================================
export interface ScoreEntry {
  name: string;
  score: number;
  mode: string;
  date: string;
}

export function getPlayer(): string {
  return localStorage.getItem('escape_player') || 'Hacker_Anônimo';
}

export function setPlayer(name: string) {
  localStorage.setItem('escape_player', name);
}

export function getScores(): ScoreEntry[] {
  const scores = localStorage.getItem('escape_scores');
  return scores ? JSON.parse(scores) : [];
}

export function saveScore(score: number, modeName: string) {
  const scores = getScores();
  scores.push({ 
    name: getPlayer(), 
    score, 
    mode: modeName, 
    date: new Date().toLocaleDateString() 
  });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('escape_scores', JSON.stringify(scores.slice(0, 10)));
}

// ==========================================
// MOTOR DO JOGO PRINCIPAL
// ==========================================
export function initGame(config: { timeLimit: number | null, maxLives: number, modeName: string }, canvas: HTMLCanvasElement) {
  
  const ROOMS: Record<string, Room> = {
    inicio: { id: 'inicio', name: 'INÍCIO', col: 0, row: 0, P: true, Q: true, R: false, type: 'start' },
    salaA: { id: 'salaA', name: 'Sala A', col: 1, row: 0, P: true, Q: false, R: true, type: 'normal' },
    salaB: { id: 'salaB', name: 'Sala B', col: 2, row: 0, P: false, Q: true, R: true, type: 'normal' },
    salaC: { id: 'salaC', name: 'Sala C', col: 0, row: 1, P: false, Q: true, R: true, type: 'normal' },
    salaD: { id: 'salaD', name: 'Sala D', col: 1, row: 1, P: true, Q: true, R: false, type: 'normal' },
    salaE: { id: 'salaE', name: 'Sala E', col: 2, row: 1, P: true, Q: false, R: true, type: 'normal' },
    salaF: { id: 'salaF', name: 'Sala F', col: 3, row: 1, P: false, Q: true, R: false, type: 'normal' },
    salaG: { id: 'salaG', name: 'Sala G', col: 1, row: 2, P: true, Q: true, R: true, type: 'normal' },
    salaH: { id: 'salaH', name: 'Sala H', col: 2, row: 2, P: true, Q: false, R: false, type: 'normal' },
    final: { id: 'final', name: 'FINAL', col: 3, row: 2, P: true, Q: true, R: true, type: 'end' },
  };

  const DOORS: Door[] = [
    { from: 'inicio', to: 'salaA', formula: 'P∧Q', dir: 'h' },
    { from: 'salaA', to: 'salaB', formula: '¬P∨R', dir: 'h' },
    { from: 'salaC', to: 'salaD', formula: 'P↔Q', dir: 'h' },
    { from: 'salaD', to: 'salaE', formula: 'P→Q', dir: 'h' },
    { from: 'salaE', to: 'salaF', formula: 'P∧Q', dir: 'h' },
    { from: 'salaG', to: 'salaH', formula: '¬P∨R', dir: 'h' },
    { from: 'salaH', to: 'final', formula: 'P↔Q', dir: 'h' },
    { from: 'inicio', to: 'salaC', formula: 'P→Q', dir: 'v' },
    { from: 'salaA', to: 'salaD', formula: 'P∧Q', dir: 'v' },
    { from: 'salaB', to: 'salaE', formula: '¬P∨R', dir: 'v' },
    { from: 'salaD', to: 'salaG', formula: 'P↔Q', dir: 'v' },
    { from: 'salaE', to: 'salaH', formula: 'P→Q', dir: 'v' },
    { from: 'salaF', to: 'final', formula: 'P∧Q', dir: 'v' },
  ];

  function evaluate(f: string, P: boolean, Q: boolean, R: boolean): boolean {
    if (f === 'P∧Q') return P && Q;
    if (f === '¬P∨R') return (!P) || R;
    if (f === 'P↔Q') return P === Q;
    if (f === 'P→Q') return (!P) || Q;
    return false;
  }

  const RW = 150, RH = 110;
  const COL = [20, 250, 480, 710]; 
  const ROW = [20, 200, 380];      

  function roomRect(r: Room) { return { x: COL[r.col], y: ROW[r.row], w: RW, h: RH }; }
  function roomCX(r: Room) { return COL[r.col] + RW / 2; }
  function roomCY(r: Room) { return ROW[r.row] + RH / 2; }
  function doorPt(d: Door) { return { x: (roomCX(ROOMS[d.from]) + roomCX(ROOMS[d.to])) / 2, y: (roomCY(ROOMS[d.from]) + roomCY(ROOMS[d.to])) / 2 }; }

  let current: string = 'inicio';
  let visited = new Set<string>(['inicio']);
  let unlocked = new Set<string>();
  let score: number = 0;
  let lives: number = config.maxLives;
  let activeDoor: Door | null = null;
  let tick: number = 0;
  let loopId: number;
  let playerVisualX = 0;
  let playerVisualY = 0;
  let isFirstFrame = true;

  let timerRafId: number;
  let timerStart = 0;
  let isModalOpen = false;

  if (!canvas) return () => {};

  // Ajusta o canvas para caber todo o mapa (e manter responsivo)
  const margin = 20;
  const mapWidth = Math.max(...COL) + RW + margin;
  const mapHeight = Math.max(...ROW) + RH + margin;

  // Define o tamanho CSS do canvas e configura resolução para displays HiDPI
  if (canvas.parentElement) {
    // tenta caber na largura do container sem ultrapassar
    const parentW = canvas.parentElement.clientWidth || mapWidth;
    const cssW = Math.min(parentW - 32, mapWidth); // deixa um pouco de padding
    canvas.style.width = cssW + 'px';
    canvas.style.height = mapHeight + 'px';
  } else {
    canvas.style.width = mapWidth + 'px';
    canvas.style.height = mapHeight + 'px';
  }

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  // scale so drawing commands use CSS pixels
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  function drawRoundRect(x: number, y: number, w: number, h: number, r: number, fill: string | null, stroke: string | null, sw: number = 1) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
  }

  function drawGlow(x: number, y: number, r: number, color: string, alpha: number = 0.35) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  function drawRoom(room: Room) {
    const { x, y } = roomRect(room);
    const isCur = room.id === current;
    const isVis = visited.has(room.id);
    const isEnd = room.type === 'end';
    const isStart = room.type === 'start';

    if (isCur) drawGlow(x + RW / 2, y + RH / 2, 90, 'rgb(0,245,255)', 0.12);
    if (isEnd) drawGlow(x + RW / 2, y + RH / 2, 90, 'rgb(251,191,36)', 0.15);
    if (isStart) drawGlow(x + RW / 2, y + RH / 2, 75, 'rgb(74,222,128)', 0.1);

    const floorCol = isCur ? '#12163a' : isVis ? '#0e1228' : '#090b1a';
    drawRoundRect(x, y, RW, RH, 8, floorCol, null);

    ctx.strokeStyle = isCur ? 'rgba(0,245,255,0.07)' : 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let tx = x + 24; tx < x + RW; tx += 24) { ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx, y + RH); ctx.stroke(); }
    for (let ty = y + 22; ty < y + RH; ty += 22) { ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x + RW, ty); ctx.stroke(); }

    let bCol = 'rgba(255,255,255,0.06)';
    if (isCur) bCol = 'rgba(0,245,255,0.5)';
    else if (isEnd) bCol = 'rgba(251,191,36,0.5)';
    else if (isStart) bCol = 'rgba(74,222,128,0.35)';
    drawRoundRect(x, y, RW, RH, 8, null, bCol, isCur ? 2 : 1.5);

    ctx.fillStyle = isCur ? '#00f5ff' : isEnd ? '#fbbf24' : isStart ? '#4ade80' : '#64748b';
    ctx.font = `bold 11px "Space Mono"`;
    ctx.textAlign = 'center'; ctx.fillText(room.name, x + RW / 2, y + RH - 12);

    const rObj = ROOMS[room.id];
    [{ l: 'P', v: rObj.P }, { l: 'Q', v: rObj.Q }, { l: 'R', v: rObj.R }].forEach((t, i) => {
      const tx = x + 24 + i * 36, ty2 = y + 18;
      ctx.beginPath(); ctx.arc(tx, ty2, 12, 0, Math.PI * 2);
      ctx.fillStyle = t.v ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'; ctx.fill();
      ctx.strokeStyle = t.v ? '#4ade80' : '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = t.v ? '#4ade80' : '#ef4444';
      ctx.font = 'bold 9px Outfit'; ctx.textAlign = 'center'; ctx.fillText(t.v ? 'V' : 'F', tx, ty2 + 3);
      ctx.fillStyle = '#475569'; ctx.font = '8px Outfit'; ctx.fillText(t.l, tx, ty2 + 15);
    });
  }

  function drawCorridor(d: Door) {
    const f = ROOMS[d.from], t = ROOMS[d.to];
    if (d.dir === 'h') {
      const x1 = COL[f.col] + RW, x2 = COL[t.col], cy = roomCY(f);
      ctx.fillStyle = '#070614'; ctx.fillRect(x1, cy - 18, x2 - x1, 36);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.strokeRect(x1, cy - 18, x2 - x1, 36);
    } else {
      const y1 = ROW[f.row] + RH, y2 = ROW[t.row], cx = roomCX(f);
      ctx.fillStyle = '#070614'; ctx.fillRect(cx - 18, y1, 36, y2 - y1);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.strokeRect(cx - 18, y1, 36, y2 - y1);
    }
  }

  function drawSeal(d: Door) {
    const { x, y } = doorPt(d);
    const acc = d.from === current || d.to === current;
    const done = unlocked.has(d.from + '→' + d.to);
    const pulse = 0.85 + 0.15 * Math.sin(tick * 0.07 + (x + y) * 0.01);

    let gc = acc ? (done ? 'rgb(74,222,128)' : 'rgb(0,245,255)') : 'rgb(100,60,180)';
    drawGlow(x, y, 28 * pulse, gc, acc ? 0.35 : 0.15);

    ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = done ? 'rgba(74,222,128,0.15)' : acc ? 'rgba(0,245,255,0.1)' : 'rgba(80,40,140,0.3)'; ctx.fill();
    ctx.strokeStyle = done ? '#4ade80' : acc ? '#00f5ff' : '#5b21b6'; ctx.lineWidth = done || acc ? 1.5 : 1; ctx.stroke();

    ctx.fillStyle = done ? '#4ade80' : acc ? '#e2e8f0' : '#7c3aed';
    ctx.font = `bold 9px "Space Mono"`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.formula, x, y); ctx.textBaseline = 'alphabetic';
  }

  function drawAll() {
    const CSS_W = canvas.width / (window.devicePixelRatio || 1);
    const CSS_H = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    const bg = ctx.createLinearGradient(0, 0, CSS_W, CSS_H);
    bg.addColorStop(0, '#08071a'); bg.addColorStop(1, '#0d0a24');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CSS_W, CSS_H);

    ctx.strokeStyle = 'rgba(0,245,255,0.02)'; ctx.lineWidth = 1;
    for (let x = 0; x < CSS_W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CSS_H); ctx.stroke(); }
    for (let y = 0; y < CSS_H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CSS_W, y); ctx.stroke(); }

    DOORS.forEach(drawCorridor);
    Object.values(ROOMS).forEach(r => { if (r.col === 3 && r.row === 0) return; if (r.col === 0 && r.row === 2) return; drawRoom(r); });
    DOORS.forEach(drawSeal);

    const targetRoom = ROOMS[current];
    if (isFirstFrame) { playerVisualX = roomCX(targetRoom); playerVisualY = roomCY(targetRoom); isFirstFrame = false; }
    playerVisualX += (roomCX(targetRoom) - playerVisualX) * 0.08;
    playerVisualY += (roomCY(targetRoom) - playerVisualY) * 0.08;

    drawGlow(playerVisualX, playerVisualY, 40, 'rgb(0,245,255)', 0.4);
    const pulse = 0.8 + 0.2 * Math.sin(tick * 0.1);
    ctx.beginPath(); ctx.arc(playerVisualX, playerVisualY, 8 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 15; ctx.stroke(); ctx.shadowBlur = 0; 
    tick++;
  }

  function updateSidebar() {
    const r = ROOMS[current];
    const sideRoomEl = document.getElementById('side-room');
    if(sideRoomEl) sideRoomEl.textContent = r.name;
    
    const tRow = document.getElementById('side-tokens');
    if(tRow) {
      tRow.innerHTML = '';
      [{ l: 'P', v: r.P }, { l: 'Q', v: r.Q }, { l: 'R', v: r.R }].forEach(t => {
        const d = document.createElement('div'); d.className = 'token ' + (t.v ? 'T' : 'F');
        d.innerHTML = `<span>${t.v ? 'V' : 'F'}</span><span class="token-label">${t.l}</span>`; tRow.appendChild(d);
      });
    }

    const dl = document.getElementById('door-list');
    if(dl) {
      dl.innerHTML = '';
      const avail = DOORS.filter(d => d.from === current || (d.to === current));
      avail.forEach(d => {
        const dest = d.from === current ? d.to : d.from;
        const done = unlocked.has(d.from + '→' + d.to);
        const btn = document.createElement('button'); btn.className = 'door-btn';
        btn.innerHTML = `<span class="formula">${d.formula}</span><span class="dest">→ ${ROOMS[dest].name}${done ? ' ✓' : ''}</span>`;
        btn.onclick = () => openModal(d);
        if (d.to === current && !unlocked.has(d.from + '→' + d.to)) btn.style.opacity = '0.4';
        else if (d.to === current) btn.onclick = () => moveRoom(d.from);
        dl.appendChild(btn);
      });
    }

    const scoreEl = document.getElementById('h-score'); if(scoreEl) scoreEl.textContent = score.toString();
    const roomsEl = document.getElementById('h-rooms'); if(roomsEl) roomsEl.textContent = `${visited.size}/10`;
    const livesEl = document.getElementById('h-lives'); if(livesEl) livesEl.textContent = '❤'.repeat(lives) + '🖤'.repeat(Math.max(0, config.maxLives - lives));
  }

  function processTimer() {
    if (!isModalOpen || !config.timeLimit) return;
    const elapsed = (performance.now() - timerStart) / 1000;
    const remaining = Math.max(0, config.timeLimit - elapsed);
    const percent = (remaining / config.timeLimit) * 100;
    
    const bar = document.getElementById('m-timer-bar');
    if (bar) {
      bar.style.width = `${percent}%`;
      bar.style.backgroundColor = percent < 30 ? '#ef4444' : percent < 60 ? '#f59e0b' : '#00f5ff';
    }

    if (remaining === 0) forceTimeout();
    else timerRafId = requestAnimationFrame(processTimer);
  }

  function forceTimeout() {
    isModalOpen = false;
    const fb = document.getElementById('modal-feedback');
    lives = Math.max(0, lives - 1);
    
    if(fb) {
      fb.textContent = `⏳ TEMPO ESGOTADO! Sistema bloqueou o acesso. -1 vida`;
      fb.className = 'fb-err';
    }
    const btn = document.getElementById('modal-close-btn');
    if (btn) btn.style.display = 'inline-block';
    
    if (lives === 0) setTimeout(() => { closeModal(); resetGame(); }, 1500);
    updateSidebar();
  }

  function openModal(d: Door) {
    if (unlocked.has(d.from + '→' + d.to)) { moveRoom(d.to === current ? d.from : d.to); return; }
    
    activeDoor = d;
    const r = ROOMS[current];
    const fromTo = document.getElementById('m-from-to'); if(fromTo) fromTo.textContent = `${ROOMS[d.from].name} → ${ROOMS[d.to].name}`;
    const mForm = document.getElementById('m-formula'); if(mForm) mForm.textContent = d.formula;
    
    const pqr = document.getElementById('m-pqr');
    if (pqr) {
      pqr.innerHTML = '';
      [{ l: 'P', v: r.P }, { l: 'Q', v: r.Q }, { l: 'R', v: r.R }].forEach(t => {
        const c = document.createElement('div'); c.className = 'pqr-chip ' + (t.v ? 'T' : 'F');
        c.textContent = `${t.l} = ${t.v ? 'V' : 'F'}`; pqr.appendChild(c);
      });
    }
    
    const fb = document.getElementById('modal-feedback'); if (fb) { fb.textContent = ''; fb.className = ''; }
    const closeBtn = document.getElementById('modal-close-btn'); if (closeBtn) closeBtn.style.display = 'none';

    const modalDiv = document.getElementById('modal');
    if (modalDiv) modalDiv.style.display = 'flex';

    isModalOpen = true;
    if (config.timeLimit) {
      const wrapper = document.getElementById('m-timer-wrapper'); if (wrapper) wrapper.style.display = 'block';
      const bar = document.getElementById('m-timer-bar'); if (bar) bar.style.width = '100%';
      timerStart = performance.now();
      timerRafId = requestAnimationFrame(processTimer);
    }
  }

  function answer(userSays: boolean) {
    if (!activeDoor || !isModalOpen) return;
    isModalOpen = false; 
    cancelAnimationFrame(timerRafId);
    
    const correct = evaluate(activeDoor.formula, ROOMS[current].P, ROOMS[current].Q, ROOMS[current].R);
    const fb = document.getElementById('modal-feedback');
    const key = activeDoor.from + '→' + activeDoor.to;
    const destinationRoom = activeDoor.from === current ? activeDoor.to : activeDoor.from;
    
    if (userSays === correct) {
      score += (config.timeLimit === 5 ? 300 : config.timeLimit ? 150 : 100);
      unlocked.add(key);
      if(fb) { fb.textContent = '✓ Acesso Concedido!'; fb.className = 'fb-ok'; }
      const btn = document.getElementById('modal-close-btn'); if(btn) btn.style.display = 'inline-block';
      setTimeout(() => { closeModal(); moveRoom(destinationRoom); }, 1000);
    } else {
      lives = Math.max(0, lives - 1);
      if(fb) { fb.textContent = `✗ Resposta Incorreta! Era ${correct ? 'VERDADEIRO' : 'FALSO'}. -1 vida`; fb.className = 'fb-err'; }
      const btn = document.getElementById('modal-close-btn'); if(btn) btn.style.display = 'inline-block';
      if (lives === 0) setTimeout(() => { closeModal(); resetGame(); }, 1500);
    }
    updateSidebar();
  }

  function closeModal() {
    isModalOpen = false;
    cancelAnimationFrame(timerRafId);
    const modalDiv = document.getElementById('modal');
    if (modalDiv) modalDiv.style.display = 'none';
    activeDoor = null;
  }

  function moveRoom(id: string) {
    current = id; visited.add(id); updateSidebar();
    if (ROOMS[id].type === 'end') {
      const winDiv = document.getElementById('win');
      if (winDiv) winDiv.style.display = 'flex';
      saveScore(score, config.modeName);
    }
  }

  function resetGame() {
    current = 'inicio'; visited = new Set(['inicio']); unlocked = new Set(); 
    score = 0; lives = config.maxLives; activeDoor = null;
    const winDiv = document.getElementById('win');
    if (winDiv) winDiv.style.display = 'none';
    updateSidebar();
  }

  window.answer = answer;
  window.closeModal = closeModal;
  window.resetGame = resetGame;

  // ====================================================
  // SOLUÇÃO FINAL DE DETECÇÃO DE CLIQUE NO CANVAS
  // ====================================================
  const clickHandler = (e: Event) => {
    if (isModalOpen) return;
    
    // Converte o evento para a interface nativa de rato
    const mouseEvent = e as MouseEvent;
    
    const rect = canvas.getBoundingClientRect();
    // Usamos coordenadas CSS (px) pois todo o desenho é feito em CSS pixels
    const mx = mouseEvent.clientX - rect.left;
    const my = mouseEvent.clientY - rect.top;
    
    let best: Door | null = null, bestD = 99;
    
    DOORS.forEach(d => {
      const p = doorPt(d); 
      const dist = Math.hypot(mx - p.x, my - p.y);
      const isConnected = d.from === current || d.to === current;
      
      // Hitbox massiva de 80px
      if (isConnected && dist < 80 && dist < bestD) { bestD = dist; best = d; }
    });
    
    if (best) openModal(best);
  };

  // Escuta apenas pelo evento de clique padrão garantindo leitura universal
  canvas.addEventListener('click', clickHandler);

  function loop() { loopId = requestAnimationFrame(loop); drawAll(); }
  setTimeout(updateSidebar, 50); 
  loop();

  return () => { 
    cancelAnimationFrame(loopId); 
    cancelAnimationFrame(timerRafId); 
    canvas.removeEventListener('click', clickHandler);
  };
}