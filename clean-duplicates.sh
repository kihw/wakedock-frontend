#!/bin/bash

# Nettoyage final des doublons d'imports
echo "🔧 Cleaning duplicate imports..."

cd /Docker/code/wakedock-env/wakedock-frontend

# Fonction pour nettoyer les doublons dans un fichier
clean_duplicates() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "Cleaning $file..."
        # Créer un fichier temporaire avec imports uniques
        python3 -c "
import re
import sys

with open('$file', 'r') as f:
    content = f.read()

# Trouver le bloc d'imports entre { et }
import_pattern = r'import\s*\{([^}]+)\}\s*from\s*[\'\"](lucide-react)[\'\"]'
matches = re.findall(import_pattern, content)

if matches:
    imports_str = matches[0]
    imports = [imp.strip().rstrip(',') for imp in imports_str.split(',')]
    unique_imports = []
    seen = set()
    
    for imp in imports:
        if imp and imp not in seen:
            unique_imports.append(imp)
            seen.add(imp)
    
    new_imports = ',\\n  '.join(unique_imports)
    new_import_block = f'import {{\\n  {new_imports}\\n}} from \"lucide-react\"'
    
    # Remplacer l'ancien bloc d'imports
    content = re.sub(import_pattern, new_import_block, content)
    
    with open('$file', 'w') as f:
        f.write(content)
    print(f'Cleaned {len(imports) - len(unique_imports)} duplicates from $file')
"
    fi
}

# Nettoyer tous les fichiers avec des imports lucide-react
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "from.*lucide-react" "$file"; then
        clean_duplicates "$file"
    fi
done

echo "✅ Duplicates cleaning completed!"
