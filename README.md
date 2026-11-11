# PDC Tracker

App web (PWA) de suivi quotidien : objectifs du « pattern », musculation, gainage, course, poids, minuteur de repos et bilans.
Tout fonctionne hors ligne, sans serveur, sans bibliothèque externe : les données restent sur le téléphone (stockage local + copies internes).

## Plan des fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Coquille de la page : en-tête, onglets, politique de sécurité (CSP), ordre de chargement des scripts |
| `css/style.css` | Tous les styles (thèmes clair/sombre, composants, bilan, barre d'onglets) |
| `js/config.js` | Anti-cadre, liste des objectifs (`OBJ`), exercices (`EX`), date de départ (`START`), clés de stockage, `esc()` |
| `js/dates.js` | Dates et formats : `key()`, `fromKey()`, `addDays()`, `today0()`, `fmtPace()`, `fmtMin()` |
| `js/stockage.js` | Lecture/écriture locale protégée : `load()`, `normDB()` (contrôle champ par champ), `save()`, `getDay()`, `syncSport()` |
| `js/sauvegarde.js` | Copies internes IndexedDB (`snapPut`), export JSON + PDF (`doExport`), restauration (`checkBackup`, `replaceData`), fenêtre `ask()` |
| `js/etat.js` | État de l'écran (`cur`, `tab`, `period`…) et logique : `streak()`, `bestEver()` |
| `js/chronos.js` | Chrono de gainage (`pk…`) et minuteur de repos (`mn…`, alerte de fin, son, vibration), écran `vMinuteur()` |
| `js/saisie.js` | Brouillons course/poids (`dC`, `dP`), steppers `ST` / `stepper()` / `bump()` avec appui long |
| `js/vues.js` | Rendu : `render()`, `vObj()` (Pattern), `vSport()` → `vMuscu()`, `vGainage()`, `vCourse()`, `vPoids()` |
| `js/bilan.js` | Bilan : `stats()`, graphiques `bars()` / `wChart()`, récapitulatifs, analyses `analyse()` / `anaView()`, `vBilan()` |
| `js/actions.js` | Toutes les actions des boutons (`actions` via `data-a`), import d'un fichier de sauvegarde |
| `js/pdf.js` | Générateur PDF intégré : `newPDF()`, `buildPDF()` |
| `js/demarrage.js` | Démarrage : minuteries, copie quotidienne, enregistrement du service worker |
| `sw.js` | Mode hors ligne (liste `LOCAL` des fichiers gardés, `VERSION` du cache) |
| `.github/verif-confidentialite.sh` | Contrôle automatique : aucune donnée personnelle dans le dépôt |
| `.github/verif-structure.sh` | Contrôle automatique : fichiers js/css présents, appelés et gardés hors ligne |

## Règles à respecter lors d'une modification

1. Les fichiers `js/` sont des scripts classiques qui partagent la même portée globale : **l'ordre de chargement dans `index.html` compte**. Un fichier ne doit exécuter au chargement que du code défini dans les fichiers précédents ; le lancement de l'app reste dans `js/demarrage.js`, chargé en dernier.
2. Nouveau fichier `js/` ou `css/` : l'ajouter dans `index.html` **et** dans la liste `LOCAL` de `sw.js`.
3. À chaque mise à jour : augmenter `VERSION` dans `sw.js`.
4. Sécurité : aucun script ni attribut `on…=` dans `index.html` (la CSP les bloque) ; aucune ressource extérieure ; toute donnée chargée passe par `normDB()` ; tout texte variable inséré dans le HTML passe par `esc()`.
5. Adresse : l'app est publiée sur `https://bndh25.github.io/pdc-tracker/` et sa CSP n'autorise que ce dossier. Elle ne se charge donc pas ailleurs (ni en local) sans adapter la CSP de `index.html`.
   **Ne publier aucun autre projet sur `bndh25.github.io`** (GitHub Pages d'un autre dépôt de ce compte) : il partagerait les données stockées de l'app. Publier les autres projets depuis un autre compte ou une organisation GitHub.
6. Avant de pousser : `bash .github/verif-structure.sh` et `bash .github/verif-confidentialite.sh` (lancés aussi automatiquement à chaque push).
