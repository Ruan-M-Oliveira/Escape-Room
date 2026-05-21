// ── Types & Interfaces ─────────────────────────────────────
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

// ── Global Window Bindings ────────────────────────────────
declare global {
  interface Window {
    answer: (userSays: boolean) => void;
    closeModal: () => void;
    resetGame: () => void;
  }
}

// ── Main Initializer ──────────────────────────────────────
export function initGame() {
  // ── Data ──────────────────────────────────────────────────
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

  // ── Layout constants ──────────────────────────────────────
  const RW = 150, RH = 110, CW = 80, CH = 70;
  const COL = [20, 250, 480, 710]; 
  const ROW = [20, 200, 380];      

  function roomRect(r: Room) { return { x: COL[r.col], y: ROW[r.row], w: RW, h: RH }; }
  function roomCX(r: Room) { return COL[r.col] + RW / 2; }
  function roomCY(r: Room) { return ROW[r.row] + RH / 2; }

  function doorPt(d: Door) {
    const f = ROOMS[d.from], t = ROOMS[d.to];
    return { x: (roomCX(f) + roomCX(t)) / 2, y: (roomCY(f) + roomCY(t)) / 2 };
  }

  // ── State ─────────────────────────────────────────────────
  let current: string = 'inicio';
  let visited = new Set<string>(['inicio']);
  let unlocked = new Set<string>();
  let score: number = 0;
  let lives: number = 3;
  let activeDoor: Door | null = null;
  let pendingMove: string | null = null;
  let tick: number = 0;
  let loopId: number;
  let playerVisualX = 0;
  let playerVisualY = 0;
  let isFirstFrame = true;
  
  // ── Canvas ────────────────────────────────────────────────
  const canvas = document.getElementById('map') as HTMLCanvasElement;
  if (!canvas) return; 
  
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  function drawRoundRect(x: number, y: number, w: number, h: number, r: number | number[], fill: string | null, stroke: string | null, sw: number = 1) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
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
    ctx.textAlign = 'center';
    ctx.fillText(room.name, x + RW / 2, y + RH - 12);

    const rObj = ROOMS[room.id];
    const toks = [{ l: 'P', v: rObj.P }, { l: 'Q', v: rObj.Q }, { l: 'R', v: rObj.R }];
    toks.forEach((t, i) => {
      const tx = x + 24 + i * 36, ty2 = y + 18;
      ctx.beginPath(); ctx.arc(tx, ty2, 12, 0, Math.PI * 2);
      ctx.fillStyle = t.v ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'; ctx.fill();
      ctx.strokeStyle = t.v ? '#4ade80' : '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = t.v ? '#4ade80' : '#ef4444';
      ctx.font = 'bold 9px Outfit'; ctx.textAlign = 'center';
      ctx.fillText(t.v ? 'V' : 'F', tx, ty2 + 3);
      ctx.fillStyle = '#475569'; ctx.font = '8px Outfit';
      ctx.fillText(t.l, tx, ty2 + 15);
    });
  }

  function drawCorridor(d: Door) {
    const f = ROOMS[d.from], t = ROOMS[d.to];
    if (d.dir === 'h') {
      const x1 = COL[f.col] + RW, x2 = COL[t.col];
      const cy = roomCY(f);
      ctx.fillStyle = '#070614';
      ctx.fillRect(x1, cy - 18, x2 - x1, 36);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
      ctx.strokeRect(x1, cy - 18, x2 - x1, 36);
    } else {
      const y1 = ROW[f.row] + RH, y2 = ROW[t.row];
      const cx = roomCX(f);
      ctx.fillStyle = '#070614';
      ctx.fillRect(cx - 18, y1, 36, y2 - y1);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
      ctx.strokeRect(cx - 18, y1, 36, y2 - y1);
    }
  }

  function isAccessible(d: Door) {
    return d.from === current || d.to === current;
  }

  function drawSeal(d: Door) {
    const { x, y } = doorPt(d);
    const acc = isAccessible(d);
    const done = unlocked.has(d.from + '→' + d.to);
    const pulse = 0.85 + 0.15 * Math.sin(tick * 0.07 + (x + y) * 0.01);

    let gc = acc ? (done ? 'rgb(74,222,128)' : 'rgb(0,245,255)') : 'rgb(100,60,180)';
    drawGlow(x, y, 28 * pulse, gc, acc ? 0.35 : 0.15);

    ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = done ? 'rgba(74,222,128,0.15)' : acc ? 'rgba(0,245,255,0.1)' : 'rgba(80,40,140,0.3)';
    ctx.fill();
    ctx.strokeStyle = done ? '#4ade80' : acc ? '#00f5ff' : '#5b21b6';
    ctx.lineWidth = done || acc ? 1.5 : 1; ctx.stroke();

    ctx.fillStyle = done ? '#4ade80' : acc ? '#e2e8f0' : '#7c3aed';
    ctx.font = `bold 9px "Space Mono"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.formula, x, y);
    ctx.textBaseline = 'alphabetic';
  }

  function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, '#08071a'); bg.addColorStop(1, '#0d0a24');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0,245,255,0.02)'; ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    DOORS.forEach(drawCorridor);
    Object.values(ROOMS).forEach(r => {
      if (r.col === 3 && r.row === 0) return;
      if (r.col === 0 && r.row === 2) return;
      drawRoom(r);
    });
    DOORS.forEach(drawSeal);

    const targetRoom = ROOMS[current];
    const targetX = roomCX(targetRoom);
    const targetY = roomCY(targetRoom);

    if (isFirstFrame) {
      playerVisualX = targetX;
      playerVisualY = targetY;
      isFirstFrame = false;
    }

    playerVisualX += (targetX - playerVisualX) * 0.08;
    playerVisualY += (targetY - playerVisualY) * 0.08;

    drawGlow(playerVisualX, playerVisualY, 40, 'rgb(0,245,255)', 0.4);

    const pulse = 0.8 + 0.2 * Math.sin(tick * 0.1);
    ctx.beginPath();
    ctx.arc(playerVisualX, playerVisualY, 8 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0; 

    tick++;
  }

  // ── Sidebar ───────────────────────────────────────────────
  function updateSidebar() {
    const r = ROOMS[current];
    document.getElementById('side-room')!.textContent = r.name;

    const tRow = document.getElementById('side-tokens') as HTMLElement;
    tRow.innerHTML = '';
    [{ l: 'P', v: r.P }, { l: 'Q', v: r.Q }, { l: 'R', v: r.R }].forEach(t => {
      const d = document.createElement('div');
      d.className = 'token ' + (t.v ? 'T' : 'F');
      d.innerHTML = `<span>${t.v ? 'V' : 'F'}</span><span class="token-label">${t.l}</span>`;
      tRow.appendChild(d);
    });

    const dl = document.getElementById('door-list') as HTMLElement;
    dl.innerHTML = '';
    const avail = DOORS.filter(d => d.from === current || (d.to === current));
    avail.forEach(d => {
      const dest = d.from === current ? d.to : d.from;
      const destR = ROOMS[dest];
      const key = d.from + '→' + d.to;
      const done = unlocked.has(key);
      const btn = document.createElement('button');
      btn.className = 'door-btn';
      btn.innerHTML = `<span class="formula">${d.formula}</span><span class="dest">→ ${destR.name}${done ? ' ✓' : ''}</span>`;
      btn.onclick = () => openModal(d);
      if (d.to === current && !unlocked.has(d.from + '→' + d.to)) btn.style.opacity = '0.4';
      else if (d.to === current) btn.onclick = () => moveRoom(d.from);
      dl.appendChild(btn);
    });

    document.getElementById('h-score')!.textContent = score.toString();
    document.getElementById('h-rooms')!.textContent = `${visited.size}/10`;
    const hearts = '❤'.repeat(lives) + '🖤'.repeat(Math.max(0, 3 - lives));
    document.getElementById('h-lives')!.textContent = hearts;
  }

  // ── Modal & Logic ─────────────────────────────────────────
  function openModal(d: Door) {
    // CORREÇÃO: Permite ir e voltar se a porta já estiver destrancada
    if (unlocked.has(d.from + '→' + d.to)) {
      moveRoom(d.to === current ? d.from : d.to);
      return;
    }

    activeDoor = d;
    pendingMove = d.to;
    const r = ROOMS[current];
    document.getElementById('m-from-to')!.textContent = `${ROOMS[d.from].name} → ${ROOMS[d.to].name}`;
    document.getElementById('m-formula')!.textContent = d.formula;
    
    const pqr = document.getElementById('m-pqr') as HTMLElement;
    pqr.innerHTML = '';
    [{ l: 'P', v: r.P }, { l: 'Q', v: r.Q }, { l: 'R', v: r.R }].forEach(t => {
      const c = document.createElement('div');
      c.className = 'pqr-chip ' + (t.v ? 'T' : 'F');
      c.textContent = `${t.l} = ${t.v ? 'V' : 'F'}`;
      pqr.appendChild(c);
    });
    
    document.getElementById('modal-feedback')!.textContent = '';
    document.getElementById('modal-feedback')!.className = '';
    document.getElementById('modal-close-btn')!.style.display = 'none';
    document.getElementById('modal')!.classList.add('show');
  }

  function answer(userSays: boolean) {
    if (!activeDoor) return;
    const r = ROOMS[current];
    const correct = evaluate(activeDoor.formula, r.P, r.Q, r.R);
    const fb = document.getElementById('modal-feedback') as HTMLElement;
    const key = activeDoor.from + '→' + activeDoor.to;
    
    // CORREÇÃO CRÍTICA: Salva o destino antes da variável `activeDoor` ser limpa!
    const destinationRoom = activeDoor.from === current ? activeDoor.to : activeDoor.from;
    
    if (userSays === correct) {
      score += 100;
      unlocked.add(key);
      fb.textContent = '✓ Correto! Porta destravada!';
      fb.className = 'fb-ok';
      document.getElementById('modal-close-btn')!.style.display = 'inline-block';
      
      setTimeout(() => { 
        closeModal(); 
        moveRoom(destinationRoom); // Usa a variável segura salva ali em cima
      }, 1200);
      
    } else {
      lives = Math.max(0, lives - 1);
      fb.textContent = `✗ Errado! Era ${correct ? 'VERDADEIRO' : 'FALSO'}. -1 vida`;
      fb.className = 'fb-err';
      document.getElementById('modal-close-btn')!.style.display = 'inline-block';
      
      if (lives === 0) setTimeout(() => { closeModal(); resetGame(); }, 1500);
    }
    updateSidebar();
  }

  function closeModal() {
    document.getElementById('modal')!.classList.remove('show');
    activeDoor = null;
  }

  function moveRoom(id: string) {
    current = id;
    visited.add(id);
    updateSidebar();
    if (ROOMS[id].type === 'end') showWin();
  }

  function showWin() {
    document.getElementById('win-msg')!.textContent = `Pontuação final: ${score} pontos! Salas visitadas: ${visited.size}/10`;
    document.getElementById('win')!.classList.add('show');
  }

  function resetGame() {
    current = 'inicio'; 
    visited = new Set(['inicio']);
    unlocked = new Set(); 
    score = 0; 
    lives = 3; 
    activeDoor = null;
    document.getElementById('win')!.classList.remove('show');
    updateSidebar();
  }

  // ── Inject Globals for React UI Interaction ───────────────
  window.answer = answer;
  window.closeModal = closeModal;
  window.resetGame = resetGame;

  // ── Click on canvas ───────────────────────────────────────
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let best: Door | null = null, bestD = 99;
    DOORS.forEach(d => {
      const p = doorPt(d);
      const dist = Math.hypot(mx - p.x, my - p.y);
      if (dist < 22 && dist < bestD) { bestD = dist; best = d; }
    });
    if (best) openModal(best);
  });

  // ── Loop ──────────────────────────────────────────────────
  function loop() { 
    loopId = requestAnimationFrame(loop); 
    drawAll(); 
  }
  
  updateSidebar();
  loop();

  return () => {
    cancelAnimationFrame(loopId);
  };
}