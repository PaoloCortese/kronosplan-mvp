# 🎨 KRONOSPLAN Brand Kit — Guida Accesso Asset

> Riferimento rapido per Claude Code e sviluppatori

## 📍 Posizione Asset

Tutti gli asset grafici ufficiali si trovano in:
```
KRONOSPLAN_BrandKit_Frozen/
```

⚠️ **Attenzione**: Questi file sono **FROZEN** — non modificare mai direttamente.

---

## 📁 Struttura Brand Kit

```
KRONOSPLAN_BrandKit_Frozen/
├── 01_Logo_Master/           → Logo completo (icona + wordmark)
│   └── kronosplan-logo-full-navy.png (799×533px)
├── 02_Logo_Varianti/         → Varianti per sfondi diversi
│   └── kronosplan-logo-full-white.png (560×112px)
├── 03_Icone/                 → App icons e favicon sources
│   ├── app-icon-512.png (512×512px) — PWA/Android
│   ├── apple-icon-180.png (180×180px) — iOS home screen
│   ├── kronosplan-icon-mobile.png (800×800px) — Mobile source
│   └── kronosplan-icon-original.png — Icona standalone
├── 04_Favicon/               → Favicon browser
│   └── favicon.ico (multi-size: 16×16, 32×32, 48×48)
├── 05_Social/                → Template social media
│   ├── template-post.png
│   ├── template-story.png
│   └── banner-claim.png
├── 06_Documenti/             → Template documenti (TBD)
└── 07_Specifiche/            → Documentazione completa
    ├── SPECIFICHE.md         ← Guida tecnica completa
    └── README.md
```

---

## 🎨 Quick Reference — Brand Colors

```css
/* Colori Primari */
--navy-primary: #1a365d;    /* Header, CTA, testi importanti */
--navy-light: #2c5282;      /* Hover states, accenti */
--arancio-accent: #ed8936;  /* Punto clessidra, accenti critici */

/* Colori Secondari */
--sfondo: #f9fafb;          /* Background generale */
--bianco: #ffffff;          /* Card, elementi su navy */
--grigio-testo: #374151;    /* Body text */
--grigio-chiaro: #6b7280;   /* Testi secondari */
--grigio-bordi: #d1d5db;    /* Bordi, separatori */
```

---

## 🔤 Quick Reference — Tipografia

```css
/* Font Stack */
font-family: Inter, 'SF Pro', system-ui, -apple-system, sans-serif;

/* Wordmark Rules */
text-transform: uppercase;  /* Sempre MAIUSCOLO: "KRONOSPLAN" */
letter-spacing: 0.02em;     /* Per titoli con wordmark */
```

---

## 🚀 Quando Usare Quale Asset

| Contesto | File | Path | Dimensioni |
|----------|------|------|-----------|
| **Login page** | Logo navy completo | `01_Logo_Master/kronosplan-logo-full-navy.png` | 200×40px |
| **Header su navy** | Logo bianco | `02_Logo_Varianti/kronosplan-logo-full-white.png` | 140×28px |
| **PWA Android** | App icon | `03_Icone/app-icon-512.png` | 512×512px |
| **iOS home** | Apple icon | `03_Icone/apple-icon-180.png` | 180×180px |
| **Favicon** | Favicon | `04_Favicon/favicon.ico` | 16-48px |
| **Avatar social** | Icon mobile | `03_Icone/kronosplan-icon-mobile.png` | 400×400px |

---

## 💻 Esempi di Codice

### Next.js — Logo Login Page
```jsx
import Image from 'next/image'

<Image
  src="/logo_completo_navy.png"
  alt="KRONOSPLAN"
  height={40}
  width={200}
  priority
  unoptimized
/>
```

### Next.js — Logo Header (bianco su navy)
```jsx
import Image from 'next/image'

<Image
  src="/logo_completo_bianco.png"
  alt="KRONOSPLAN"
  height={28}
  width={140}
  priority
/>
```

### HTML — Meta Tags
```html
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-icon.png" />
<meta property="og:image" content="/brand/banner-claim.png" />
```

### CSS — Colori Brand
```css
.header {
  background-color: #1a365d; /* Navy Primary */
}

.cta-button {
  background-color: #1a365d;
  color: #ffffff;
}

.cta-button:hover {
  background-color: #2c5282; /* Navy Light */
}

.accent {
  color: #ed8936; /* Arancio Accent */
}
```

---

## ✅ Regole di Accesso

### ✅ DO — Cosa Fare
- Copiare asset dalla cartella frozen alla working directory (es: `public/`)
- Usare riferimenti ai path corretti nel codice
- Consultare `SPECIFICHE.md` per decisioni brand
- Mantenere aspect ratio originali
- Verificare trasparenza PNG

### ❌ DON'T — Cosa Non Fare
- ❌ Modificare file direttamente in `KRONOSPLAN_BrandKit_Frozen/`
- ❌ Cambiare colori del brand senza approvazione
- ❌ Alterare proporzioni o ritagliare il logo
- ❌ Usare font diversi da Inter/SF Pro per wordmark
- ❌ Scrivere "Kronosplan" o "kronosplan" → sempre **MAIUSCOLO**

---

## 📖 Documentazione Completa

Per specifiche tecniche complete, consulta:
```
KRONOSPLAN_BrandKit_Frozen/07_Specifiche/SPECIFICHE.md
```

Questa guida include:
- ✅ Palette colori estesa
- ✅ Sistema tipografico completo
- ✅ Dimensioni e proporzioni dettagliate
- ✅ Esempi di codice avanzati
- ✅ Checklist pre-deploy
- ✅ Note tecniche su formati e ottimizzazione

---

## 🔄 Workflow Tipico

1. **Identifica il contesto**: Login? Header? Mobile icon?
2. **Scegli l'asset**: Consulta tabella "Quando Usare Quale Asset"
3. **Copia il file**: Da `KRONOSPLAN_BrandKit_Frozen/` a `public/` o working dir
4. **Implementa nel codice**: Usa esempi sopra come riferimento
5. **Verifica**: Test su sfondo bianco e navy, mobile e desktop
6. **Deploy**: Pulisci cache (`.next/`) se necessario

---

## 📞 Support

Per modifiche sostanziali al brand o dubbi:
- Consulta `KRONOSPLAN_BrandKit_Frozen/07_Specifiche/SPECIFICHE.md`
- Verifica commit history per precedenti implementazioni
- Contatta team design/brand per approvazioni

---

**Versione**: 1.0
**Data**: 2026-01-23
**Status**: ✅ FROZEN
