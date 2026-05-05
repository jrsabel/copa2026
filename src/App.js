import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ─── GRUPOS OFICIAIS ──────────────────────────────────────────────────────────
const GROUPS = {
  A: [
    {name:"México",          code:"MEX", flag:"🇲🇽"},
    {name:"Coreia do Sul",   code:"KOR", flag:"🇰🇷"},
    {name:"África do Sul",   code:"RSA", flag:"🇿🇦"},
    {name:"Rep. Tcheca",     code:"CZE", flag:"🇨🇿"},
  ],
  B: [
    {name:"Canadá",          code:"CAN", flag:"🇨🇦"},
    {name:"Bósnia",          code:"BIH", flag:"🇧🇦"},
    {name:"Qatar",           code:"QAT", flag:"🇶🇦"},
    {name:"Suíça",           code:"SUI", flag:"🇨🇭"},
  ],
  C: [
    {name:"Brasil",          code:"BRA", flag:"🇧🇷"},
    {name:"Marrocos",        code:"MAR", flag:"🇲🇦"},
    {name:"Haiti",           code:"HAI", flag:"🇭🇹"},
    {name:"Escócia",         code:"SCO", flag:"SC"},
  ],
  D: [
    {name:"Estados Unidos",  code:"USA", flag:"🇺🇸"},
    {name:"Paraguai",        code:"PAR", flag:"🇵🇾"},
    {name:"Austrália",       code:"AUS", flag:"🇦🇺"},
    {name:"Turquia",         code:"TUR", flag:"🇹🇷"},
  ],
  E: [
    {name:"Alemanha",        code:"GER", flag:"🇩🇪"},
    {name:"Curaçao",         code:"CUW", flag:"🇨🇼"},
    {name:"Costa do Marfim", code:"CIV", flag:"🇨🇮"},
    {name:"Equador",         code:"ECU", flag:"🇪🇨"},
  ],
  F: [
    {name:"Holanda",         code:"NED", flag:"🇳🇱"},
    {name:"Japão",           code:"JPN", flag:"🇯🇵"},
    {name:"Suécia",          code:"SWE", flag:"🇸🇪"},
    {name:"Tunísia",         code:"TUN", flag:"🇹🇳"},
  ],
  G: [
    {name:"Bélgica",         code:"BEL", flag:"🇧🇪"},
    {name:"Egito",           code:"EGY", flag:"🇪🇬"},
    {name:"Irã",             code:"IRN", flag:"🇮🇷"},
    {name:"Nova Zelândia",   code:"NZL", flag:"🇳🇿"},
  ],
  H: [
    {name:"Espanha",         code:"ESP", flag:"🇪🇸"},
    {name:"Cabo Verde",      code:"CPV", flag:"🇨🇻"},
    {name:"Arábia Saudita",  code:"KSA", flag:"🇸🇦"},
    {name:"Uruguai",         code:"URU", flag:"🇺🇾"},
  ],
  I: [
    {name:"França",          code:"FRA", flag:"🇫🇷"},
    {name:"Senegal",         code:"SEN", flag:"🇸🇳"},
    {name:"Iraque",          code:"IRQ", flag:"🇮🇶"},
    {name:"Noruega",         code:"NOR", flag:"🇳🇴"},
  ],
  J: [
    {name:"Argentina",       code:"ARG", flag:"🇦🇷"},
    {name:"Argélia",         code:"ALG", flag:"🇩🇿"},
    {name:"Áustria",         code:"AUT", flag:"🇦🇹"},
    {name:"Jordânia",        code:"JOR", flag:"🇯🇴"},
  ],
  K: [
    {name:"Portugal",        code:"POR", flag:"🇵🇹"},
    {name:"RD Congo",        code:"COD", flag:"🇨🇩"},
    {name:"Uzbequistão",     code:"UZB", flag:"🇺🇿"},
    {name:"Colômbia",        code:"COL", flag:"🇨🇴"},
  ],
  L: [
    {name:"Inglaterra",      code:"ENG", flag:"EN"},
    {name:"Croácia",         code:"CRO", flag:"🇭🇷"},
    {name:"Gana",            code:"GHA", flag:"🇬🇭"},
    {name:"Panamá",          code:"PAN", flag:"🇵🇦"},
  ],
};

// ─── ESPECIAIS ────────────────────────────────────────────────────────────────
// Subgrupos de especiais com cor e label próprios
const SPECIAL_GROUPS = {
  FWC: {
    label: "Especiais",
    color: "#c9a84c",        // dourado
    ids: ["FWC 00","FWC 1","FWC 2","FWC 3","FWC 4","FWC 5","FWC 6","FWC 7","FWC 8"],
    labels: {
      "FWC 00":"Capa","FWC 1":"Apresentação","FWC 2":"Sede EUA","FWC 3":"Sede México",
      "FWC 4":"Sede Canadá","FWC 5":"Taça FIFA","FWC 6":"Mascote","FWC 7":"Bola Oficial","FWC 8":"Árbitros",
    },
  },
  SEL: {
    label: "Seleções Especiais",
    color: "#c9a84c",        // dourado
    ids: ["FWC 9","FWC 10","FWC 11","FWC 12","FWC 13","FWC 14","FWC 15","FWC 16","FWC 17","FWC 18","FWC 19"],
    labels: {
      "FWC 9":"Sel. Especial 1","FWC 10":"Sel. Especial 2","FWC 11":"Sel. Especial 3",
      "FWC 12":"Sel. Especial 4","FWC 13":"Sel. Especial 5","FWC 14":"Sel. Especial 6",
      "FWC 15":"Sel. Especial 7","FWC 16":"Sel. Especial 8","FWC 17":"Sel. Especial 9",
      "FWC 18":"Sel. Especial 10","FWC 19":"Sel. Especial 11",
    },
  },
  CC: {
    label: "Coca-Cola",
    color: "#c0392b",        // vermelho
    ids: ["CC1","CC2","CC3","CC4","CC5","CC6","CC7","CC8","CC9","CC10","CC11","CC12","CC13","CC14"],
    labels: {
      "CC1":"Coca-Cola 1","CC2":"Coca-Cola 2","CC3":"Coca-Cola 3","CC4":"Coca-Cola 4",
      "CC5":"Coca-Cola 5","CC6":"Coca-Cola 6","CC7":"Coca-Cola 7","CC8":"Coca-Cola 8",
      "CC9":"Coca-Cola 9","CC10":"Coca-Cola 10","CC11":"Coca-Cola 11","CC12":"Coca-Cola 12",
      "CC13":"Coca-Cola 13","CC14":"Coca-Cola 14",
    },
  },
};

// Cor de destaque por id especial
function specialColor(id) {
  if (SPECIAL_GROUPS.CC.ids.includes(id)) return SPECIAL_GROUPS.CC.color;
  if (SPECIAL_GROUPS.FWC.ids.includes(id) || SPECIAL_GROUPS.SEL.ids.includes(id)) return SPECIAL_GROUPS.FWC.color;
  return "#111";
}
function specialGroup(id) {
  if (SPECIAL_GROUPS.CC.ids.includes(id)) return "CC";
  if (SPECIAL_GROUPS.SEL.ids.includes(id)) return "SEL";
  if (SPECIAL_GROUPS.FWC.ids.includes(id)) return "FWC";
  return null;
}
function specialLabel(id) {
  for (const sg of Object.values(SPECIAL_GROUPS)) {
    if (sg.labels[id]) return sg.labels[id];
  }
  return id;
}

// ─── TODOS OS IDs ─────────────────────────────────────────────────────────────
function allStickers() {
  const ids = {};
  // Especiais FWC + SEL
  [...SPECIAL_GROUPS.FWC.ids, ...SPECIAL_GROUPS.SEL.ids].forEach(id => {
    ids[id] = { group:"ESPECIAL", subgroup: specialGroup(id), team:"Especial", code:"FWC", n:0, flag:"⭐" };
  });
  // Coca-Cola
  SPECIAL_GROUPS.CC.ids.forEach(id => {
    ids[id] = { group:"ESPECIAL", subgroup:"CC", team:"Coca-Cola", code:"CC", n:0, flag:"🥤" };
  });
  // Times
  Object.entries(GROUPS).forEach(([g, teams]) => {
    teams.forEach(team => {
      for (let n = 1; n <= 20; n++) {
        const id = `${team.code} ${n}`;
        ids[id] = { group:g, team:team.name, code:team.code, flag:team.flag, n };
      }
    });
  });
  return ids;
}
const ALL = allStickers();
const TOTAL = Object.keys(ALL).length;

// Demo
const DEMO = {};
["BRA 1","BRA 3","BRA 5","BRA 7","ARG 1","ARG 2","ARG 4","FRA 1","FRA 2","GER 1",
 "TUR 1","TUR 5","TUR 14","TUR 18","SCO 11","URU 3","MEX 5","MEX 9","MEX 14",
 "FWC 1","FWC 2","FWC 9","FWC 10","CC1","CC3","CC5",
 "POR 1","POR 3","ESP 1"].forEach(id => {
  DEMO[id] = { owned:true, repeated:["TUR 14","BRA 5","ARG 4","FWC 1","CC3"].includes(id), qty: ["TUR 14","BRA 5","ARG 4","FWC 1","CC3"].includes(id) ? 2 : 0 };
});

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=18, color="#111", sw=1.5 }) => {
  const d = {
    ranking:<><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M2 20h4M18 20h4"/><path d="M4 20v-1a2 2 0 012-2M20 20v-1a2 2 0 00-2-2"/></>,
    album:  <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
    chart:  <><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></>,
    repeat: <><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>,
    user:   <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    check:  <path d="M20 6L9 17l-5-5"/>,
    share:  <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    down:   <path d="m6 9 6 6 6-6"/>,
    right:  <path d="m9 18 6-6-6-6"/>,
    plus:   <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    minus:  <path d="M5 12h14"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d[name]}
    </svg>
  );
};

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
const Bar = ({ value, total, height=2, color="#111" }) => {
  const pct = total ? Math.round((value/total)*100) : 0;
  return (
    <div style={{height,background:"#ececec",borderRadius:height,overflow:"hidden",flex:1}}>
      <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:height,transition:"width .4s"}}/>
    </div>
  );
};

// ─── BANDEIRAS SVG INLINE ─────────────────────────────────────────────────────
// Bandeiras desenhadas em SVG puro, sem dependência de internet
const FLAGS_SVG = {
  BRA: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#009c3b"/><polygon points="10,1 19,7 10,13 1,7" fill="#FFDF00"/><circle cx="10" cy="7" r="3.5" fill="#002776"/><path d="M6.8,5.8 Q10,4.5 13.2,5.8" fill="none" stroke="#fff" strokeWidth="0.7"/></svg>,
  ARG: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#74ACDF"/><rect y="4.67" width="20" height="4.67" fill="#fff"/><circle cx="10" cy="7" r="1.8" fill="#F6B40E"/></svg>,
  URU: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect y="1.56" width="20" height="1.56" fill="#0038A8"/><rect y="4.67" width="20" height="1.56" fill="#0038A8"/><rect y="7.78" width="20" height="1.56" fill="#0038A8"/><rect y="10.89" width="20" height="1.56" fill="#0038A8"/><circle cx="5" cy="7" r="2" fill="#F6D216"/></svg>,
  FRA: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#ED2939"/><rect width="13.3" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#002395"/></svg>,
  GER: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#FFCE00"/><rect width="20" height="9.33" fill="#DD0000"/><rect width="20" height="4.67" fill="#000"/></svg>,
  ESP: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#c60b1e"/><rect y="3.5" width="20" height="7" fill="#ffc400"/></svg>,
  ENG: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect x="8.5" width="3" height="14" fill="#CF1B2B"/><rect y="5.5" width="20" height="3" fill="#CF1B2B"/></svg>,
  POR: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#FF0000"/><rect width="8" height="14" fill="#006600"/><circle cx="8" cy="7" r="2.2" fill="#FFD700" stroke="#00008B" strokeWidth="0.4"/></svg>,
  NED: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#1e4785"/><rect width="20" height="9.33" fill="#fff"/><rect width="20" height="4.67" fill="#ae1c28"/></svg>,
  ITA: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#CE2B37"/><rect width="13.3" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#009246"/></svg>,
  BEL: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#EF3340"/><rect width="13.3" height="14" fill="#FAE042"/><rect width="6.67" height="14" fill="#000"/></svg>,
  CRO: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect width="20" height="4.67" fill="#FF0000"/><rect y="9.33" width="20" height="4.67" fill="#0000CD"/></svg>,
  JPN: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="3.5" fill="#BC002D"/></svg>,
  KOR: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="3" fill="#CD2E3A"/><path d="M10,4 A3,3 0 0,1 10,10" fill="#003478"/></svg>,
  AUS: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#00008B"/><path d="M0,0 L10,7 M10,0 L0,7" stroke="#fff" strokeWidth="2.5"/><path d="M0,0 L10,7 M10,0 L0,7" stroke="#C8102E" strokeWidth="1.5"/><rect x="4" width="2" height="7" fill="#fff"/><rect y="3" width="10" height="2" fill="#fff"/><rect x="4.4" width="1.2" height="7" fill="#C8102E"/><rect y="3.4" width="10" height="1.2" fill="#C8102E"/></svg>,
  MAR: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#C1272D"/><polygon points="10,3.5 11.2,7 14.8,7 11.9,9.1 13,12.5 10,10.4 7,12.5 8.1,9.1 5.2,7 8.8,7" fill="none" stroke="#006233" strokeWidth="0.7"/></svg>,
  RSA: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#007A4D"/><polygon points="0,0 8,7 0,14" fill="#000"/><polygon points="0,0 6,0 13,7 6,14 0,14 7,7" fill="#FFB81C"/><rect y="5.5" width="20" height="3" fill="#fff"/><rect y="6" width="20" height="2" fill="#E03C31"/></svg>,
  MEX: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#CE1126"/><rect width="13.3" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#006847"/><circle cx="10" cy="7" r="1.8" fill="#8B4513"/></svg>,
  USA: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#B22234"/><rect y="1.08" width="20" height="1.08" fill="#fff"/><rect y="3.23" width="20" height="1.08" fill="#fff"/><rect y="5.38" width="20" height="1.08" fill="#fff"/><rect y="7.54" width="20" height="1.08" fill="#fff"/><rect y="9.69" width="20" height="1.08" fill="#fff"/><rect y="11.85" width="20" height="1.08" fill="#fff"/><rect width="8" height="7.54" fill="#3C3B6E"/></svg>,
  CAN: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect width="5" height="14" fill="#FF0000"/><rect x="15" width="5" height="14" fill="#FF0000"/><polygon points="10,2 11,5.5 14.5,5.5 11.8,7.5 12.8,11 10,9 7.2,11 8.2,7.5 5.5,5.5 9,5.5" fill="#FF0000"/></svg>,
  SCO: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#003DA5"/><path d="M0,0 L20,14 M20,0 L0,14" stroke="#fff" strokeWidth="3"/></svg>,
  TUR: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#E30A17"/><circle cx="8" cy="7" r="3.2" fill="#fff"/><circle cx="9.5" cy="7" r="2.4" fill="#E30A17"/><polygon points="13,7 14.2,5.2 15.5,7 14.2,8.8" fill="#fff"/></svg>,
  SEN: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#00853F"/><rect x="6.67" width="6.67" height="14" fill="#FDEF42"/><rect x="13.33" width="6.67" height="14" fill="#E31B23"/><polygon points="10,4.5 10.7,6.8 13,6.8 11.1,8.2 11.8,10.5 10,9.1 8.2,10.5 8.9,8.2 7,6.8 9.3,6.8" fill="#00853F"/></svg>,
  COL: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#CE1126"/><rect width="20" height="9.33" fill="#003087"/><rect width="20" height="4.67" fill="#FCD116"/></svg>,
  ECU: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#034EA2"/><rect width="20" height="9.33" fill="#E31837"/><rect width="20" height="4.67" fill="#FFD100"/></svg>,
  GHA: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#006B3F"/><rect width="20" height="9.33" fill="#FCD116"/><rect width="20" height="4.67" fill="#EF3340"/><polygon points="10,5 10.8,7.4 13.4,7.4 11.3,8.9 12.1,11.3 10,9.8 7.9,11.3 8.7,8.9 6.6,7.4 9.2,7.4" fill="#000"/></svg>,
  PAN: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect width="10" height="7" fill="#DB161B"/><rect x="10" y="7" width="10" height="7" fill="#005293"/><polygon points="5,1 5.8,3.4 8.4,3.4 6.3,4.9 7.1,7.3 5,5.8 2.9,7.3 3.7,4.9 1.6,3.4 4.2,3.4" fill="#005293"/><polygon points="15,7.5 15.8,9.9 18.4,9.9 16.3,11.4 17.1,13.8 15,12.3 12.9,13.8 13.7,11.4 11.6,9.9 14.2,9.9" fill="#DB161B"/></svg>,
  NOR: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#EF2B2D"/><rect x="5.5" width="3" height="14" fill="#fff"/><rect y="5.5" width="20" height="3" fill="#fff"/><rect x="6" width="2" height="14" fill="#002868"/><rect y="6" width="20" height="2" fill="#002868"/></svg>,
  EGY: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect width="20" height="4.67" fill="#CE1126"/><rect y="9.33" width="20" height="4.67" fill="#000"/><circle cx="10" cy="7" r="1.5" fill="#C09300"/></svg>,
  IRN: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#239F40"/><rect width="20" height="9.33" fill="#fff"/><rect width="20" height="4.67" fill="#DA0000"/></svg>,
  KSA: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#006C35"/><rect y="6.25" width="20" height="1.5" fill="#fff"/></svg>,
  QAT: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#8D1B3D"/><rect width="7" height="14" fill="#fff"/><path d="M7,0 L9.5,1.4 L7,2.8 L9.5,4.2 L7,5.6 L9.5,7 L7,8.4 L9.5,9.8 L7,11.2 L9.5,12.6 L7,14" fill="#8D1B3D" stroke="#8D1B3D" strokeWidth="0.5"/></svg>,
  SUI: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#FF0000"/><rect x="8.5" y="3" width="3" height="8" fill="#fff"/><rect x="5.5" y="6" width="9" height="2" fill="#fff"/></svg>,
  BIH: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#002395"/><polygon points="4,0 18,0 18,14" fill="#FFCE00"/></svg>,
  NZL: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#00247D"/><path d="M0,0 L10,7 M10,0 L0,7" stroke="#fff" strokeWidth="2.5"/><path d="M0,0 L10,7 M10,0 L0,7" stroke="#CC142B" strokeWidth="1.5"/><rect x="4" width="2" height="7" fill="#fff"/><rect y="3" width="10" height="2" fill="#fff"/><rect x="4.4" width="1.2" height="7" fill="#CC142B"/><rect y="3.4" width="10" height="1.2" fill="#CC142B"/></svg>,
  CZE: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#D7141A"/><rect width="20" height="7" fill="#fff"/><polygon points="0,0 8,7 0,14" fill="#11457E"/></svg>,
  JOR: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#007A3D"/><rect width="20" height="9.33" fill="#fff"/><rect width="20" height="4.67" fill="#000"/><polygon points="0,7 6,3.5 6,10.5" fill="#CE1126"/></svg>,
  ALG: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect width="10" height="14" fill="#006233"/><circle cx="11" cy="7" r="2.8" fill="#fff"/><circle cx="11.8" cy="7" r="2" fill="#006233"/><polygon points="13.5,7 14.5,5.5 15.8,7 14.5,8.5" fill="#D21034"/></svg>,
  AUT: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#ED2939"/><rect y="4.67" width="20" height="4.67" fill="#fff"/></svg>,
  POL: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#DC143C"/><rect width="20" height="7" fill="#fff"/></svg>,
  CIV: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#009A00"/><rect width="13.3" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#F77F00"/></svg>,
  PAR: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#0038A8"/><rect width="20" height="9.33" fill="#fff"/><rect width="20" height="4.67" fill="#D52B1E"/></svg>,
  SWE: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#006AA7"/><rect x="5.5" width="3" height="14" fill="#FECC02"/><rect y="5.5" width="20" height="3" fill="#FECC02"/></svg>,
  TUN: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#E70013"/><circle cx="10" cy="7" r="4" fill="#fff"/><circle cx="10" cy="7" r="2.8" fill="#E70013"/><polygon points="12.8,7 13.8,5.5 15,7 13.8,8.5" fill="#fff"/></svg>,
  CPV: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#003893"/><rect y="7.5" width="20" height="3" fill="#CF1126"/><rect y="8.75" width="20" height="0.8" fill="#F7D116"/></svg>,
  COD: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#007FFF"/><path d="M0,14 L20,0" stroke="#F7D618" strokeWidth="3"/><rect width="20" height="4" fill="#CE1021"/></svg>,
  UZB: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#1EB53A"/><rect width="20" height="9.33" fill="#fff"/><rect width="20" height="4.67" fill="#009FCA"/><rect y="4.17" width="20" height="0.6" fill="#CE1126"/><rect y="9.33" width="20" height="0.6" fill="#CE1126"/></svg>,
  HAI: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#D21034"/><rect width="20" height="7" fill="#00209F"/></svg>,
  CUW: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#002B7F"/><rect y="8.5" width="20" height="2" fill="#F9E814"/><circle cx="5" cy="4.5" r="1.8" fill="#fff"/><circle cx="8.5" cy="4.5" r="1.8" fill="#fff"/></svg>,
  IRQ: <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#007A3D"/><rect width="20" height="9.33" fill="#fff"/><rect width="20" height="4.67" fill="#CE1126"/><rect x="7" y="5.5" width="6" height="3" fill="#000"/></svg>,
};

const FlagBadge = ({ code, emoji, size=36 }) => {
  const flagSvg = FLAGS_SVG[code];
  if (flagSvg) {
    // Bandeira é 20x14 (proporção retangular). Para preencher um círculo (quadrado),
    // usamos viewBox quadrado centralizado com slice para cobrir tudo.
    const cloned = React.cloneElement(flagSvg, {
      width: size,
      height: size,
      viewBox: "3 0 14 14",
      preserveAspectRatio: "xMidYMid slice",
      style: { display: "block" }
    });
    return (
      <div style={{
        width:size, height:size, borderRadius:"50%",
        overflow:"hidden",
        flexShrink:0, boxShadow:"0 1px 4px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(0,0,0,0.06)",
      }}>
        {cloned}
      </div>
    );
  }
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      overflow:"hidden",
      flexShrink:0, boxShadow:"0 1px 4px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(0,0,0,0.06)",
      background:"#f2f2f7", display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.5
    }}>
      {emoji||"🏳️"}
    </div>
  );
};
// ─── TELA: ESPECIAIS ──────────────────────────────────────────────────────────
const SpecialScreen = ({ stickers, onToggle, onToggleRep, onBack }) => {
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #ebebeb",padding:"12px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <FlagBadge emoji="⭐" size={36}/>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:700,color:"#111"}}>Figurinhas Especiais</div>
            <div style={{fontSize:13,color:"#8e8e93",marginTop:1}}>
              {[...SPECIAL_GROUPS.FWC.ids,...SPECIAL_GROUPS.SEL.ids,...SPECIAL_GROUPS.CC.ids].filter(id=>stickers[id]?.owned).length} de {[...SPECIAL_GROUPS.FWC.ids,...SPECIAL_GROUPS.SEL.ids,...SPECIAL_GROUPS.CC.ids].length}
            </div>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 24px"}}>
        {Object.entries(SPECIAL_GROUPS).map(([sgKey, sg])=>{
          const accentColor = sg.color;
          return (
            <div key={sgKey} style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,letterSpacing:0.5,color:accentColor,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:accentColor}}/>
                {sg.label.toUpperCase()}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {sg.ids.map(id=>{
                  const isOwned = !!stickers[id]?.owned;
                  const qty = stickers[id]?.qty || 0;
                  const isRep = qty > 0;
                  return (
                    <div key={id} style={{display:"flex",flexDirection:"column"}}>
                      <button onClick={()=>onToggle(id)}
                        style={{padding:"14px 6px 10px",
                          borderRadius: isOwned ? "8px 8px 0 0" : "8px",
                          border:"1px solid", borderBottom: isOwned ? "none" : "1px solid",
                          borderColor: isOwned ? accentColor : "#e0e0e0",
                          background: isOwned ? accentColor : "#fff",
                          color: isOwned ? "#fff" : "#aaa",
                          fontSize:13,fontWeight:700,letterSpacing:0.8,
                          cursor:"pointer",transition:"all .15s",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif"}}>
                        {id}
                        {isOwned && <div style={{fontSize:8,opacity:0.7,marginTop:2}}>{specialLabel(id).replace(id+" ","")}</div>}
                      </button>
                      {isOwned && (
                        <div style={{display:"flex",borderRadius:"0 0 8px 8px",overflow:"hidden",border:`1px solid ${accentColor}30`,borderTop:"none",background:"#fafafa"}}>
                          <button onClick={()=>onToggleRep(id,-1)}
                            style={{flex:1,padding:"5px",background:"#fafafa",border:"none",color:"#8e8e93",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <Icon name="minus" size={10} color="#bbb" sw={2.5}/>
                          </button>
                          <div style={{flex:1,padding:"5px",background:qty>0?accentColor+"18":"transparent",color:qty>0?accentColor:"#ccc",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif",borderLeft:`1px solid ${accentColor}20`,borderRight:`1px solid ${accentColor}20`}}>
                            {qty > 0 ? `+${qty}` : "rep"}
                          </div>
                          <button onClick={()=>onToggleRep(id,1)}
                            style={{flex:1,padding:"5px",background:"#fafafa",border:"none",color:"#8e8e93",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <Icon name="plus" size={10} color="#bbb" sw={2.5}/>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── TELA: GRID DE UMA SELEÇÃO ────────────────────────────────────────────────
const TeamScreen = ({ team, stickers, onToggle, onToggleRep, onBack }) => {
  const ids = Array.from({length:20}, (_,i) => `${team.code} ${i+1}`);
  const owned = ids.filter(id => stickers[id]?.owned).length;
  const totalRep = ids.reduce((acc,id) => acc + (stickers[id]?.qty||0), 0);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #ebebeb",padding:"12px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <FlagBadge code={team.code} emoji={team.flag} size={40}/>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:700,color:"#111"}}>{team.name} <span style={{color:"#8e8e93",fontWeight:400,fontSize:12}}>({team.code})</span></div>
            <div style={{fontSize:13,color:"#8e8e93",marginTop:2}}>
              {owned} de 20 · {totalRep} repetida{totalRep!==1?"s":""}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
          <Bar value={owned} total={20} height={3}/>
          <span style={{fontSize:13,fontWeight:700,color:"#111",flexShrink:0}}>{Math.round((owned/20)*100)}%</span>
        </div>
        <button onClick={()=>ids.forEach(id=>{if(!stickers[id]?.owned) onToggle(id)})}
          style={{marginTop:10,width:"100%",padding:"9px",background:"none",border:"1px solid #e0e0e0",borderRadius:6,fontSize:13,fontWeight:600,color:"#888",cursor:"pointer",letterSpacing:0.5}}>
          Marcar todas
        </button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 24px"}}>
        <div style={{fontSize:13,color:"#8e8e93",letterSpacing:0.5,fontWeight:700,marginBottom:12}}>
          TOQUE PARA MARCAR QUE VOCÊ TEM · USE + / − PARA REPETIDAS
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {ids.map(id => {
            const isOwned = !!stickers[id]?.owned;
            const qty = stickers[id]?.qty || 0;
            return (
              <div key={id} style={{display:"flex",flexDirection:"column"}}>
                <button onClick={()=>onToggle(id)}
                  style={{padding:"16px 6px",borderRadius:isOwned?"8px 8px 0 0":"8px",
                    border:"1px solid", borderBottom:isOwned?"none":"1px solid",
                    borderColor:isOwned?"#111":"#e0e0e0",
                    background:isOwned?"#111":"#fff",
                    color:isOwned?"#fff":"#aaa",
                    fontSize:13,fontWeight:700,letterSpacing:0.3,
                    cursor:"pointer",transition:"all .15s",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif"}}>
                  {id}
                </button>
                {isOwned && (
                  <div style={{display:"flex",borderRadius:"0 0 8px 8px",overflow:"hidden",border:"1px solid #e0e0e0",borderTop:"none",background:"#fafafa"}}>
                    <button onClick={()=>onToggleRep(id,-1)}
                      style={{flex:1,padding:"6px",background:"#fafafa",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon name="minus" size={10} color="#bbb" sw={2.5}/>
                    </button>
                    <div style={{flex:1,background:qty>0?"#f0f0f0":"transparent",color:qty>0?"#333":"#ccc",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif",borderLeft:"1px solid #e8e8e8",borderRight:"1px solid #e8e8e8"}}>
                      {qty > 0 ? `+${qty}` : "rep"}
                    </div>
                    <button onClick={()=>onToggleRep(id,1)}
                      style={{flex:1,padding:"6px",background:"#fafafa",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon name="plus" size={10} color="#bbb" sw={2.5}/>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── ABA ÁLBUM ────────────────────────────────────────────────────────────────
const AlbumTab = ({ stickers, onSelectTeam }) => {
  const [openGroups, setOpenGroups] = useState({A:true,B:true});
  const [search, setSearch] = useState("");
  const toggleGroup = g => setOpenGroups(prev=>({...prev,[g]:!prev[g]}));

  const totalRep = Object.values(stickers).reduce((acc,s)=>acc+(s.qty||0),0);

  const filteredGroups = useMemo(()=>{
    if (!search.trim()) return GROUPS;
    const q = search.toLowerCase();
    const r={};
    Object.entries(GROUPS).forEach(([g,teams])=>{
      const f=teams.filter(t=>t.name.toLowerCase().includes(q)||t.code.toLowerCase().includes(q));
      if(f.length) r[g]=f;
    });
    return r;
  },[search]);

  const specialOwned = [...SPECIAL_GROUPS.FWC.ids,...SPECIAL_GROUPS.SEL.ids,...SPECIAL_GROUPS.CC.ids].filter(id=>stickers[id]?.owned).length;
  const specialTotal = [...SPECIAL_GROUPS.FWC.ids,...SPECIAL_GROUPS.SEL.ids,...SPECIAL_GROUPS.CC.ids].length;
  const specialRep = [...SPECIAL_GROUPS.FWC.ids,...SPECIAL_GROUPS.SEL.ids,...SPECIAL_GROUPS.CC.ids].reduce((acc,id)=>acc+(stickers[id]?.qty||0),0);

  return (
    <div style={{padding:"0 0 20px"}}>
      {/* Busca */}
      <div style={{padding:"16px 16px 8px"}}>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",opacity:0.4}}>
            <Icon name="search" size={16} color="#111"/>
          </div>
          <input style={{background:"#fff",border:"none",borderRadius:10,padding:"12px 14px 12px 38px",color:"#111",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif",fontSize:15,outline:"none",width:"100%"}}
            placeholder="Buscar seleção" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Especiais */}
      {!search && (
        <div style={{margin:"8px 16px 0"}}>
          <button onClick={()=>onSelectTeam({name:"Especiais",code:"FWC",flag:"⭐",isSpecial:true})}
            style={{width:"100%",background:"#fff",border:"none",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <FlagBadge emoji="⭐" size={40}/>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:16,fontWeight:600,color:"#111"}}>Especiais</div>
                <div style={{fontSize:13,color:"#8e8e93",marginTop:2}}>
                  {specialOwned}/{specialTotal}
                  {specialRep>0 && <span style={{color:"#c9a84c",marginLeft:8}}>{specialRep} repetida{specialRep!==1?"s":""}</span>}
                </div>
              </div>
            </div>
            <Icon name="right" size={16} color="#c7c7cc" sw={2}/>
          </button>
        </div>
      )}

      {/* Grupos */}
      <div style={{marginTop:8}}>
        {Object.entries(filteredGroups).map(([g,teams])=>{
          const groupIds = teams.flatMap(t=>Array.from({length:20},(_,i)=>`${t.code} ${i+1}`));
          const groupOwned = groupIds.filter(id=>stickers[id]?.owned).length;
          const groupRep = groupIds.reduce((acc,id)=>acc+(stickers[id]?.qty||0),0);
          const isOpen = openGroups[g]!==false;
          return (
            <div key={g} style={{margin:"0 16px 10px"}}>
              <button onClick={()=>toggleGroup(g)}
                style={{width:"100%",background:"#fff",border:"none",
                  borderRadius:isOpen?"12px 12px 0 0":"12px",
                  padding:"14px 16px",display:"flex",alignItems:"center",
                  justifyContent:"space-between",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#111",width:30,height:30,background:"#f2f2f7",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {g}
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:16,fontWeight:600,color:"#111"}}>Grupo {g}</div>
                    <div style={{fontSize:13,color:"#8e8e93"}}>
                      {groupOwned}/{groupIds.length}
                      {groupRep>0 && <span style={{color:"#c9a84c",marginLeft:8}}>{groupRep} rep.</span>}
                    </div>
                  </div>
                </div>
                <Icon name={isOpen?"down":"right"} size={16} color="#c7c7cc" sw={2}/>
              </button>
              {isOpen && (
                <div style={{background:"#fff",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
                  {teams.map((team,idx)=>{
                    const tIds = Array.from({length:20},(_,i)=>`${team.code} ${i+1}`);
                    const tOwned = tIds.filter(id=>stickers[id]?.owned).length;
                    const tRep = tIds.reduce((acc,id)=>acc+(stickers[id]?.qty||0),0);
                    return (
                      <button key={team.code} onClick={()=>onSelectTeam(team)}
                        style={{width:"100%",background:"#fff",border:"none",
                          borderTop:idx>0?"1px solid #f2f2f7":"1px solid #f2f2f7",
                          padding:"12px 16px",display:"flex",alignItems:"center",cursor:"pointer",gap:14}}>
                        <FlagBadge code={team.code} emoji={team.flag} size={38}/>
                        <div style={{flex:1,textAlign:"left"}}>
                          <div style={{fontSize:16,fontWeight:500,color:"#111"}}>
                            {team.name}
                          </div>
                          <div style={{fontSize:13,color:"#8e8e93",marginTop:2}}>
                            {team.code} · {tOwned}/20
                            {tRep>0 && <span style={{color:"#c9a84c",marginLeft:6}}>· {tRep} rep.</span>}
                          </div>
                        </div>
                        <Icon name="right" size={14} color="#c7c7cc" sw={2}/>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── ABA STATS ────────────────────────────────────────────────────────────────
const StatsTab = ({ stickers }) => {
  const owned = Object.values(stickers).filter(s=>s.owned).length;
  const totalRep = Object.values(stickers).reduce((acc,s)=>acc+(s.qty||0),0);
  const pct = Math.round((owned/TOTAL)*100);
  return (
    <div style={{padding:"12px 14px 20px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        {[{l:"Total",v:TOTAL,c:"#111"},{l:"Tenho",v:owned,c:"#111"},{l:"Faltam",v:TOTAL-owned,c:"#111"},{l:"Repetidas",v:totalRep,c:"#c9a84c"}].map(s=>(
          <div key={s.l} style={{background:"#fff",border:"1px solid #e5e5ea",borderRadius:10,padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:26,fontWeight:700,color:s.c,fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif"}}>{s.v}</div>
            <div style={{fontSize:13,color:"#8e8e93",marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #e5e5ea",borderRadius:10,padding:14,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
          <span style={{fontSize:14,fontWeight:700,color:"#111"}}>Progresso geral</span>
          <span style={{fontSize:20,fontWeight:700,color:"#111",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif"}}>{pct}%</span>
        </div>
        <Bar value={owned} total={TOTAL} height={3}/>
        <div style={{fontSize:13,color:"#8e8e93",marginTop:8}}>{owned} de {TOTAL}</div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e5e5ea",borderRadius:10,padding:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:12}}>Por grupo</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {Object.entries(GROUPS).map(([g,teams])=>{
            const ids=teams.flatMap(t=>Array.from({length:20},(_,i)=>`${t.code} ${i+1}`));
            const o=ids.filter(id=>stickers[id]?.owned).length;
            const p=Math.round((o/ids.length)*100);
            return (
              <div key={g}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11}}>
                  <span style={{fontWeight:600,color:"#333"}}>Grupo {g}</span>
                  <span style={{color:"#8e8e93"}}>{o}/{ids.length} <b style={{color:"#111"}}>{p}%</b></span>
                </div>
                <Bar value={o} total={ids.length} height={2}/>
              </div>
            );
          })}
          {Object.entries(SPECIAL_GROUPS).map(([key,grp])=>{
            const o=grp.ids.filter(id=>stickers[id]?.owned).length;
            const p=Math.round((o/grp.ids.length)*100);
            return (
              <div key={key}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11}}>
                  <span style={{fontWeight:600,color:"#333"}}>{grp.label}</span>
                  <span style={{color:"#8e8e93"}}>{o}/{grp.ids.length} <b style={{color:"#111"}}>{p}%</b></span>
                </div>
                <Bar value={o} total={grp.ids.length} height={2} color={grp.color}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── ABA TROCAR ───────────────────────────────────────────────────────────────
const TrocarTab = ({ stickers, onToggleRep, onShowPublic }) => {
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState({});
  const toggleGroup = g => setOpenGroups(prev=>({...prev,[g]:!prev[g]}));

  async function handleShare() {
    const url = `${window.location.origin}/?user=jrsabel`;
    const text = "Minhas figurinhas repetidas da Copa 2026 — veja quais tenho para trocar!";
    if (navigator.share) {
      try { await navigator.share({title:"Copa 2026 — Figurinhas Repetidas",text,url}); } catch(e){}
    } else { navigator.clipboard.writeText(url); }
  }

  const rep = useMemo(()=>
    Object.entries(stickers)
      .filter(([,v])=>v.owned && (v.qty||0)>0)
      .map(([id,v])=>({id, qty:v.qty, ...ALL[id]}))
      .filter(r=>r.group)
  ,[stickers]);

  const totalRep = rep.reduce((acc,r)=>acc+r.qty,0);

  const filtered = useMemo(()=>{
    if (!search.trim()) return rep;
    const q = search.toUpperCase();
    return rep.filter(r=>r.id.includes(q)||(r.team||"").toUpperCase().includes(q));
  },[rep,search]);

  // Agrupa por grupo, depois por time
  const byGroup = useMemo(()=>{
    const m={};
    filtered.forEach(s=>{if(!m[s.group])m[s.group]=[];m[s.group].push(s)});
    return m;
  },[filtered]);

  // Para cada grupo, agrupa por time
  const byGroupAndTeam = useMemo(()=>{
    const result={};
    Object.entries(byGroup).forEach(([g,items])=>{
      const teams={};
      items.forEach(s=>{
        const key = s.team||g;
        if(!teams[key]) teams[key]={team:s.team,code:s.code,flag:s.flag,items:[]};
        teams[key].items.push(s);
      });
      result[g]=teams;
    });
    return result;
  },[byGroup]);

  return (
    <div style={{padding:"0 0 20px"}}>
      {/* Compartilhar */}
      <div style={{margin:"12px 14px 0",background:"#fff",border:"1px solid #e5e5ea",borderRadius:10,padding:14}}>
        <div style={{fontSize:14,fontWeight:700,color:"#111",marginBottom:2}}>Página pública de trocas</div>
        <div style={{fontSize:13,color:"#8e8e93",marginBottom:10}}>Compartilhe para trocar figurinhas</div>
        <div style={{background:"#f7f7f7",borderRadius:6,padding:"8px 10px",fontSize:13,color:"#888",marginBottom:10,fontFamily:"monospace",wordBreak:"break-all"}}>
          albumcopa26.vercel.app/?user=jrsabel
        </div>
        <button onClick={onShowPublic||handleShare}
          style={{width:"100%",padding:"10px",background:"#111",border:"none",borderRadius:6,color:"#fff",fontSize:13,fontWeight:600,fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <Icon name="share" size={13} color="#fff" sw={2}/>
          Compartilhar minhas repetidas
        </button>
      </div>

      {/* Cabeçalho + busca */}
      <div style={{padding:"14px 14px 0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:700,color:"#8e8e93",letterSpacing:0.5}}>REPETIDAS</div>
          <div style={{fontSize:13,fontWeight:700,color:"#c9a84c",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif"}}>{totalRep} total</div>
        </div>
        <div style={{position:"relative",marginBottom:14}}>
          <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",opacity:0.3}}>
            <Icon name="search" size={13} color="#111"/>
          </div>
          <input style={{background:"#fff",border:"1px solid #e5e5ea",borderRadius:10,padding:"9px 12px 9px 30px",color:"#111",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif",fontSize:15,outline:"none",width:"100%"}}
            placeholder="Buscar figurinha repetida..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {filtered.length===0
        ? <div style={{margin:"0 14px",background:"#fff",border:"1px solid #e5e5ea",borderRadius:10,padding:28,textAlign:"center",color:"#8e8e93",fontSize:13,fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif"}}>
            Nenhuma repetida ainda
          </div>
        : Object.entries(byGroupAndTeam).map(([g, teams])=>{
            const groupItems = filtered.filter(s=>s.group===g);
            const groupQty = groupItems.reduce((acc,s)=>acc+s.qty,0);
            const isOpen = openGroups[g]!==false; // aberto por padrão
            const isSpecial = g==="ESPECIAL";

            return (
              <div key={g} style={{margin:"0 14px 10px"}}>
                {/* Header do grupo */}
                <button onClick={()=>toggleGroup(g)}
                  style={{width:"100%",background:"#fff",border:"1px solid #e5e5ea",
                    borderRadius:isOpen?"8px 8px 0 0":"8px",
                    padding:"12px 14px",display:"flex",alignItems:"center",
                    justifyContent:"space-between",cursor:"pointer",
                    borderBottom:isOpen?"1px solid #f0f0f0":"1px solid #e8e8e8"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#111",letterSpacing:0.3,width:28,height:28,background:"#f2f2f7",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {isSpecial?"★":g}
                    </div>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#111"}}>{isSpecial?"Especiais":`Grupo ${g}`}</div>
                      <div style={{fontSize:13,color:"#c9a84c",fontWeight:600,marginTop:1}}>{groupQty} repetida{groupQty!==1?"s":""}</div>
                    </div>
                  </div>
                  <Icon name={isOpen?"down":"right"} size={14} color="#ccc" sw={2}/>
                </button>

                {/* Times dentro do grupo */}
                {isOpen && (
                  <div style={{background:"#fff",border:"1px solid #e5e5ea",borderTop:"none",borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
                    {Object.entries(teams).map(([teamKey,teamData],idx)=>(
                      <div key={teamKey} style={{borderTop:idx>0?"1px solid #f5f5f5":"none"}}>
                        {/* Header do time com bandeira */}
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px 6px",background:"#fafafa"}}>
                          <FlagBadge code={teamData.code} emoji={teamData.flag} size={28}/>
                          <div style={{fontSize:13,fontWeight:600,color:"#555"}}>
                            {teamData.team} <span style={{color:"#c7c7cc",fontWeight:400,fontSize:10}}>({teamData.code})</span>
                          </div>
                        </div>
                {/* Figurinhas do time em grid 3 colunas */}
                        <div style={{padding:"8px 14px 12px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                          {teamData.items.map(s=>{
                            const qty = s.qty||0;
                            return (
                              <div key={s.id} style={{display:"flex",flexDirection:"column"}}>
                                <div style={{padding:"14px 6px",borderRadius:"8px 8px 0 0",border:"1px solid #111",borderBottom:"none",background:"#111",color:"#fff",fontSize:13,fontWeight:700,letterSpacing:0.3,textAlign:"center",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif"}}>
                                  {s.id}
                                </div>
                                <div style={{display:"flex",borderRadius:"0 0 8px 8px",overflow:"hidden",border:"1px solid #e0e0e0",borderTop:"none",background:"#fafafa"}}>
                                  <button onClick={()=>onToggleRep(s.id,-1)}
                                    style={{flex:1,padding:"6px",background:"#fafafa",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    <Icon name="minus" size={10} color="#bbb" sw={2.5}/>
                                  </button>
                                  <div style={{flex:1,background:qty>0?"#f0f0f0":"transparent",color:qty>0?"#333":"#ccc",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif",borderLeft:"1px solid #e8e8e8",borderRight:"1px solid #e8e8e8"}}>
                                    {qty>0?`+${qty}`:"rep"}
                                  </div>
                                  <button onClick={()=>onToggleRep(s.id,1)}
                                    style={{flex:1,padding:"6px",background:"#fafafa",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    <Icon name="plus" size={10} color="#bbb" sw={2.5}/>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
      }
    </div>
  );
};


// ─── ABA PERFIL ───────────────────────────────────────────────────────────────
const PerfilTab = ({ onSignOut }) => (
  <div style={{padding:"12px 14px 20px"}}>
    <div style={{background:"#fff",border:"1px solid #e5e5ea",borderRadius:10,padding:24,textAlign:"center",marginBottom:10}}>
      <div style={{width:56,height:56,background:"#111",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
        <Icon name="user" size={22} color="#fff" sw={1.5}/>
      </div>
      <div style={{fontSize:16,fontWeight:700,color:"#111",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif"}}>jrsabel</div>
      <div style={{fontSize:13,color:"#8e8e93",marginTop:3}}>juniorsabel@gmail.com</div>
    </div>
    <button onClick={onSignOut} style={{width:"100%",padding:"13px",background:"#fff",border:"1px solid #e5e5ea",borderRadius:10,color:"#8e8e93",fontSize:13,fontWeight:600,fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:0.5}}>
      <Icon name="logout" size={13} color="#aaa" sw={2}/> Sair da conta
    </button>
  </div>
);


// ─── ABA RANKING (Supabase) ──────────────────────────────────────────────────
const RankingTab = ({ myStickers, currentUsername }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMissing, setFilterMissing] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const toggleGroup = g => setOpenGroups(prev=>({...prev,[g]:!prev[g]}));
  const AF = "-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";

  // Carregar usuários do public_repeated
  useEffect(()=>{
    (async () => {
      const { data: pubData } = await supabase.from("public_repeated").select("username,repeated_ids,avatar_url");
      if (!pubData) { setLoading(false); return; }
      // Buscar total de figurinhas de cada usuário (via stickers)
      const usernames = pubData.map(p=>p.username);
      const list = pubData.map(p => ({
        username: p.username,
        avatar: p.avatar_url || null,
        repeated: p.repeated_ids || [],
        rep: (p.repeated_ids||[]).length,
        total: 0, // será preenchido abaixo se conseguirmos
      }));
      // Tentamos pegar totals (opcional - se não conseguir, fica 0)
      try {
        const { data: usersData } = await supabase.from("public_repeated").select("user_id,username");
        if (usersData) {
          for (const u of list) {
            const match = usersData.find(x=>x.username===u.username);
            if (match) {
              const { count } = await supabase.from("stickers").select("*",{count:"exact",head:true}).eq("user_id",match.user_id).eq("owned",true);
              u.total = count || 0;
            }
          }
        }
      } catch(e){}
      setUsers(list);
      setLoading(false);
    })();
  },[]);

  const myOwned = useMemo(()=> new Set(Object.entries(myStickers).filter(([,v])=>v.owned).map(([k])=>k)), [myStickers]);
  const ranked = useMemo(()=> [...users].sort((a,b)=>b.rep-a.rep).map((u,i)=>({...u,rank:i+1})), [users]);

  const userStickers = useMemo(()=>{
    if (!selectedUser) return [];
    const all = selectedUser.repeated.map(id=>({id,...ALL[id]})).filter(r=>r.group);
    if (!filterMissing) return all;
    return all.filter(s=>!myOwned.has(s.id));
  },[selectedUser, filterMissing, myOwned]);

  const byGroupAndTeam = useMemo(()=>{
    const byG={};
    userStickers.forEach(s=>{if(!byG[s.group])byG[s.group]=[];byG[s.group].push(s)});
    const result={};
    Object.entries(byG).forEach(([g,items])=>{
      const teams={};
      items.forEach(s=>{
        const key=s.team||g;
        if(!teams[key]) teams[key]={team:s.team,code:s.code,flag:s.flag,items:[]};
        teams[key].items.push(s);
      });
      result[g]=teams;
    });
    return result;
  },[userStickers]);

  if (loading) return <div style={{textAlign:"center",padding:40,color:"#8e8e93",fontSize:15,fontFamily:AF}}>Carregando...</div>;

  if (selectedUser) {
    const useful = filterMissing ? userStickers.length : selectedUser.repeated.length;
    return (
      <div>
        <div style={{background:"#fff",borderBottom:"1px solid #e5e5ea",padding:"14px 16px",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <button onClick={()=>{setSelectedUser(null);setOpenGroups({});}}
              style={{background:"none",border:"none",cursor:"pointer",padding:4,margin:-4,flexShrink:0}}>
              <Icon name="back" size={20} color="#111" sw={2}/>
            </button>
            <div style={{width:42,height:42,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid #e5e5ea"}}>
              {selectedUser.avatar
                ? <img src={selectedUser.avatar} alt={selectedUser.username} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontSize:17,color:"#fff",fontWeight:600}}>{selectedUser.username[0].toUpperCase()}</span>
              }
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:600,color:"#111"}}>@{selectedUser.username}</div>
              <div style={{fontSize:13,color:"#8e8e93"}}>
                {selectedUser.rep} repetidas{selectedUser.total>0?` · ${selectedUser.total} figurinhas`:""}
              </div>
            </div>
          </div>
          <button onClick={()=>setFilterMissing(f=>!f)}
            style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:filterMissing?"#111":"#f2f2f7",border:"none",borderRadius:10,cursor:"pointer"}}>
            <span style={{fontSize:14,fontWeight:500,color:filterMissing?"#fff":"#111",fontFamily:AF}}>
              {filterMissing?"Mostrando só o que você não tem":"Mostrando tudo"}
            </span>
            <span style={{fontSize:13,color:filterMissing?"rgba(255,255,255,0.7)":"#8e8e93",fontFamily:AF}}>
              {useful} figurinha{useful!==1?"s":""}
            </span>
          </button>
        </div>

        <div style={{padding:"12px 16px 32px"}}>
          {userStickers.length===0
            ? <div style={{background:"#fff",borderRadius:12,padding:32,textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>🎉</div>
                <div style={{fontSize:16,fontWeight:600,color:"#111",marginBottom:4}}>Você já tem tudo!</div>
                <div style={{fontSize:13,color:"#8e8e93"}}>Nenhuma figurinha nova com este usuário</div>
                <button onClick={()=>setFilterMissing(false)}
                  style={{marginTop:16,padding:"10px 20px",background:"#f2f2f7",border:"none",borderRadius:10,fontSize:14,color:"#111",cursor:"pointer",fontFamily:AF}}>
                  Ver todas as repetidas
                </button>
              </div>
            : Object.entries(byGroupAndTeam).map(([g,teams])=>{
                const groupItems = userStickers.filter(s=>s.group===g);
                const isOpen = openGroups[g]!==false;
                const isSpecial = g==="ESPECIAL";
                return (
                  <div key={g} style={{marginBottom:10}}>
                    <button onClick={()=>toggleGroup(g)}
                      style={{width:"100%",background:"#fff",border:"none",borderRadius:isOpen?"12px 12px 0 0":"12px",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#111",width:30,height:30,background:"#f2f2f7",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {isSpecial?"★":g}
                        </div>
                        <div style={{textAlign:"left"}}>
                          <div style={{fontSize:16,fontWeight:600,color:"#111"}}>{isSpecial?"Especiais":`Grupo ${g}`}</div>
                          <div style={{fontSize:13,color:"#8e8e93",marginTop:1}}>{groupItems.length} figurinha{groupItems.length!==1?"s":""}</div>
                        </div>
                      </div>
                      <Icon name={isOpen?"down":"right"} size={16} color="#c7c7cc" sw={2}/>
                    </button>
                    {isOpen && (
                      <div style={{background:"#fff",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
                        {Object.entries(teams).map(([teamKey,teamData])=>(
                          <div key={teamKey} style={{borderTop:"1px solid #f2f2f7"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px 6px"}}>
                              <FlagBadge code={teamData.code} emoji={teamData.flag} size={32}/>
                              <div style={{fontSize:15,fontWeight:500,color:"#111"}}>
                                {teamData.team} <span style={{color:"#8e8e93",fontWeight:400,fontSize:13}}>({teamData.code})</span>
                              </div>
                            </div>
                            <div style={{padding:"4px 16px 12px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                              {teamData.items.map(s=>(
                                <div key={s.id} style={{padding:"12px 6px",borderRadius:10,border:"1px solid #e5e5ea",background:myOwned.has(s.id)?"#f2f2f7":"#fff",color:myOwned.has(s.id)?"#c7c7cc":"#111",fontSize:13,fontWeight:600,textAlign:"center"}}>
                                  {s.id}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
          }
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{fontSize:13,color:"#8e8e93",marginBottom:16}}>
        Usuários com mais figurinhas para trocar — toque para ver o que você não tem ainda.
      </div>

      {ranked.length===0 ? (
        <div style={{background:"#fff",borderRadius:12,padding:32,textAlign:"center",color:"#8e8e93",fontSize:14}}>
          Ninguém tem repetidas ainda. Seja o primeiro a marcar!
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {ranked.map((u,idx)=>{
            const useful = u.repeated.filter(id=>!myOwned.has(id)).length;
            const isMe = u.username===currentUsername;
            return (
              <button key={u.username} onClick={()=>{if(!isMe){setSelectedUser(u);setOpenGroups({});}}}
                style={{width:"100%",background:"#fff",border:isMe?"2px solid #111":"none",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,cursor:isMe?"default":"pointer",textAlign:"left"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:idx===0?"#FFD700":idx===1?"#C0C0C0":idx===2?"#CD7F32":"#f2f2f7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:14,fontWeight:700,color:idx<3?"#fff":"#8e8e93"}}>{u.rank}</span>
                </div>
                <div style={{width:42,height:42,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid #e5e5ea"}}>
                  {u.avatar
                    ? <img src={u.avatar} alt={u.username} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <span style={{fontSize:17,color:"#fff",fontWeight:600}}>{u.username[0].toUpperCase()}</span>
                  }
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:15,fontWeight:600,color:"#111"}}>@{u.username}</span>
                    {isMe && <span style={{fontSize:11,color:"#fff",background:"#111",padding:"2px 7px",borderRadius:20,fontWeight:600}}>você</span>}
                  </div>
                  <div style={{fontSize:13,color:"#8e8e93",marginTop:2}}>
                    {u.total>0&&<>{u.total} figurinhas · </>}<span style={{color:"#c9a84c",fontWeight:500}}>{u.rep} repetidas</span>
                  </div>
                </div>
                {!isMe && (
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:17,fontWeight:700,color:useful>0?"#111":"#c7c7cc"}}>{useful}</div>
                    <div style={{fontSize:11,color:"#8e8e93"}}>match</div>
                  </div>
                )}
                {!isMe && <Icon name="right" size={14} color="#c7c7cc" sw={2}/>}
              </button>
            );
          })}
        </div>
      )}

      <div style={{marginTop:20,padding:"14px 16px",background:"#fff",borderRadius:12}}>
        <div style={{fontSize:13,fontWeight:600,color:"#111",marginBottom:4}}>Como funciona?</div>
        <div style={{fontSize:13,color:"#8e8e93",lineHeight:1.5}}>
          O número <b style={{color:"#111"}}>"match"</b> mostra quantas das repetidas desse usuário você ainda não tem no seu álbum.
        </div>
      </div>
    </div>
  );
};

// ─── GERADOR DE PIX BR CODE (copia-e-cola) ────────────────────────────────────
function genPixPayload(key, name, city, amount, txid="COPA2026") {
  const f = (id, val) => id + String(val.length).padStart(2,"0") + val;
  const merchantAccount = f("00","BR.GOV.BCB.PIX") + f("01", key);
  const additional = f("05", txid);
  let payload =
    f("00","01") +
    f("26", merchantAccount) +
    f("52","0000") +
    f("53","986") +
    (amount > 0 ? f("54", amount.toFixed(2)) : "") +
    f("58","BR") +
    f("59", name.substring(0,25)) +
    f("60", city.substring(0,15)) +
    f("62", additional) +
    "6304";
  let crc = 0xFFFF;
  for (let i=0; i<payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j=0; j<8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
  }
  return payload + crc.toString(16).toUpperCase().padStart(4,"0");
}

// TODO: substituir pela chave PIX real
const PIX_KEY = "b5ab5f93-51b2-43b5-99eb-644b5183cd3e";
const PIX_NAME = "JOSE A SABEL JR";
const PIX_CITY = "SAO PAULO";

// ─── PERFIL com upload de foto ────────────────────────────────────────────────
const PerfilTabReal = ({ username, email, avatarUrl, onSignOut, onAvatarChange }) => {
  const [uploading, setUploading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdInfo, setPwdInfo] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const AF = "-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";

  const finalAmount = customAmount ? parseFloat(customAmount.replace(",",".")) || 0 : amount;
  const pixCode = useMemo(()=> genPixPayload(PIX_KEY, PIX_NAME, PIX_CITY, finalAmount), [finalAmount]);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pixCode)}`;

  function copyPix() {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { alert("Foto muito grande (máx 2MB)"); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert:true, cacheControl:"0" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("public_repeated").update({ avatar_url:url }).eq("user_id", user.id);
      onAvatarChange?.(url);
    } catch(err) { alert("Erro ao enviar foto: "+err.message); }
    setUploading(false);
  }

  async function handleChangePwd() {
    setPwdError(""); setPwdInfo("");
    if (newPwd.length < 6) { setPwdError("Senha precisa ter ao menos 6 caracteres."); return; }
    if (newPwd !== confirmPwd) { setPwdError("As senhas não coincidem."); return; }
    setPwdLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);
    if (err) { setPwdError(err.message); return; }
    setPwdInfo("Senha alterada com sucesso!");
    setNewPwd(""); setConfirmPwd("");
    setTimeout(()=>{ setShowPwd(false); setPwdInfo(""); }, 1500);
  }

  const inp = { width:"100%", padding:"12px 14px", border:"none", background:"#f2f2f7", borderRadius:10, fontSize:15, outline:"none", color:"#111", fontFamily:AF };

  return (
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{background:"#fff",borderRadius:14,padding:24,textAlign:"center",marginBottom:10}}>
        <label style={{cursor:"pointer",display:"inline-block",position:"relative"}}>
          <div style={{width:80,height:80,background:avatarUrl?"transparent":"#111",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",overflow:"hidden",border:"2px solid #e5e5ea"}}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <span style={{fontSize:28,color:"#fff",fontWeight:600,fontFamily:AF}}>{(username||"?")[0].toUpperCase()}</span>
            }
          </div>
          <div style={{position:"absolute",bottom:14,right:"calc(50% - 48px)",width:28,height:28,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>
            <Icon name="plus" size={14} color="#fff" sw={2.5}/>
          </div>
          <input type="file" accept="image/*" onChange={handleUpload} style={{display:"none"}} disabled={uploading}/>
        </label>
        <div style={{fontSize:17,fontWeight:600,color:"#111"}}>{username||""}</div>
        <div style={{fontSize:13,color:"#8e8e93",marginTop:3}}>{email||""}</div>
        {uploading&&<div style={{fontSize:12,color:"#8e8e93",marginTop:8}}>Enviando foto...</div>}
      </div>

      {/* Trocar senha */}
      {!showPwd ? (
        <button onClick={()=>setShowPwd(true)} style={{width:"100%",padding:"13px",background:"#fff",border:"none",borderRadius:12,color:"#111",fontSize:15,fontWeight:500,cursor:"pointer",fontFamily:AF,marginBottom:10,textAlign:"center"}}>
          Trocar senha
        </button>
      ) : (
        <div style={{background:"#fff",borderRadius:12,padding:18,marginBottom:10}}>
          <div style={{fontSize:15,fontWeight:600,color:"#111",marginBottom:14}}>Trocar senha</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Nova senha (mín 6)" style={inp}/>
            <input type="password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} placeholder="Confirme a nova senha" style={inp}/>
            {pwdError&&<div style={{background:"#fef2f2",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#dc2626"}}>{pwdError}</div>}
            {pwdInfo&&<div style={{background:"#f0fdf4",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#16a34a"}}>{pwdInfo}</div>}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button onClick={()=>{setShowPwd(false);setNewPwd("");setConfirmPwd("");setPwdError("");setPwdInfo("");}}
                style={{flex:1,padding:"11px",background:"#f2f2f7",border:"none",borderRadius:10,color:"#111",fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:AF}}>
                Cancelar
              </button>
              <button onClick={handleChangePwd} disabled={pwdLoading}
                style={{flex:1,padding:"11px",background:"#111",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:600,cursor:pwdLoading?"not-allowed":"pointer",fontFamily:AF}}>
                {pwdLoading?"Salvando...":"Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribuir via PIX */}
      {!showPix ? (
        <button onClick={()=>setShowPix(true)}
          style={{width:"100%",padding:"13px",background:"#fff",border:"none",borderRadius:12,color:"#111",fontSize:15,fontWeight:500,cursor:"pointer",fontFamily:AF,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:18}}>🩶</span> Contribuir com site
        </button>
      ) : (
        <div style={{background:"#fff",borderRadius:12,padding:18,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{fontSize:15,fontWeight:600,color:"#111"}}>Contribuir via PIX</div>
            <button onClick={()=>{setShowPix(false);setCustomAmount("");setAmount(10);}}
              style={{background:"none",border:"none",fontSize:13,color:"#8e8e93",cursor:"pointer",fontFamily:AF}}>
              Fechar
            </button>
          </div>
          <div style={{fontSize:13,color:"#8e8e93",marginBottom:14,lineHeight:1.4}}>
            Sua contribuição ajuda a manter o site funcionando. Obrigado 🩶
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
            {[10, 20, 50].map(v=>(
              <button key={v} onClick={()=>{setAmount(v);setCustomAmount("");}}
                style={{padding:"12px",background:!customAmount&&amount===v?"#111":"#f2f2f7",border:"none",borderRadius:10,color:!customAmount&&amount===v?"#fff":"#111",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:AF}}>
                R$ {v}
              </button>
            ))}
          </div>
          <div style={{position:"relative",marginBottom:14}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#8e8e93",fontFamily:AF}}>R$</span>
            <input type="text" inputMode="decimal" value={customAmount}
              onChange={e=>setCustomAmount(e.target.value.replace(/[^\d,.]/g,""))}
              placeholder="outro valor"
              style={{width:"100%",padding:"12px 14px 12px 38px",border:"none",background:"#f2f2f7",borderRadius:10,fontSize:15,outline:"none",color:"#111",fontFamily:AF,boxSizing:"border-box"}}/>
          </div>
          {finalAmount > 0 && (
            <>
              <div style={{background:"#f2f2f7",borderRadius:12,padding:16,textAlign:"center",marginBottom:12}}>
                <img src={qrUrl} alt="QR Code PIX" style={{width:200,height:200,display:"block",margin:"0 auto",background:"#fff",padding:8,borderRadius:8}}/>
                <div style={{fontSize:13,color:"#8e8e93",marginTop:10}}>Escaneie no seu app do banco</div>
                <div style={{fontSize:18,fontWeight:700,color:"#111",marginTop:4}}>R$ {finalAmount.toFixed(2).replace(".",",")}</div>
              </div>
              <button onClick={copyPix}
                style={{width:"100%",padding:"13px",background:copied?"#16a34a":"#111",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:AF,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {copied
                  ? <><Icon name="check" size={14} color="#fff" sw={2.5}/> Copiado!</>
                  : "Copiar código PIX"
                }
              </button>
            </>
          )}
          {finalAmount === 0 && customAmount && (
            <div style={{background:"#fef2f2",borderRadius:8,padding:"10px 12px",fontSize:13,color:"#dc2626"}}>
              Digite um valor válido
            </div>
          )}
        </div>
      )}

      <button onClick={onSignOut} style={{width:"100%",padding:"13px",background:"#fff",border:"none",borderRadius:12,color:"#dc2626",fontSize:15,fontWeight:500,cursor:"pointer",fontFamily:AF}}>
        Sair da conta
      </button>
    </div>
  );
};

// ─── PÁGINA PÚBLICA ───────────────────────────────────────────────────────────
function PublicRepeatedPage({ username }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState({});
  const [avatarUrl, setAvatarUrl] = useState(null);
  const toggleGroup = g => setOpenGroups(prev=>({...prev,[g]:!prev[g]}));
  const APPLE_FONT = "-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";

  useEffect(() => {
    supabase.from("public_repeated").select("repeated_ids,updated_at,avatar_url").eq("username", username).single()
      .then(({ data }) => {
        if (data) { setRows(data.repeated_ids||[]); setAvatarUrl(data.avatar_url||null); setUpdatedAt(new Date(data.updated_at).toLocaleString("pt-BR")); }
        setLoading(false);
      });
  }, [username]);

  const rep = useMemo(() => rows.map(id=>({id,...ALL[id]})).filter(r=>r.group), [rows]);
  const totalRep = rep.length;
  const filtered = useMemo(()=>{
    if (!search.trim()) return rep;
    const q = search.toUpperCase();
    return rep.filter(r=>r.id.includes(q)||(r.team||"").toUpperCase().includes(q));
  },[rep,search]);
  const byGroupAndTeam = useMemo(()=>{
    const byG={};
    filtered.forEach(s=>{if(!byG[s.group])byG[s.group]=[];byG[s.group].push(s)});
    const result={};
    Object.entries(byG).forEach(([g,items])=>{
      const teams={};
      items.forEach(s=>{
        const key=s.team||g;
        if(!teams[key]) teams[key]={team:s.team,code:s.code,flag:s.flag,items:[]};
        teams[key].items.push(s);
      });
      result[g]=teams;
    });
    return result;
  },[filtered]);

  return (
    <div style={{minHeight:"100vh",background:"#f2f2f7",fontFamily:APPLE_FONT}}>
      <style>{`*{box-sizing:border-box}body{margin:0;background:#f2f2f7}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#e0e0e0;border-radius:2px}input{font-family:${APPLE_FONT}}`}</style>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e5ea",padding:"14px 16px",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid #e5e5ea"}}>
            {avatarUrl
              ? <img src={avatarUrl} alt={username} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <span style={{fontSize:17,color:"#fff",fontWeight:600}}>{username[0].toUpperCase()}</span>
            }
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:600,color:"#111"}}>@{username}</div>
            <div style={{fontSize:13,color:"#8e8e93",marginTop:1}}>{totalRep} disponível{totalRep!==1?"is":""} para troca</div>
          </div>
          <a href="/" style={{fontSize:13,color:"#8e8e93",textDecoration:"none"}}>← Álbum</a>
        </div>
      </div>

      <div style={{padding:"16px 16px 32px"}}>
        {loading ? <div style={{textAlign:"center",padding:40,color:"#8e8e93",fontSize:15}}>Carregando...</div>
        : <>
            <div style={{position:"relative",marginBottom:14}}>
              <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",opacity:0.4}}>
                <Icon name="search" size={16} color="#111"/>
              </div>
              <input style={{background:"#fff",border:"none",borderRadius:10,padding:"12px 14px 12px 38px",color:"#111",fontSize:15,outline:"none",width:"100%"}}
                placeholder="Buscar figurinha" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            {filtered.length===0
              ? <div style={{background:"#fff",borderRadius:12,padding:28,textAlign:"center",color:"#8e8e93",fontSize:15}}>Nenhuma repetida encontrada</div>
              : Object.entries(byGroupAndTeam).map(([g,teams])=>{
                  const groupItems = filtered.filter(s=>s.group===g);
                  const isOpen = openGroups[g]!==false;
                  const isSpecial = g==="ESPECIAL";
                  return (
                    <div key={g} style={{marginBottom:10}}>
                      <button onClick={()=>toggleGroup(g)}
                        style={{width:"100%",background:"#fff",border:"none",borderRadius:isOpen?"12px 12px 0 0":"12px",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#111",width:30,height:30,background:"#f2f2f7",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {isSpecial?"★":g}
                          </div>
                          <div style={{textAlign:"left"}}>
                            <div style={{fontSize:17,fontWeight:600,color:"#111"}}>{isSpecial?"Especiais":`Grupo ${g}`}</div>
                            <div style={{fontSize:13,color:"#c9a84c",fontWeight:500,marginTop:1}}>{groupItems.length} disponível{groupItems.length!==1?"is":""}</div>
                          </div>
                        </div>
                        <Icon name={isOpen?"down":"right"} size={16} color="#c7c7cc" sw={2}/>
                      </button>
                      {isOpen && (
                        <div style={{background:"#fff",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
                          {Object.entries(teams).map(([teamKey,teamData])=>(
                            <div key={teamKey} style={{borderTop:"1px solid #f2f2f7"}}>
                              <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px 6px"}}>
                                <FlagBadge code={teamData.code} emoji={teamData.flag} size={32}/>
                                <div style={{fontSize:15,fontWeight:500,color:"#111"}}>
                                  {teamData.team} <span style={{color:"#8e8e93",fontWeight:400,fontSize:13}}>({teamData.code})</span>
                                </div>
                              </div>
                              <div style={{padding:"4px 16px 12px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                                {teamData.items.map(s=>(
                                  <div key={s.id} style={{padding:"12px 6px",borderRadius:10,border:"1px solid #e5e5ea",background:"#fff",color:"#111",fontSize:13,fontWeight:600,textAlign:"center"}}>
                                    {s.id}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
            }
            {updatedAt&&<div style={{textAlign:"center",fontSize:13,color:"#c7c7cc",marginTop:16}}>Atualizado em {updatedAt}</div>}
          </>
        }
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // segundos restantes para próximo signup
  const [pendingEmail, setPendingEmail] = useState(""); // email com confirmação pendente
  const APPLE_FONT = "-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";

  // Tick do cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(()=>setCooldown(c=>c-1), 1000);
    return ()=>clearTimeout(t);
  }, [cooldown]);

  function validateUsername(u) {
    if (u.length < 3) return "Usuário precisa ter ao menos 3 caracteres.";
    if (u.length > 20) return "Usuário muito longo (máx 20).";
    if (!/^[a-z0-9_]+$/i.test(u)) return "Use apenas letras, números e underscore.";
    return null;
  }

  async function handle() {
    setError(""); setInfo("");
    if (!email.trim() || !password.trim()) { setError("Preencha todos os campos."); return; }

    if (mode === "login") {
      setLoading(true);
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) {
        if (err.message.toLowerCase().includes("email not confirmed")) {
          setPendingEmail(email);
          setError("E-mail ainda não confirmado. Verifique sua caixa ou reenvie abaixo.");
        } else {
          setError("E-mail ou senha incorretos.");
        }
        return;
      }
      onLogin(data.user);
      return;
    }

    // CADASTRO
    if (cooldown > 0) return; // botão já mostra o tempo
    if (!username.trim()) { setError("Escolha um nome de usuário."); return; }
    const uErr = validateUsername(username.trim());
    if (uErr) { setError(uErr); return; }
    if (password.length < 6) { setError("Senha precisa ter ao menos 6 caracteres."); return; }

    setLoading(true);

    // 1. Verifica se username já existe
    const { data: existing } = await supabase.from("public_repeated").select("username").eq("username", username.trim().toLowerCase()).maybeSingle();
    if (existing) {
      setError("Este nome de usuário já está em uso. Escolha outro.");
      setLoading(false);
      return;
    }

    // 2. Tenta criar conta
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim().toLowerCase() } }
    });

    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("Este e-mail já está cadastrado. Faça login.");
      } else if (msg.includes("rate limit") || err.status === 429) {
        setCooldown(180);
        setError("Muitas tentativas. Aguarde antes de tentar de novo.");
      } else if (msg.includes("invalid email")) {
        setError("E-mail inválido.");
      } else {
        setError(err.message);
      }
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      setPendingEmail(email);
      setInfo("Conta criada! Enviamos um e-mail de confirmação. Verifique sua caixa de entrada (ou spam) e clique no link para ativar.");
      setCooldown(60);
    } else if (data.user) {
      onLogin(data.user);
    }
    setLoading(false);
  }

  async function resendConfirmation() {
    if (!pendingEmail || cooldown > 0) return;
    setError(""); setInfo(""); setLoading(true);
    const { error: err } = await supabase.auth.resend({ type:"signup", email: pendingEmail });
    setLoading(false);
    if (err) {
      if (err.status === 429 || err.message.toLowerCase().includes("rate")) {
        setCooldown(180);
        setError("Muitas tentativas. Aguarde antes de reenviar.");
      } else {
        setError(err.message);
      }
      return;
    }
    setInfo("E-mail de confirmação reenviado! Verifique sua caixa de entrada.");
    setCooldown(60);
  }

  function fmtTime(s) {
    if (s >= 60) return `${Math.floor(s/60)}m ${s%60}s`;
    return `${s}s`;
  }

  const inp = { width:"100%", padding:"12px 14px", border:"none", background:"#f2f2f7", borderRadius:10, fontSize:15, outline:"none", color:"#111", fontFamily:APPLE_FONT, boxSizing:"border-box" };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f2f2f7",padding:"24px 20px",fontFamily:APPLE_FONT,boxSizing:"border-box"}}>
      <style>{`*{box-sizing:border-box}body{margin:0}`}</style>
      <div style={{width:"100%",maxWidth:380,boxSizing:"border-box"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:48,height:48,background:"#111",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <svg viewBox="0 0 80 90" width="26" fill="none"><path d="M22 10 C22 10 20 26 22 34 C24 42 32 46 40 46 C48 46 56 42 58 34 C60 26 58 10 58 10 Z" fill="#fff" opacity="0.9"/><path d="M22 16 C17 16 13 20 13 25 C13 30 17 34 22 33" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/><path d="M58 16 C63 16 67 20 67 25 C67 30 63 34 58 33" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/><rect x="36" y="46" width="8" height="14" rx="2" fill="#fff"/><rect x="28" y="60" width="24" height="4" rx="2" fill="#fff"/><polygon points="40,2 42,7.5 48,7.5 43.5,11 45.5,16.5 40,13 34.5,16.5 36.5,11 32,7.5 38,7.5" fill="#fff"/></svg>
          </div>
          <div style={{fontSize:22,fontWeight:700,color:"#111"}}>Copa 2026</div>
          <div style={{fontSize:13,color:"#8e8e93",marginTop:4}}>Álbum de figurinhas</div>
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:22,boxSizing:"border-box"}}>
          <div style={{display:"flex",background:"#f2f2f7",borderRadius:9,padding:3,marginBottom:20}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");setInfo("");setPendingEmail("");}}
                style={{flex:1,padding:"8px",border:"none",background:mode===m?"#fff":"transparent",color:"#111",fontSize:14,fontWeight:mode===m?600:400,cursor:"pointer",borderRadius:7,fontFamily:APPLE_FONT,boxShadow:mode===m?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
                {m==="login"?"Entrar":"Cadastrar"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {mode==="register"&&<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Nome de usuário (3-20, sem espaços)" style={inp} maxLength={20}/>}
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" style={inp}/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha (mínimo 6 caracteres)" onKeyDown={e=>e.key==="Enter"&&handle()} style={inp}/>
            {error&&<div style={{background:"#fef2f2",borderRadius:8,padding:"10px 12px",fontSize:13,color:"#dc2626"}}>{error}</div>}
            {info&&<div style={{background:"#eff6ff",borderRadius:8,padding:"10px 12px",fontSize:13,color:"#2563eb"}}>{info}</div>}
            <button onClick={handle} disabled={loading||cooldown>0} style={{padding:"14px",background:loading||cooldown>0?"#999":"#111",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:600,cursor:loading||cooldown>0?"not-allowed":"pointer",fontFamily:APPLE_FONT,marginTop:4}}>
              {loading?"Carregando...":cooldown>0?`Aguarde ${fmtTime(cooldown)}`:mode==="login"?"Entrar":"Criar conta"}
            </button>
            {pendingEmail && (
              <button onClick={resendConfirmation} disabled={loading||cooldown>0}
                style={{padding:"10px",background:"transparent",border:"1px solid #e5e5ea",borderRadius:10,color:"#111",fontSize:13,fontWeight:500,cursor:loading||cooldown>0?"not-allowed":"pointer",fontFamily:APPLE_FONT,opacity:cooldown>0?0.5:1}}>
                Reenviar e-mail de confirmação
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const params = new URLSearchParams(window.location.search);
  const publicUser = params.get("user");
  const [session, setSession] = useState(undefined);
  const [stickers, setStickers] = useState({});
  const [tab, setTab] = useState("album");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const APPLE_FONT = "-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase.from("stickers").select("sticker_id,owned,qty").eq("user_id", session.user.id)
      .then(({ data }) => {
        const m = {};
        data?.forEach(r => { m[r.sticker_id] = { owned: r.owned, qty: r.qty||0 }; });
        setStickers(m);
      });
    supabase.from("public_repeated").select("avatar_url").eq("user_id", session.user.id).single()
      .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
  }, [session]);

  const syncPublic = useCallback(async (updated) => {
    const ids = Object.entries(updated).filter(([,v])=>v.owned&&(v.qty||0)>0).map(([k])=>k);
    const un = session.user.user_metadata?.username || session.user.email.split("@")[0];
    await supabase.from("public_repeated").upsert({ user_id:session.user.id, username:un, repeated_ids:ids, updated_at:new Date().toISOString() }, { onConflict:"user_id" });
  }, [session]);

  const toggle = useCallback(async (id) => {
    const cur = stickers[id] || {};
    const next = { ...stickers };
    if (cur.owned) { delete next[id]; } else { next[id] = { owned:true, qty:0 }; }
    setStickers(next); setSaving(true);
    await supabase.from("stickers").upsert({ user_id:session.user.id, sticker_id:id, owned:!!next[id]?.owned, qty:0, updated_at:new Date().toISOString() }, { onConflict:"user_id,sticker_id" });
    await syncPublic(next); setSaving(false);
  }, [stickers, session, syncPublic]);

  const toggleRep = useCallback(async (id, delta) => {
    const cur = stickers[id] || {};
    if (!cur.owned) return;
    const newQty = Math.max(0, (cur.qty||0) + delta);
    const next = { ...stickers, [id]: { ...cur, qty: newQty } };
    setStickers(next); setSaving(true);
    await supabase.from("stickers").upsert({ user_id:session.user.id, sticker_id:id, owned:true, qty:newQty, updated_at:new Date().toISOString() }, { onConflict:"user_id,sticker_id" });
    await syncPublic(next); setSaving(false);
  }, [stickers, session, syncPublic]);

  const username = session?.user?.user_metadata?.username || session?.user?.email?.split("@")[0] || "";
  const email = session?.user?.email || "";
  const owned = Object.values(stickers).filter(s=>s.owned).length;
  const totalRep = Object.values(stickers).reduce((acc,s)=>acc+(s.qty||0),0);
  const pct = Math.round((owned/TOTAL)*100);

  async function handleShare() {
    const url = `${window.location.origin}/?user=${encodeURIComponent(username)}`;
    const text = "Minhas figurinhas repetidas da Copa 2026 — veja quais tenho para trocar!";
    if (navigator.share) { try { await navigator.share({title:"Copa 2026 — Figurinhas Repetidas",text,url}); } catch(e){} }
    else { navigator.clipboard.writeText(url); }
  }

  if (publicUser) return <PublicRepeatedPage username={publicUser}/>;
  if (session===undefined) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f2f2f7",color:"#8e8e93",fontSize:15,fontFamily:APPLE_FONT}}>Carregando...</div>;
  if (!session) return <AuthScreen onLogin={()=>{}}/>;

  const CupSVG = ({size=18,color="#fff"}) => (
    <svg viewBox="0 0 80 90" width={size} fill="none">
      <path d="M22 10 C22 10 20 26 22 34 C24 42 32 46 40 46 C48 46 56 42 58 34 C60 26 58 10 58 10 Z" fill={color} opacity="0.9"/>
      <path d="M22 16 C17 16 13 20 13 25 C13 30 17 34 22 33" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M58 16 C63 16 67 20 67 25 C67 30 63 34 58 33" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <rect x="36" y="46" width="8" height="14" rx="2" fill={color}/>
      <rect x="28" y="60" width="24" height="4" rx="2" fill={color}/>
      <polygon points="40,2 42,7.5 48,7.5 43.5,11 45.5,16.5 40,13 34.5,16.5 36.5,11 32,7.5 38,7.5" fill={color}/>
    </svg>
  );

  const NAV = [
    {id:"album",    icon:"album",  label:"Álbum"},
    {id:"summary",  icon:"chart",  label:"Resumo"},
    {id:"repeated", icon:"repeat", label:"Repetidas"},
    {id:"trade",    icon:"search", label:"Trocar"},
    {id:"profile",  icon:"user",   label:"Perfil"},
  ];

  const content = selectedTeam
    ? selectedTeam.isSpecial
      ? <SpecialScreen stickers={stickers} onToggle={toggle} onToggleRep={toggleRep} onBack={()=>setSelectedTeam(null)}/>
      : <TeamScreen team={selectedTeam} stickers={stickers} onToggle={toggle} onToggleRep={toggleRep} onBack={()=>setSelectedTeam(null)}/>
    : <>
        {tab==="album"   && <AlbumTab stickers={stickers} onSelectTeam={t=>setSelectedTeam(t)}/>}
        {tab==="summary"  && <StatsTab stickers={stickers}/>}
        {tab==="repeated" && <TrocarTab stickers={stickers} onToggleRep={toggleRep} onShare={handleShare}/>}
        {tab==="trade"    && <RankingTab myStickers={stickers} currentUsername={username}/>}
        {tab==="profile" && <PerfilTabReal username={username} email={email} avatarUrl={avatarUrl} onSignOut={()=>supabase.auth.signOut()} onAvatarChange={setAvatarUrl}/>}
      </>;

  return (
    <div style={{minHeight:"100vh",background:"#f2f2f7",fontFamily:APPLE_FONT}}>
      <style>{`
        *{box-sizing:border-box} body{margin:0;background:#f2f2f7}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#e0e0e0;border-radius:2px}
        button{font-family:${APPLE_FONT};transition:all .15s} button:active{opacity:.75;transform:scale(.97)}
        input{font-family:${APPLE_FONT}}
        .layout{display:flex;flex-direction:column;max-width:430px;margin:0 auto;min-height:100vh}
        .sidebar{display:none} .top-header{display:flex}
        .bottom-nav{display:flex;position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#fff;border-top:1px solid #e5e5ea;z-index:200}
        .main-content{flex:1;overflow-y:auto;padding-bottom:68px} .desktop-header{display:none}
        @media(min-width:768px){
          .layout{flex-direction:row;max-width:100%;min-height:100vh}
          .sidebar{display:flex;flex-direction:column;width:230px;height:100vh;background:#fff;border-right:1px solid #e5e5ea;position:sticky;top:0;padding:24px 0 0;flex-shrink:0;overflow:hidden}
          .top-header{display:none} .bottom-nav{display:none}
          .main-content{flex:1;overflow-y:auto;padding-bottom:0;max-width:860px}
          .desktop-header{display:flex;background:#fff;border-bottom:1px solid #e5e5ea;padding:14px 24px;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div style={{padding:"0 20px 20px",borderBottom:"1px solid #f2f2f7"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,background:"#111",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CupSVG size={20}/></div>
              <div><div style={{fontSize:15,fontWeight:600,color:"#111"}}>Copa 2026</div><div style={{fontSize:13,color:"#8e8e93"}}>Álbum</div></div>
            </div>
          </div>
          <div style={{padding:"14px 20px",borderBottom:"1px solid #f2f2f7"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,color:"#8e8e93"}}>Progresso</span><span style={{fontSize:13,fontWeight:600,color:"#111"}}>{pct}%</span></div>
            <Bar value={owned} total={TOTAL} height={3}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:13,color:"#8e8e93"}}>{owned} de {TOTAL}</span>
              {totalRep>0&&<span style={{fontSize:13,color:"#c9a84c",fontWeight:500}}>{totalRep} repetidas</span>}
            </div>
          </div>
          {saving&&<div style={{padding:"8px 20px",fontSize:13,color:"#8e8e93"}}>Salvando…</div>}
          <nav style={{padding:"12px 0",flex:1,overflowY:"auto",minHeight:0}}>
            {NAV.map(n=>{const active=tab===n.id&&!selectedTeam;return(
              <button key={n.id} onClick={()=>{setTab(n.id);setSelectedTeam(null)}}
                style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 20px",border:"none",background:active?"#f7f7f7":"transparent",cursor:"pointer",borderLeft:`3px solid ${active?"#111":"transparent"}`,color:active?"#111":"#8e8e93"}}>
                <Icon name={n.icon} size={18} color={active?"#111":"#c7c7cc"} sw={active?2:1.5}/>
                <span style={{fontSize:15,fontWeight:active?600:400}}>{n.label}</span>
                {n.id==="repeated"&&totalRep>0&&<span style={{marginLeft:"auto",fontSize:13,fontWeight:600,color:"#c9a84c"}}>{totalRep}</span>}
              </button>
            );})}
          </nav>
          <div style={{padding:"16px 20px",borderTop:"1px solid #f2f2f7",flexShrink:0,background:"#fff"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"1.5px solid #e5e5ea"}}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <span style={{fontSize:14,color:"#fff",fontWeight:600}}>{(username||"?")[0].toUpperCase()}</span>
                }
              </div>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{username}</div>
                <div style={{fontSize:12,color:"#8e8e93",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{email}</div>
              </div>
            </div>
            <button onClick={()=>supabase.auth.signOut()} style={{width:"100%",padding:"8px",background:"none",border:"1px solid #e5e5ea",borderRadius:8,color:"#8e8e93",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Icon name="logout" size={13} color="#8e8e93" sw={2}/> Sair
            </button>
          </div>
        </aside>

        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          <div className="top-header" style={{background:"#fff",borderBottom:"1px solid #e5e5ea",padding:"12px 16px",position:"sticky",top:0,zIndex:100,alignItems:"center",gap:12}}>
            {selectedTeam
              ? <button onClick={()=>setSelectedTeam(null)} style={{background:"none",border:"none",cursor:"pointer",padding:4,margin:-4}}><Icon name="back" size={20} color="#111" sw={2}/></button>
              : <div style={{width:32,height:32,background:"#111",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CupSVG/></div>
            }
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:17,color:"#111",fontWeight:600}}>{selectedTeam?selectedTeam.name:"Copa 2026"}</div>
              <div style={{fontSize:13,color:"#8e8e93",marginTop:1}}>{selectedTeam?"Figurinhas":"Álbum"}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:15,color:"#111",fontWeight:600}}>{pct}%</div>
              <div style={{fontSize:13,color:"#8e8e93",marginTop:2}}>{owned}/{TOTAL}</div>
            </div>
          </div>

          <div className="desktop-header">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {selectedTeam&&<button onClick={()=>setSelectedTeam(null)} style={{background:"none",border:"none",cursor:"pointer",padding:4,marginRight:4}}><Icon name="back" size={18} color="#111" sw={2}/></button>}
              <div>
                <div style={{fontSize:17,fontWeight:600,color:"#111"}}>{selectedTeam?selectedTeam.name:NAV.find(n=>n.id===tab)?.label}</div>
                <div style={{fontSize:13,color:"#8e8e93"}}>{selectedTeam?"Figurinhas":"Copa do Mundo 2026"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:16,fontSize:13,color:"#8e8e93",alignItems:"center"}}>
              {saving&&<span style={{fontSize:13,color:"#8e8e93"}}>Salvando…</span>}
              <span>{owned} figurinhas</span>
              {totalRep>0&&<span style={{color:"#c9a84c",fontWeight:500}}>{totalRep} repetidas</span>}
            </div>
          </div>

          <div className="main-content">{content}</div>

          <nav className="bottom-nav">
            {NAV.map(n=>{const active=tab===n.id&&!selectedTeam;return(
              <button key={n.id} onClick={()=>{setTab(n.id);setSelectedTeam(null)}}
                style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 4px 8px",border:"none",background:"transparent",cursor:"pointer",gap:3,position:"relative"}}>
                <Icon name={n.icon} size={22} color={active?"#111":"#c7c7cc"} sw={active?2:1.5}/>
                {n.id==="repeated"&&totalRep>0&&<div style={{position:"absolute",top:5,right:"calc(50% - 16px)",minWidth:16,height:16,padding:"0 4px",borderRadius:8,background:"#c9a84c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700}}>{totalRep>99?"99+":totalRep}</div>}
                <span style={{fontSize:11,fontWeight:active?600:400,color:active?"#111":"#8e8e93"}}>{n.label}</span>
              </button>
            );})}
          </nav>
        </div>
      </div>
    </div>
  );
}
