import { Player, Platform, Particle, Cloud } from './types';

export function drawCloud(ctx: CanvasRenderingContext2D, c: Cloud) {
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, c.w * 0.5, c.w * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(c.x - c.w * 0.25, c.y + 5, c.w * 0.35, c.w * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(c.x + c.w * 0.3, c.y + 3, c.w * 0.3, c.w * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPixelHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FF1493') {
  ctx.fillStyle = color;
  const s = size / 8;
  const rows = [
    [0, 1, 1, 0, 0, 1, 1, 0], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const ox = cx - size / 2;
  const oy = cy - size / 2;
  rows.forEach((row, ry) => row.forEach((v, rx) => { if (v) ctx.fillRect(ox + rx * s, oy + ry * s, s + 0.5, s + 0.5); }));
}

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, frame: number) {
  const { x, y, w, h, facing } = p;
  ctx.fillStyle = '#FF69B4';
  ctx.fillRect(x + 4, y + 8, w - 8, h - 16);
  ctx.fillStyle = '#FFD1DC';
  ctx.fillRect(x + 6, y, w - 12, 12);
  ctx.fillStyle = '#333';
  const eyeOff = facing > 0 ? 4 : -4;
  ctx.fillRect(x + w / 2 - 4 + eyeOff, y + 4, 3, 3);
  ctx.fillRect(x + w / 2 + 2 + eyeOff, y + 4, 3, 3);
  ctx.fillStyle = '#DC143C';
  const legOff = Math.abs(Math.sin(frame * 0.2)) * 3;
  ctx.fillRect(x + 6, y + h - 8, 6, 8 + (p.vx !== 0 ? legOff : 0));
  ctx.fillRect(x + w - 12, y + h - 8, 6, 8 + (p.vx !== 0 ? -legOff + 3 : 0));
  drawPixelHeart(ctx, x + w / 2, y + 14, 8, '#FF1493');
}

export function drawPlatform(ctx: CanvasRenderingContext2D, p: Platform) {
  const col = p.color || '#FF69B4';
  const mobile = ctx.canvas.width < 768;
  const renderY = p.type === 'no' ? (mobile ? ctx.canvas.height - 270 : ctx.canvas.height - 180) : p.y;
  ctx.fillStyle = col;
  ctx.fillRect(p.x, renderY, p.w, p.h);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(p.x, renderY, p.w, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(p.x, renderY + p.h - 4, p.w, 4);
  if (p.w > 40) {
    const hearts = Math.floor(p.w / 40);
    for (let i = 0; i < hearts; i++) drawPixelHeart(ctx, p.x + 20 + i * 40, renderY + p.h / 2, 12, 'rgba(255,255,255,0.25)');
  }
  if (p.label) {
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Press Start 2P", cursive';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, p.x + p.w / 2, renderY + p.h / 2 + 4);
    ctx.textAlign = 'left';
  }
}

export function drawGround(ctx: CanvasRenderingContext2D, cameraX: number, canvasW: number, canvasH: number) {
  const mobile = canvasW < 768;
  const groundY = canvasH - (mobile ? 150 : 40);
  const startX = Math.floor(cameraX / 40) * 40;
  for (let gx = startX - 40; gx < cameraX + canvasW + 40; gx += 40) {
    const shade = Math.abs(gx / 40) % 2 === 0 ? '#FF69B4' : '#FF85C8';
    ctx.fillStyle = shade;
    ctx.fillRect(gx - cameraX, groundY, 40, mobile ? 150 : 40);
    drawPixelHeart(ctx, gx - cameraX + 20, groundY + 20, 10, 'rgba(255,255,255,0.15)');
  }
  ctx.fillStyle = '#DC143C';
  ctx.fillRect(0, groundY, canvasW, 4);
}

export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const alpha = p.life / p.maxLife;
  if (p.type === 'heart') {
    ctx.globalAlpha = alpha;
    drawPixelHeart(ctx, p.x, p.y, p.size, p.color);
    ctx.globalAlpha = 1;
  } else {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  }
}

export function drawLetter(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const hover = Math.sin(frame * 0.1) * 5;
  const ly = y + hover;
  const w = 32;
  const h = 24;
  ctx.fillStyle = '#fdfdfd';
  ctx.fillRect(x, ly, w, h);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, ly, w, h);
  ctx.beginPath();
  ctx.moveTo(x, ly);
  ctx.lineTo(x + w / 2, ly + h / 2);
  ctx.lineTo(x + w, ly);
  ctx.stroke();
  drawPixelHeart(ctx, x + w / 2, ly + h / 2 + 2, 8, '#DC143C');
}

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#FFB6C1');
  grad.addColorStop(0.5, '#FFC0CB');
  grad.addColorStop(1, '#FFD1DC');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}
