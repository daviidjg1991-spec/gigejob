#!/bin/sh

# Falla si algún comando falla
set -e

# Desactivar auto-actualizaciones lentas de Homebrew en CI
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1

# Verificar e instalar Node.js si no está presente
if ! command -v node >/dev/null 2>&1; then
    echo "Instalando Node.js..."
    brew install node
else
    echo "Node.js ya está disponible: $(node -v)"
fi

# Verificar e instalar CocoaPods si no está presente
if ! command -v pod >/dev/null 2>&1; then
    echo "Instalando CocoaPods..."
    brew install cocoapods
else
    echo "CocoaPods ya está disponible: $(pod --version)"
fi

# Navegar a la raíz del repositorio de forma robusta en Xcode Cloud
if [ -n "$CI_PRIMARY_REPOSITORY_PATH" ]; then
    cd "$CI_PRIMARY_REPOSITORY_PATH"
else
    cd "$(dirname "$0")/../../.."
fi

echo "Directorio de trabajo: $(pwd)"

echo "Instalando dependencias de NPM..."
npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Parche de compatibilidad para Capacitor CLI si fuera necesario
node -e "const fs=require('fs'); const p='node_modules/@capacitor/cli/dist/util/template.js'; if(fs.existsSync(p)){let s=fs.readFileSync(p,'utf8'); s=s.replace('tar_1.default.extract', '((tar_1.default||tar_1).extract)'); fs.writeFileSync(p,s);}" || true

echo "Construyendo los recursos web (Vite/React)..."
npm run build

echo "Copiando recursos web a iOS..."
npx cap copy ios

echo "Instalando dependencias nativas (CocoaPods)..."
cd ios/App
pod install

echo "ci_post_clone finalizado con éxito."
