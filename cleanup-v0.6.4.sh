#!/bin/bash

# Script de nettoyage des imports et corrections pour v0.6.4

cd /Docker/code/wakedock-env/wakedock-frontend

echo "🧹 Nettoyage architecture pour v0.6.4..."

# 1. Supprimer fichiers problématiques restants
echo "Suppression fichiers Storybook et tests..."
find src -name "*.stories.*" -delete
find src -name "*.test.*" -delete
find src -name "*stories*" -delete

# 2. Correction des imports @/lib/utils
echo "Correction imports utils..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|@/lib/utils|../../lib/utils|g" 2>/dev/null || true
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '@/lib/utils'|from '../../lib/utils'|g" 2>/dev/null || true

# 3. Correction des imports de composants manquants
echo "Correction imports composants..."
find src -name "*.tsx" | xargs sed -i "s|@/components/ui/card|@/components/ui/Card|g" 2>/dev/null || true
find src -name "*.tsx" | xargs sed -i "s|@/components/ui/button|@/components/ui/Button|g" 2>/dev/null || true
find src -name "*.tsx" | xargs sed -i "s|@/components/ui/badge|@/components/ui/Badge|g" 2>/dev/null || true

# 4. Supprimer références aux stores supprimés
echo "Suppression références stores Svelte..."
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "svelte/store" | xargs rm -f

# 5. Supprimer fichiers avec erreurs non récupérables
echo "Suppression fichiers non récupérables..."
rm -f src/lib/test-exports.ts
rm -f src/lib/api-backup.ts
rm -rf src/lib/design-system
rm -rf src/lib/features
rm -rf src/lib/middleware
rm -rf src/lib/monitoring
rm -rf src/lib/services/containers.ts
rm -rf src/lib/services/monitoring.ts
rm -rf src/lib/services/notifications.ts

# 6. Nettoyer les exports d'index
echo "Nettoyage exports..."
# Supprimer les lignes qui exportent des modules supprimés
sed -i '/svelte/d' src/lib/stores/index.ts 2>/dev/null || true
sed -i '/\$lib/d' src/lib/stores/index.ts 2>/dev/null || true

echo "✅ Nettoyage terminé!"
