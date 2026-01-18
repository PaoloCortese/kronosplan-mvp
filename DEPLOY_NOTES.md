# KRONOSPLAN - DEPLOY NOTES

## A. Environment Variables (Nomi)
Le seguenti variabili devono essere configurate su Vercel (Settings → Environment Variables):

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Impostare per: **Preview** e **Production**

---

## B. Procedura Deploy (Vercel Web UI)

1. Push repository su GitHub (o GitLab/Bitbucket)
2. Login su vercel.com → "Add New Project"
3. Import repository GitHub
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `.` (default)
6. Build Command: `npm run build` (default)
7. Output Directory: `.next` (default)
8. Aggiungi Environment Variables (sezione A)
9. Click "Deploy"

**Nota**: Il progetto è attualmente in `/Users/paolocortese` (home directory).
Per deploy via CLI, spostare i file in una directory dedicata (es. `~/projects/kronosplan/`).

---

## C. Smoke Test Checklist

### Test 1: Redirect non autenticato
- [ ] Aprire `/checkin` → redirect a `/`
- [ ] Aprire `/calendario` → redirect a `/`
- [ ] Aprire `/post/<any-id>` → redirect a `/`

### Test 2: Register/Login
- [ ] Register con nuova email su `/`
- [ ] Verifica redirect automatico a `/checkin`

### Test 3: Check-in flow
- [ ] Compilare campo risposta
- [ ] Click "Avanti"
- [ ] Verifica redirect a `/response`

### Test 4: Calendario filtering
- [ ] Navigare a `/calendario`
- [ ] Verificare presenza post (se seed applicato)
- [ ] Verificare isolamento: solo post della propria agency

### Test 5: Post copy + status update
- [ ] Click su un post dal calendario
- [ ] Click bottone "Copia"
- [ ] Verifica messaggio "Copiato."
- [ ] Verifica in Supabase: campo `status` = 'copied'

---

## D. Cosa NON è incluso
Onboarding, profile pages, AI generazione copy, analytics/KPI, Stripe integration.

---

## E. Build Fixes Applicati

### Fix 1: Rimozione directory `src/` residua
**File**: N/A (directory rinominata in `src-old-backup/`)
**Motivo**: Conflitto con file di vecchi progetti (Firebase, Lucide React)

### Fix 2: Next.js 15 params type
**File**: `app/post/[id]/page.tsx`
**Diff**:
```diff
- export default function PostPage({ params }: { params: { id: string } }) {
+ export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
+   const unwrappedParams = use(params)
```
**Motivo**: Next.js 15 richiede params come Promise in dynamic routes

### Fix 3: TypeScript config scope
**File**: `tsconfig.json`
**Diff**:
```diff
- "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
- "exclude": ["node_modules"]
+ "include": [
+   "next-env.d.ts",
+   "app/**/*.ts",
+   "app/**/*.tsx",
+   "components/**/*.ts",
+   "components/**/*.tsx",
+   "lib/**/*.ts",
+   "lib/**/*.tsx",
+   ".next/types/**/*.ts"
+ ],
+ "exclude": ["node_modules", "Desktop", "Documents", "Downloads", "src-old-backup"]
```
**Motivo**: Limitare build a sole directory del progetto KRONOSPLAN

---

## F. Build Status
✅ **Build locale OK** (`npm run build`)
- 7 routes compilate
- 0 errori TypeScript
- 0 errori runtime
- Bundle size: ~153 kB First Load JS

---

## G. Repository
- Git inizializzato: ✅
- Commits: 3
- Branch: `main`
- Files tracked: 26
- `.gitignore` configurato (esclude `.env.local`, `node_modules`, test files)

---

## H. Next Steps (Post-Deploy)
1. Pushare repository su GitHub
2. Collegare a Vercel via Web UI
3. Configurare env vars su Vercel
4. Deployare
5. Eseguire smoke tests su URL staging
6. (Opzionale) Configurare custom domain
