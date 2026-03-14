#!/usr/bin/env node
/**
 * Converts the changelog HTML to PDF using Puppeteer.
 * Usage: node scripts/html-to-pdf.mjs [htmlPath] [pdfPath]
 * Requires: npx puppeteer (or puppeteer installed)
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, process.argv[2] || 'changelog-1303-1403.html');
const pdfPath = resolve(__dirname, process.argv[3] || 'changelog-1303-1403.pdf');

// Dynamic import so we can use npx puppeteer
const puppeteer = await import('puppeteer');
const browser = await puppeteer.default.launch();
const page = await browser.newPage();
const html = readFileSync(htmlPath, 'utf-8');
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
});
await browser.close();

console.log('PDF opgeslagen:', pdfPath);
