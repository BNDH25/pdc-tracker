#!/usr/bin/env bash
# Verification de confidentialite : motifs generiques uniquement.
# A lancer a la racine du depot, avec l'historique complet.
set -u
tmp=$(mktemp)
erreurs=0
alerte() { echo "ALERTE: $*"; erreurs=$((erreurs + 1)); }

# Adresses autorisees (generiques, non personnelles)
autorise='^([0-9]+\+[A-Za-z0-9-]+@users\.noreply\.github\.com|noreply@github\.com|noreply@anthropic\.com)$'
motif_email='[A-Za-z0-9._%+-]{2,}@[A-Za-z0-9-]{2,}(\.[A-Za-z0-9-]+)*\.[a-z]{2,}'
motif_tel='(\+33|0033)[ .-]?[1-9]([ .-]?[0-9]{2}){4}|(^|[^0-9])0[1-9]([ .-]?[0-9]{2}){4}([^0-9]|$)'

echo "1. E-mails dans les fichiers actuels (texte et binaires)"
while IFS= read -r -d '' f; do
  grep -a -o -E "$motif_email" -- "$f" | grep -v -E "$autorise" | sort -u | while read -r e; do
    echo "ALERTE: e-mail dans $f : $e"
  done
done < <(git ls-files -z)
n=$(git ls-files -z | xargs -0 grep -a -o -h -E "$motif_email" 2>/dev/null | grep -v -c -E "$autorise")
[ "$n" -gt 0 ] && erreurs=$((erreurs + n))

echo "2. Numeros de telephone dans les fichiers texte actuels"
if git grep -I -n -E "$motif_tel" >"$tmp" 2>/dev/null; then
  cat "$tmp"; alerte "numero de telephone possible"
fi

echo "3. Fichiers sensibles presents (y compris ajoutes via le site GitHub)"
sensibles='(^|/)(\.env(\..*)?|.*\.(pem|key|p12|pfx)|id_rsa.*|id_ed25519.*)$|^[^/]+\.(json|pdf)$'
git ls-files | grep -E "$sensibles" | while read -r f; do echo "ALERTE: fichier sensible : $f"; done
n=$(git ls-files | grep -c -E "$sensibles"); [ "$n" -gt 0 ] && erreurs=$((erreurs + n))

echo "4. Identites des commits (auteur et commiteur)"
n=0
while read -r e; do
  if ! echo "$e" | grep -q -E "$autorise"; then echo "ALERTE: identite de commit : $e"; n=$((n + 1)); fi
done < <(git log --all --format='%ae%n%ce' | sort -u)
erreurs=$((erreurs + n))

echo "5. E-mails dans tout l'historique (messages et contenus)"
n=0
while read -r e; do
  echo "ALERTE: e-mail dans l'historique : $e"; n=$((n + 1))
done < <(git log --all -p -a --format='%B' | grep -a -o -E "$motif_email" | sort -u | grep -v -E "$autorise")
erreurs=$((erreurs + n))

echo "6. Fichiers sensibles dans tout l'historique"
n=0
while read -r f; do
  echo "ALERTE: fichier sensible dans l'historique : $f"; n=$((n + 1))
done < <(git log --all --name-only --format= | sort -u | grep -E "$sensibles")
erreurs=$((erreurs + n))

if [ "$erreurs" -gt 0 ]; then echo "ECHEC : $erreurs alerte(s)."; exit 1; fi
echo "OK : aucune donnee personnelle detectee."
