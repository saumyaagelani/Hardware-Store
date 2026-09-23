/**
 * PLACEHOLDER PRODUCT ILLUSTRATIONS
 * -----------------------------------------------------------------------------
 * Final product photography has not been supplied. Rather than using stock or
 * third-party photos, the prototype renders consistent, clearly-illustrative
 * SVG artwork per product (colour-aware, three views each). Replace product
 * image URLs in the admin/product data with real photos when available.
 */
import type { ArtKind } from "@/lib/types";

export type View = 1 | 2 | 3;

export interface ArtSpec {
  kind: ArtKind;
  primary: string;
  secondary?: string;
  variant?: number;
  seed: string;
}

/* ------------------------------- utilities ------------------------------- */

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let a = hashString(seed) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clampHex(hex: string): string {
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#9ca3af";
}

/** Lighten (amt > 0) or darken (amt < 0) a hex colour. */
export function shade(hex: string, amt: number): string {
  const h = clampHex(hex).slice(1);
  const n = parseInt(h, 16);
  const mix = (c: number) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function luminance(hex: string): number {
  const n = parseInt(clampHex(hex).slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ------------------------------ shared defs ------------------------------ */

function baseDefs(): string {
  return `
  <linearGradient id="studio" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f7f8f9"/><stop offset="1" stop-color="#eceef1"/>
  </linearGradient>
  <radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#111827" stop-opacity="0.28"/><stop offset="1" stop-color="#111827" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e9f3f7" stop-opacity="0.85"/><stop offset="0.45" stop-color="#cfe3ec" stop-opacity="0.55"/><stop offset="1" stop-color="#b7d1dc" stop-opacity="0.75"/>
  </linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>`;
}

function groundShadow(cx: number, cy: number, rx: number, ry: number): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#shadow)"/>`;
}

/* ----------------------------- wood / grain ------------------------------ */

function grainLines(x: number, y: number, w: number, h: number, color: string, rand: () => number, vertical = false): string {
  const lines: string[] = [];
  const count = Math.max(3, Math.round((vertical ? w : h) / 9));
  for (let i = 0; i < count; i++) {
    const off = ((i + rand() * 0.8) / count) * (vertical ? w : h);
    const amp = 1.5 + rand() * 3.5;
    const len = vertical ? h : w;
    const segs = 4;
    let d = vertical ? `M${r1(x + off)} ${r1(y)}` : `M${r1(x)} ${r1(y + off)}`;
    for (let s = 1; s <= segs; s++) {
      const t = (s / segs) * len;
      const c = ((s - 0.5) / segs) * len;
      const wob = (rand() - 0.5) * amp * 2;
      d += vertical
        ? ` Q${r1(x + off + wob)} ${r1(y + c)} ${r1(x + off)} ${r1(y + t)}`
        : ` Q${r1(x + c)} ${r1(y + off + wob)} ${r1(x + t)} ${r1(y + off)}`;
    }
    lines.push(`<path d="${d}" stroke="${color}" stroke-opacity="${(0.18 + rand() * 0.25).toFixed(2)}" stroke-width="${(0.8 + rand() * 1.4).toFixed(1)}" fill="none"/>`);
  }
  if (rand() > 0.45) {
    const kx = x + w * (0.2 + rand() * 0.6);
    const ky = y + h * (0.3 + rand() * 0.4);
    lines.push(
      `<ellipse cx="${r1(kx)}" cy="${r1(ky)}" rx="${vertical ? 3 : 9}" ry="${vertical ? 9 : 3}" fill="${color}" fill-opacity="0.35"/>`,
    );
  }
  return lines.join("");
}

function plankTexture(x: number, y: number, w: number, h: number, base: string, dark: string, rand: () => number, vertical = false): string {
  const tone = shade(base, (rand() - 0.5) * 0.14);
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${tone}"/>${grainLines(x, y, w, h, dark, rand, vertical)}`;
}

/* ================================ KINDS ================================== */

/** Each drawer renders the product centred in an 800x800 canvas. */
type Drawer = (spec: ArtSpec, rand: () => number) => string;

const drawVinyl: Drawer = (spec, rand) => {
  const base = spec.primary;
  const dark = spec.secondary ?? shade(base, -0.35);
  const v = spec.variant ?? 0;

  if (v === 7) {
    // Underlayment roll
    return `${groundShadow(400, 600, 260, 34)}
    <g>
      <rect x="170" y="330" width="420" height="250" rx="12" fill="${shade(base, -0.05)}"/>
      <rect x="170" y="330" width="420" height="250" rx="12" fill="url(#metal)"/>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${200 + i * 45}" y1="330" x2="${200 + i * 45}" y2="580" stroke="${dark}" stroke-opacity="0.2" stroke-width="2"/>`).join("")}
      <ellipse cx="590" cy="455" rx="60" ry="125" fill="${shade(base, 0.1)}" stroke="${dark}" stroke-opacity="0.35"/>
      ${[100, 80, 60, 40, 22].map((ry, i) => `<ellipse cx="590" cy="455" rx="${ry * 0.48}" ry="${ry}" fill="none" stroke="${dark}" stroke-opacity="${0.2 + i * 0.08}" stroke-width="2"/>`).join("")}
      <ellipse cx="590" cy="455" rx="8" ry="16" fill="#9aa3ad"/>
      <path d="M170 560 L110 640 L520 640 L590 580" fill="${shade(base, 0.06)}" stroke="${dark}" stroke-opacity="0.25"/>
    </g>`;
  }

  if (v === 3) {
    // Large-format tiles, top-down sample board
    const tiles: string[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const x = 150 + col * 252 + (row % 2 ? 0 : 0);
        const y = 180 + row * 150;
        const tone = shade(base, (rand() - 0.5) * 0.12);
        tiles.push(`<rect x="${x}" y="${y}" width="246" height="144" rx="2" fill="${tone}"/>`);
        for (let s = 0; s < 40; s++) {
          tiles.push(`<circle cx="${r1(x + rand() * 246)}" cy="${r1(y + rand() * 144)}" r="${r1(0.6 + rand() * 1.8)}" fill="${dark}" fill-opacity="${(0.12 + rand() * 0.2).toFixed(2)}"/>`);
        }
        tiles.push(`<path d="M${x + 20} ${y + 30 + rand() * 60} q ${60 + rand() * 60} ${-20 + rand() * 40} ${160 + rand() * 40} ${-10 + rand() * 30}" stroke="${shade(base, 0.25)}" stroke-width="10" stroke-opacity="0.25" fill="none"/>`);
      }
    }
    return `${groundShadow(400, 660, 300, 30)}
      <g transform="translate(0 -10)"><rect x="142" y="172" width="516" height="468" rx="6" fill="${shade(base, -0.3)}"/>${tiles.join("")}</g>`;
  }

  if (v === 5) {
    // Herringbone: stair-stepped bands of horizontal + vertical planks, rotated 45°.
    const W = 34;
    const L = 136;
    const parts: string[] = [`<clipPath id="hb"><rect x="150" y="150" width="500" height="500" rx="4"/></clipPath><g clip-path="url(#hb)"><rect x="150" y="150" width="500" height="500" fill="${dark}"/><g transform="rotate(45 400 400)">`];
    const plank = (x: number, y: number, w: number, h: number) => {
      const tone = shade(base, (rand() - 0.5) * 0.18);
      return `<rect x="${r1(x)}" y="${r1(y)}" width="${w}" height="${h}" fill="${tone}" stroke="${dark}" stroke-width="1.5"/>${grainLines(x, y, w, h, shade(base, -0.45), rand, h > w)}`;
    };
    for (let t = -6; t <= 6; t++) {
      for (let s2 = -12; s2 <= 12; s2++) {
        const ox = 400 + s2 * W - t * L;
        const oy = 400 + s2 * W + t * L;
        if (Math.abs(ox - 400) > 520 || Math.abs(oy - 400) > 520) continue;
        parts.push(plank(ox, oy, L, W), plank(ox + L, oy + W - L, W, L));
      }
    }
    parts.push("</g></g>");
    return `${groundShadow(400, 670, 300, 28)}${parts.join("")}<rect x="150" y="150" width="500" height="500" rx="4" fill="none" stroke="#111827" stroke-opacity="0.12"/>`;
  }

  // Default: fanned plank samples with layered edge
  const planks: string[] = [];
  const count = 5;
  const w = 540;
  const h = v === 4 ? 70 : 84;
  for (let i = 0; i < count; i++) {
    const y = 190 + i * (h + 6);
    const x = 130 + (i % 2 ? 26 : 0);
    planks.push(
      `<g><rect x="${x + 4}" y="${y + 6}" width="${w}" height="${h}" rx="3" fill="#111827" fill-opacity="0.08"/>` +
        `<clipPath id="p${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/></clipPath>` +
        `<g clip-path="url(#p${i})">${plankTexture(x, y, w * 0.55, h, base, dark, rand)}${plankTexture(x + w * 0.55, y, w * 0.45, h, base, dark, rand)}` +
        `<line x1="${x + w * 0.55}" y1="${y}" x2="${x + w * 0.55}" y2="${y + h}" stroke="${dark}" stroke-opacity="0.45" stroke-width="1.5"/>` +
        `<rect x="${x}" y="${y}" width="${w}" height="3" fill="#ffffff" fill-opacity="0.35"/></g>` +
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="${dark}" stroke-opacity="0.35"/></g>`,
    );
  }
  // Cutaway showing SPC layers
  const layers = `<g transform="translate(560 575)">
    <rect x="0" y="0" width="150" height="12" fill="${base}"/><rect x="0" y="12" width="150" height="4" fill="#ffffff" fill-opacity="0.7"/>
    <rect x="0" y="16" width="150" height="26" fill="#8f949b"/><rect x="0" y="42" width="150" height="12" fill="#3b4048"/>
    <rect x="0" y="0" width="150" height="54" fill="none" stroke="#111827" stroke-opacity="0.2"/></g>`;
  return `${groundShadow(420, 660, 330, 30)}${planks.join("")}${v === 6 ? "" : layers}`;
};

const drawDoor: Drawer = (spec, rand) => {
  void rand;
  const base = spec.primary;
  const accent = spec.secondary ?? shade(base, -0.2);
  const v = spec.variant ?? 0;
  const edge = shade(base, -0.12);
  const lever = (x: number, y: number, color = "#1f2328") =>
    `<g><circle cx="${x}" cy="${y}" r="13" fill="${color}"/><rect x="${x - 44}" y="${y - 5}" width="46" height="10" rx="5" fill="${color}"/><circle cx="${x}" cy="${y}" r="13" fill="url(#metal)"/></g>`;
  const panel = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${shade(base, -0.035)}"/>
     <path d="M${x} ${y} h${w} l-8 8 h${-(w - 16)} v${h - 16} l-8 8 z" fill="${shade(base, -0.1)}"/>
     <path d="M${x + w} ${y + h} h${-w} l8 -8 h${w - 16} v${-(h - 16)} l8 -8 z" fill="${shade(base, 0.06)}"/>`;

  if (v === 2) {
    // Barn door with track
    const slats = Array.from({ length: 6 }, (_, i) => `<rect x="${250 + i * 50}" y="190" width="50" height="520" fill="${shade(base, (i % 3) * 0.04 - 0.03)}" stroke="${shade(base, -0.3)}" stroke-width="1.5"/>${grainLines(250 + i * 50, 190, 50, 520, shade(base, -0.4), rng(spec.seed + i), true)}`).join("");
    return `${groundShadow(400, 722, 200, 18)}
      <rect x="140" y="128" width="520" height="14" rx="4" fill="${accent}"/>
      <circle cx="290" cy="152" r="22" fill="${accent}"/><circle cx="510" cy="152" r="22" fill="${accent}"/>
      <rect x="284" y="150" width="12" height="54" fill="${accent}"/><rect x="504" y="150" width="12" height="54" fill="${accent}"/>
      ${slats}
      <path d="M250 190 L550 710 M550 190 L250 710" stroke="${shade(base, -0.25)}" stroke-width="16" stroke-opacity="0.35"/>
      <rect x="250" y="190" width="300" height="520" fill="none" stroke="${shade(base, -0.35)}" stroke-width="3"/>
      <rect x="515" y="380" width="12" height="130" rx="6" fill="${accent}"/>`;
  }
  if (v === 3) {
    // Mirrored bifold
    const leaf = (x: number) => `<rect x="${x}" y="150" width="118" height="560" fill="#ffffff" stroke="#d1d5db" stroke-width="6"/>
      <rect x="${x + 6}" y="156" width="106" height="548" fill="url(#glass)"/>
      <path d="M${x + 20} 170 l70 0 l-60 300 l-10 0 z" fill="#ffffff" fill-opacity="0.35"/>`;
    return `${groundShadow(400, 722, 260, 18)}<rect x="160" y="140" width="480" height="10" fill="#d1d5db"/>${[164, 282, 400, 518].map(leaf).join("")}`;
  }
  if (v === 4) {
    // French double door with frosted lites
    const leaf = (x: number, flip: boolean) => {
      const lites = Array.from({ length: 5 }, (_, i) => `<rect x="${x + 24}" y="${190 + i * 98}" width="124" height="88" fill="#e8eef1"/><rect x="${x + 24}" y="${190 + i * 98}" width="124" height="88" fill="url(#glass)" fill-opacity="0.5"/>`).join("");
      return `<rect x="${x}" y="166" width="172" height="550" fill="${base}" stroke="${edge}" stroke-width="2"/>${lites}${lever(flip ? x + 18 : x + 154, 450)}`;
    };
    return `${groundShadow(400, 726, 250, 18)}<rect x="208" y="152" width="384" height="572" fill="${shade(base, -0.06)}"/>${leaf(224, false)}${leaf(404, true)}`;
  }
  // Slab variants: 0 shaker 1-panel, 1 shaker 2-panel, 5 solid core
  const door = `<rect x="250" y="130" width="300" height="600" fill="${base}" stroke="${edge}" stroke-width="2"/>
    <rect x="550" y="130" width="14" height="600" fill="${shade(base, -0.18)}"/>`;
  const panels =
    v === 1
      ? panel(300, 180, 200, 240) + panel(300, 470, 200, 210)
      : v === 5
        ? panel(300, 180, 200, 500) + `<rect x="250" y="130" width="300" height="600" fill="${shade(base, -0.05)}" fill-opacity="0.35"/>`
        : panel(300, 180, 200, 500);
  const hinges = v === 1 ? `<rect x="244" y="200" width="8" height="46" fill="#b9bcbf"/><rect x="244" y="420" width="8" height="46" fill="#b9bcbf"/><rect x="244" y="620" width="8" height="46" fill="#b9bcbf"/>` : "";
  return `${groundShadow(410, 738, 210, 18)}${door}${panels}${hinges}${v === 1 || v === 5 ? lever(520, 450, "#8e9296") : ""}`;
};

const drawStairs: Drawer = (spec, rand) => {
  const base = spec.primary;
  const dark = spec.secondary ?? shade(base, -0.3);
  const v = spec.variant ?? 0;
  if (v === 0 || v === 6) {
    const steps: string[] = [];
    const n = v === 6 ? 5 : 4;
    for (let i = 0; i < n; i++) {
      const x = 170 + i * 80;
      const y = 600 - i * 90;
      steps.push(`<rect x="${x}" y="${y}" width="${520 - i * 80}" height="90" fill="${v === 6 ? "#f4f3ef" : "#f1efe9"}" stroke="#d5d0c4"/>`);
      steps.push(`<g><rect x="${x - 10}" y="${y - 22}" width="${540 - i * 80}" height="24" rx="10" fill="${base}"/>${grainLines(x - 10, y - 22, 540 - i * 80, 24, shade(base, -0.45), rand)}<rect x="${x - 10}" y="${y - 22}" width="${540 - i * 80}" height="24" rx="10" fill="url(#metal)"/></g>`);
    }
    return `${groundShadow(420, 700, 300, 22)}${steps.reverse().join("")}`;
  }
  if (v === 2 || v === 5) {
    // Single board, isometric
    const top = v === 5 ? "#f1efe9" : base;
    return `${groundShadow(410, 560, 300, 30)}
      <g transform="translate(400 420) skewY(-12)">
        <rect x="-300" y="-60" width="600" height="${v === 5 ? 150 : 120}" fill="${top}"/>
        ${v === 5 ? "" : grainLines(-300, -60, 600, 120, shade(base, -0.45), rand)}
        <rect x="-300" y="${v === 5 ? 90 : 60}" width="600" height="22" fill="${shade(top, -0.18)}"/>
        <rect x="-300" y="-60" width="600" height="${v === 5 ? 172 : 142}" fill="url(#metal)" fill-opacity="0.6"/>
      </g>`;
  }
  // Mouldings / nosing: long profile at an angle
  const profile =
    v === 1
      ? `<path d="M0 0 h70 q14 0 14 14 v26 h-18 v-22 h-66 z" fill="${base}" stroke="${dark}" stroke-width="2"/>`
      : v === 3
        ? `<path d="M0 30 q0 -10 10 -12 l20 -6 h60 l20 6 q10 2 10 12 v6 h-45 v24 h-30 v-24 h-45 z" fill="${base}" stroke="${dark}" stroke-width="2"/>`
        : `<path d="M0 0 v60 h60 a60 60 0 0 0 -60 -60 z" fill="${base}" stroke="${dark}" stroke-width="2"/>`;
  return `${groundShadow(400, 600, 300, 26)}
    <g transform="translate(130 520) rotate(-22)">
      <rect x="0" y="0" width="560" height="${v === 1 ? 40 : 46}" fill="${base}"/>
      ${grainLines(0, 0, 560, 40, shade(base, -0.4), rand)}
      <rect x="0" y="0" width="560" height="14" fill="#ffffff" fill-opacity="0.18"/>
    </g>
    <g transform="translate(560 520) scale(1.8)">${profile}</g>`;
};

const drawShowerBase: Drawer = (spec) => {
  const base = spec.primary;
  const rim = spec.secondary ?? "#c9ced6";
  const v = spec.variant ?? 0;
  const dots = (x: number, y: number, w: number, h: number) =>
    Array.from({ length: Math.floor(w / 26) * Math.floor(h / 26) }, (_, i) => {
      const cx = x + 13 + (i % Math.floor(w / 26)) * 26;
      const cy = y + 13 + Math.floor(i / Math.floor(w / 26)) * 26;
      return `<circle cx="${cx}" cy="${cy}" r="2.2" fill="${rim}" fill-opacity="0.5"/>`;
    }).join("");
  if (v === 2) {
    return `${groundShadow(400, 640, 280, 30)}
      <path d="M160 240 L400 240 L640 400 L640 600 L160 600 Z" fill="${base}" stroke="${rim}" stroke-width="4"/>
      <path d="M190 270 L392 270 L610 414 L610 570 L190 570 Z" fill="${shade(base, -0.03)}"/>
      <path d="M160 240 L400 240 L640 400 L640 380 L410 222 L150 222 Z" fill="${rim}"/>
      <circle cx="400" cy="440" r="26" fill="#b9bcbf"/><circle cx="400" cy="440" r="20" fill="none" stroke="#6b7280" stroke-dasharray="3 4" stroke-width="3"/>`;
  }
  const drain =
    v === 3
      ? `<rect x="210" y="290" width="380" height="22" rx="4" fill="#9aa3ad"/>${Array.from({ length: 18 }, (_, i) => `<rect x="${222 + i * 20}" y="296" width="10" height="10" rx="2" fill="#4b5563"/>`).join("")}`
      : `<circle cx="${v === 1 ? 400 : 250}" cy="430" r="28" fill="#b9bcbf"/><circle cx="${v === 1 ? 400 : 250}" cy="430" r="21" fill="none" stroke="#6b7280" stroke-dasharray="3 4" stroke-width="3"/>`;
  const h = v === 1 ? 330 : 280;
  const y = v === 1 ? 250 : 270;
  return `${groundShadow(400, y + h + 40, 320, 28)}
    <rect x="120" y="${y - 30}" width="560" height="30" fill="${rim}"/>
    <rect x="${120 - 22}" y="${y - 30}" width="22" height="${h + 30}" fill="${shade(rim, -0.05)}"/>
    <rect x="680" y="${y - 30}" width="22" height="${h + 30}" fill="${shade(rim, -0.05)}"/>
    <rect x="120" y="${y}" width="560" height="${h}" rx="${v === 3 ? 4 : 10}" fill="${base}" stroke="${rim}" stroke-width="4"/>
    <rect x="150" y="${y + 26}" width="500" height="${h - 56}" rx="8" fill="${shade(base, -0.03)}"/>
    ${dots(160, y + 36, 480, h - 76)}
    ${drain}
    <rect x="120" y="${y + h - 16}" width="560" height="22" fill="${shade(base, -0.08)}"/>`;
};

const drawShowerDoor: Drawer = (spec) => {
  const hw = spec.primary;
  const v = spec.variant ?? 0;
  const glassPanel = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)" stroke="${shade("#b7d1dc", -0.2)}" stroke-width="2"/>
     <path d="M${x + w * 0.15} ${y + 10} l${w * 0.25} 0 l${-w * 0.35} ${h * 0.55} l${-w * 0.02} 0 z" fill="#ffffff" fill-opacity="0.45"/>
     <rect x="${x + 4}" y="${y}" width="3" height="${h}" fill="#ffffff" fill-opacity="0.6"/>`;
  if (v === 2) {
    return `${groundShadow(400, 700, 300, 22)}
      <rect x="120" y="560" width="560" height="120" rx="10" fill="#f7f8fa" stroke="#c9ced6" stroke-width="3"/>
      <rect x="130" y="200" width="16" height="360" fill="${hw}"/><rect x="654" y="200" width="16" height="360" fill="${hw}"/>
      <rect x="130" y="196" width="540" height="14" fill="${hw}"/>
      ${glassPanel(150, 212, 270, 340)}${glassPanel(380, 214, 270, 340)}
      <rect x="220" y="340" width="120" height="8" rx="4" fill="${hw}"/>`;
  }
  if (v === 3) {
    return `${groundShadow(400, 700, 300, 22)}
      <path d="M170 160 L430 220 L430 690 L170 650 Z" fill="url(#glass)" stroke="#9fb8c3" stroke-width="2"/>
      <path d="M430 220 L650 150 L650 650 L430 690 Z" fill="url(#glass)" stroke="#9fb8c3" stroke-width="2"/>
      <rect x="426" y="300" width="8" height="40" fill="${hw}"/><rect x="426" y="560" width="8" height="40" fill="${hw}"/>
      <rect x="600" y="360" width="10" height="140" rx="5" fill="${hw}"/>
      <path d="M190 190 l60 12 l-60 260 z" fill="#ffffff" fill-opacity="0.4"/>`;
  }
  if (v === 1) {
    return `${groundShadow(400, 720, 220, 20)}
      <rect x="248" y="140" width="10" height="560" fill="${hw}"/>
      ${glassPanel(262, 140, 290, 560)}
      <rect x="258" y="170" width="18" height="30" rx="3" fill="${hw}"/><rect x="258" y="640" width="18" height="30" rx="3" fill="${hw}"/>
      <rect x="506" y="360" width="12" height="150" rx="6" fill="${hw}"/>`;
  }
  return `${groundShadow(400, 720, 320, 20)}
    <rect x="110" y="120" width="580" height="16" rx="8" fill="${hw}"/><rect x="110" y="120" width="580" height="16" rx="8" fill="url(#metal)"/>
    ${glassPanel(130, 150, 300, 560)}${glassPanel(370, 146, 300, 564)}
    <circle cx="410" cy="148" r="14" fill="${hw}"/><circle cx="640" cy="148" r="14" fill="${hw}"/>
    <rect x="386" y="360" width="12" height="160" rx="6" fill="${hw}"/><rect x="386" y="360" width="12" height="160" rx="6" fill="url(#metal)"/>`;
};

const drawLock: Drawer = (spec) => {
  const c = spec.primary;
  const accent = spec.secondary ?? shade(c, 0.2);
  const v = spec.variant ?? 0;
  if (v === 2) {
    // Smart keypad
    const keys = Array.from({ length: 12 }, (_, i) => `<circle cx="${358 + (i % 3) * 42}" cy="${300 + Math.floor(i / 3) * 44}" r="13" fill="#ffffff" fill-opacity="0.12"/><text x="${358 + (i % 3) * 42}" y="${305 + Math.floor(i / 3) * 44}" font-family="Arial" font-size="14" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "✓", "0", "⌂"][i]}</text>`).join("");
    return `${groundShadow(400, 640, 150, 18)}
      <rect x="320" y="200" width="160" height="400" rx="30" fill="${c}"/><rect x="320" y="200" width="160" height="400" rx="30" fill="url(#metal)"/>
      <rect x="336" y="240" width="128" height="220" rx="16" fill="#0b0f16"/>${keys}
      <rect x="380" y="224" width="40" height="4" rx="2" fill="${accent}"/>
      <circle cx="400" cy="530" r="30" fill="${shade(c, 0.12)}"/><rect x="394" y="516" width="12" height="28" rx="6" fill="#0b0f16"/>`;
  }
  if (v === 3) {
    return `${groundShadow(400, 610, 140, 16)}
      <circle cx="400" cy="400" r="130" fill="${c}"/><circle cx="400" cy="400" r="130" fill="url(#metal)"/>
      <circle cx="400" cy="400" r="95" fill="${shade(c, 0.08)}"/><circle cx="400" cy="400" r="95" fill="url(#metal)"/>
      <circle cx="400" cy="382" r="16" fill="#374151"/><path d="M392 385 h16 l6 50 h-28 z" fill="#374151"/>`;
  }
  if (v === 4) {
    return `${groundShadow(400, 690, 140, 16)}
      <rect x="340" y="130" width="120" height="540" rx="20" fill="${c}"/><rect x="340" y="130" width="120" height="540" rx="20" fill="url(#metal)"/>
      <rect x="372" y="190" width="56" height="300" rx="28" fill="none" stroke="${shade(c, 0.25)}" stroke-width="18"/>
      <rect x="386" y="210" width="28" height="260" rx="14" fill="${c}"/>
      <circle cx="400" cy="570" r="32" fill="${shade(c, 0.15)}"/><rect x="394" y="556" width="12" height="28" rx="6" fill="#111827"/>`;
  }
  if (v === 5) {
    return `${groundShadow(400, 700, 220, 16)}
      <rect x="360" y="120" width="30" height="540" rx="10" fill="${c}"/><rect x="360" y="120" width="30" height="540" rx="10" fill="url(#metal)"/>
      <rect x="390" y="160" width="60" height="20" fill="${c}"/><rect x="390" y="600" width="60" height="20" fill="${c}"/>
      <rect x="480" y="300" width="130" height="200" rx="14" fill="${shade(accent, -0.1)}"/><rect x="500" y="320" width="90" height="160" rx="8" fill="${c}"/>`;
  }
  // Lever on rose
  return `${groundShadow(420, 560, 220, 20)}
    <circle cx="300" cy="400" r="92" fill="${c}"/><circle cx="300" cy="400" r="92" fill="url(#metal)"/>
    <circle cx="300" cy="400" r="62" fill="${shade(c, 0.1)}"/>
    <path d="M300 368 h260 q30 0 30 30 v4 q0 30 -30 30 h-260 z" fill="${c}"/>
    <path d="M300 368 h260 q30 0 30 30 v4 q0 30 -30 30 h-260 z" fill="url(#metal)"/>
    <circle cx="300" cy="400" r="46" fill="${c}"/><circle cx="300" cy="400" r="46" fill="url(#metal)"/>
    ${v === 0 ? `<rect x="292" y="330" width="16" height="10" rx="4" fill="${shade(c, 0.3)}"/>` : ""}
    <rect x="340" y="372" width="230" height="6" rx="3" fill="#ffffff" fill-opacity="${luminance(c) > 0.5 ? 0.5 : 0.2}"/>`;
};

const drawToiletSeat: Drawer = (spec) => {
  const c = spec.primary;
  const edge = spec.secondary ?? "#d7dbe0";
  const v = spec.variant ?? 0;
  const ry = v === 1 ? 210 : 250;
  return `${groundShadow(400, 680, 230, 22)}
    <rect x="300" y="130" width="200" height="40" rx="14" fill="${edge}"/>
    <circle cx="330" cy="150" r="12" fill="#9aa3ad"/><circle cx="470" cy="150" r="12" fill="#9aa3ad"/>
    <ellipse cx="400" cy="${170 + ry}" rx="200" ry="${ry}" fill="${c}" stroke="${edge}" stroke-width="4"/>
    <ellipse cx="400" cy="${190 + ry}" rx="118" ry="${ry - 80}" fill="${shade(c, -0.1)}"/>
    <ellipse cx="400" cy="${192 + ry}" rx="104" ry="${ry - 94}" fill="#e5e7eb"/>
    <ellipse cx="360" cy="${120 + ry}" rx="60" ry="${ry * 0.5}" fill="#ffffff" fill-opacity="0.4"/>
    ${v === 2 ? `<rect x="590" y="200" width="70" height="170" rx="16" fill="${c}" stroke="${edge}" stroke-width="3"/><circle cx="625" cy="240" r="12" fill="#1d4ed8" fill-opacity="0.7"/><circle cx="625" cy="280" r="9" fill="${edge}"/><circle cx="625" cy="310" r="9" fill="${edge}"/><circle cx="625" cy="340" r="9" fill="${edge}"/>` : ""}`;
};

const drawVanity: Drawer = (spec, rand) => {
  const body = spec.primary;
  const top = spec.secondary ?? "#f2f2ef";
  const v = spec.variant ?? 0;
  const door = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${body}" stroke="${shade(body, -0.25)}" stroke-width="2"/>
     <rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${h - 32}" fill="${shade(body, -0.06)}" stroke="${shade(body, 0.12)}" stroke-width="2"/>`;
  const knob = (x: number, y: number) => `<rect x="${x - 3}" y="${y - 18}" width="6" height="36" rx="3" fill="#c8a24a"/>`;
  const faucet = (x: number) => `<rect x="${x - 6}" y="250" width="12" height="44" rx="4" fill="#1f2328"/><path d="M${x} 256 q0 -24 30 -24 h8 v10 h-8 q-18 0 -18 14 z" fill="#1f2328"/>`;

  if (v === 4) {
    return `${groundShadow(400, 700, 200, 16)}
      <rect x="220" y="120" width="360" height="520" rx="10" fill="#f5b82e" fill-opacity="0.25" filter="url(#soft)"/>
      <rect x="230" y="130" width="340" height="500" rx="8" fill="#dfe7ec"/>
      <rect x="230" y="130" width="340" height="500" rx="8" fill="url(#glass)"/>
      <rect x="246" y="146" width="308" height="468" rx="4" fill="none" stroke="#ffffff" stroke-width="6" stroke-opacity="0.9"/>
      <path d="M280 170 l90 0 l-120 300 l-10 0 z" fill="#ffffff" fill-opacity="0.35"/>`;
  }
  if (v === 1) {
    const drawers = `<rect x="190" y="330" width="420" height="190" fill="${body}"/>${grainLines(190, 330, 420, 190, shade(body, -0.4), rand)}
      <line x1="190" y1="425" x2="610" y2="425" stroke="${shade(body, -0.35)}" stroke-width="3"/>`;
    return `${groundShadow(400, 640, 250, 18)}
      <rect x="170" y="310" width="460" height="22" fill="${top}" stroke="#d1d5db"/>
      ${drawers}
      <path d="M320 310 q0 -70 80 -70 q80 0 80 70 z" fill="#ffffff" stroke="#d1d5db" stroke-width="2"/>
      ${faucet(520).replace(/250/g, "240")}`;
  }
  const width = v === 2 ? 560 : v === 3 ? 300 : 420;
  const x = 400 - width / 2;
  const legs = v === 3 ? "" : `<rect x="${x + 8}" y="640" width="16" height="30" fill="${shade(body, -0.3)}"/><rect x="${x + width - 24}" y="640" width="16" height="30" fill="${shade(body, -0.3)}"/>`;
  const cabinetH = v === 3 ? 230 : 330;
  const cabinetY = 310;
  let fronts = "";
  if (v === 2) {
    fronts = [0, 1, 2].map((i) => door(x + 10 + i * 180, cabinetY + 10, 180, 100) + knob(x + 100 + i * 180, cabinetY + 60).replace("rotate", "")).join("") + door(x + 10, cabinetY + 120, 270, 200) + door(x + 280, cabinetY + 120, 270, 200) + knob(x + 260, cabinetY + 220) + knob(x + 300, cabinetY + 220);
  } else if (v === 3) {
    fronts = door(x + 10, cabinetY + 10, width - 20, cabinetH - 20) + `<rect x="${x + width / 2 - 30}" y="${cabinetY + 40}" width="60" height="8" rx="4" fill="#c8a24a"/>`;
  } else {
    fronts = door(x + 10, cabinetY + 10, width - 20, 90) + `<rect x="${x + width / 2 - 30}" y="${cabinetY + 52}" width="60" height="8" rx="4" fill="#c8a24a"/>` + door(x + 10, cabinetY + 110, (width - 20) / 2, 210) + door(x + width / 2, cabinetY + 110, (width - 20) / 2, 210) + knob(x + width / 2 - 20, cabinetY + 200) + knob(x + width / 2 + 20, cabinetY + 200);
  }
  const sinks = v === 2 ? [x + 150, x + width - 150] : [400];
  return `${groundShadow(400, 680, width / 2 + 40, 18)}
    <rect x="${x}" y="${cabinetY}" width="${width}" height="${cabinetH}" fill="${shade(body, -0.08)}"/>
    ${fronts}${legs}
    <rect x="${x - 10}" y="${cabinetY - 26}" width="${width + 20}" height="28" rx="2" fill="${top}" stroke="#d1d5db"/>
    <rect x="${x - 10}" y="${cabinetY - 26}" width="${width + 20}" height="8" fill="#ffffff" fill-opacity="0.6"/>
    ${sinks.map((sx) => `<ellipse cx="${sx}" cy="${cabinetY - 24}" rx="70" ry="6" fill="#d1d5db"/>${faucet(sx)}`).join("")}`;
};

const drawPlumbing: Drawer = (spec) => {
  const c = spec.primary;
  const c2 = spec.secondary ?? shade(c, -0.2);
  const v = spec.variant ?? 0;
  if (v === 0) {
    const rings = Array.from({ length: 9 }, (_, i) => `<ellipse cx="400" cy="420" rx="${250 - i * 14}" ry="${150 - i * 8}" fill="none" stroke="${c}" stroke-width="13"/><ellipse cx="400" cy="420" rx="${250 - i * 14}" ry="${150 - i * 8}" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="3"/>`).join("");
    return `${groundShadow(400, 590, 280, 30)}${rings}<rect x="560" y="420" width="190" height="16" rx="8" fill="${c}"/>`;
  }
  if (v === 1) {
    return `${groundShadow(400, 640, 180, 18)}
      <circle cx="400" cy="400" r="170" fill="${c}"/><circle cx="400" cy="400" r="170" fill="url(#metal)"/>
      <circle cx="400" cy="400" r="60" fill="${shade(c, 0.12)}"/>
      <path d="M400 380 L400 250 q0 -20 20 -20 h8 q20 0 20 20 L448 380 z" fill="${c2}"/>
      <circle cx="400" cy="400" r="34" fill="${c2}"/><circle cx="400" cy="400" r="34" fill="url(#metal)"/>`;
  }
  if (v === 2) {
    const braid = (y: number) => `<path d="M160 ${y} C 300 ${y - 80}, 420 ${y + 80}, 600 ${y}" stroke="${c}" stroke-width="22" fill="none"/>
      <path d="M160 ${y} C 300 ${y - 80}, 420 ${y + 80}, 600 ${y}" stroke="${c2}" stroke-width="22" stroke-dasharray="3 5" fill="none"/>
      <rect x="120" y="${y - 20}" width="50" height="40" rx="6" fill="#c8a24a"/><rect x="590" y="${y - 18}" width="56" height="36" rx="6" fill="#dfe3e6" stroke="#9aa3ad"/>`;
    return `${groundShadow(400, 620, 280, 20)}${braid(350)}${braid(470)}`;
  }
  if (v === 3) {
    return `${groundShadow(400, 620, 200, 20)}
      <rect x="250" y="360" width="300" height="90" rx="14" fill="${c}"/><rect x="250" y="360" width="300" height="90" rx="14" fill="url(#metal)"/>
      <rect x="360" y="440" width="80" height="140" rx="10" fill="${c}"/>
      <rect x="370" y="250" width="60" height="120" rx="8" fill="${shade(c, -0.1)}"/>
      <rect x="300" y="230" width="200" height="36" rx="18" fill="#1d4ed8"/>
      <rect x="200" y="370" width="60" height="70" rx="8" fill="${c2}"/>`;
  }
  if (v === 4) {
    return `${groundShadow(400, 620, 280, 20)}
      <rect x="150" y="360" width="200" height="110" rx="10" fill="${c}"/><rect x="150" y="360" width="200" height="110" rx="10" fill="url(#metal)"/>
      <path d="M420 250 h60 v320 h140 v50 h-200 z" fill="#374151"/>
      <rect x="220" y="520" width="60" height="120" rx="8" fill="${c2}"/><rect x="200" y="500" width="100" height="40" rx="8" fill="#1f2328"/>
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${560 + (i % 3) * 40} ${300 + Math.floor(i / 3) * 50} l24 0 l0 12 l-12 12 l-12 -12 z" fill="${c}"/>`).join("")}`;
  }
  if (v === 6) {
    return `${groundShadow(400, 640, 220, 18)}
      <g transform="rotate(-30 400 400)"><rect x="200" y="350" width="340" height="100" rx="18" fill="${c}"/><rect x="200" y="350" width="340" height="100" rx="18" fill="url(#metal)"/>
      <rect x="240" y="370" width="160" height="60" rx="6" fill="#111827"/><text x="320" y="410" font-family="Arial" font-weight="700" font-size="22" fill="${c}" text-anchor="middle">GRIP</text>
      <path d="M540 380 l100 12 v16 l-100 12 z" fill="${c2}"/><rect x="160" y="370" width="40" height="60" rx="6" fill="${c2}"/></g>`;
  }
  // P-trap
  return `${groundShadow(400, 660, 200, 20)}
    <path d="M300 160 v280 a100 100 0 0 0 200 0 v-40 h120" stroke="${c}" stroke-width="56" fill="none" stroke-linejoin="round"/>
    <path d="M300 160 v280 a100 100 0 0 0 200 0 v-40 h120" stroke="#ffffff" stroke-opacity="0.35" stroke-width="10" fill="none"/>
    <rect x="266" y="270" width="68" height="30" rx="8" fill="${c2}"/><rect x="560" y="370" width="30" height="62" rx="8" fill="${c2}"/>`;
};

const drawShowerAccessory: Drawer = (spec, rand) => {
  const c = spec.primary;
  const c2 = spec.secondary ?? shade(c, 0.2);
  const v = spec.variant ?? 0;
  if (v === 0) {
    return `${groundShadow(400, 720, 220, 16)}
      <rect x="170" y="120" width="220" height="220" rx="16" fill="${c}"/><rect x="170" y="120" width="220" height="220" rx="16" fill="url(#metal)"/>
      ${Array.from({ length: 49 }, (_, i) => `<circle cx="${200 + (i % 7) * 27}" cy="${150 + Math.floor(i / 7) * 27}" r="4" fill="${c2}"/>`).join("")}
      <rect x="380" y="220" width="150" height="16" rx="8" fill="${c}"/><rect x="514" y="220" width="16" height="450" rx="8" fill="${c}"/>
      <rect x="540" y="380" width="16" height="260" rx="8" fill="${c}"/>
      <g transform="rotate(-12 580 420)"><rect x="560" y="330" width="44" height="150" rx="22" fill="${c}"/><circle cx="582" cy="340" r="34" fill="${c}"/><circle cx="582" cy="340" r="24" fill="${c2}"/></g>
      <path d="M548 640 q-60 60 -140 20" stroke="${c}" stroke-width="10" fill="none"/>`;
  }
  if (v === 1) {
    return `${groundShadow(400, 520, 330, 26)}
      <g transform="rotate(-10 400 420)"><rect x="80" y="380" width="640" height="80" rx="8" fill="${c}"/><rect x="80" y="380" width="640" height="80" rx="8" fill="url(#metal)"/>
      ${Array.from({ length: 28 }, (_, i) => `<rect x="${104 + i * 21.5}" y="398" width="10" height="44" rx="3" fill="#4b5563"/>`).join("")}</g>`;
  }
  if (v === 2) {
    return `${groundShadow(400, 700, 200, 16)}
      <rect x="250" y="140" width="300" height="540" rx="6" fill="${c}"/>
      <rect x="280" y="170" width="240" height="480" fill="${shade(c, -0.12)}"/>
      <rect x="280" y="170" width="240" height="30" fill="${shade(c, -0.22)}"/>
      <rect x="272" y="400" width="256" height="20" fill="${c}"/>
      ${Array.from({ length: 16 }, (_, i) => `<line x1="250" y1="${140 + i * 34}" x2="550" y2="${140 + i * 34}" stroke="${c2}" stroke-opacity="0.35"/>`).join("")}`;
  }
  if (v === 3) {
    return `${groundShadow(400, 540, 300, 20)}
      <rect x="130" y="370" width="540" height="40" rx="20" fill="${c}"/><rect x="130" y="370" width="540" height="40" rx="20" fill="url(#metal)"/>
      ${Array.from({ length: 30 }, (_, i) => `<line x1="${330 + i * 5}" y1="372" x2="${320 + i * 5}" y2="408" stroke="${c2}" stroke-width="1.5"/>`).join("")}
      <circle cx="150" cy="390" r="46" fill="${c}"/><circle cx="650" cy="390" r="46" fill="${c}"/>
      <circle cx="150" cy="390" r="46" fill="url(#metal)"/><circle cx="650" cy="390" r="46" fill="url(#metal)"/>`;
  }
  // Teak bench
  const slats = Array.from({ length: 6 }, (_, i) => `<rect x="180" y="${300 + i * 34}" width="440" height="26" rx="4" fill="${shade(c, (i % 2) * 0.05)}"/>${grainLines(180, 300 + i * 34, 440, 26, shade(c, -0.4), rand)}`).join("");
  return `${groundShadow(400, 640, 260, 20)}
    <rect x="170" y="190" width="460" height="16" rx="6" fill="${c2}"/>
    <path d="M200 206 L230 560 M600 206 L570 560" stroke="${c2}" stroke-width="14"/>
    ${slats}`;
};

const drawWpcPanel: Drawer = (spec, rand) => {
  const c = spec.primary;
  const dark = spec.secondary ?? shade(c, -0.35);
  const v = spec.variant ?? 0;
  if (v === 1) {
    const speck = Array.from({ length: 220 }, () => `<circle cx="${r1(200 + rand() * 400)}" cy="${r1(110 + rand() * 580)}" r="${r1(0.6 + rand() * 2)}" fill="${dark}" fill-opacity="${(0.1 + rand() * 0.25).toFixed(2)}"/>`).join("");
    return `${groundShadow(400, 712, 230, 16)}
      <rect x="200" y="110" width="200" height="590" fill="${c}"/><rect x="400" y="110" width="200" height="590" fill="${shade(c, 0.04)}"/>
      ${speck}<line x1="400" y1="110" x2="400" y2="700" stroke="${dark}" stroke-opacity="0.4" stroke-width="2"/>
      <rect x="200" y="110" width="400" height="590" fill="url(#metal)" fill-opacity="0.5"/>`;
  }
  if (v === 3) {
    return `${groundShadow(400, 600, 300, 24)}
      <g transform="translate(120 520) rotate(-24)"><rect width="580" height="44" fill="${c}"/>${grainLines(0, 0, 580, 44, dark, rand)}<rect width="580" height="44" fill="url(#metal)"/></g>
      <g transform="translate(560 520) scale(2)"><path d="M0 0 h50 v10 h-40 v40 h-10 z" fill="${c}" stroke="${dark}"/></g>`;
  }
  const flutes: string[] = [];
  const n = v === 2 ? 9 : 12;
  const w = 400 / n;
  for (let i = 0; i < n; i++) {
    const x = 200 + i * w;
    if (v === 2) {
      flutes.push(`<rect x="${r1(x + 6)}" y="110" width="${r1(w - 12)}" height="590" rx="3" fill="${shade(c, (rand() - 0.5) * 0.1)}"/>${grainLines(x + 6, 110, w - 12, 590, shade(c, -0.4), rand, true)}`);
    } else {
      flutes.push(`<rect x="${r1(x)}" y="110" width="${r1(w)}" height="590" fill="${c}"/>
        <rect x="${r1(x)}" y="110" width="${r1(w * 0.35)}" height="590" fill="#ffffff" fill-opacity="0.16"/>
        <rect x="${r1(x + w * 0.72)}" y="110" width="${r1(w * 0.28)}" height="590" fill="#000000" fill-opacity="0.16"/>
        ${grainLines(x, 110, w, 590, dark, rand, true)}`);
    }
  }
  return `${groundShadow(400, 712, 230, 16)}${v === 2 ? `<rect x="196" y="106" width="408" height="598" fill="${dark}"/>` : ""}${flutes.join("")}`;
};

const drawers: Record<ArtKind, Drawer> = {
  vinyl: drawVinyl,
  door: drawDoor,
  stairs: drawStairs,
  "shower-base": drawShowerBase,
  "shower-door": drawShowerDoor,
  lock: drawLock,
  "toilet-seat": drawToiletSeat,
  vanity: drawVanity,
  plumbing: drawPlumbing,
  "shower-accessory": drawShowerAccessory,
  "wpc-panel": drawWpcPanel,
};

/* ================================ SCENES ================================= */

/** Perspective plank floor between y=top and y=800. */
export function perspectiveFloor(base: string, seed: string, top = 470, tile = false): string {
  const rand = rng(`${seed}-floor`);
  const vpX = 400;
  const vpY = top - 260;
  const parts: string[] = [`<rect x="0" y="${top}" width="800" height="${800 - top}" fill="${shade(base, -0.05)}"/>`];
  const strips = tile ? 8 : 14;
  const bottomSpan = 1800;
  for (let i = 0; i < strips; i++) {
    const bx0 = vpX - bottomSpan / 2 + (i * bottomSpan) / strips;
    const bx1 = vpX - bottomSpan / 2 + ((i + 1) * bottomSpan) / strips;
    const t = (top - vpY) / (800 - vpY);
    const tx0 = vpX + (bx0 - vpX) * t;
    const tx1 = vpX + (bx1 - vpX) * t;
    parts.push(`<path d="M${r1(tx0)} ${top} L${r1(tx1)} ${top} L${r1(bx1)} 800 L${r1(bx0)} 800 Z" fill="${shade(base, (rand() - 0.5) * 0.14)}"/>`);
    // joints across the strip
    let y = top + 8 + rand() * 30;
    while (y < 800) {
      const k = (y - vpY) / (800 - vpY);
      const xa = vpX + (bx0 - vpX) * k;
      const xb = vpX + (bx1 - vpX) * k;
      parts.push(`<line x1="${r1(xa)}" y1="${r1(y)}" x2="${r1(xb)}" y2="${r1(y)}" stroke="${shade(base, -0.35)}" stroke-opacity="0.5" stroke-width="${r1(0.6 + k)}"/>`);
      y += (tile ? 50 : 90) * k * (0.8 + rand() * 0.6);
    }
    parts.push(`<line x1="${r1(tx0)}" y1="${top}" x2="${r1(bx0)}" y2="800" stroke="${shade(base, -0.35)}" stroke-opacity="0.45" stroke-width="1.2"/>`);
  }
  parts.push(`<rect x="0" y="${top}" width="800" height="${800 - top}" fill="url(#floorLight)"/>`);
  return parts.join("");
}

function sceneDefs(wall: string): string {
  return `<linearGradient id="wallLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#000000" stop-opacity="0.08"/></linearGradient>
  <linearGradient id="floorLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000000" stop-opacity="0.12"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.06"/><stop offset="1" stop-color="#000000" stop-opacity="0.05"/></linearGradient>
  <linearGradient id="wallBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wall}"/><stop offset="1" stop-color="${shade(wall, -0.06)}"/></linearGradient>`;
}

function sofa(x: number, y: number, color = "#5b6572"): string {
  return `<g><rect x="${x}" y="${y}" width="300" height="90" rx="18" fill="${color}"/><rect x="${x + 10}" y="${y + 40}" width="280" height="70" rx="14" fill="${shade(color, 0.12)}"/>
    <rect x="${x - 16}" y="${y + 30}" width="40" height="90" rx="14" fill="${shade(color, -0.06)}"/><rect x="${x + 276}" y="${y + 30}" width="40" height="90" rx="14" fill="${shade(color, -0.06)}"/>
    <rect x="${x + 20}" y="${y + 120}" width="10" height="18" fill="#1f2328"/><rect x="${x + 270}" y="${y + 120}" width="10" height="18" fill="#1f2328"/></g>`;
}

function plant(x: number, y: number): string {
  return `<g><path d="M${x} ${y} q-50 -80 -20 -170 q20 60 20 170 z" fill="#4d6b4f"/><path d="M${x} ${y} q40 -90 10 -190 q-30 70 -10 190 z" fill="#5f8261"/><path d="M${x} ${y} q70 -40 70 -120 q-50 40 -70 120 z" fill="#3f5a41"/>
    <path d="M${x - 34} ${y} h68 l-8 70 h-52 z" fill="#e7e2d8"/></g>`;
}

function roomScene(spec: ArtSpec, product: string): string {
  const k = spec.kind;
  const wall = k === "vanity" || k.startsWith("shower") || k === "toilet-seat" ? "#e9ecee" : "#ece8e1";
  const floorColor = k === "vinyl" ? spec.primary : k === "vanity" || k.startsWith("shower") || k === "toilet-seat" ? "#b9b4ab" : "#c9a27a";
  const tileFloor = k === "vinyl" ? spec.variant === 3 : k === "vanity" || k.startsWith("shower") || k === "toilet-seat";
  const horizon = k === "vinyl" ? 380 : 560;
  const bath = wall === "#e9ecee";
  const wallTiles = bath
    ? Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 42}" x2="800" y2="${i * 42}" stroke="#d4d9dd" stroke-width="2"/>`).join("") +
      Array.from({ length: 10 }, (_, i) => `<line x1="${i * 84}" y1="0" x2="${i * 84}" y2="${horizon}" stroke="#d4d9dd" stroke-width="2"/>`).join("")
    : "";
  const baseboard = `<rect x="0" y="${horizon - 22}" width="800" height="22" fill="#f7f6f3"/><rect x="0" y="${horizon - 2}" width="800" height="3" fill="#000" fill-opacity="0.08"/>`;
  const window = `<g><rect x="520" y="70" width="190" height="230" fill="#dbe7ee"/><rect x="520" y="70" width="190" height="230" fill="url(#sheen)" fill-opacity="0.5"/><rect x="520" y="70" width="190" height="230" fill="none" stroke="#ffffff" stroke-width="10"/><line x1="615" y1="70" x2="615" y2="300" stroke="#ffffff" stroke-width="6"/></g>`;
  const decor = k === "vinyl" ? `${window}${sofa(90, 300)}${plant(640, 440)}` : "";
  return `<defs>${baseDefs()}${sceneDefs(wall)}</defs>
    <rect width="800" height="${horizon}" fill="url(#wallBase)"/>${wallTiles}
    <rect width="800" height="${horizon}" fill="url(#wallLight)"/>
    ${perspectiveFloor(floorColor, spec.seed, horizon, tileFloor)}
    ${bath ? "" : baseboard}
    ${decor}
    ${product}`;
}

/* ================================= API =================================== */

export function renderProductSvg(spec: ArtSpec, view: View): string {
  const rand = rng(`${spec.seed}-${spec.kind}`);
  const inner = drawers[spec.kind](spec, rand);
  let body: string;
  if (view === 1) {
    body = `<defs>${baseDefs()}</defs><rect width="800" height="800" fill="url(#studio)"/>${inner}`;
  } else if (view === 2) {
    // Detail crop: zoom into the upper-left of the product.
    body = `<defs>${baseDefs()}</defs><rect width="800" height="800" fill="url(#studio)"/>
      <g transform="translate(-380 -300) scale(1.9)">${inner}</g>
      <rect x="0" y="0" width="800" height="800" fill="none" stroke="#111827" stroke-opacity="0.04" stroke-width="20"/>`;
  } else {
    // Transforms seat each product on the floor line of the room scene.
    const placement: Partial<Record<ArtKind, string>> = {
      door: "translate(152 107) scale(0.62)",
      stairs: "translate(160 146) scale(0.6)",
      "shower-base": "translate(140 283) scale(0.65)",
      "shower-door": "translate(136 92) scale(0.66)",
      vanity: "translate(112 78) scale(0.72)",
      "wpc-panel": "translate(40 -70) scale(0.9)",
    };
    const product = spec.kind === "vinyl" ? "" : `<g transform="${placement[spec.kind] ?? "translate(200 160) scale(0.5)"}">${inner}</g>`;
    return svgDoc(roomScene(spec, product));
  }
  return svgDoc(body);
}

function svgDoc(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img">${body}</svg>`;
}

/** Wide hero illustration: a finished interior featuring floor, wall panels and a door. */
export function renderHeroSvg(): string {
  const oak = "#c9a27a";
  const flutes = Array.from({ length: 16 }, (_, i) => {
    const x = 60 + i * 26;
    return `<rect x="${x}" y="40" width="26" height="520" fill="#6f4e37"/><rect x="${x}" y="40" width="9" height="520" fill="#fff" fill-opacity="0.14"/><rect x="${x + 19}" y="40" width="7" height="520" fill="#000" fill-opacity="0.18"/>`;
  }).join("");
  const door = drawDoor({ kind: "door", primary: "#f4f3ef", secondary: "#d9d6cd", variant: 1, seed: "hero" }, rng("hero"));
  const vanity = drawVanity({ kind: "vanity", primary: "#23385a", secondary: "#f2f2ef", variant: 0, seed: "hero" }, rng("hero-v"));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" role="img">
  <defs>${baseDefs()}${sceneDefs("#ece8e1")}
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6e0" stop-opacity="0.8"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1200" height="580" fill="url(#wallBase)"/>
  <g>${flutes}</g>
  <rect x="56" y="36" width="424" height="528" fill="none" stroke="#3b2a1e" stroke-opacity="0.35" stroke-width="4"/>
  <g transform="translate(350 28) scale(0.75)">${door}</g>
  <g transform="translate(760 205) scale(0.55)">
    <rect x="160" y="-20" width="480" height="300" rx="8" fill="#dfe7ec"/><rect x="160" y="-20" width="480" height="300" rx="8" fill="url(#glass)"/>
    ${vanity}
  </g>
  <rect width="1200" height="580" fill="url(#wallLight)"/>
  <g transform="scale(1.5 1)">${perspectiveFloor(oak, "hero", 580)}</g>
  <rect x="0" y="566" width="1200" height="16" fill="#f7f6f3"/>
  <path d="M0 0 L520 0 L260 800 L0 800 Z" fill="url(#sun)" opacity="0.35"/>
  ${plant(500, 640)}
</svg>`;
}
