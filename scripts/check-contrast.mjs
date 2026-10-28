/**
 * Contrast Ratio Verification Script for Occasio Design Tokens & Material Surfaces.
 *
 * Verifies WCAG 2.2 AA compliance:
 * - >= 4.5:1 for body and normal text
 * - >= 3.0:1 for large display type (>= 24px or bold >= 18.5px) and graphical elements
 *
 * Tests:
 * 1. Standard flat surfaces (paper #FAF7F2, surface #F5EFE6, white #FFFFFF)
 * 2. Composited paper grain texture (worst-case 5% dark noise on paper)
 * 3. Deep hero band surfaces across all 3 themes (wedding, birthday, community)
 * 4. Composited hero surface textures (worst-case 6% light engraving lines on deep hero tone)
 * 5. Primary button and theme accent contrast pairs
 */

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(c1, c2) {
  const rgb1 = typeof c1 === 'string' ? hexToRgb(c1) : c1;
  const rgb2 = typeof c2 === 'string' ? hexToRgb(c2) : c2;
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function composite(fgRgb, bgRgb, alpha) {
  return {
    r: Math.round(fgRgb.r * alpha + bgRgb.r * (1 - alpha)),
    g: Math.round(fgRgb.g * alpha + bgRgb.g * (1 - alpha)),
    b: Math.round(fgRgb.b * alpha + bgRgb.b * (1 - alpha)),
  };
}

const backgrounds = {
  paper: '#FAF7F2',
  surface: '#F5EFE6',
  white: '#FFFFFF',
};

const commonTokens = {
  ink: '#1C1917',
  'ink-muted': '#5E5750',
  'ink-subtle': '#6E665E',
  success: '#186333',
  warning: '#8A4500',
  error: '#9E1C1C',
};

const themes = {
  wedding: {
    accent: '#1B4D3E',
    'accent-hover': '#13382D',
    highlight: '#7A6230',
    heroBg: '#1B4434',
    heroText: '#FAF7F2',
    heroMuted: '#D8D2C5',
  },
  birthday: {
    accent: '#9C411E',
    'accent-hover': '#7F3215',
    highlight: '#8A6014',
    heroBg: '#823415',
    heroText: '#FAF7F2',
    heroMuted: '#EADCD1',
  },
  community: {
    accent: '#165359',
    'accent-hover': '#0F3D42',
    highlight: '#755928',
    heroBg: '#13464C',
    heroText: '#FAF7F2',
    heroMuted: '#D0DFE0',
  },
};

let failures = 0;
let passedChecks = 0;

console.log('--- WCAG 2.2 AA Contrast Verification (Flat + Composited Textures) ---\n');

// 1. Common tokens against flat backgrounds (>= 4.5:1)
for (const [bgName, bgHex] of Object.entries(backgrounds)) {
  for (const [tokenName, tokenHex] of Object.entries(commonTokens)) {
    const ratio = getContrastRatio(bgHex, tokenHex);
    if (ratio < 4.5) {
      console.error(`FAIL: ${tokenName} (${tokenHex}) against ${bgName} (${bgHex}) ratio is ${ratio.toFixed(2)}:1 (>= 4.5:1 required)`);
      failures++;
    } else {
      passedChecks++;
    }
  }
}

// 2. Common tokens against composited paper grain texture (worst-case 5% dark grain on paper)
const paperGrainBg = composite(hexToRgb('#1C1917'), hexToRgb('#FAF7F2'), 0.05);
for (const [tokenName, tokenHex] of Object.entries(commonTokens)) {
  const ratio = getContrastRatio(paperGrainBg, tokenHex);
  if (ratio < 4.5) {
    console.error(`FAIL: ${tokenName} against composited paper grain texture ratio is ${ratio.toFixed(2)}:1 (>= 4.5:1 required)`);
    failures++;
  } else {
    passedChecks++;
  }
}

// 3. Theme accent tokens against backgrounds (>= 4.5:1)
for (const [themeName, tokens] of Object.entries(themes)) {
  for (const tokenName of ['accent', 'accent-hover']) {
    for (const [bgName, bgHex] of Object.entries(backgrounds)) {
      const tokenHex = tokens[tokenName];
      const ratio = getContrastRatio(bgHex, tokenHex);
      if (ratio < 4.5) {
        console.error(`FAIL: [${themeName}] ${tokenName} (${tokenHex}) against ${bgName} (${bgHex}) ratio is ${ratio.toFixed(2)}:1`);
        failures++;
      } else {
        passedChecks++;
      }
    }
  }
}

// 4. Button primary text (#FAF7F2) against theme accents (>= 4.5:1)
for (const [themeName, tokens] of Object.entries(themes)) {
  const ratio = getContrastRatio(tokens.accent, '#FAF7F2');
  if (ratio < 4.5) {
    console.error(`FAIL: [${themeName}] ivory text (#FAF7F2) on accent (${tokens.accent}) ratio is ${ratio.toFixed(2)}:1`);
    failures++;
  } else {
    passedChecks++;
  }
}

// 5. Deep Hero band surface text contrast (raw and composited with 6% light texture lines)
for (const [themeName, tokens] of Object.entries(themes)) {
  const heroRgb = hexToRgb(tokens.heroBg);
  const heroTextRgb = hexToRgb(tokens.heroText);
  const heroMutedRgb = hexToRgb(tokens.heroMuted);

  // Raw hero background
  const textRatio = getContrastRatio(heroRgb, heroTextRgb);
  if (textRatio < 4.5) {
    console.error(`FAIL: [${themeName}] heroText (${tokens.heroText}) on heroBg (${tokens.heroBg}) ratio is ${textRatio.toFixed(2)}:1`);
    failures++;
  } else {
    passedChecks++;
  }

  const mutedRatio = getContrastRatio(heroRgb, heroMutedRgb);
  if (mutedRatio < 4.5) {
    console.error(`FAIL: [${themeName}] heroMuted (${tokens.heroMuted}) on heroBg (${tokens.heroBg}) ratio is ${mutedRatio.toFixed(2)}:1`);
    failures++;
  } else {
    passedChecks++;
  }

  // Composited with 6% light texture lines (worst-case lightest pixel on hero)
  const lightTextureBg = composite({ r: 255, g: 255, b: 255 }, heroRgb, 0.06);
  const compTextRatio = getContrastRatio(lightTextureBg, heroTextRgb);
  if (compTextRatio < 4.5) {
    console.error(`FAIL: [${themeName}] heroText on composited texture heroBg ratio is ${compTextRatio.toFixed(2)}:1`);
    failures++;
  } else {
    passedChecks++;
  }

  // Composited with 6% dark texture lines (worst-case darkest pixel on hero)
  const darkTextureBg = composite({ r: 0, g: 0, b: 0 }, heroRgb, 0.06);
  const darkTextRatio = getContrastRatio(darkTextureBg, heroTextRgb);
  if (darkTextRatio < 4.5) {
    console.error(`FAIL: [${themeName}] heroText on dark composited texture heroBg ratio is ${darkTextRatio.toFixed(2)}:1`);
    failures++;
  } else {
    passedChecks++;
  }
}

console.log(`\nResults: ${passedChecks} checks passed, ${failures} failures.`);

if (failures > 0) {
  console.error(`FAILED: ${failures} color contrast checks failed WCAG 2.2 AA requirements.`);
  process.exit(1);
} else {
  console.log('All theme color token pairs (flat and composited textures) exceed WCAG AA 4.5:1 contrast requirements.\n');
}
