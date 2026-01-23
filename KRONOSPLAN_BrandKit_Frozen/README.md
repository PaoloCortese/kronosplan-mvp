# 🎨 KRONOSPLAN Brand Kit (FROZEN)

Asset grafici ufficiali del brand KRONOSPLAN — versione congelata 1.0.

## ⚠️ Regole d'Uso

**FROZEN** = Non modificare mai i file in questa cartella.

- ✅ **Copiare** asset nella working directory per uso
- ✅ **Riferire** i path corretti nel codice
- ❌ **Mai modificare** direttamente questi file

## 📁 Struttura

```
KRONOSPLAN_BrandKit_Frozen/
├── 01_Logo_Master/           → Logo completo ufficiale
├── 02_Logo_Varianti/         → Varianti (bianco, mono)
├── 03_Icone/                 → App icon, favicon sources
├── 04_Favicon/               → Favicon browser
├── 05_Social/                → Template social media
├── 06_Documenti/             → Template documenti
└── 07_Specifiche/            → Documentazione completa
    └── SPECIFICHE.md         ← LEGGI QUESTO PER DETTAGLI
```

## 🎨 Quick Reference

### Colori
- Navy Primary: `#1a365d`
- Arancio Accent: `#ed8936`
- Sfondo: `#f9fafb`

### Font
- Inter / SF Pro / system-ui
- Wordmark: sempre MAIUSCOLO "KRONOSPLAN"

## 🚀 Uso Rapido

### Logo per Login (navy)
```jsx
<Image
  src="/brand/kronosplan-logo-full-navy.png"
  alt="KRONOSPLAN"
  height={40}
  width={200}
  priority
  unoptimized
/>
```

### Logo per Header (bianco su navy)
```jsx
<Image
  src="/brand/kronosplan-logo-full-white.png"
  alt="KRONOSPLAN"
  height={28}
  width={140}
  priority
/>
```

## 📖 Documentazione Completa

Consulta [07_Specifiche/SPECIFICHE.md](07_Specifiche/SPECIFICHE.md) per:
- Palette colori completa
- Guida tipografica
- Dimensioni e proporzioni
- Esempi di codice
- Checklist pre-deploy

## 📅 Info

- **Versione**: 1.0
- **Data**: 2026-01-23
- **Status**: ✅ FROZEN
