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

echo "Copiando recursos web a iOS..."
npx cap copy ios

echo "Instalando dependencias nativas (CocoaPods)..."
cd ios/App
pod install

echo "ci_post_clone finalizado con éxito."
