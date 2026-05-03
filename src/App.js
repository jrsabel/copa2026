import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './supabaseClient'

// ─── DATA ────────────────────────────────────────────────────────────────────
const GROUPS = {
  A: { teams: ['EUA', 'México', 'Canadá', 'Grupo A4'], color: '#e63946' },
  B: { teams: ['Brasil', 'Argentina', 'Uruguai', 'Grupo B4'], color: '#2a9d8f' },
  C: { teams: ['França', 'Alemanha', 'Espanha', 'Grupo C4'], color: '#e9c46a' },
  D: { teams: ['Inglaterra', 'Portugal', 'Holanda', 'Grupo D4'], color: '#f4a261' },
  E: { teams: ['Itália', 'Bélgica', 'Croácia', 'Grupo E4'], color: '#457b9d' },
  F: { teams: ['Japão', 'Coreia do Sul', 'Austrália', 'Grupo F4'], color: '#06b6d4' },
  G: { teams: ['Marrocos', 'Senegal', 'Egito', 'Grupo G4'], color: '#c77dff' },
  H: { teams: ['Arábia Saudita', 'Irã', 'Qatar', 'Grupo H4'], color: '#80b918' },
  I: { teams: ['México B', 'Equador', 'Peru', 'Grupo I4'], color: '#ff6b6b' },
  J: { teams: ['Colômbia', 'Chile', 'Venezuela', 'Grupo J4'], color: '#ffd166' },
  K: { teams: ['Gana', 'Costa do Marfim', 'Nigéria', 'Grupo K4'], color: '#06d6a0' },
  L: { teams: ['Turquia', 'Polônia', 'Romênia', 'Grupo L4'], color: '#118ab2' },
}

const TEAM_FLAGS = {
  EUA: '🇺🇸', México: '🇲🇽', Canadá: '🇨🇦',
  Brasil: '🇧🇷', Argentina: '🇦🇷', Uruguai: '🇺🇾',
  França: '🇫🇷', Alemanha: '🇩🇪', Espanha: '🇪🇸',
  Inglaterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Portugal: '🇵🇹', Holanda: '🇳🇱',
  Itália: '🇮🇹', Bélgica: '🇧🇪', Croácia: '🇭🇷',
  Japão: '🇯🇵', 'Coreia do Sul': '🇰🇷', Austrália: '🇦🇺',
  Marrocos: '🇲🇦', Senegal: '🇸🇳', Egito: '🇪🇬',
  'Arábia Saudita': '🇸🇦', Irã: '🇮🇷', Qatar: '🇶🇦',
  'México B': '🇲🇽', Equador: '🇪🇨', Peru: '🇵🇪',
  Colômbia: '🇨🇴', Chile: '🇨🇱', Venezuela: '🇻🇪',
  Gana: '🇬🇭', 'Costa do Marfim': '🇨🇮', Nigéria: '🇳🇬',
  Turquia: '🇹🇷', Polônia: '🇵🇱', Romênia: '🇷🇴',
}

function generateStickers() {
  const all = {}
  const specials = [
    { id: 'ESP-1', label: 'Capa do Álbum', group: 'ESPECIAL' },
    { id: 'ESP-2', label: 'Mapa Sede - EUA', group: 'ESPECIAL' },
    { id: 'ESP-3', label: 'Mapa Sede - México', group: 'ESPECIAL' },
    { id: 'ESP-4', label: 'Mapa Sede - Canadá', group: 'ESPECIAL' },
    { id: 'ESP-5', label: 'Taça FIFA', group: 'ESPECIAL' },
    { id: 'ESP-6', label: 'Mascote Oficial', group: 'ESPECIAL' },
  ]
  specials.forEach(s => { all[s.id] = s })
  Object.entries(GROUPS).forEach(([gKey, gData]) => {
    gData.teams.forEach((team, ti) => {
      const prefix = `${gKey}${ti + 1}`
      all[`${prefix}-S`] = { id: `${prefix}-S`, label: `${team} — Escudo`, group: gKey, team }
      for (let n = 1; n <= 18; n++) {
        all[`${prefix}-${n}`] = { id: `${prefix}-${n}`, label: `${team} #${n}`, group: gKey, team }
      }
    })
  })
  return all
}

const ALL_STICKERS = generateStickers()
const TOTAL = Object.keys(ALL_STICKERS).length

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f6f8; font-family: 'DM Sans', sans-serif; color: #111; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

    .auth-input {
      background: #fff; border: 1.5px solid #e2e5ea; border-radius: 10px;
      padding: 11px 14px; color: #111; font-family: 'DM Sans', sans-serif;
      font-size: 14px; width: 100%; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .auth-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
    .auth-btn {
      width: 100%; padding: 12px; background: #1a1a2e; border: none;
      border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px;
      font-weight: 600; color: #fff; cursor: pointer; transition: background 0.2s, transform 0.1s;
    }
    .auth-btn:hover:not(:disabled) { background: #2d2d4a; transform: translateY(-1px); }
    .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-tab {
      flex: 1; padding: 10px; border: none; background: transparent;
      color: #9ca3af; font-family: 'DM Sans', sans-serif; font-size: 14px;
      font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;
    }
    .auth-tab.active { color: #1a1a2e; border-bottom-color: #1a1a2e; }

    .filter-btn {
      padding: 6px 13px; border-radius: 20px; border: 1.5px solid #e5e7eb;
      background: #fff; color: #6b7280; font-family: 'DM Sans', sans-serif;
      font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .filter-btn:hover { border-color: #d1d5db; color: #374151; }
    .filter-btn.active { background: #1a1a2e; border-color: #1a1a2e; color: #fff; }
    .filter-btn.active-color { color: #fff; }

    .status-btn {
      padding: 6px 13px; border-radius: 20px; border: 1.5px solid #e5e7eb;
      background: #fff; color: #6b7280; font-family: 'DM Sans', sans-serif;
      font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s;
    }
    .status-btn.active { background: #1a1a2e; border-color: #1a1a2e; color: #fff; }

    .search-input {
      background: #fff; border: 1.5px solid #e5e7eb; border-radius: 10px;
      padding: 10px 14px 10px 38px; color: #111; font-family: 'DM Sans', sans-serif;
      font-size: 13px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%;
    }
    .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .search-input::placeholder { color: #9ca3af; }

    .sticker-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 10px; animation: fadeIn 0.3s ease;
    }
    .sticker-card {
      border-radius: 12px; padding: 10px 8px; cursor: pointer;
      transition: all 0.18s; user-select: none;
    }
    .sticker-card:hover { transform: translateY(-2px); }

    .pub-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 5px 10px; border-radius: 20px; font-size: 11px;
      font-family: 'DM Sans', sans-serif; font-weight: 500; margin: 3px; border: 1px solid;
    }
  `}</style>
)

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')

  async function handle() {
    setError(''); setInfo('')
    if (!email.trim() || !password.trim()) { setError('Preencha todos os campos.'); return }
    if (mode === 'register' && !username.trim()) { setError('Escolha um nome de usuário.'); return }
    setLoading(true)

    if (mode === 'login') {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError('E-mail ou senha incorretos.'); setLoading(false); return }
      onLogin(data.user)
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { username } }
      })
      if (err) { setError(err.message); setLoading(false); return }
      if (data.user && !data.session) {
        setInfo('Conta criada! Verifique seu e-mail para confirmar.')
      } else if (data.user) {
        onLogin(data.user)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f6f8' }}>
      {/* Painel decorativo */}
      <div style={{
        flex: 1, display: 'none',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
        alignItems: 'center', justifyContent: 'center', padding: 48,
      }} />

      {/* Formulário */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'fadeUp 0.5s ease' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, background: '#1a1a2e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏆</div>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1a1a2e' }}>Copa 2026</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Álbum de Figurinhas</div>
              </div>
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1a1a2e' }}>
              {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              {mode === 'login' ? 'Entre para acessar seu álbum' : 'Comece a montar seu álbum agora'}
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1.5px solid #e5e7eb', marginBottom: 24 }}>
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); setInfo('') }}>Entrar</button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); setInfo('') }}>Cadastrar</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ color: '#374151', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Nome de usuário</label>
                <input className="auth-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="ex: joaosilva" />
              </div>
            )}
            <div>
              <label style={{ color: '#374151', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>E-mail</label>
              <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === 'Enter' && handle()} />
            </div>
            <div>
              <label style={{ color: '#374151', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input className="auth-input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" onKeyDown={e => e.key === 'Enter' && handle()} style={{ paddingRight: 40 }} />
                <button onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#9ca3af' }}>{showPw ? '🙈' : '👁'}</button>
              </div>
            </div>

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#dc2626' }}>{error}</div>}
            {info && <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#2563eb' }}>{info}</div>}

            <button className="auth-btn" onClick={handle} disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── STICKER VISUAL ───────────────────────────────────────────────────────────
function StickerVisual({ sticker, groupColor }) {
  const flag = TEAM_FLAGS[sticker.team] || '🏳️'
  const isSpecial = sticker.id.startsWith('ESP')
  const isShield = sticker.id.includes('-S')
  const num = parseInt(sticker.id.split('-').pop()) || 1

  if (isSpecial) return (
    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 10, marginTop: 12, marginBottom: 6, background: 'linear-gradient(145deg, #fef9ec, #fdf3d0)', border: '1.5px solid #f0c040', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(240,192,64,0.2)' }}>
      <div style={{ fontSize: 26 }}>✨</div>
      <div style={{ fontSize: 8, color: '#b45309', fontWeight: 700, letterSpacing: 1, marginTop: 4 }}>ESPECIAL</div>
    </div>
  )

  if (isShield) return (
    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 10, marginTop: 12, marginBottom: 6, background: `linear-gradient(160deg, ${groupColor}18, ${groupColor}08)`, border: `1.5px solid ${groupColor}50`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${groupColor}20`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '28%', background: `${groupColor}25`, borderBottom: `1px solid ${groupColor}30` }} />
      <div style={{ fontSize: 24, zIndex: 1 }}>{flag}</div>
      <div style={{ fontSize: 7.5, color: groupColor, fontWeight: 700, letterSpacing: 1.5, marginTop: 5, zIndex: 1 }}>ESCUDO</div>
    </div>
  )

  return (
    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 10, marginTop: 12, marginBottom: 6, background: `linear-gradient(160deg, ${groupColor}14 0%, #fff 70%)`, border: `1.5px solid ${groupColor}40`, boxShadow: `0 2px 10px ${groupColor}18`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '32%', background: `${groupColor}22`, borderBottom: `1px solid ${groupColor}25` }} />
      <div style={{ position: 'absolute', top: 5, left: 0, right: 0, textAlign: 'center', fontSize: 11 }}>{flag}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, paddingTop: 6 }}>👤</div>
      <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center', fontFamily: "'DM Serif Display', serif", fontSize: 20, color: groupColor, lineHeight: 1 }}>{num}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: groupColor, padding: '3px 4px', textAlign: 'center', fontFamily: 'DM Sans', fontSize: 7, fontWeight: 700, letterSpacing: 0.5, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sticker.team}</div>
    </div>
  )
}

// ─── STICKER CARD ─────────────────────────────────────────────────────────────
function StickerCard({ sticker, owned, repeated, onToggleOwned, onToggleRepeated }) {
  const groupColor = GROUPS[sticker.group]?.color || '#3b82f6'
  return (
    <div className="sticker-card" onClick={() => onToggleOwned(sticker.id)} style={{
      background: owned ? '#fff' : '#f9fafb',
      border: `1.5px solid ${owned ? groupColor + '60' : '#e5e7eb'}`,
      boxShadow: owned ? `0 4px 16px ${groupColor}20, 0 1px 4px rgba(0,0,0,0.06)` : '0 1px 3px rgba(0,0,0,0.04)',
      transform: owned ? 'translateY(-1px)' : 'none',
    }}>
      <div style={{ position: 'absolute', top: 6, left: 7, fontSize: 8, color: owned ? groupColor : '#d1d5db', fontWeight: 700 }}>{sticker.id}</div>
      {owned && (
        <div style={{ position: 'absolute', top: 5, right: 7, width: 16, height: 16, borderRadius: '50%', background: groupColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>✓</div>
      )}
      {owned ? (
        <StickerVisual sticker={sticker} groupColor={groupColor} />
      ) : (
        <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 8, marginTop: 12, marginBottom: 6, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {sticker.id.startsWith('ESP') ? '✨' : sticker.id.includes('-S') ? '🛡️' : (TEAM_FLAGS[sticker.team] || '🏳️')}
        </div>
      )}
      <div style={{ fontSize: 9, color: owned ? '#374151' : '#9ca3af', fontWeight: owned ? 600 : 400, textAlign: 'center', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {sticker.label.split('—')[1]?.trim() || sticker.label}
      </div>
      {owned && (
        <div onClick={e => { e.stopPropagation(); onToggleRepeated(sticker.id) }} style={{ marginTop: 5, textAlign: 'center', fontSize: 9, color: repeated ? '#f59e0b' : '#d1d5db', cursor: 'pointer', padding: '3px 0', borderTop: '1px solid #f3f4f6', fontWeight: repeated ? 600 : 400 }}>
          {repeated ? '🔁 repetida' : 'repetida?'}
        </div>
      )}
    </div>
  )
}

// ─── PUBLIC PAGE ──────────────────────────────────────────────────────────────
function PublicPage({ username }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: pubData } = await supabase
        .from('public_repeated')
        .select('repeated_ids, updated_at')
        .eq('username', username)
        .single()

      if (pubData) {
        setRows(pubData.repeated_ids || [])
        setUpdatedAt(new Date(pubData.updated_at).toLocaleString('pt-BR'))
      }
      setLoading(false)
    }
    load()
  }, [username])

  const repeatedStickers = useMemo(() => rows.map(id => ALL_STICKERS[id]).filter(Boolean), [rows])

  const byGroup = useMemo(() => {
    const map = {}
    repeatedStickers.forEach(s => {
      if (!map[s.group]) map[s.group] = []
      map[s.group].push(s)
    })
    return map
  }, [repeatedStickers])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f8' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 20px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#1a1a2e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏆</div>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: '#1a1a2e' }}>Copa 2026</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Figurinhas Repetidas</div>
            </div>
          </div>
          <a href="/" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, color: '#374151', fontSize: 12, fontWeight: 500, padding: '7px 14px', textDecoration: 'none' }}>← Meu álbum</a>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: '#1a1a2e' }}>
              Repetidas de <span style={{ color: '#3b82f6' }}>{username}</span>
            </div>
            {updatedAt && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Atualizado em {updatedAt}</div>}
          </div>
          {!loading && (
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#3b82f6' }}>{repeatedStickers.length}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>disponíveis para troca</div>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>⏳ Carregando...</div>
        ) : repeatedStickers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#374151' }}>Nenhuma repetida ainda</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(byGroup).map(([group, stickers]) => {
              const color = group === 'ESPECIAL' ? '#f59e0b' : (GROUPS[group]?.color || '#6b7280')
              return (
                <div key={group} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: '#1a1a2e' }}>
                      {group === 'ESPECIAL' ? '✨ Especiais' : `Grupo ${group}`}
                    </span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>({stickers.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {stickers.map(s => (
                      <span key={s.id} className="pub-chip" style={{ background: `${color}10`, borderColor: `${color}30`, color: '#374151' }}>
                        {TEAM_FLAGS[s.team] || ''} {s.label.replace(`${s.team} — `, '').replace(`${s.team} `, '')}
                        <span style={{ color: '#d1d5db', fontSize: 9 }}>{s.id}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const params = new URLSearchParams(window.location.search)
  const publicUser = params.get('user')

  const [session, setSession] = useState(undefined) // undefined = carregando
  const [stickers, setStickers] = useState({})       // { sticker_id: { owned, repeated } }
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Carrega sessão ao iniciar
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  // Carrega figurinhas do banco quando loga
  useEffect(() => {
    if (!session) return
    async function loadStickers() {
      const { data } = await supabase
        .from('stickers')
        .select('sticker_id, owned, repeated')
        .eq('user_id', session.user.id)

      const map = {}
      data?.forEach(row => { map[row.sticker_id] = { owned: row.owned, repeated: row.repeated } })
      setStickers(map)
    }
    loadStickers()
  }, [session])

  const upsertSticker = useCallback(async (stickerId, owned, repeated) => {
    setSaving(true)
    await supabase.from('stickers').upsert({
      user_id: session.user.id,
      sticker_id: stickerId,
      owned,
      repeated,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,sticker_id' })
    setSaving(false)
  }, [session])

  const syncPublicRepeated = useCallback(async (updatedStickers) => {
    const repeatedIds = Object.entries(updatedStickers)
      .filter(([, v]) => v.owned && v.repeated)
      .map(([k]) => k)

    const username = session.user.user_metadata?.username || session.user.email.split('@')[0]

    await supabase.from('public_repeated').upsert({
      user_id: session.user.id,
      username,
      repeated_ids: repeatedIds,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }, [session])

  async function toggleOwned(id) {
    const current = stickers[id] || { owned: false, repeated: false }
    const next = { ...stickers }
    if (current.owned) {
      next[id] = { owned: false, repeated: false }
    } else {
      next[id] = { owned: true, repeated: false }
    }
    setStickers(next)
    await upsertSticker(id, next[id].owned, next[id].repeated)
    await syncPublicRepeated(next)
  }

  async function toggleRepeated(id) {
    const current = stickers[id] || { owned: true, repeated: false }
    const next = { ...stickers, [id]: { owned: true, repeated: !current.repeated } }
    setStickers(next)
    await upsertSticker(id, true, !current.repeated)
    await syncPublicRepeated(next)
  }

  function copyPublicLink() {
    const username = session.user.user_metadata?.username || session.user.email.split('@')[0]
    const url = `${window.location.origin}/?user=${encodeURIComponent(username)}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const ownedCount = Object.values(stickers).filter(s => s.owned).length
  const repeatedCount = Object.values(stickers).filter(s => s.owned && s.repeated).length
  const pct = Math.round((ownedCount / TOTAL) * 100)
  const username = session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || ''

  const filteredStickers = useMemo(() => Object.values(ALL_STICKERS).filter(s => {
    if (filterGroup !== 'ALL' && s.group !== filterGroup) return false
    const q = search.toLowerCase()
    if (q && !s.label.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false
    const st = stickers[s.id] || {}
    if (filterStatus === 'OWNED' && !st.owned) return false
    if (filterStatus === 'MISSING' && st.owned) return false
    if (filterStatus === 'REPEATED' && !(st.owned && st.repeated)) return false
    return true
  }), [search, filterGroup, filterStatus, stickers])

  // Página pública
  if (publicUser) return (<><GlobalStyles /><PublicPage username={publicUser} /></>)

  // Loading inicial
  if (session === undefined) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6f8' }}>
      <GlobalStyles />
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18 }}>Carregando...</div>
      </div>
    </div>
  )

  // Tela de login
  if (!session) return (<><GlobalStyles /><AuthScreen onLogin={() => {}} /></>)

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', background: '#f5f6f8' }}>

        {/* HEADER */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 20px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#1a1a2e', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏆</div>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: '#1a1a2e' }}>Copa 2026</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>Álbum de Figurinhas</div>
              </div>
            </div>

            <div style={{ flex: 1, maxWidth: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, color: '#6b7280' }}>
                <span>{ownedCount} / {TOTAL}</span>
                <span style={{ color: '#1a1a2e', fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {saving && <span style={{ fontSize: 11, color: '#9ca3af', animation: 'pulse 1s infinite' }}>Salvando…</span>}
              <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 26, height: 26, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👤</div>
                {username}
              </div>
              <button onClick={copyPublicLink} style={{ background: copied ? '#f0fdf4' : '#eff6ff', border: `1.5px solid ${copied ? '#86efac' : '#bfdbfe'}`, borderRadius: 8, color: copied ? '#16a34a' : '#2563eb', fontSize: 12, fontWeight: 500, padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: 'DM Sans' }}>
                {copied ? '✓ Copiado!' : '🔗 Compartilhar repetidas'}
              </button>
              <button onClick={() => supabase.auth.signOut()} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, color: '#6b7280', fontFamily: 'DM Sans', fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>Sair</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Total no álbum', value: TOTAL, emoji: '📦', color: '#6366f1' },
              { label: 'Tenho', value: ownedCount, emoji: '✅', color: '#10b981' },
              { label: 'Faltam', value: TOTAL - ownedCount, emoji: '🔍', color: '#ef4444' },
              { label: 'Repetidas', value: repeatedCount, emoji: '🔁', color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9ca3af' }}>🔍</span>
              <input className="search-input" placeholder="Buscar por seleção ou número..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {[['ALL', 'Todas'], ['OWNED', '✅ Tenho'], ['MISSING', '❌ Faltam'], ['REPEATED', '🔁 Repetidas']].map(([v, l]) => (
                <button key={v} className={`status-btn ${filterStatus === v ? 'active' : ''}`} onClick={() => setFilterStatus(v)}>{l}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className={`filter-btn ${filterGroup === 'ALL' ? 'active' : ''}`} onClick={() => setFilterGroup('ALL')}>Todos</button>
              <button className={`filter-btn ${filterGroup === 'ESPECIAL' ? 'active' : ''}`} onClick={() => setFilterGroup('ESPECIAL')}>✨ Especiais</button>
              {Object.entries(GROUPS).map(([g, data]) => (
                <button key={g}
                  className={`filter-btn ${filterGroup === g ? 'active-color' : ''}`}
                  onClick={() => setFilterGroup(g)}
                  style={filterGroup === g ? { background: data.color, borderColor: data.color, color: '#fff' } : {}}>
                  Grupo {g}
                </button>
              ))}
            </div>
          </div>

          {/* COUNT */}
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>
            {filteredStickers.length} figurinha{filteredStickers.length !== 1 ? 's' : ''}
          </div>

          {/* GRID */}
          {filteredStickers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', color: '#9ca3af' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#374151' }}>Nenhuma figurinha encontrada</div>
            </div>
          ) : (
            <div className="sticker-grid" style={{ position: 'relative' }}>
              {filteredStickers.map(s => (
                <div key={s.id} style={{ position: 'relative' }}>
                  <StickerCard
                    sticker={s}
                    owned={!!(stickers[s.id]?.owned)}
                    repeated={!!(stickers[s.id]?.repeated)}
                    onToggleOwned={toggleOwned}
                    onToggleRepeated={toggleRepeated}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
