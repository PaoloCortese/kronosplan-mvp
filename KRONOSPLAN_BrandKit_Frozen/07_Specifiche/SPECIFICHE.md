# KRONOSPLAN Brand Kit — Specifiche Tecniche

## 📋 Panoramica

Questo Brand Kit contiene tutti gli asset grafici ufficiali del brand KRONOSPLAN.
Tutti i file in questa cartella sono **FROZEN** — non modificare direttamente, copiare nella working directory se necessario.

---

## 🎨 Colori Brand

### Colori Primari
- **Navy Primary**: `#1a365d` — Colore principale brand, usato per header, CTA, testi importanti
- **Navy Light**: `#2c5282` — Variante più chiara per hover states e accenti
- **Arancio Accent**: `#ed8936` — Punto focale nell'icona clessidra, usato con parsimonia per accenti critici

### Colori Secondari
- **Sfondo**: `#f9fafb` — Sfondo generale interfaccia
- **Bianco**: `#ffffff` — Card, elementi su navy
- **Grigio Testo**: `#374151` — Testo body principale
- **Grigio Chiaro**: `#6b7280` — Testi secondari, placeholder
- **Grigio Bordi**: `#d1d5db` — Bordi, separatori

---

## 🔤 Tipografia

### Font Stack
```css
font-family: Inter, 'SF Pro', system-ui, -apple-system, sans-serif;
```

### Gerarchia Tipografica
- **H1**: 24px / 1.2 / 600 weight / 0.02em letter-spacing
- **H2**: 20px / 1.3 / 600 weight
- **Body**: 14px / 1.5 / 400 weight
- **Small**: 12px / 1.4 / 400 weight
- **Button**: 14px / 1 / 500 weight

### Regole Wordmark
- Sempre MAIUSCOLO: "KRONOSPLAN"
- Mai separare in due righe
- Letter-spacing titoli: 0.02em
- Usare font Inter o SF Pro

---

## 🖼️ Asset Grafici

### 01_Logo_Master/
Logo completo (icona + wordmark) nelle versioni ufficiali.

- **kronosplan-logo-full-navy.png** (799×533px)
  - Logo completo navy con trasparenza
  - Include clessidra con punto arancione `#ed8936`
  - Uso: Login page, documenti, presentazioni

### 02_Logo_Varianti/
Varianti del logo per contesti specifici.

- **kronosplan-logo-full-white.png** (560×112px)
  - Logo completo bianco per sfondi scuri
  - Uso: Header su sfondo navy `#1a365d`

### 03_Icone/
Icone app e varianti standalone.

- **app-icon-512.png** (512×512px) — PWA/Android icon
- **apple-icon-180.png** (180×180px) — iOS home screen icon
- **kronosplan-icon-mobile.png** (800×800px) — Fonte master per mobile
- **kronosplan-icon-original.png** — Icona originale standalone

### 04_Favicon/
Favicon per browser.

- **favicon.ico** — Multi-size (16×16, 32×32, 48×48)

### 05_Social/
Template e asset per social media.

- **template-post.png** — Template post social
- **template-story.png** — Template Instagram Stories
- **banner-claim.png** — Banner con claim

### 06_Documenti/
Template per documenti (da popolare).

### 07_Specifiche/
Documentazione tecnica (questo file).

---

## 📐 Dimensioni e Proporzioni

### Logo Completo
- Aspect ratio: ~5:1 (orizzontale)
- Dimensioni minime: 140px larghezza
- Spazio di rispetto: 20% altezza logo su ogni lato

### Icona Standalone
- Formato: Quadrato 1:1
- Dimensioni minime: 32×32px
- Dimensioni consigliate: 512×512px per export

### Favicon
- Formati: ICO multi-size (16, 32, 48)
- Mantenere leggibilità anche a 16×16px

---

## 🚀 Utilizzo nel Codice

### Next.js / React
```jsx
import Image from 'next/image'

// Logo navy per login page
<Image
  src="/brand/kronosplan-logo-full-navy.png"
  alt="KRONOSPLAN"
  height={40}
  width={200}
  priority
  unoptimized
/>

// Logo bianco per header
<Image
  src="/brand/kronosplan-logo-full-white.png"
  alt="KRONOSPLAN"
  height={28}
  width={140}
  priority
/>
```

### HTML Standard
```html
<!-- Logo navy -->
<img src="/brand/kronosplan-logo-full-navy.png" alt="KRONOSPLAN" />

<!-- Favicon -->
<link rel="icon" href="/brand/favicon.ico" />
<link rel="apple-touch-icon" href="/brand/apple-icon-180.png" />
```

### CSS
```css
.logo-background {
  background-image: url('/brand/kronosplan-icon-mobile.png');
  background-size: contain;
  background-repeat: no-repeat;
}

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
```

---

## 📱 Contesti d'Uso

| Contesto | Asset | Dimensioni Display |
|----------|-------|-------------------|
| Login Page | `01_Logo_Master/kronosplan-logo-full-navy.png` | 200×40px |
| Header (navy bg) | `02_Logo_Varianti/kronosplan-logo-full-white.png` | 140×28px |
| Favicon browser | `04_Favicon/favicon.ico` | 16-48px |
| PWA Android | `03_Icone/app-icon-512.png` | 512×512px |
| iOS home screen | `03_Icone/apple-icon-180.png` | 180×180px |
| Avatar social | `03_Icone/kronosplan-icon-mobile.png` | 400×400px |
| Open Graph image | `05_Social/banner-claim.png` | 1200×630px |

---

## ✅ Checklist Pre-Deploy

Prima di pubblicare modifiche grafiche:

- [ ] Logo corretto (navy con punto arancione visibile)
- [ ] Trasparenza PNG preservata
- [ ] Dimensioni corrette per contesto
- [ ] Favicon multi-size funzionante
- [ ] Test su sfondo bianco e navy
- [ ] Verificato su device mobile
- [ ] Cache browser pulita (.next/ rimossa)

---

## 🔒 Regole di Accesso

### DO
✅ Copiare asset dalla cartella frozen alla working directory
✅ Usare riferimenti ai path corretti nel codice
✅ Consultare queste specifiche per decisioni brand
✅ Mantenere aspect ratio originali

### DON'T
❌ Modificare file direttamente in KRONOSPLAN_BrandKit_Frozen/
❌ Cambiare colori del brand senza approvazione
❌ Alterare proporzioni o ritagliare il logo
❌ Usare font diversi da Inter/SF Pro per il wordmark

---

## 📞 Note Tecniche

### Formati Supportati
- **PNG**: Preferito per logo e icone (supporta trasparenza)
- **SVG**: Ideale per scalabilità (da implementare)
- **ICO**: Necessario per favicon browser legacy

### Ottimizzazione
- PNG: usare `optimize: true` in PIL quando si generano asset
- Next.js Image: aggiungere `unoptimized` se ci sono artefatti visivi
- Cache: ricordarsi di pulire `.next/` dopo modifiche agli asset

### Compatibilità
- iOS: usa `apple-icon.png` (180×180px)
- Android: usa `icon.png` (512×512px)
- Browser: usa `favicon.ico` multi-size
- PWA manifest: puntare a `icon.png`

---

## 📅 Versione

**Versione**: 1.0
**Data**: 2026-01-23
**Frozen**: ✅ Sì

Questo kit è congelato e rappresenta l'identità visiva ufficiale di KRONOSPLAN.
Per modifiche sostanziali, consultare il team design/brand.
