import { supabase } from "./supabaseClient";
import { useState, useEffect, useMemo, useCallback } from "react";

// ─── DADOS ────────────────────────────────────────────────────────────────────
const GROUPS = {
  A: [
    {name:"México",           code:"MEX", flag:"🇲🇽"},
    {name:"Coreia do Sul",    code:"KOR", flag:"🇰🇷"},
    {name:"África do Sul",    code:"RSA", flag:"🇿🇦"},
    {name:"Rep. Tcheca",      code:"CZE", flag:"🇨🇿"},
  ],
  B: [
    {name:"Canadá",           code:"CAN", flag:"🇨🇦"},
    {name:"Bósnia",           code:"BIH", flag:"🇧🇦"},
    {name:"Qatar",            code:"QAT", flag:"🇶🇦"},
    {name:"Suíça",            code:"SUI", flag:"🇨🇭"},
  ],
  C: [
    {name:"Brasil",           code:"BRA", flag:"🇧🇷"},
    {name:"Marrocos",         code:"MAR", flag:"🇲🇦"},
    {name:"Haiti",            code:"HAI", flag:"🇭🇹"},
    {name:"Escócia",          code:"SCO", flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿"},
  ],
  D: [
    {name:"Estados Unidos",   code:"USA", flag:"🇺🇸"},
    {name:"Paraguai",         code:"PAR", flag:"🇵🇾"},
    {name:"Austrália",        code:"AUS", flag:"🇦🇺"},
    {name:"Turquia",          code:"TUR", flag:"🇹🇷"},
  ],
  E: [
    {name:"Alemanha",         code:"GER", flag:"🇩🇪"},
    {name:"Curaçao",          code:"CUW", flag:"🇨🇼"},
    {name:"Costa do Marfim",  code:"CIV", flag:"🇨🇮"},
    {name:"Equador",          code:"ECU", flag:"🇪🇨"},
  ],
  F: [
    {name:"Holanda",          code:"NED", flag:"🇳🇱"},
    {name:"Japão",            code:"JPN", flag:"🇯🇵"},
    {name:"Suécia",           code:"SWE", flag:"🇸🇪"},
    {name:"Tunísia",          code:"TUN", flag:"🇹🇳"},
  ],
  G: [
    {name:"Bélgica",          code:"BEL", flag:"🇧🇪"},
    {name:"Egito",            code:"EGY", flag:"🇪🇬"},
    {name:"Irã",              code:"IRN", flag:"🇮🇷"},
    {name:"Nova Zelândia",    code:"NZL", flag:"🇳🇿"},
  ],
  H: [
    {name:"Espanha",          code:"ESP", flag:"🇪🇸"},
    {name:"Cabo Verde",       code:"CPV", flag:"🇨🇻"},
    {name:"Arábia Saudita",   code:"KSA", flag:"🇸🇦"},
    {name:"Uruguai",          code:"URU", flag:"🇺🇾"},
  ],
  I: [
    {name:"França",           code:"FRA", flag:"🇫🇷"},
    {name:"Senegal",          code:"SEN", flag:"🇸🇳"},
    {name:"Iraque",           code:"IRQ", flag:"🇮🇶"},
    {name:"Noruega",          code:"NOR", flag:"🇳🇴"},
  ],
  J: [
    {name:"Argentina",        code:"ARG", flag:"🇦🇷"},
    {name:"Argélia",          code:"ALG", flag:"🇩🇿"},
    {name:"Áustria",          code:"AUT", flag:"🇦🇹"},
    {name:"Jordânia",         code:"JOR", flag:"🇯🇴"},
  ],
  K: [
    {name:"Portugal",         code:"POR", flag:"🇵🇹"},
    {name:"RD Congo",         code:"COD", flag:"🇨🇩"},
    {name:"Uzbequistão",      code:"UZB", flag:"🇺🇿"},
    {name:"Colômbia",         code:"COL", flag:"🇨🇴"},
  ],
  L: [
    {name:"Inglaterra",       code:"ENG", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    {name:"Croácia",          code:"CRO", flag:"🇭🇷"},
    {name:"Gana",             code:"GHA", flag:"🇬🇭"},
    {name:"Panamá",           code:"PAN", flag:"🇵🇦"},
  ],
};

// Gera todos os IDs: cada seleção tem 20 figurinhas (1 escudo + 19 jogadores)
function allStickers() {
  const ids = {};
  // Especiais FWC 1-6
  for (let i = 1; i <= 6; i++) ids[`FWC ${i}`] = { group:"FWC", team:"Especial", code:"FWC", n:i };
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

// Demo data
const DEMO = {};
["BRA 1","BRA 3","BRA 5","BRA 7","ARG 1","ARG 2","ARG 4","FRA 1","FRA 2","GER 1",
 "TUR 1","TUR 5","TUR 14","TUR 18","SCO 11","URU 3","MEX 5","MEX 9","MEX 14",
 "FWC 1","FWC 2","POR 1","POR 3","ESP 1","ITA 1"].forEach(id => {
  DEMO[id] = { owned: true, repeated: ["TUR 14","BRA 5","ARG 4"].includes(id) };
});

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=18, color="#111", sw=1.5 }) => {
  const d = {
    back:   <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
    album:  <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
    chart:  <><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></>,
    repeat: <><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>,
    user:   <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    check:  <path d="M20 6L9 17l-5-5"/>,
    copy:   <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    down:   <path d="m6 9 6 6 6-6"/>,
    right:  <path d="m9 18 6-6-6-6"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d[name]}
    </svg>
  );
};

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
const Bar = ({ value, total, height=2 }) => {
  const pct = total ? Math.round((value/total)*100) : 0;
  return (
    <div style={{height, background:"#ececec", borderRadius:height, overflow:"hidden", flex:1}}>
      <div style={{height:"100%", width:`${pct}%`, background:"#111", borderRadius:height, transition:"width .4s"}}/>
    </div>
  );
};

// ─── TELA: GRID DE FIGURINHAS DE UMA SELEÇÃO ─────────────────────────────────
const TeamScreen = ({ team, stickers, onToggle, onToggleRep, onBack }) => {
  const ids = Array.from({length:20}, (_,i) => `${team.code} ${i+1}`);
  const owned = ids.filter(id => stickers[id]?.owned).length;
  const repeated = ids.filter(id => stickers[id]?.repeated).length;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Header */}
      <div style={{background:"#fff",borderBottom:"1px solid #ebebeb",padding:"12px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:28}}>{team.flag}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:"#111",letterSpacing:0.3}}>{team.name}</div>
            <div style={{fontSize:11,color:"#aaa",marginTop:1}}>
              {owned} de 20 · {repeated} repetida{repeated!==1?"s":""}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
          <Bar value={owned} total={20} height={3}/>
          <span style={{fontSize:11,fontWeight:700,color:"#111",flexShrink:0}}>{Math.round((owned/20)*100)}%</span>
        </div>
        <button onClick={()=>ids.forEach(id=>{if(!stickers[id]?.owned) onToggle(id)})}
          style={{marginTop:10,width:"100%",padding:"9px",background:"none",
            border:"1px solid #e0e0e0",borderRadius:6,fontSize:11,fontWeight:600,
            color:"#888",cursor:"pointer",letterSpacing:0.5}}>
          Marcar todas
        </button>
      </div>

      {/* Grid */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 24px"}}>
        <div style={{fontSize:9,color:"#bbb",letterSpacing:1.5,fontWeight:700,marginBottom:12}}>
          TOQUE PARA MARCAR QUE VOCÊ TEM
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {ids.map(id => {
            const isOwned = !!stickers[id]?.owned;
            const isRep   = !!stickers[id]?.repeated;
            return (
              <div key={id} style={{display:"flex",flexDirection:"column",gap:0}}>
                {/* Botão principal — marcar que tem */}
                <button onClick={()=>onToggle(id)}
                  style={{padding:"16px 6px",borderRadius: isOwned ? "8px 8px 0 0" : "8px",
                    border:"1px solid", borderBottom: isOwned ? "none" : "1px solid",
                    borderColor: isOwned ? "#111" : "#e0e0e0",
                    background: isOwned ? "#111" : "#fff",
                    color: isOwned ? "#fff" : "#aaa",
                    fontSize:11,fontWeight:700,letterSpacing:1,
                    cursor:"pointer",transition:"all .15s",
                    fontFamily:"Georgia,serif"}}>
                  {id}
                </button>
                {/* Botão repetida — só aparece quando tem */}
                {isOwned && (
                  <button onClick={()=>onToggleRep(id)}
                    style={{padding:"6px",borderRadius:"0 0 8px 8px",
                      border:"1px solid #111",borderTop:"1px solid #333",
                      background: isRep ? "#333" : "#1a1a1a",
                      color: isRep ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize:9,fontWeight:700,letterSpacing:0.8,
                      cursor:"pointer",transition:"all .15s",
                      fontFamily:"Georgia,serif"}}>
                    {isRep ? "↺ repetida" : "repetida?"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── TELA: LISTA DE GRUPOS E SELEÇÕES ────────────────────────────────────────
const AlbumTab = ({ stickers, onSelectTeam }) => {
  const [openGroups, setOpenGroups] = useState({"A":true,"B":true});
  const [search, setSearch] = useState("");

  const toggleGroup = g => setOpenGroups(prev => ({...prev,[g]:!prev[g]}));

  const ownedTotal = Object.values(stickers).filter(s=>s.owned).length;
  const pct = Math.round((ownedTotal/TOTAL)*100);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return GROUPS;
    const q = search.toLowerCase();
    const result = {};
    Object.entries(GROUPS).forEach(([g, teams]) => {
      const filtered = teams.filter(t => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
      if (filtered.length) result[g] = filtered;
    });
    return result;
  }, [search]);

  return (
    <div style={{padding:"0 0 20px"}}>
      {/* Busca */}
      <div style={{padding:"12px 14px 0"}}>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",opacity:0.3}}>
            <Icon name="search" size={14} color="#111"/>
          </div>
          <input style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,
            padding:"10px 12px 10px 32px",color:"#111",fontFamily:"Georgia,serif",
            fontSize:13,outline:"none",width:"100%",letterSpacing:0.3}}
            placeholder="Buscar seleção..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Especiais */}
      {!search && (
        <div style={{margin:"12px 14px 0"}}>
          <button onClick={()=>onSelectTeam({name:"Especiais",code:"FWC",flag:"★"}, "FWC")}
            style={{width:"100%",background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,
              padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,background:"#111",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg viewBox="0 0 80 90" width="20" fill="none">
                  <path d="M22 10 C22 10 20 26 22 34 C24 42 32 46 40 46 C48 46 56 42 58 34 C60 26 58 10 58 10 Z" fill="#fff" opacity="0.9"/>
                  <path d="M22 16 C17 16 13 20 13 25 C13 30 17 34 22 33" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                  <path d="M58 16 C63 16 67 20 67 25 C67 30 63 34 58 33" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                  <rect x="36" y="46" width="8" height="14" rx="2" fill="#fff"/>
                  <rect x="28" y="60" width="24" height="4" rx="2" fill="#fff"/>
                  <polygon points="40,2 42,7.5 48,7.5 43.5,11 45.5,16.5 40,13 34.5,16.5 36.5,11 32,7.5 38,7.5" fill="#fff"/>
                </svg>
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#111"}}>Especiais</div>
                <div style={{fontSize:11,color:"#aaa",marginTop:1}}>
                  {Object.keys(stickers).filter(id=>id.startsWith("FWC")&&stickers[id].owned).length} de 6
                </div>
              </div>
            </div>
            <Icon name="right" size={16} color="#ccc" sw={2}/>
          </button>
        </div>
      )}

      {/* Grupos */}
      <div style={{marginTop:12}}>
        {Object.entries(filteredGroups).map(([g, teams]) => {
          const groupIds = teams.flatMap(t => Array.from({length:20},(_,i)=>`${t.code} ${i+1}`));
          const groupOwned = groupIds.filter(id=>stickers[id]?.owned).length;
          const groupTotal = groupIds.length;
          const isOpen = openGroups[g] !== false;

          return (
            <div key={g} style={{margin:"0 14px 10px"}}>
              {/* Header do grupo */}
              <button onClick={()=>toggleGroup(g)}
                style={{width:"100%",background:"#fff",border:"1px solid #e8e8e8",
                  borderRadius:isOpen?"8px 8px 0 0":"8px",
                  padding:"12px 14px",display:"flex",alignItems:"center",
                  justifyContent:"space-between",cursor:"pointer",borderBottom:isOpen?"1px solid #f0f0f0":"1px solid #e8e8e8"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#111",letterSpacing:1,
                    width:28,height:28,background:"#f4f4f4",borderRadius:6,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {g}
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#111"}}>Grupo {g}</div>
                    <div style={{fontSize:10,color:"#aaa"}}>{groupOwned} de {groupTotal}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:60}}>
                    <Bar value={groupOwned} total={groupTotal} height={2}/>
                  </div>
                  <Icon name={isOpen?"down":"right"} size={14} color="#ccc" sw={2}/>
                </div>
              </button>

              {/* Times do grupo */}
              {isOpen && (
                <div style={{background:"#fff",border:"1px solid #e8e8e8",borderTop:"none",
                  borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
                  {teams.map((team, idx) => {
                    const ids = Array.from({length:20},(_,i)=>`${team.code} ${i+1}`);
                    const owned = ids.filter(id=>stickers[id]?.owned).length;
                    return (
                      <button key={team.code} onClick={()=>onSelectTeam(team, g)}
                        style={{width:"100%",background:"#fff",border:"none",
                          borderTop: idx > 0 ? "1px solid #f5f5f5" : "none",
                          padding:"12px 14px",display:"flex",alignItems:"center",
                          cursor:"pointer",gap:12}}>
                        <span style={{fontSize:22,flexShrink:0}}>{team.flag}</span>
                        <div style={{flex:1,textAlign:"left"}}>
                          <div style={{fontSize:12,fontWeight:600,color:"#111"}}>{team.name} <span style={{color:"#bbb",fontWeight:400,fontSize:11}}>({team.code})</span></div>
                          <div style={{fontSize:10,color:"#aaa",marginTop:1}}>{owned} de 20</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                          <div style={{width:50}}>
                            <Bar value={owned} total={20} height={2}/>
                          </div>
                          <Icon name="right" size={14} color="#ddd" sw={2}/>
                        </div>
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
  const rep   = Object.values(stickers).filter(s=>s.owned&&s.repeated).length;
  const pct   = Math.round((owned/TOTAL)*100);

  return (
    <div style={{padding:"12px 14px 20px"}}>
      {/* Números principais */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        {[{l:"Total",v:TOTAL},{l:"Tenho",v:owned},{l:"Faltam",v:TOTAL-owned},{l:"Repetidas",v:rep}].map(s=>(
          <div key={s.l} style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:26,fontWeight:800,color:"#111",fontFamily:"Georgia,serif"}}>{s.v}</div>
            <div style={{fontSize:10,color:"#aaa",marginTop:4,letterSpacing:0.5}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Progresso */}
      <div style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,padding:14,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,color:"#111",letterSpacing:0.5}}>Progresso geral</span>
          <span style={{fontSize:20,fontWeight:800,color:"#111",fontFamily:"Georgia,serif"}}>{pct}%</span>
        </div>
        <Bar value={owned} total={TOTAL} height={3}/>
        <div style={{fontSize:10,color:"#bbb",marginTop:8}}>{owned} de {TOTAL} figurinhas</div>
      </div>

      {/* Por grupo */}
      <div style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,padding:14}}>
        <div style={{fontSize:11,fontWeight:700,color:"#111",marginBottom:12,letterSpacing:0.5}}>Por grupo</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {Object.entries(GROUPS).map(([g, teams])=>{
            const ids = teams.flatMap(t=>Array.from({length:20},(_,i)=>`${t.code} ${i+1}`));
            const o = ids.filter(id=>stickers[id]?.owned).length;
            const p = Math.round((o/ids.length)*100);
            return (
              <div key={g}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11}}>
                  <span style={{fontWeight:600,color:"#333"}}>Grupo {g}</span>
                  <span style={{color:"#aaa"}}>{o}/{ids.length} <b style={{color:"#111"}}>{p}%</b></span>
                </div>
                <Bar value={o} total={ids.length} height={2}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── ABA TROCAR ───────────────────────────────────────────────────────────────
const TrocarTab = ({ stickers, onToggleRep }) => {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/?user=jrsabel`;
    const text = `Minhas figurinhas repetidas da Copa 2026 — veja quais tenho para trocar!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Copa 2026 — Figurinhas Repetidas", text, url });
      } catch (e) {}
    } else {
      // Fallback: copia o link
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  }
  const rep = Object.entries(stickers)
    .filter(([,v])=>v.owned&&v.repeated)
    .map(([id])=>({id, ...ALL[id]}))
    .filter(Boolean);

  const byGroup = useMemo(()=>{
    const m={};
    rep.forEach(s=>{if(!m[s.group])m[s.group]=[];m[s.group].push(s)});
    return m;
  },[rep]);

  return (
    <div style={{padding:"12px 14px 20px"}}>
      <div style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"#111",marginBottom:3,letterSpacing:0.3}}>Página pública de trocas</div>
        <div style={{fontSize:11,color:"#aaa",marginBottom:12}}>Compartilhe para trocar figurinhas</div>
        <div style={{background:"#f7f7f7",borderRadius:6,padding:"9px 12px",fontSize:10,
          color:"#888",marginBottom:12,fontFamily:"monospace",wordBreak:"break-all"}}>
          albumcopa26.vercel.app/?user=jrsabel
        </div>
        <button onClick={handleShare}
          style={{width:"100%",padding:"11px",background:copied?"#f7f7f7":"#111",
            border:`1px solid ${copied?"#e0e0e0":"#111"}`,borderRadius:6,
            color:copied?"#111":"#fff",fontSize:12,fontWeight:600,
            fontFamily:"Georgia,serif",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:0.3}}>
          <Icon name={copied?"check":"copy"} size={13} color={copied?"#111":"#fff"} sw={2}/>
          {copied?"Link copiado!":"Compartilhar minhas repetidas"}
        </button>
      </div>

      <div style={{fontSize:10,fontWeight:700,color:"#aaa",letterSpacing:1.5,marginBottom:10}}>
        SUAS REPETIDAS ({rep.length})
      </div>

      {rep.length===0
        ? <div style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,
            padding:28,textAlign:"center",color:"#bbb",fontSize:12,fontFamily:"Georgia,serif"}}>
            Nenhuma repetida ainda
          </div>
        : Object.entries(byGroup).map(([g, items])=>(
          <div key={g} style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,padding:14,marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:"#aaa",letterSpacing:1,marginBottom:10}}>
              {g==="FWC"?"ESPECIAIS":`GRUPO ${g}`}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {items.map(s=>(
                <div key={s.id} style={{display:"flex",flexDirection:"column",width:"calc(33.33% - 6px)"}}>
                  {/* Chip da figurinha */}
                  <div style={{display:"flex",alignItems:"center",gap:6,
                    padding:"10px 8px",borderRadius:"7px 7px 0 0",
                    border:"1px solid #111",borderBottom:"none",
                    background:"#111"}}>
                    <span style={{fontSize:15}}>{s.flag}</span>
                    <span style={{fontSize:10,fontWeight:700,fontFamily:"Georgia,serif",
                      color:"#fff",letterSpacing:0.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.id}</span>
                  </div>
                  {/* Botão desmarcar */}
                  <button onClick={()=>onToggleRep(s.id)}
                    style={{padding:"6px 4px",borderRadius:"0 0 7px 7px",
                      border:"1px solid #111",borderTop:"1px solid #2a2a2a",
                      background:"#1a1a1a",color:"rgba(255,255,255,0.45)",
                      fontSize:9,fontWeight:700,letterSpacing:0.5,
                      cursor:"pointer",fontFamily:"Georgia,serif",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <Icon name="check" size={9} color="rgba(255,255,255,0.3)" sw={2.5}/>
                    desmarcar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      }
    </div>
  );
};

// ─── ABA PERFIL ───────────────────────────────────────────────────────────────
const PerfilTab = ({ onSignOut }) => (
  <div style={{padding:"12px 14px 20px"}}>
    <div style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,
      padding:24,textAlign:"center",marginBottom:10}}>
      <div style={{width:56,height:56,background:"#111",borderRadius:"50%",
        display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
        <Icon name="user" size={22} color="#fff" sw={1.5}/>
      </div>
      <div style={{fontSize:16,fontWeight:700,color:"#111",fontFamily:"Georgia,serif"}}>jrsabel</div>
      <div style={{fontSize:11,color:"#aaa",marginTop:3}}>juniorsabel@gmail.com</div>
    </div>
    <button style={{width:"100%",padding:"13px",background:"#fff",
      border:"1px solid #e8e8e8",borderRadius:8,color:"#aaa",
      fontSize:11,fontWeight:600,fontFamily:"Georgia,serif",
      cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:0.5}}>
      <Icon name="logout" size={13} color="#aaa" sw={2}/>
      Sair da conta
    </button>
  </div>
);


// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle() {
    setError(""); setInfo("");
    if (!email.trim() || !password.trim()) { setError("Preencha todos os campos."); return; }
    if (mode === "register" && !username.trim()) { setError("Escolha um nome de usuário."); return; }
    setLoading(true);
    if (mode === "login") {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError("E-mail ou senha incorretos."); setLoading(false); return; }
      onLogin(data.user);
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user && !data.session) setInfo("Verifique seu e-mail para confirmar.");
      else if (data.user) onLogin(data.user);
    }
    setLoading(false);
  }

  const inp = { width:"100%", padding:"11px", border:"1px solid #e8e8e8", borderRadius:7, fontSize:14, outline:"none", color:"#111", fontFamily:"Georgia,serif" };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f4f4f4",padding:"24px 20px"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:44,height:44,background:"#111",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <svg viewBox="0 0 80 90" width="24" fill="none">
              <path d="M22 10 C22 10 20 26 22 34 C24 42 32 46 40 46 C48 46 56 42 58 34 C60 26 58 10 58 10 Z" fill="#fff" opacity="0.9"/>
              <path d="M22 16 C17 16 13 20 13 25 C13 30 17 34 22 33" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <path d="M58 16 C63 16 67 20 67 25 C67 30 63 34 58 33" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <rect x="36" y="46" width="8" height="14" rx="2" fill="#fff"/>
              <rect x="28" y="60" width="24" height="4" rx="2" fill="#fff"/>
              <polygon points="40,2 42,7.5 48,7.5 43.5,11 45.5,16.5 40,13 34.5,16.5 36.5,11 32,7.5 38,7.5" fill="#fff"/>
            </svg>
          </div>
          <div style={{fontSize:18,fontWeight:700,color:"#111",fontFamily:"Georgia,serif"}}>Copa 2026</div>
          <div style={{fontSize:11,color:"#aaa",marginTop:2,letterSpacing:1}}>ÁLBUM DE FIGURINHAS</div>
        </div>
        <div style={{background:"#fff",borderRadius:10,padding:20,border:"1px solid #e8e8e8"}}>
          <div style={{display:"flex",borderBottom:"1px solid #e8e8e8",marginBottom:20}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");setInfo("");}}
                style={{flex:1,padding:"10px",border:"none",background:"transparent",color:mode===m?"#111":"#aaa",fontSize:13,fontWeight:mode===m?700:400,cursor:"pointer",borderBottom:`2px solid ${mode===m?"#111":"transparent"}`,marginBottom:-1,fontFamily:"Georgia,serif"}}>
                {m==="login"?"Entrar":"Cadastrar"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {mode==="register"&&<div><label style={{fontSize:11,color:"#aaa",display:"block",marginBottom:5,letterSpacing:0.5}}>USUÁRIO</label><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="ex: joaosilva" style={inp}/></div>}
            <div><label style={{fontSize:11,color:"#aaa",display:"block",marginBottom:5,letterSpacing:0.5}}>E-MAIL</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" style={inp}/></div>
            <div><label style={{fontSize:11,color:"#aaa",display:"block",marginBottom:5,letterSpacing:0.5}}>SENHA</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="mínimo 6 caracteres" onKeyDown={e=>e.key==="Enter"&&handle()} style={inp}/></div>
            {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#dc2626"}}>{error}</div>}
            {info&&<div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:7,padding:"9px 12px",fontSize:12,color:"#2563eb"}}>{info}</div>}
            <button onClick={handle} disabled={loading} style={{padding:"13px",background:"#111",border:"none",borderRadius:7,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:0.5,fontFamily:"Georgia,serif"}}>
              {loading?"Carregando...":mode==="login"?"Entrar":"Criar conta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PÚBLICA ───────────────────────────────────────────────────────────
function PublicRepeatedPage({ username }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    supabase.from("public_repeated").select("repeated_ids,updated_at").eq("username", username).single()
      .then(({ data }) => {
        if (data) { setRows(data.repeated_ids||[]); setUpdatedAt(new Date(data.updated_at).toLocaleString("pt-BR")); }
        setLoading(false);
      });
  }, [username]);

  const rep = useMemo(() => rows.map(id=>({id,...ALL[id]})).filter(r=>r.group), [rows]);
  const byGroup = useMemo(() => { const m={}; rep.forEach(s=>{if(!m[s.group])m[s.group]=[];m[s.group].push(s)}); return m; }, [rep]);

  return (
    <div style={{maxWidth:700,margin:"0 auto",minHeight:"100vh",background:"#f4f4f4",fontFamily:"Georgia,serif"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e8e8e8",padding:"14px 20px",position:"sticky",top:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111"}}>Repetidas de {username}</div>
            {updatedAt&&<div style={{fontSize:10,color:"#bbb",marginTop:2}}>Atualizado em {updatedAt}</div>}
          </div>
          <a href="/" style={{fontSize:11,color:"#aaa",textDecoration:"none",fontFamily:"Georgia,serif"}}>← Meu álbum</a>
        </div>
      </div>
      <div style={{padding:"16px 20px 32px"}}>
        {loading ? <div style={{textAlign:"center",padding:40,color:"#bbb",fontSize:13}}>Carregando...</div>
        : rep.length===0 ? <div style={{textAlign:"center",padding:40,color:"#bbb",fontSize:13}}>Nenhuma repetida ainda</div>
        : Object.entries(byGroup).map(([g,items])=>(
          <div key={g} style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,padding:14,marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:"#aaa",letterSpacing:1,marginBottom:10}}>{g==="FWC"?"ESPECIAIS":`GRUPO ${g}`}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {items.map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:6,border:"1px solid #e8e8e8",background:"#f7f7f7"}}>
                  <span style={{fontSize:14}}>{s.flag}</span>
                  <span style={{fontSize:10,fontWeight:700,color:"#111",letterSpacing:0.5}}>{s.id}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase.from("stickers").select("sticker_id,owned,repeated").eq("user_id", session.user.id)
      .then(({ data }) => {
        const m = {};
        data?.forEach(r => { m[r.sticker_id] = { owned: r.owned, repeated: r.repeated }; });
        setStickers(m);
      });
  }, [session]);

  const syncPublic = useCallback(async (updated) => {
    const ids = Object.entries(updated).filter(([,v])=>v.owned&&v.repeated).map(([k])=>k);
    const un = session.user.user_metadata?.username || session.user.email.split("@")[0];
    await supabase.from("public_repeated").upsert({ user_id:session.user.id, username:un, repeated_ids:ids, updated_at:new Date().toISOString() }, { onConflict:"user_id" });
  }, [session]);

  const toggle = useCallback(async (id) => {
    const cur = stickers[id] || {};
    const next = { ...stickers };
    if (cur.owned) { delete next[id]; } else { next[id] = { owned:true, repeated:false }; }
    setStickers(next); setSaving(true);
    await supabase.from("stickers").upsert({ user_id:session.user.id, sticker_id:id, owned:!!next[id]?.owned, repeated:false, updated_at:new Date().toISOString() }, { onConflict:"user_id,sticker_id" });
    await syncPublic(next); setSaving(false);
  }, [stickers, session, syncPublic]);

  const toggleRep = useCallback(async (id) => {
    const cur = stickers[id] || {};
    if (!cur.owned) return;
    const next = { ...stickers, [id]: { owned:true, repeated:!cur.repeated } };
    setStickers(next); setSaving(true);
    await supabase.from("stickers").upsert({ user_id:session.user.id, sticker_id:id, owned:true, repeated:!cur.repeated, updated_at:new Date().toISOString() }, { onConflict:"user_id,sticker_id" });
    await syncPublic(next); setSaving(false);
  }, [stickers, session, syncPublic]);

  const username = session?.user?.user_metadata?.username || session?.user?.email?.split("@")[0] || "";
  const email = session?.user?.email || "";
  const owned = Object.values(stickers).filter(s=>s.owned).length;
  const pct = Math.round((owned/TOTAL)*100);

  if (publicUser) return <PublicRepeatedPage username={publicUser}/>;
  if (session === undefined) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f4f4f4",color:"#aaa",fontSize:13,fontFamily:"Georgia,serif"}}>Carregando...</div>;
  if (!session) return <AuthScreen onLogin={()=>{}} />;

  const NAV = [{id:"album",icon:"album",label:"Álbum"},{id:"stats",icon:"chart",label:"Stats"},{id:"share",icon:"repeat",label:"Trocar"},{id:"profile",icon:"user",label:"Perfil"}];

  const CupSVG = ({size=18}) => (
    <svg viewBox="0 0 80 90" width={size} fill="none">
      <path d="M22 10 C22 10 20 26 22 34 C24 42 32 46 40 46 C48 46 56 42 58 34 C60 26 58 10 58 10 Z" fill="#fff" opacity="0.9"/>
      <path d="M22 16 C17 16 13 20 13 25 C13 30 17 34 22 33" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M58 16 C63 16 67 20 67 25 C67 30 63 34 58 33" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <rect x="36" y="46" width="8" height="14" rx="2" fill="#fff"/>
      <rect x="28" y="60" width="24" height="4" rx="2" fill="#fff"/>
      <polygon points="40,2 42,7.5 48,7.5 43.5,11 45.5,16.5 40,13 34.5,16.5 36.5,11 32,7.5 38,7.5" fill="#fff"/>
    </svg>
  );

    }

  const content = selectedTeam
    ? <TeamScreen team={selectedTeam} stickers={stickers} onToggle={toggle} onToggleRep={toggleRep} onBack={()=>setSelectedTeam(null)}/>
    : <>
        {tab==="album"   && <AlbumTab stickers={stickers} onSelectTeam={t=>setSelectedTeam(t)}/>}
        {tab==="stats"   && <StatsTab stickers={stickers}/>}
        {tab==="share"   && <TrocarTab stickers={stickers} onToggleRep={toggleRep}/>}
        {tab==="profile" && <PerfilTab username={username} email={email} onSignOut={()=>supabase.auth.signOut()}/>}
      </>;

  return (
    <div style={{minHeight:"100vh",background:"#f4f4f4",fontFamily:"Georgia,serif"}}>
      <style>{`
        *{box-sizing:border-box} body{margin:0;background:#f4f4f4}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#e0e0e0;border-radius:2px}
        button{font-family:Georgia,serif;transition:all .15s} button:active{opacity:.75;transform:scale(.97)}
        input{font-family:Georgia,serif}
        .layout{display:flex;flex-direction:column;max-width:430px;margin:0 auto;min-height:100vh}
        .sidebar{display:none}
        .top-header{display:flex}
        .bottom-nav{display:flex;position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#fff;border-top:1px solid #e8e8e8;z-index:200}
        .main-content{flex:1;overflow-y:auto;padding-bottom:68px}
        .desktop-header{display:none}
        @media(min-width:768px){
          .layout{flex-direction:row;max-width:100%;min-height:100vh}
          .sidebar{display:flex;flex-direction:column;width:220px;min-height:100vh;background:#fff;border-right:1px solid #e8e8e8;position:sticky;top:0;padding:24px 0;flex-shrink:0}
          .top-header{display:none}
          .bottom-nav{display:none}
          .main-content{flex:1;overflow-y:auto;padding-bottom:0;max-width:820px}
          .desktop-header{display:flex;background:#fff;border-bottom:1px solid #e8e8e8;padding:14px 24px;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
        }
      `}</style>

      <div className="layout">
        {/* Sidebar desktop */}
        <aside className="sidebar">
          <div style={{padding:"0 20px 24px",borderBottom:"1px solid #f0f0f0"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,background:"#111",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CupSVG size={20}/></div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#111",letterSpacing:0.3}}>Copa 2026</div>
                <div style={{fontSize:9,color:"#bbb",letterSpacing:1.5}}>ÁLBUM DE FIGURINHAS</div>
              </div>
            </div>
          </div>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #f0f0f0"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,color:"#aaa"}}>Progresso</span>
              <span style={{fontSize:11,fontWeight:700,color:"#111"}}>{pct}%</span>
            </div>
            <Bar value={owned} total={TOTAL} height={3}/>
            <div style={{fontSize:10,color:"#bbb",marginTop:5}}>{owned} de {TOTAL}</div>
          </div>
          {saving && <div style={{padding:"8px 20px",fontSize:10,color:"#bbb"}}>Salvando…</div>}
          <nav style={{padding:"12px 0",flex:1}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>{setTab(n.id);setSelectedTeam(null)}}
                style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 20px",border:"none",background:tab===n.id&&!selectedTeam?"#f7f7f7":"transparent",cursor:"pointer",borderLeft:`3px solid ${tab===n.id&&!selectedTeam?"#111":"transparent"}`,color:tab===n.id&&!selectedTeam?"#111":"#aaa"}}>
                <Icon name={n.icon} size={16} color={tab===n.id&&!selectedTeam?"#111":"#ccc"} sw={tab===n.id&&!selectedTeam?2:1.5}/>
                <span style={{fontSize:13,fontWeight:tab===n.id&&!selectedTeam?700:400,letterSpacing:0.3}}>{n.label}</span>
              </button>
            ))}
          </nav>
          <div style={{padding:"16px 20px",borderTop:"1px solid #f0f0f0"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#111"}}>{username}</div>
            <div style={{fontSize:10,color:"#aaa",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{email}</div>
            <button onClick={()=>supabase.auth.signOut()} style={{marginTop:10,width:"100%",padding:"8px",background:"none",border:"1px solid #e8e8e8",borderRadius:6,color:"#aaa",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Icon name="logout" size={12} color="#aaa" sw={2}/> Sair
            </button>
          </div>
        </aside>

        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          {/* Header mobile */}
          <div className="top-header" style={{background:"#fff",borderBottom:"1px solid #e8e8e8",padding:"12px 16px",position:"sticky",top:0,zIndex:100,alignItems:"center",gap:12}}>
            {selectedTeam
              ? <button onClick={()=>setSelectedTeam(null)} style={{background:"none",border:"none",cursor:"pointer",padding:4,margin:-4}}><Icon name="back" size={18} color="#111" sw={2}/></button>
              : <div style={{width:32,height:32,background:"#111",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CupSVG/></div>
            }
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,color:"#111",fontWeight:700,letterSpacing:0.3}}>{selectedTeam?selectedTeam.name:"Copa 2026"}</div>
              <div style={{fontSize:9,color:"#bbb",letterSpacing:1.5,marginTop:1}}>{selectedTeam?"FIGURINHAS":"ÁLBUM DE FIGURINHAS"}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:12,color:"#111",fontWeight:700}}>{pct}%</div>
              <div style={{width:70,height:2,background:"#eee",borderRadius:2,marginTop:4}}><div style={{height:"100%",width:`${pct}%`,background:"#111",borderRadius:2,transition:"width .4s"}}/></div>
              <div style={{fontSize:9,color:"#bbb",marginTop:3}}>{owned}/{TOTAL}</div>
            </div>
          </div>

          {/* Header desktop */}
          <div className="desktop-header">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {selectedTeam&&<button onClick={()=>setSelectedTeam(null)} style={{background:"none",border:"none",cursor:"pointer",padding:4,marginRight:4}}><Icon name="back" size={16} color="#111" sw={2}/></button>}
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"#111"}}>{selectedTeam?selectedTeam.name:NAV.find(n=>n.id===tab)?.label}</div>
                <div style={{fontSize:10,color:"#bbb",letterSpacing:1}}>{selectedTeam?"FIGURINHAS":"COPA DO MUNDO 2026"}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {saving&&<span style={{fontSize:10,color:"#bbb"}}>Salvando…</span>}
              <div style={{fontSize:12,color:"#aaa"}}>{owned} figurinhas · {TOTAL-owned} faltam</div>
            </div>
          </div>

          <div className="main-content">{content}</div>

          {/* Bottom nav mobile */}
          <nav className="bottom-nav">
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>{setTab(n.id);setSelectedTeam(null)}}
                style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 4px 8px",border:"none",background:"transparent",cursor:"pointer",gap:3,borderTop:`2px solid ${tab===n.id&&!selectedTeam?"#111":"transparent"}`,marginTop:-1}}>
                <Icon name={n.icon} size={17} color={tab===n.id&&!selectedTeam?"#111":"#ccc"} sw={tab===n.id&&!selectedTeam?2:1.5}/>
                <span style={{fontSize:9,fontWeight:tab===n.id&&!selectedTeam?700:400,color:tab===n.id&&!selectedTeam?"#111":"#ccc",letterSpacing:0.8}}>{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
