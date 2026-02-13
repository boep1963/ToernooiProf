#!/bin/bash
# ClubMatch - Development Environment Setup Script
# This script installs dependencies and starts the development server.

set -e

echo "============================================"
echo "  ClubMatch - Biljart Competitie Beheer"
echo "  Development Environment Setup"
echo "============================================"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is niet geinstalleerd."
    echo "Installeer Node.js 20+ LTS van https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "WARNING: Node.js versie $(node -v) gedetecteerd."
    echo "ClubMatch vereist Node.js 20 of hoger."
    echo ""
fi

echo "Node.js versie: $(node -v)"
echo "npm versie: $(npm -v)"
echo ""

# Install dependencies
echo ">> Afhankelijkheden installeren..."
npm install
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "WARNING: .env.local bestand niet gevonden!"
    echo "Kopieer .env.local.example naar .env.local en vul de Firebase configuratie in."
    echo ""
    echo "  cp .env.local.example .env.local"
    echo ""
    echo "De applicatie zal starten maar Firebase functionaliteit werkt niet zonder configuratie."
    echo ""
fi

# Start development server
echo ">> Development server starten..."
echo ""
echo "============================================"
echo "  ClubMatch draait op: http://localhost:3000"
echo "============================================"
echo ""
echo "Druk op Ctrl+C om de server te stoppen."
echo ""

npm run dev
