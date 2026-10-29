import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// Helper to create an editorial SVG composition and render to WebP
async function createStillLifeImage(outputPath, { width = 800, height = 600, svgContent, quality = 82 }) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const svgBuffer = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <!-- Paper Grain Filter -->
        <filter id="grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.11  0 0 0 0 0.10  0 0 0 0 0.09  0 0 0 0.04 0" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
        <!-- Soft Vignette & Directional Window Light -->
        <radialGradient id="vignette" cx="30%" cy="30%" r="85%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15" />
          <stop offset="60%" stop-color="#000000" stop-opacity="0.0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
        </radialGradient>
      </defs>
      ${svgContent}
      <!-- Ambient Lighting & Vignette Overlay -->
      <rect width="${width}" height="${height}" fill="url(#vignette)" style="mix-blend-mode: multiply;" />
      <rect width="${width}" height="${height}" filter="url(#grain)" fill="transparent" />
    </svg>
  `);

  const info = await sharp(svgBuffer)
    .webp({ quality })
    .toFile(outputPath);

  console.log(`Saved ${outputPath} (${info.width}x${info.height}, ${info.size} bytes)`);
  return info;
}

async function main() {
  console.log('Generating procedural editorial still-life imagery...');

  // 1. Community Welcome Card (800x600)
  await createStillLifeImage('public/images/welcome/community.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#123F45" />
      <!-- Warm wood tabletop base -->
      <rect y="220" width="800" height="380" fill="#2A1B14" />
      <rect y="220" width="800" height="4" fill="#3D291F" />
      <!-- Linen runner -->
      <polygon points="180,220 620,220 660,600 140,600" fill="#EAE3D5" />
      <polygon points="190,220 610,220 650,600 150,600" fill="#F4EFE6" />
      <!-- Stoneware jug with sunflowers -->
      <ellipse cx="400" cy="360" rx="65" ry="85" fill="#8C9A86" />
      <rect x="370" y="240" width="60" height="60" fill="#7C8A76" />
      <!-- Sunflowers -->
      <circle cx="360" cy="210" r="45" fill="#D99B26" />
      <circle cx="360" cy="210" r="22" fill="#3D2512" />
      <circle cx="440" cy="190" r="50" fill="#D99B26" />
      <circle cx="440" cy="190" r="24" fill="#3D2512" />
      <circle cx="400" cy="150" r="40" fill="#C58917" />
      <circle cx="400" cy="150" r="19" fill="#331E0D" />
      <!-- Handcrafted Ceramic Pitcher & Citrus -->
      <ellipse cx="270" cy="420" rx="42" ry="55" fill="#C46D47" />
      <circle cx="510" cy="460" r="28" fill="#E89635" />
      <circle cx="550" cy="480" r="22" fill="#E5A823" />
      <!-- Blank Deckle-edge Craft Clipboard -->
      <rect x="230" y="470" width="130" height="90" rx="4" fill="#FFFDF8" stroke="#D1C7BA" stroke-width="1.5" transform="rotate(-6 295 515)" />
      <rect x="275" y="464" width="40" height="12" rx="2" fill="#D9B65B" transform="rotate(-6 295 515)" />
    `,
  });

  // 2. Birthday Mood 1: Vintage Speakeasy (800x600)
  await createStillLifeImage('public/images/mood/birthday-vintage-speakeasy.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#1C1512" />
      <!-- Dark walnut bar surface -->
      <rect y="260" width="800" height="340" fill="#2E1C14" />
      <!-- Fluted glass decanter with amber whiskey -->
      <path d="M360,180 L440,180 L460,340 C460,400 340,400 340,340 Z" fill="#E5A823" fill-opacity="0.65" stroke="#FAF7F2" stroke-width="1.5" />
      <rect x="385" y="120" width="30" height="60" fill="#FAF7F2" fill-opacity="0.4" />
      <circle cx="400" cy="100" r="22" fill="#D9B65B" />
      <!-- Cut Crystal Tumbler with ice sphere -->
      <path d="M510,330 L570,330 L560,450 L520,450 Z" fill="#D99B26" fill-opacity="0.5" stroke="#FFFFFF" stroke-width="1.2" />
      <circle cx="540" cy="385" r="20" fill="#FFFFFF" fill-opacity="0.35" />
      <!-- Vintage brass record player arm & vinyl rim -->
      <circle cx="210" cy="480" r="160" fill="#111111" stroke="#333333" stroke-width="4" />
      <circle cx="210" cy="480" r="55" fill="#7A3112" />
      <line x1="280" y1="360" x2="230" y2="460" stroke="#D9B65B" stroke-width="5" stroke-linecap="round" />
      <circle cx="280" cy="360" r="12" fill="#8A6A12" />
      <!-- Deep velvet drape in background corner -->
      <path d="M0,0 Q180,80 120,350 Q80,500 0,600 Z" fill="#3D1408" />
    `,
  });

  // 3. Birthday Mood 2: Garden Brunch (800x600)
  await createStillLifeImage('public/images/mood/birthday-garden-brunch.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#F4EFE6" />
      <!-- Sunlit conservatory greenhouse window panes -->
      <line x1="260" y1="0" x2="260" y2="300" stroke="#D8CFC2" stroke-width="2" />
      <line x1="540" y1="0" x2="540" y2="300" stroke="#D8CFC2" stroke-width="2" />
      <line x1="0" y1="140" x2="800" y2="140" stroke="#D8CFC2" stroke-width="2" />
      <!-- Dappled botanical shadows -->
      <path d="M120,40 Q200,90 260,30 Q220,120 310,160" stroke="#8FAF8F" stroke-width="18" stroke-linecap="round" opacity="0.25" fill="none" />
      <!-- Whitewashed wooden garden table -->
      <rect y="280" width="800" height="320" fill="#EAE4D8" />
      <!-- Porcelain pedestal cake stand with fresh citrus & berries -->
      <ellipse cx="400" cy="380" rx="140" ry="25" fill="#FFFDF8" stroke="#D1C7BA" stroke-width="2" />
      <rect x="385" y="380" width="30" height="70" fill="#FAF7F2" stroke="#D1C7BA" stroke-width="1.5" />
      <ellipse cx="400" cy="450" rx="75" ry="15" fill="#FFFDF8" stroke="#D1C7BA" stroke-width="1.5" />
      <!-- Fluted French porcelain teapot -->
      <path d="M210,340 C210,300 290,300 290,340 L295,420 C295,450 205,450 205,420 Z" fill="#FFFDF8" stroke="#8FAF8F" stroke-width="2" />
      <path d="M205,370 Q160,380 180,410 Q195,420 210,415" fill="none" stroke="#8FAF8F" stroke-width="4" />
      <!-- Sliced blood oranges and fresh rosemary -->
      <circle cx="560" cy="430" r="32" fill="#C43D2A" />
      <circle cx="560" cy="430" r="26" fill="#D95338" stroke="#FAF7F2" stroke-dasharray="4 4" stroke-width="2" />
      <circle cx="620" cy="450" r="24" fill="#E89635" />
      <line x1="490" y1="460" x2="530" y2="430" stroke="#2F6B4F" stroke-width="3" stroke-linecap="round" />
    `,
  });

  // 4. Birthday Mood 3: Astronomy Midnight (800x600)
  await createStillLifeImage('public/images/mood/birthday-astronomy-midnight.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#0C1524" />
      <!-- Slate tabletop surface -->
      <rect y="270" width="800" height="330" fill="#131B2A" />
      <!-- Brass Celestial Armillary Sphere / Astrolabe -->
      <circle cx="390" cy="270" r="110" fill="none" stroke="#D9B65B" stroke-width="3" />
      <ellipse cx="390" cy="270" rx="110" ry="45" fill="none" stroke="#D9B65B" stroke-width="2" transform="rotate(-30 390 270)" />
      <ellipse cx="390" cy="270" rx="45" ry="110" fill="none" stroke="#8A6A12" stroke-width="1.5" transform="rotate(15 390 270)" />
      <circle cx="390" cy="270" r="16" fill="#D9B65B" />
      <line x1="390" y1="380" x2="390" y2="460" stroke="#8A6A12" stroke-width="6" stroke-linecap="round" />
      <ellipse cx="390" cy="460" rx="60" ry="12" fill="#D9B65B" />
      <!-- Dark Indigo Stationery with Gold Constellations -->
      <rect x="170" y="380" width="130" height="170" rx="3" fill="#18233C" stroke="#D9B65B" stroke-width="1.2" transform="rotate(8 235 465)" />
      <circle cx="210" cy="430" r="2" fill="#D9B65B" />
      <circle cx="250" cy="420" r="2.5" fill="#D9B65B" />
      <circle cx="260" cy="470" r="1.5" fill="#D9B65B" />
      <line x1="210" y1="430" x2="250" y2="420" stroke="#D9B65B" stroke-width="0.75" stroke-dasharray="2 2" />
      <!-- Obsidian dish with scattered gold sequins -->
      <ellipse cx="570" cy="440" rx="65" ry="32" fill="#080B10" stroke="#25324D" stroke-width="1.5" />
      <circle cx="550" cy="435" r="3" fill="#D9B65B" />
      <circle cx="580" cy="445" r="2" fill="#D9B65B" />
      <circle cx="565" cy="450" r="2.5" fill="#FAF7F2" />
    `,
  });

  // 5. Birthday Mood 4: Retro Disco (800x600)
  await createStillLifeImage('public/images/mood/birthday-retro-disco.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#24141E" />
      <!-- Warm reflective laminate tabletop -->
      <rect y="290" width="800" height="310" fill="#3D1D30" />
      <!-- Mirrored faceted disco sphere catching golden amber glow -->
      <circle cx="380" cy="240" r="115" fill="#D4A773" />
      <!-- Facet tile lines -->
      <path d="M265,240 C265,160 495,160 495,240 C495,320 265,320 265,240 Z" fill="none" stroke="#FAF7F2" stroke-width="1.5" opacity="0.6" />
      <ellipse cx="380" cy="240" rx="70" ry="115" fill="none" stroke="#FAF7F2" stroke-width="1.5" opacity="0.6" />
      <ellipse cx="380" cy="240" rx="115" ry="60" fill="none" stroke="#FAF7F2" stroke-width="1.5" opacity="0.6" />
      <!-- Golden cocktail coupe with effervescent sparkle -->
      <path d="M530,340 C530,410 630,410 630,340 Z" fill="#E5A823" fill-opacity="0.7" stroke="#FAF7F2" stroke-width="1.5" />
      <line x1="580" y1="410" x2="580" y2="480" stroke="#FAF7F2" stroke-width="3" />
      <ellipse cx="580" cy="480" rx="35" ry="8" fill="#FAF7F2" />
      <!-- Warm acrylic amber coasters and scattered foil stars -->
      <circle cx="210" cy="440" r="45" fill="#C46D47" fill-opacity="0.8" />
      <circle cx="250" cy="480" r="35" fill="#D99B26" fill-opacity="0.8" />
      <path d="M480,180 Q485,170 490,180 Q500,185 490,190 Q485,200 480,190 Q470,185 480,180 Z" fill="#D9B65B" />
      <path d="M290,150 Q293,143 296,150 Q303,153 296,156 Q293,163 290,156 Q283,153 290,150 Z" fill="#D9B65B" />
    `,
  });

  // 6. Community Mood 1: Open Air Market (800x600)
  await createStillLifeImage('public/images/mood/community-open-air-market.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#1C383D" />
      <!-- Rustic wooden plank counter -->
      <rect y="240" width="800" height="360" fill="#362519" />
      <line x1="0" y1="330" x2="800" y2="330" stroke="#261910" stroke-width="3" />
      <line x1="0" y1="420" x2="800" y2="420" stroke="#261910" stroke-width="3" />
      <line x1="0" y1="510" x2="800" y2="510" stroke="#261910" stroke-width="3" />
      <!-- Burlap runner -->
      <rect x="140" y="240" width="520" height="360" fill="#D6C4AE" />
      <!-- Slatted Wooden produce crate -->
      <rect x="220" y="270" width="220" height="150" fill="#8A603C" stroke="#4A3320" stroke-width="2" rx="4" />
      <!-- Heirloom Tomatoes and Fresh Lemons -->
      <circle cx="265" cy="330" r="26" fill="#C43322" />
      <circle cx="310" cy="315" r="28" fill="#D44A37" />
      <circle cx="355" cy="335" r="24" fill="#C43322" />
      <circle cx="395" cy="320" r="26" fill="#E5A823" />
      <circle cx="280" cy="370" r="25" fill="#D47726" />
      <circle cx="330" cy="375" r="28" fill="#C43322" />
      <!-- Artisanal sourdough boule on parchment -->
      <ellipse cx="530" cy="380" rx="85" ry="60" fill="#C98B4B" stroke="#8A5623" stroke-width="2" />
      <path d="M470,360 Q530,335 590,360" stroke="#704318" stroke-width="4" stroke-linecap="round" fill="none" />
      <!-- Fresh rosemary and thyme sprigs -->
      <line x1="420" y1="460" x2="490" y2="440" stroke="#2F6B4F" stroke-width="3" stroke-linecap="round" />
    `,
  });

  // 7. Community Mood 2: Neighborhood Harvest (800x600)
  await createStillLifeImage('public/images/mood/community-neighborhood-harvest.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#2E3B32" />
      <!-- Weathered garden bench / wood surface -->
      <rect y="260" width="800" height="340" fill="#423023" />
      <!-- Heirloom pumpkins and squash -->
      <ellipse cx="360" cy="390" rx="95" ry="75" fill="#D96E26" stroke="#9E460E" stroke-width="2" />
      <rect x="352" y="300" width="16" height="30" rx="3" fill="#523B22" />
      <ellipse cx="490" cy="410" rx="70" ry="55" fill="#FAF5E8" stroke="#CCC2AE" stroke-width="2" />
      <ellipse cx="240" cy="425" rx="55" ry="42" fill="#5E7550" stroke="#3F5235" stroke-width="2" />
      <!-- Dried wheat sheaves tied with twine -->
      <path d="M560,190 Q580,310 630,460" stroke="#D9B65B" stroke-width="12" stroke-linecap="round" />
      <path d="M580,180 Q595,300 645,450" stroke="#D4A747" stroke-width="10" stroke-linecap="round" />
      <rect x="585" y="340" width="35" height="15" rx="2" fill="#8A6A12" />
      <!-- Ceramic apple cider jug -->
      <path d="M150,330 C150,290 210,290 210,330 L215,440 L145,440 Z" fill="#E8DDD0" stroke="#BAAEA0" stroke-width="2" />
      <ellipse cx="180" cy="440" rx="35" ry="10" fill="#BAAEA0" />
    `,
  });

  // 8. Community Mood 3: Street Art Fair (800x600)
  await createStillLifeImage('public/images/mood/community-street-art-fair.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#1A282C" />
      <!-- Birch plywood drafting desk -->
      <rect y="250" width="800" height="350" fill="#E5D8C3" />
      <!-- Large painter palette with mixed oil pigments -->
      <path d="M220,380 C220,290 420,270 470,340 C520,410 440,510 320,510 C240,510 220,450 220,380 Z" fill="#D4B996" stroke="#9E8260" stroke-width="2" />
      <circle cx="430" cy="420" r="18" fill="#E5D8C3" stroke="#9E8260" stroke-width="2" />
      <!-- Rich pigment dollops on palette -->
      <circle cx="260" cy="340" r="14" fill="#123F45" />
      <circle cx="295" cy="320" r="15" fill="#C43D2A" />
      <circle cx="340" cy="315" r="16" fill="#D9B65B" />
      <circle cx="385" cy="330" r="15" fill="#2F6B4F" />
      <circle cx="420" cy="360" r="13" fill="#7A3112" />
      <!-- Natural glass pigment jars & brushes -->
      <rect x="510" y="330" width="55" height="75" rx="6" fill="#EAEAEA" fill-opacity="0.75" stroke="#BFBFBF" stroke-width="1.5" />
      <rect x="515" y="350" width="45" height="50" rx="3" fill="#D99B26" />
      <rect x="580" y="320" width="55" height="85" rx="6" fill="#EAEAEA" fill-opacity="0.75" stroke="#BFBFBF" stroke-width="1.5" />
      <rect x="585" y="345" width="45" height="55" rx="3" fill="#1F5F7A" />
      <line x1="450" y1="460" x2="570" y2="280" stroke="#8A5A30" stroke-width="5" stroke-linecap="round" />
      <line x1="460" y1="475" x2="600" y2="290" stroke="#8A5A30" stroke-width="4" stroke-linecap="round" />
    `,
  });

  // 9. Community Mood 4: Lantern Festival (800x600)
  await createStillLifeImage('public/images/mood/community-lantern-festival.webp', {
    svgContent: `
      <rect width="800" height="600" fill="#0D1E24" />
      <!-- Low cedar outdoor tea table at twilight -->
      <rect y="310" width="800" height="290" fill="#241B15" />
      <!-- Woven bamboo mat -->
      <rect x="150" y="310" width="500" height="290" fill="#998365" stroke="#735F45" stroke-width="1.5" />
      <!-- Glowing spherical paper lanterns -->
      <!-- Large center lantern -->
      <circle cx="380" cy="270" r="95" fill="#FFE082" />
      <circle cx="380" cy="270" r="75" fill="#FFCA28" />
      <ellipse cx="380" cy="270" rx="55" ry="95" fill="none" stroke="#D99B26" stroke-width="1.5" />
      <ellipse cx="380" cy="270" rx="95" ry="55" fill="none" stroke="#D99B26" stroke-width="1.5" />
      <rect x="365" y="165" width="30" height="15" rx="2" fill="#5D4037" />
      <rect x="365" y="360" width="30" height="15" rx="2" fill="#5D4037" />
      <!-- Smaller lantern in background -->
      <circle cx="560" cy="210" r="60" fill="#FFD54F" />
      <ellipse cx="560" cy="210" rx="35" ry="60" fill="none" stroke="#D99B26" stroke-width="1.2" />
      <!-- Stoneware matcha / tea bowls -->
      <ellipse cx="250" cy="450" rx="42" ry="25" fill="#4E5D52" stroke="#2C3730" stroke-width="2" />
      <ellipse cx="490" cy="460" rx="38" ry="22" fill="#756455" stroke="#42372E" stroke-width="2" />
    `,
  });

  // 10. Docs Banner (1600x400)
  await createStillLifeImage('docs/banner.webp', {
    width: 1600,
    height: 400,
    svgContent: `
      <rect width="1600" height="400" fill="#17392C" />
      <circle cx="800" cy="200" r="320" fill="none" stroke="#D9B65B" stroke-width="1" stroke-dasharray="4 6" opacity="0.3" />
      <rect x="680" y="80" width="240" height="240" rx="8" fill="#FFFDF8" stroke="#D9B65B" stroke-width="2" />
      <rect x="692" y="92" width="216" height="216" rx="4" fill="none" stroke="#E6DFD5" stroke-width="1" />
      <!-- Monogram 'O' -->
      <circle cx="800" cy="180" r="36" fill="#17392C" />
      <circle cx="800" cy="180" r="24" fill="#FFFDF8" />
      <!-- Brand Name -->
      <text x="800" y="260" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#1C1917" text-anchor="middle" letter-spacing="2">OCCASIO</text>
      <text x="800" y="285" font-family="sans-serif" font-size="11" font-weight="600" fill="#8A6A12" text-anchor="middle" letter-spacing="3">EVENT PLANNING ASSISTANT</text>
    `,
  });

  // 11. Docs Social Preview (1280x640, PNG format as specified)
  const socialSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640">
      <rect width="1280" height="640" fill="#17392C" />
      <rect x="40" y="40" width="1200" height="560" rx="16" fill="#FAF7F2" stroke="#D9B65B" stroke-width="3" />
      <rect x="52" y="52" width="1176" height="536" rx="12" fill="none" stroke="#E6DFD5" stroke-width="1" />
      
      <!-- Left Editorial Monogram & Title -->
      <circle cx="200" cy="240" r="60" fill="#17392C" />
      <circle cx="200" cy="240" r="42" fill="#FAF7F2" />
      <text x="200" y="258" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#17392C" text-anchor="middle">O</text>
      
      <text x="300" y="225" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="#1C1917" letter-spacing="-1">Occasio</text>
      <text x="300" y="270" font-family="sans-serif" font-size="20" font-weight="600" fill="#8A6A12" letter-spacing="3">GENAI EVENT PLANNING ASSISTANT</text>
      
      <text x="300" y="340" font-family="sans-serif" font-size="18" fill="#57524C" max-width="600">
        Bespoke Budgets • Reverse-Scheduled Timelines • Vendor Procurement • Curated Ideas
      </text>

      <!-- Bottom Feature Badges -->
      <g transform="translate(300, 420)">
        <rect x="0" y="0" width="140" height="42" rx="21" fill="#EAF3EE" stroke="#2F6B4F" stroke-width="1.5" />
        <text x="70" y="26" font-family="sans-serif" font-size="13" font-weight="bold" fill="#2F6B4F" text-anchor="middle">Weddings</text>

        <rect x="160" y="0" width="140" height="42" rx="21" fill="#FCF6E8" stroke="#8A5A00" stroke-width="1.5" />
        <text x="230" y="26" font-family="sans-serif" font-size="13" font-weight="bold" fill="#8A5A00" text-anchor="middle">Birthdays</text>

        <rect x="320" y="0" width="160" height="42" rx="21" fill="#EBF4F8" stroke="#1F5F7A" stroke-width="1.5" />
        <text x="400" y="26" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1F5F7A" text-anchor="middle">Community Events</text>
      </g>
    </svg>
  `);

  if (!fs.existsSync('docs')) fs.mkdirSync('docs', { recursive: true });
  await sharp(socialSvg).png({ quality: 90 }).toFile('docs/social-preview.png');
  console.log('Saved docs/social-preview.png');

  console.log('All fallback imagery successfully generated!');
}

main().catch(console.error);

