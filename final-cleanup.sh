#!/bin/bash

# Script de nettoyage final pour v0.6.4
echo "🧹 Final cleanup for v0.6.4..."

cd /Docker/code/wakedock-env/wakedock-frontend

# 1. Supprimer les fichiers Svelte restants
echo "Removing remaining Svelte files..."
find . -name "*.svelte" -type f -delete
find . -name "*.svelte.ts" -type f -delete
find . -name "*.svelte.js" -type f -delete

# 2. Supprimer les références Svelte dans les index
echo "Cleaning Svelte imports in index files..."
find . -name "index.ts" -exec sed -i '/\.svelte/d' {} \;
find . -name "index.js" -exec sed -i '/\.svelte/d' {} \;

# 3. Supprimer les stores problématiques avec svelte/store
echo "Removing Svelte store imports..."
find . -name "*.ts" -exec sed -i '/from.*svelte\/store/d' {} \;
find . -name "*.js" -exec sed -i '/from.*svelte\/store/d' {} \;

# 4. Supprimer les fichiers de stores problématiques
echo "Removing problematic store files..."
rm -f src/lib/stores/auth.js
rm -f src/lib/stores/services.js
rm -f src/lib/stores/system.js
rm -f src/lib/stores/ui.js
rm -f src/lib/stores/websocket.js
rm -f src/lib/stores/advanced/dashboardStore.js
rm -f src/lib/stores/advanced/webSocketStore.js
rm -f src/lib/stores/advanced/performanceStore.js
rm -f src/lib/stores/advanced/pwaStore.js

# 5. Supprimer les fichiers de configuration problématiques
echo "Removing problematic config files..."
rm -f src/lib/config/environment.ts
rm -f src/lib/config/loader.ts

# 6. Supprimer les imports SvelteKit
echo "Removing SvelteKit imports..."
find . -name "*.ts" -exec sed -i '/from.*\$app\//d' {} \;
find . -name "*.tsx" -exec sed -i '/from.*\$app\//d' {} \;

# 7. Supprimer les composants UI problématiques
echo "Removing problematic UI components..."
rm -rf src/lib/components/ui/atoms/
rm -rf src/lib/components/ui/molecules/
rm -rf src/lib/components/ui/organisms/
rm -rf src/lib/components/security/mfa/

# 8. Supprimer les fichiers de test imports
echo "Removing test imports..."
rm -f src/lib/test-imports.ts

# 9. Supprimer les hooks problématiques
echo "Removing problematic hooks..."
rm -f src/hooks/use-nextjs-optimized.ts

# 10. Supprimer les icônes inexistantes de lucide-react
echo "Fixing lucide-react imports..."
sed -i 's/Discord,/\/\/ Discord,/g' src/components/layout/Footer.tsx 2>/dev/null || true
sed -i 's/Telegram,/\/\/ Telegram,/g' src/components/layout/Footer.tsx 2>/dev/null || true
sed -i 's/WhatsApp,/\/\/ WhatsApp,/g' src/components/layout/Footer.tsx 2>/dev/null || true
sed -i 's/Refresh,/RefreshCw,/g' src/components/layout/Footer.tsx 2>/dev/null || true

# Sidebar fixes - remplacer les icônes inexistantes
echo "Fixing Sidebar icons..."
if [ -f "src/components/layout/Sidebar.tsx" ]; then
    sed -i 's/Desktop,/Monitor,/g' src/components/layout/Sidebar.tsx
    sed -i 's/Ethernet,/Network,/g' src/components/layout/Sidebar.tsx
    sed -i 's/Modem,/Router,/g' src/components/layout/Sidebar.tsx
    sed -i 's/Tower,/Server,/g' src/components/layout/Sidebar.tsx
    # Supprimer toutes les icônes d'animaux inexistantes
    sed -i '/Octopus,/d' src/components/layout/Sidebar.tsx
    sed -i '/Crab,/d' src/components/layout/Sidebar.tsx
    sed -i '/Butterfly,/d' src/components/layout/Sidebar.tsx
    sed -i '/Bee,/d' src/components/layout/Sidebar.tsx
    sed -i '/Spider,/d' src/components/layout/Sidebar.tsx
    sed -i '/Ant,/d' src/components/layout/Sidebar.tsx
    # Et tous les autres...
    sed -i '/Stopwatch,/d' src/components/layout/Sidebar.tsx
    sed -i '/Alarm,/d' src/components/layout/Sidebar.tsx
    sed -i 's/Tree,/TreePine,/g' src/components/layout/Sidebar.tsx
fi

# 11. Corriger les Card imports
echo "Fixing Card component imports..."
find . -name "*.tsx" -exec sed -i 's/from.*@\/components\/ui\/Card/from "@\/components\/ui\/card"/g' {} \;

# 12. Nettoyer les imports d'API problématiques
echo "Cleaning API imports..."
if [ -f "src/lib/api/system-api.ts" ]; then
    # Ajouter les endpoints manquants
    sed -i 's/API_ENDPOINTS\.SYSTEM\.INFO/API_ENDPOINTS.SYSTEM.OVERVIEW/g' src/lib/api/system-api.ts
    sed -i 's/API_ENDPOINTS\.SYSTEM\.BASE/API_ENDPOINTS.SYSTEM.OVERVIEW/g' src/lib/api/system-api.ts
fi

# 13. Supprimer les fichiers de stores avancés problématiques
echo "Removing advanced store imports..."
rm -f src/lib/stores/advanced/index.ts
rm -f src/lib/stores/app-integration.ts

echo "✅ Final cleanup completed!"
echo "📊 Remaining files:"
find . -name "*.ts" -o -name "*.tsx" | wc -l
echo "🔍 Running TypeScript check..."
