function encodeSvgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function createEditorialSvgCover(options: {
  title: string;
  author: string;
  edition?: string;
  motif: 'marginalia' | 'conservatory' | 'typography' | 'coastal' | 'harmonic';
}): string {
  const title = escapeXml(options.title);
  const author = escapeXml(options.author.toUpperCase());
  const edition = escapeXml(options.edition || 'ACELIVRE EDITION');

  const words = title.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > 16 && current) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current);

  const titleMarkup = lines
    .slice(0, 4)
    .map(
      (line, idx) =>
        `<text x="150" y="${120 + idx * 28}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="600" letter-spacing="0.4" fill="${
          options.motif === 'marginalia' || options.motif === 'harmonic' ? '#FDF2F8' : '#3D000F'
        }">${line}</text>`
    )
    .join('');

  if (options.motif === 'marginalia') {
    return encodeSvgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
        <rect width="300" height="400" fill="#5C0017"/>
        <rect x="14" y="14" width="272" height="372" fill="none" stroke="#FBCFE8" stroke-width="0.9" stroke-opacity="0.65"/>
        <rect x="20" y="20" width="260" height="360" fill="none" stroke="#FBCFE8" stroke-width="0.4" stroke-opacity="0.4"/>
        <circle cx="150" cy="255" r="64" fill="none" stroke="#F9A8D4" stroke-width="1" stroke-opacity="0.7"/>
        <circle cx="150" cy="255" r="46" fill="#800020" stroke="#FCE7F3" stroke-width="0.75" stroke-opacity="0.8"/>
        <path d="M150 180 L150 330 M75 255 L225 255" stroke="#FBCFE8" stroke-width="0.6" stroke-opacity="0.45"/>
        <polygon points="150,218 182,255 150,292 118,255" fill="none" stroke="#FDF2F8" stroke-width="1.1"/>
        <text x="150" y="64" text-anchor="middle" font-family="sans-serif" font-size="8.5" letter-spacing="2.6" fill="#FBCFE8">${author}</text>
        ${titleMarkup}
        <text x="150" y="362" text-anchor="middle" font-family="sans-serif" font-size="7.5" letter-spacing="2.2" fill="#F9A8D4">${edition}</text>
      </svg>
    `);
  }

  if (options.motif === 'conservatory') {
    return encodeSvgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
        <rect width="300" height="400" fill="#FDF2F8"/>
        <rect x="16" y="16" width="268" height="368" fill="#FFFFFF" stroke="#800020" stroke-width="1"/>
        <path d="M70 332 L70 218 A80 80 0 0 1 230 218 L230 332 Z" fill="#FCE7F3" stroke="#800020" stroke-width="1.1"/>
        <path d="M90 332 L90 225 A60 60 0 0 1 210 225 L210 332" fill="none" stroke="#800020" stroke-width="0.7" stroke-opacity="0.6"/>
        <line x1="150" y1="138" x2="150" y2="332" stroke="#800020" stroke-width="0.7" stroke-opacity="0.6"/>
        <line x1="70" y1="245" x2="230" y2="245" stroke="#800020" stroke-width="0.7" stroke-opacity="0.6"/>
        <path d="M150 326 C150 285 118 272 114 238 C136 246 146 266 150 284 C154 266 164 246 186 238 C182 272 150 285 150 326 Z" fill="#800020" fill-opacity="0.88"/>
        <text x="150" y="58" text-anchor="middle" font-family="sans-serif" font-size="8.5" letter-spacing="2.4" fill="#800020">${author}</text>
        ${titleMarkup}
        <text x="150" y="366" text-anchor="middle" font-family="sans-serif" font-size="7.5" letter-spacing="2.2" fill="#6E4A56">${edition}</text>
      </svg>
    `);
  }

  if (options.motif === 'typography') {
    return encodeSvgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
        <rect width="300" height="400" fill="#FCE7F3"/>
        <rect x="24" y="24" width="252" height="352" fill="#FFFFFF" stroke="#E5B8CE" stroke-width="1"/>
        <line x1="24" y1="196" x2="276" y2="196" stroke="#800020" stroke-width="1"/>
        <line x1="150" y1="196" x2="150" y2="376" stroke="#800020" stroke-width="0.7" stroke-opacity="0.45"/>
        <circle cx="150" cy="286" r="56" fill="#800020"/>
        <circle cx="150" cy="286" r="34" fill="#FCE7F3"/>
        <circle cx="150" cy="286" r="14" fill="#5C0017"/>
        <text x="150" y="66" text-anchor="middle" font-family="sans-serif" font-size="8.5" letter-spacing="2.6" fill="#6E4A56">${author}</text>
        ${titleMarkup}
        <text x="42" y="362" font-family="monospace" font-size="8" fill="#800020">01 / GRID</text>
        <text x="258" y="362" text-anchor="end" font-family="monospace" font-size="8" fill="#800020">1 : 1.618</text>
      </svg>
    `);
  }

  if (options.motif === 'coastal') {
    return encodeSvgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
        <rect width="300" height="400" fill="#FAF0F5"/>
        <rect x="18" y="18" width="264" height="364" fill="none" stroke="#800020" stroke-width="0.9"/>
        <path d="M40 245 Q95 225 150 245 T260 245" fill="none" stroke="#800020" stroke-width="1.2" stroke-opacity="0.8"/>
        <path d="M40 263 Q95 243 150 263 T260 263" fill="none" stroke="#B84B6E" stroke-width="1" stroke-opacity="0.7"/>
        <path d="M40 281 Q95 261 150 281 T260 281" fill="none" stroke="#800020" stroke-width="0.8" stroke-opacity="0.5"/>
        <path d="M40 299 Q95 279 150 299 T260 299" fill="none" stroke="#B84B6E" stroke-width="0.7" stroke-opacity="0.4"/>
        <circle cx="150" cy="222" r="24" fill="#FBCFE8" stroke="#800020" stroke-width="1"/>
        <text x="150" y="64" text-anchor="middle" font-family="sans-serif" font-size="8.5" letter-spacing="2.4" fill="#6E4A56">${author}</text>
        ${titleMarkup}
        <text x="150" y="358" text-anchor="middle" font-family="sans-serif" font-size="7.5" letter-spacing="2.2" fill="#800020">${edition}</text>
      </svg>
    `);
  }

  return encodeSvgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <rect width="300" height="400" fill="#800020"/>
      <rect x="16" y="16" width="268" height="368" fill="none" stroke="#FCE7F3" stroke-width="0.8" stroke-opacity="0.55"/>
      <ellipse cx="150" cy="264" rx="88" ry="34" fill="none" stroke="#FBCFE8" stroke-width="1" stroke-opacity="0.8"/>
      <ellipse cx="150" cy="264" rx="64" ry="52" fill="none" stroke="#FDF2F8" stroke-width="0.8" stroke-opacity="0.65"/>
      <ellipse cx="150" cy="264" rx="34" ry="74" fill="none" stroke="#F9A8D4" stroke-width="0.9" stroke-opacity="0.75"/>
      <circle cx="150" cy="264" r="6" fill="#FCE7F3"/>
      <text x="150" y="62" text-anchor="middle" font-family="sans-serif" font-size="8.5" letter-spacing="2.5" fill="#FBCFE8">${author}</text>
      ${titleMarkup}
      <text x="150" y="362" text-anchor="middle" font-family="sans-serif" font-size="7.5" letter-spacing="2.2" fill="#FBCFE8">${edition}</text>
    </svg>
  `);
}
