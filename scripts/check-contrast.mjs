/**
 * Contrast Ratio Verification Script for Occasio Design Tokens.
 *
 * Verifies WCAG 2.2 AA compliance (>= 4.5:1 for body text, >= 3.0:1 for large/graphical).
 * Tests all 3 event themes: wedding, birthday, community across paper, surface, and card backgrounds.
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

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
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
    accent: '#1B4D3E', // deep forest green
    'accent-hover': '#13382D',
    highlight: '#7A6230', // warm gold
  },
  birthday: {
    accent: '#9C411E', // warm terracotta
    'accent-hover': '#7F3215',
    highlight: '#8A6014', // amber/gold
  },
  community: {
    accent: '#165359', // deep teal
    'accent-hover': '#0F3D42',
    highlight: '#755928', // sand
  },
};

let failures = 0;
let passedChecks = 0;

console.log('--- WCAG 2.2 AA Contrast Verification ---\n');

// 1. Common tokens against backgrounds
for (const [bgName, bgHex] of Object.entries(backgrounds)) {
  for (const [tokenName, tokenHex] of Object.entries(commonTokens)) {
    const ratio = getContrastRatio(bgHex, tokenHex);
    const pass = ratio >= 4.5;
    if (!pass) {
      console.error(`FAIL: ${tokenName} (${tokenHex}) against ${bgName} (${bgHex}) ratio is ${ratio.toFixed(2)}:1 (minimum 4.5:1 required)`);
      failures++;
    } else {
      passedChecks++;
    }
  }
}

// 2. Theme accent tokens against backgrounds & white text on accent
for (const [themeName, tokens] of Object.entries(themes)) {
  for (const [tokenName, tokenHex] of Object.entries(tokens)) {
    for (const [bgName, bgHex] of Object.entries(backgrounds)) {
      const ratio = getContrastRatio(bgHex, tokenHex);
      const pass = ratio >= 4.5;
      if (!pass) {
        console.error(`FAIL: [${themeName}] ${tokenName} (${tokenHex}) against ${bgName} (${bgHex}) ratio is ${ratio.toFixed(2)}:1`);
        failures++;
      } else {
        passedChecks++;
      }
    }
  }

  // White text on accent (for buttons & badges)
  const buttonRatio = getContrastRatio('#FFFFFF', tokens.accent);
  if (buttonRatio < 4.5) {
    console.error(`FAIL: [${themeName}] white text on accent (${tokens.accent}) ratio is ${buttonRatio.toFixed(2)}:1`);
    failures++;
  } else {
    passedChecks++;
  }
}

console.log(`\nResults: ${passedChecks} checks passed, ${failures} failures.`);

if (failures > 0) {
  process.exit(1);
} else {
  console.log('All theme color token pairs exceed WCAG AA 4.5:1 contrast requirements.\n');
}
