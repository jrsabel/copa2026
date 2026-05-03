# 🏆 Copa 2026 — Álbum de Figurinhas

Tracker de figurinhas com autenticação real (Supabase) e deploy na Vercel.

---

## Estrutura do projeto

```
copa2026/
├── public/
│   └── index.html
├── src/
│   ├── App.js           ← app principal
│   ├── supabaseClient.js ← conexão com Supabase
│   └── index.js         ← entry point React
├── .env                 ← credenciais (NÃO suba no GitHub)
├── .env.example         ← modelo sem credenciais
├── .gitignore
└── package.json
```

---

## Como subir no GitHub + Vercel

### 1. Criar repositório no GitHub

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/copa2026.git
git push -u origin main
```

>  O arquivo `.env` está no `.gitignore` — as credenciais NÃO serão enviadas ao GitHub.

---

### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**
2. Importe o repositório `copa2026` do GitHub
3. Antes de confirmar o deploy, vá em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `REACT_APP_SUPABASE_URL` | `https://kfkffgyraoiafzjvjlpl.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGci...` (sua chave anon completa) |

4. Clique em **Deploy** ✅

---

### 3. Configurar URL no Supabase

Após o deploy, copie a URL do seu site na Vercel (ex: `https://copa2026.vercel.app`) e:

1. No painel do Supabase vá em **Authentication → URL Configuration**
2. Em **Site URL** coloque sua URL da Vercel
3. Em **Redirect URLs** adicione `https://copa2026.vercel.app/**`

---

## 🗄️ SQL para rodar no Supabase

Cole isso no **SQL Editor** do Supabase:

```sql
create table stickers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  sticker_id text not null,
  owned boolean default false,
  repeated boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, sticker_id)
);

alter table stickers enable row level security;

create policy "select own" on stickers for select using (auth.uid() = user_id);
create policy "insert own" on stickers for insert with check (auth.uid() = user_id);
create policy "update own" on stickers for update using (auth.uid() = user_id);
create policy "delete own" on stickers for delete using (auth.uid() = user_id);

create table public_repeated (
  user_id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  repeated_ids text[] default '{}',
  updated_at timestamptz default now()
);

alter table public_repeated enable row level security;

create policy "anyone can view" on public_repeated for select using (true);
create policy "owner manages" on public_repeated for all using (auth.uid() = user_id);
```
