#!/bin/sh

# Falla si algún comando falla
set -e

echo "Instalando Node.js..."
brew install node

echo "Instalando Cocoapods..."
brew install cocoapods

echo "Navegando a la raíz del proyecto..."
cd ../../../

echo "Instalando dependencias de NPM..."
npm ci

echo "Construyendo los recursos web (Vite/React)..."
npm run build

echo "Sincronizando Capacitor con iOS..."
npx cap sync ios

echo "ci_post_clone finalizado con éxito."
