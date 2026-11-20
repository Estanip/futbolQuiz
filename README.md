# Quiz de Fútbol · Penales

Juego web de preguntas (Selección / Clubes / Mundial). Si errás o se te acaba el tiempo, pateás un penal con puntería y potencia.

## Cómo correrlo

```bash
npm install
npm run dev
```

## Modos

- **Partida rápida:** 10 preguntas
- **Infinito:** sigue hasta quedarte sin vidas (el mazo se reshuflea)

## Mecánicas

- 3 vidas · 12s por pregunta
- Penal con skill (apuntar + potencia)
- La racha endurece al arquero
- Récords locales por modo (`localStorage`)

## Deploy

### Netlify (más simple)

1. Subí el repo a GitHub
2. En [netlify.com](https://www.netlify.com): New site → Import → build `npm run build`, publish `dist`
3. O arrastrá la carpeta `dist` a [app.netlify.com/drop](https://app.netlify.com/drop) después de `npm run build`

### GitHub Pages

1. Creá el repo y pusheá a `main`
2. Settings → Pages → Source: **GitHub Actions**
3. El workflow `.github/workflows/deploy.yml` publica solo

```bash
npm run build
```

## Stack

Phaser 3 · Vite · JavaScript
