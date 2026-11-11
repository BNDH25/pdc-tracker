#!/usr/bin/env bash
# Verification de structure : l'app doit rester complete hors ligne et sans script dans la page.
# A lancer a la racine du depot.
set -u
erreurs=0
alerte() { echo "ALERTE: $*"; erreurs=$((erreurs + 1)); }

echo "1. Aucun script ecrit directement dans index.html (la politique de securite les bloquerait)"
if grep -n -E '<script( [^>]*)?>[^<]' index.html | grep -v 'src=' ; then alerte "script integre dans index.html"; fi
if grep -n -i -E ' on[a-z]+=' index.html; then alerte "attribut on...= dans index.html"; fi

echo "2. Chaque fichier js/ et css/ appele par index.html existe et est garde hors ligne par sw.js"
for f in $(grep -o -E '(src|href)="(js|css)/[^"]+"' index.html | sed -E 's/^[a-z]+="//; s/"$//'); do
  [ -f "$f" ] || alerte "fichier manquant : $f"
  grep -q "'$f'" sw.js || alerte "$f absent de la liste LOCAL de sw.js"
done

echo "3. Chaque fichier de js/ et css/ est bien appele par index.html"
for f in js/*.js css/*.css; do
  [ -e "$f" ] || continue
  grep -q "\"$f\"" index.html || alerte "$f n'est pas appele par index.html"
done

echo "4. Chaque fichier garde hors ligne par sw.js existe"
for f in $(grep -o -E "'[^']+'" sw.js | tr -d "'" | grep -E '\.(html|css|js|png|woff|webmanifest)$'); do
  [ -f "$f" ] || alerte "sw.js reference un fichier absent : $f"
done

if [ "$erreurs" -gt 0 ]; then echo "ECHEC : $erreurs alerte(s)."; exit 1; fi
echo "OK : structure coherente."
