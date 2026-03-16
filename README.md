# Générateur de prompts pédagogiques — NSI & Mathématiques
 
> Application HTML autonome pour enseignants de lycée. Génère des prompts structurés pour produire des ressources pédagogiques conformes aux programmes officiels français (BO 2019-2026) à l'aide d'une IA générative.
 
**Développé par DarkSATHI Li · Lycée Antoine Watteau**
 
---
 
## Fonctionnalités
 
- **2 disciplines** — NSI (Première, Terminale, BTS SIO) et Mathématiques (Seconde, Première, Terminale, Maths Expertes)
- **Conformité BO 2019-2026** — 24 chapitres NSI et 28 chapitres Maths référencés avec notions et prérequis exacts
- **8 types de ressources** — TP guidé, Cours interactif, Activité découverte, Évaluation, Fiche de révision, Projet, Devoir Maison, Investigation
- **Compétences officielles** — 6 compétences NSI (A/C/I/T/D/Cm) et 6 compétences Maths (Ch/Mo/Re/Ra/Ca/Cm)
- **Différenciation pédagogique** — 3 niveaux (Guidé / Attendu / Expert)
- **Export LaTeX** — template compilable LuaLaTeX, A4 paysage 2 colonnes, polices Iwona/Latin Modern/Libertine
- **Évaluation IA** — analyse du prompt via Groq (clé gratuite) avec suggestions ciblées
- **Bibliothèque locale illimitée** — sauvegarde, nommage et rechargement des prompts
- **Thème clair / sombre** — conforme WCAG AA, optimisé vidéoprojecteur en classe
 
---
 
## Utilisation
 
**Aucune installation.** Ouvrir directement dans un navigateur :
 
```
generateur-nsi-maths.html
```
 
Ou accéder en ligne : **[lien à compléter]**
 
### Workflow en 3 étapes
 
```
1. Construire  →  Choisir discipline, type, niveau, chapitre
                  Remplir les sections (compétences, structure, contraintes…)
 
2. Aperçu & IA →  Relire le prompt généré
                  Évaluation optionnelle via Groq (clé gratuite sur console.groq.com)
 
3. Exporter    →  Copier le prompt ou télécharger en .txt
                  Coller dans Claude, ChatGPT, Mistral ou Gemini
                  → Ressource pédagogique complète générée par l'IA
```
 
---
 
## Prérequis
 
| Élément | Détail |
|---------|--------|
| Navigateur | Chrome, Firefox ou Edge (version récente) |
| Serveur | Aucun — fichier HTML statique autonome |
| Évaluation IA | Clé API Groq gratuite (`gsk_...`) sur [console.groq.com](https://console.groq.com) |
| Export LaTeX | LuaLaTeX installé localement (`texlive-full` ou MiKTeX) |
 
---
 
## Programmes officiels couverts
 
### NSI
 
| Niveau | Chapitres |
|--------|-----------|
| **Terminale** | Structures de données · BDD relationnelles · Architectures · Systèmes d'exploitation · Réseaux · Langages & POO · Algorithmique avancée · IHM Web |
| **Première** | Représentation des données · Traitement de données · Interactions Web · Architecture & OS · Langages & types construits · Algorithmique |
| **BTS SIO** | Développement Python/Web · Bases de données avancées · Réseaux & sécurité |
 
### Mathématiques
 
| Niveau | Chapitres |
|--------|-----------|
| **Terminale** | Suites · Limites & continuité · Dérivation avancée · Intégrales · Log & exponentielle · Probabilités · Géométrie 3D · Trigonométrie · Combinatoire |
| **Première** | Second degré · Dérivation · Trigonométrie · Suites · Exponentielle & ln · Probabilités · Géométrie plane |
| **Seconde** | Fonctions · Statistiques · Probabilités · Géométrie analytique · Algorithmique Python |
| **Maths Expertes** | Nombres complexes · Arithmétique · Matrices |
 
---
 
## Confidentialité
 
- **Aucune donnée n'est envoyée au serveur** hébergeant ce fichier
- Les prompts générés et la bibliothèque de sauvegarde restent dans le `localStorage` du navigateur de l'utilisateur
- Les clés API Groq sont saisies localement et ne transitent que directement vers `api.groq.com` depuis le navigateur de l'utilisateur
- Ce dépôt ne contient aucun tracker, aucune analytics, aucun cookie
 
> La bibliothèque de prompts est liée au navigateur et à la machine. Exporter les prompts importants en `.txt` (étape 3) pour les conserver durablement.
 
---
 
## Déploiement
 
### Serveur web statique (Apache, Nginx, ENT)
 
```bash
# Copier le fichier dans le répertoire web
cp generateur-nsi-maths.html /var/www/html/
 
# Accès : https://votre-serveur.fr/generateur-nsi-maths.html
```
 
Aucune configuration serveur spécifique requise.
 
### GitHub Pages
 
```
Settings → Pages → Deploy from branch → main → / (root)
```
 
### Netlify Drop
 
Glisser-déposer le fichier sur [app.netlify.com/drop](https://app.netlify.com/drop) → URL HTTPS publique en 30 secondes.
 
---
 
## Export LaTeX
 
Le bouton **Export LaTeX** génère un fichier `.tex` compilable avec :
 
```bash
lualatex -synctex=1 -interaction=nonstopmode document.tex
```
 
**Packages requis :** `amsmath` · `geometry` · `enumitem` · `xcolor[dvipsnames]` · `mdframed` · `fancyhdr` · `iwona` (optionnel)
 
**Formats disponibles :** A4 paysage 2 colonnes · A4 portrait · A4 paysage 1 colonne
 
---
 
## Problèmes connus
 
**`message channel closed before a response was received`**
Cette erreur provient d'une extension de navigateur (uBlock Origin, Grammarly, AdBlock…) qui intercepte les requêtes vers `api.groq.com`.
**Solution :** utiliser le fichier en mode Incognito (`Ctrl+Shift+N`) où les extensions sont désactivées par défaut.
 
**Polices non chargées**
Si le réseau bloque Google Fonts, les polices de secours (Georgia, monospace) sont utilisées automatiquement. L'outil reste entièrement fonctionnel.
 
---
 
## Licence
 
Usage pédagogique libre. Aucune restriction pour un usage en établissement scolaire.
Merci de conserver la mention `DarkSATHI Li · Lycée Antoine Watteau` dans le pied de page.
 
---
 
*Dernière mise à jour : mars 2026 — Conforme BO NSI et Mathématiques 2019-2026*
