/* ============================================================
   NSI PROMPT FORGE v4 — Application principale
   ES2020+ · Vanilla JS · Aucune dépendance externe
   ============================================================ */

'use strict';

/* ============================================================
   ÉTAT GLOBAL
   ============================================================ */
const STATE = {
  profil: '',       // 'expert' | 'debutant' | 'inspecteur' | 'eleve'
  disc: '',         // 'nsi' | 'math' | 'autre'
  bloom: '',        // 'N1'..'N6'
  prompt: '',
  boTexteExtrait: '',
  version: 4
};

/* ============================================================
   TAXONOMIE DE BLOOM — 6 niveaux nommés
   ============================================================ */
const BLOOM = [
  {
    id: 'N1', niveau: 'Niveau 1', nom: 'Mémoriser',
    verbes: 'Citer, définir, identifier, lister, nommer, rappeler',
    desc: "L'élève restitue des connaissances mémorisées sans les transformer.",
    color: 1
  },
  {
    id: 'N2', niveau: 'Niveau 2', nom: 'Comprendre',
    verbes: 'Expliquer, décrire, résumer, paraphraser, illustrer',
    desc: "L'élève reformule et explique le sens des connaissances.",
    color: 2
  },
  {
    id: 'N3', niveau: 'Niveau 3', nom: 'Appliquer',
    verbes: 'Calculer, exécuter, résoudre, utiliser, implémenter',
    desc: "L'élève utilise une procédure dans une situation donnée.",
    color: 3
  },
  {
    id: 'N4', niveau: 'Niveau 4', nom: 'Analyser',
    verbes: 'Comparer, distinguer, décomposer, structurer, raisonner',
    desc: "L'élève décompose un problème pour en comprendre la structure.",
    color: 4
  },
  {
    id: 'N5', niveau: 'Niveau 5', nom: 'Évaluer',
    verbes: 'Critiquer, justifier, argumenter, valider, sélectionner',
    desc: "L'élève porte un jugement fondé sur des critères explicites.",
    color: 5
  },
  {
    id: 'N6', niveau: 'Niveau 6', nom: 'Créer',
    verbes: 'Concevoir, produire, planifier, élaborer, inventer',
    desc: "L'élève assemble des éléments pour produire quelque chose de nouveau.",
    color: 6
  }
];

/* ============================================================
   THÈME SOMBRE / CLAIR
   ============================================================ */
function toggleTheme() {
  const light = document.body.classList.toggle('light');
  localStorage.setItem('pfv4_theme', light ? 'light' : 'dark');
  const btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = light ? '☽' : '☀';
}

function initTheme() {
  const saved = localStorage.getItem('pfv4_theme');
  if (saved === 'light') document.body.classList.add('light');
  const btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = document.body.classList.contains('light') ? '☽' : '☀';
}

/* ============================================================
   SÉLECTION DU PROFIL
   ============================================================ */
function choisirProfil(p) {
  STATE.profil = p;
  localStorage.setItem('pfv4_profil', p);

  document.body.className = document.body.className
    .replace(/\bprofil-\w+\b/g, '').trim();
  document.body.classList.add(`profil-${p}`);

  document.getElementById('profil-screen').style.display = 'none';
  document.getElementById('app-shell').style.display = 'block';

  const labels = {
    expert:     { txt: 'Enseignant expert',   color: 'var(--bleu-lt)',   bg: 'rgba(91,141,184,.12)'  },
    debutant:   { txt: 'Enseignant débutant', color: 'var(--vert-lt)',   bg: 'rgba(61,158,95,.12)'   },
    inspecteur: { txt: 'Inspecteur / Cadre',  color: 'var(--or-lt)',     bg: 'rgba(197,150,58,.12)'  },
    eleve:      { txt: 'Élève',               color: 'var(--violet-lt)', bg: 'rgba(130,100,200,.12)' }
  };

  const badge = document.getElementById('profil-badge-header');
  if (badge && labels[p]) {
    badge.textContent = labels[p].txt;
    badge.style.color = labels[p].color;
    badge.style.background = labels[p].bg;
    badge.style.borderColor = labels[p].color;
  }

  // Mode élève → page dédiée
  if (p === 'eleve') {
    allerVersPageEleve();
  }

  // Adapter le registre selon le profil
  adapterRegistre();
}

function adapterRegistre() {
  // En mode inspecteur : vouvoyer dans les encarts
  const textes = document.querySelectorAll('.tutoie');
  textes.forEach(el => {
    if (STATE.profil === 'inspecteur') {
      el.textContent = el.getAttribute('data-vous') || el.textContent;
    } else {
      el.textContent = el.getAttribute('data-tu') || el.textContent;
    }
  });
}

/* ============================================================
   GÉNÉRATION DES CARTES BLOOM
   ============================================================ */
function genererCartesBlooom() {
  const container = document.getElementById('bloom-cards');
  if (!container) return;
  container.innerHTML = '';

  BLOOM.forEach(b => {
    const card = document.createElement('div');
    card.className = `bloom-card bloom-${b.color}`;
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', 'false');
    card.setAttribute('tabindex', '0');
    card.dataset.id = b.id;
    card.innerHTML = `
      <div class="bloom-level">${b.niveau}</div>
      <div class="bloom-name">${b.nom}</div>
      <div class="bloom-verbs">${b.verbes}</div>
    `;
    card.addEventListener('click', () => selectionnerBloom(b.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectionnerBloom(b.id);
      }
    });
    container.appendChild(card);
  });
}

function selectionnerBloom(id) {
  STATE.bloom = id;
  document.querySelectorAll('.bloom-card').forEach(c => {
    const sel = c.dataset.id === id;
    c.classList.toggle('selected', sel);
    c.setAttribute('aria-checked', sel ? 'true' : 'false');
  });
}

/* ============================================================
   DISCIPLINE
   ============================================================ */
function choisirDisc(d) {
  STATE.disc = d;

  ['nsi','math','autre'].forEach(x => {
    const card = document.getElementById(`card-${x}`);
    if (card) {
      card.className = `disc-card${d === x ? ` selected-${x}` : ''}`;
    }
  });

  // Sections spécifiques
  const nsi   = ['ctx-nsi',  'sec-exo-nsi',  'sec-tech-nsi',  'bo-nsi',  'champ-langue-py', 'conseil-nsi'];
  const math  = ['ctx-math', 'sec-exo-math', 'sec-tech-math', 'bo-math', 'conseil-math'];
  const autre = ['ctx-autre', 'sec-tech-autre'];

  nsi.forEach(id   => togHidden(id, d !== 'nsi'));
  math.forEach(id  => togHidden(id, d !== 'math'));
  autre.forEach(id => togHidden(id, d !== 'autre'));

  // Niveau par défaut
  const selNiv = document.getElementById('niveau');
  if (selNiv) {
    if (d === 'nsi')   selNiv.value = 'Terminale NSI';
    if (d === 'math')  selNiv.value = 'Terminale Maths spécialité';
    if (d === 'autre') selNiv.value = 'Terminale';
  }

  if (d === 'nsi')  preRemplirNsi();
  if (d === 'math') preRemplirMath();

  genererRappelsAuto();
  sauvegarder();
}

function togHidden(id, hidden) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden', hidden);
}

/* ============================================================
   VALEURS PRÉ-REMPLIES
   ============================================================ */
function preRemplirNsi() {
  set('theme', 'Programmation dynamique');
  set('sous-titre', 'De la récursion naïve à la solution optimale');
  set('prerequis', 'Récursivité en Python, listes, dictionnaires, fonctions, POO, arbres, graphes');
  set('profil', "Une partie des élèves n'a pas de spécialité mathématiques. Tous les exemples doivent être concrets et accessibles (jeux, vie quotidienne). Les élèves n'ont jamais entendu parler du thème avant ce TP.");
  set('sections', `1. Introduction — Part d'une situation concrète (rendu de monnaie 6€). Fait ressentir le problème AVANT de le nommer. Vocabulaire technique interdit sauf encadré final « Vocabulaire ».
2. Cours 1 — Mémoïsation (approche descendante) : reprend là où l'intro s'est arrêtée, cache dictionnaire, @lru_cache, comparaison naïf vs cache.
3. Exercice 1 — Escalier (1 ou 2 marches) : mise en situation narrative, mémoïsation appliquée, fonction de test pré-écrite.
4. Cours 2 — Approche tabulaire (ascendante) : sans récursion, table remplie à la main puis en Python.
5. Exercice 2 — Sac à dos 0/1 avec objets concrets nommés.
6. Cours 3 — Comparaison mémoïsation vs tabulaire : tableau comparatif, deux conditions nécessaires.
7. Exercice 3 — Rendu de monnaie pièces 1/3/4 : deux approches + décomposition.
8. Synthèse — Chemin optimal dans une grille (robot droite/bas).`);
  set('principe', "Chaque concept est illustré par un exemple concret avant d'être nommé. L'élève ressent le problème avant de recevoir la solution. Un concept nouveau maximum par paragraphe. Ton oral, tutoiement, questions rhétoriques.");
  set('vocab-interdit', 'mémoïsation, sous-problème, récurrence, DP, programmation dynamique, récursion naïve, approche descendante, approche ascendante, tabulaire');
  set('objectifs', "À l'issue de ce TP, l'élève sera capable de concevoir et implémenter un algorithme de programmation dynamique (mémoïsation et approche tabulaire) pour résoudre un problème d'optimisation, et d'expliquer pourquoi cette approche est plus efficace que la récursion naïve.");
  selectionnerBloom('N3');
}

function preRemplirMath() {
  set('theme', 'Suites numériques');
  set('sous-titre', 'Limites, monotonie et convergence');
  set('prerequis', 'Calcul algébrique, fonctions de référence, notion intuitive de limite vue en Première');
  set('profil', "Classe de Terminale spécialité Maths. Niveau moyen. Quelques élèves envisagent une CPGE, la majorité vise une licence.");
  set('sections', `1. Rappels et définitions — Définition formelle de la limite d'une suite, exemples de suites classiques.
2. Exercices d'application directe — Calculer des limites de suites simples, déterminer le sens de variation.
3. Théorèmes de convergence — Théorème des suites monotones bornées, théorème des gendarmes. Démonstrations attendues.
4. Exercices intermédiaires — Prouver la convergence d'une suite par les théorèmes.
5. Synthèse — Problème ouvert combinant plusieurs notions : suite définie par récurrence, étude de monotonie, convergence.`);
  set('principe', "Chaque théorème est introduit par un exemple numérique avant d'être énoncé formellement. Les démonstrations sont guidées étape par étape.");
  set('objectifs', "À l'issue de cette séquence, l'élève sera capable de déterminer si une suite est convergente, calculer sa limite le cas échéant, et rédiger une démonstration rigoureuse.");
  set('savoirs-maths', "Définition d'une suite convergente, limite finie, limite infinie. Théorème des suites monotones bornées. Théorème des gendarmes.");
  set('savoir-faire-maths', "Calculer la limite d'une suite par les opérations sur les limites. Démontrer qu'une suite est croissante par récurrence. Utiliser le théorème des gendarmes.");
  selectionnerBloom('N4');
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function g(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function ck(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

/* ============================================================
   RAPPELS AUTO-GÉNÉRÉS
   ============================================================ */
function genererRappelsAuto() {
  const rappelsNsi = [
    '1. Chaque fonction Python est suivie d\'une fonction test_ avec minimum 3 assertions et print("Les tests sont validés.").',
    '2. Aucun attribut id ou class HTML ne contient d\'accent ou de caractère non-ASCII.',
    '3. L\'introduction n\'utilise aucun terme technique interdit sauf dans l\'encadré final « Vocabulaire ».',
    '4. Toutes les capacités BO cochées sont couvertes par au moins un exercice ou une section de cours.',
    '5. PyScript version 2026.3.1 exclusivement — URL exacte : https://pyscript.net/releases/2026.3.1/core.js'
  ];
  const rappelsMath = [
    '1. Toutes les notations mathématiques respectent strictement les conventions officielles du BO.',
    '2. Le fichier .tex produit est compilable sans fichier externe en une seule passe.',
    '3. hyperref est chargé EN DERNIER dans le préambule — ordre des packages impératif.',
    '4. Toutes les compétences mathématiques cochées sont mobilisées dans au moins un exercice.',
    '5. Aucun placeholder % TODO ni section vide dans le document produit.'
  ];
  const rappelsAutre = [
    '1. La ressource respecte le programme officiel de la discipline.',
    '2. Les objectifs opérationnels sont formulés avec des verbes d\'action mesurables.',
    '3. Chaque exercice est adapté au niveau et aux pré-requis des élèves.',
    '4. Le ton et le registre sont adaptés à l\'audience cible.',
    '5. La ressource est autonome et utilisable sans fichier externe.'
  ];

  const champ = document.getElementById('rappels');
  if (!champ) return;
  if (champ.value.trim() && champ.dataset.autoGenerated !== 'true') return;

  let rappels = rappelsAutre;
  if (STATE.disc === 'math') rappels = rappelsMath;
  if (STATE.disc === 'nsi')  rappels = rappelsNsi;

  champ.value = rappels.join('\n');
  champ.dataset.autoGenerated = 'true';
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function allerPage(n) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page${n}`);
  if (page) page.classList.add('active');

  ['1','2','3'].forEach(i => {
    const el = document.getElementById(`st${i}`);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (+i < n)  el.classList.add('done');
    if (+i === n) el.classList.add('active');

    // Couleur selon discipline
    if (+i === n) {
      el.classList.toggle('disc-math',  STATE.disc === 'math');
      el.classList.toggle('disc-autre', STATE.disc === 'autre');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function allerPage1() { allerPage(1); }

function allerPage2() {
  if (!validerP1()) return;
  STATE.prompt = construirePrompt();
  afficherApercu();
  allerPage(2);
}

function allerPage3() {
  STATE.prompt = STATE.prompt || construirePrompt();
  const el = document.getElementById('apercu-final');
  if (el) el.textContent = STATE.prompt;
  afficherCQ();
  allerPage(3);
}

function allerVersPageEleve() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-eleve');
  if (page) page.classList.add('active');
  document.getElementById('stepper').style.display = 'none';
}

/* ============================================================
   VALIDATION PAGE 1
   ============================================================ */
function validerP1() {
  let ok = true;

  if (!STATE.disc) {
    ['card-nsi','card-math','card-autre'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.border = '2px solid var(--rouge)';
    });
    ok = false;
  }

  ['theme', 'prerequis', 'sections', 'principe'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.style.borderColor = 'var(--rouge)';
      ok = false;
    } else {
      el.style.borderColor = '';
    }
  });

  const err = document.getElementById('err-p1');
  if (err) err.classList.toggle('visible', !ok);
  return ok;
}

/* ============================================================
   CONSTRUCTION DU PROMPT — incluant Bloom
   ============================================================ */
function construirePrompt() {
  let p = '';
  const isMath  = STATE.disc === 'math';
  const isNsi   = STATE.disc === 'nsi';
  const isAutre = STATE.disc === 'autre';

  const niveau     = g('niveau');
  const typeRes    = g('type-res');
  const numRes     = g('num-res');
  const theme      = g('theme');
  const sousTitre  = g('sous-titre');
  const prerequis  = g('prerequis');
  const profil     = g('profil');
  const objectifs  = g('objectifs');
  const sections   = g('sections');
  const principe   = g('principe');
  const vocabInter = g('vocab-interdit');
  const typo       = g('typographie');
  const ton        = g('ton');
  const piedPage   = g('pied-page');
  const rappels    = g('rappels');
  const autoVerif  = g('auto-verif');

  // Niveau taxonomique Bloom
  const bloomData = BLOOM.find(b => b.id === STATE.bloom);
  const bloomStr  = bloomData
    ? `Niveau taxonomique visé (Bloom révisé) : ${bloomData.id} — ${bloomData.nom}\nVerbes d'action à privilégier : ${bloomData.verbes}\nDescription : ${bloomData.desc}`
    : '';

  // Différenciation pédagogique
  const diffAcc = Array.from(document.querySelectorAll('#diff-tags input:checked'))
    .map(el => el.value).join(', ');

  // Position dans la séquence
  const posSeq     = g('pos-sequence');
  const lienEval   = g('lien-evaluation');
  const referentiel = g('referentiel');

  // ---- RÔLE ET CONTEXTE ----
  p += '## RÔLE ET CONTEXTE\n\n';

  if (isMath) {
    const themeBo = g('theme-bo-math');
    p += `Tu es un professeur de Mathématiques au lycée, spécialisé dans la conception de ressources pédagogiques conformes aux programmes officiels de l'Éducation nationale française.\n`;
    p += `Tu maîtrises parfaitement le Bulletin Officiel Mathématiques (spécialité Terminale, arrêté du 17 juillet 2019 modifié en 2020).\n`;
    p += `Tu as une expérience de la correction d'épreuves de baccalauréat et tu sais calibrer la difficulté et la rigueur en fonction des attendus officiels.\n`;
    p += `Ta ressource porte sur le thème : **${theme}**`;
    if (sousTitre) p += ` — ${sousTitre}`;
    p += `.\n`;
    p += `Thème du programme officiel concerné : ${themeBo}\n`;
  } else if (isNsi) {
    const themeBo = g('theme-bo-nsi');
    p += `Tu es un professeur de NSI (Numérique et Sciences Informatiques) au lycée, expert en conception de ressources pédagogiques interactives sous forme de pages HTML autonomes.\n`;
    p += `Tu maîtrises parfaitement le Bulletin Officiel NSI (arrêtés du 19 juillet 2019 pour la Première et du 17 juillet 2019 pour la Terminale).\n`;
    p += `Ton objectif est de produire un ${typeRes} complet et progressif sur le thème : **${theme}**`;
    if (sousTitre) p += ` — ${sousTitre}`;
    p += `.\n`;
    p += `Thème du programme officiel concerné : ${themeBo}\n`;
  } else {
    const discAutre = g('disc-autre-nom') || 'autre discipline';
    p += `Tu es un professeur de ${discAutre} au lycée, spécialisé dans la conception de ressources pédagogiques.\n`;
    p += `Ta ressource porte sur le thème : **${theme}**`;
    if (sousTitre) p += ` — ${sousTitre}`;
    p += `.\n`;
    if (g('bo-autre')) p += `Programme de référence : ${g('bo-autre')}\n`;
  }

  if (numRes) p += `Numéro de ressource : ${numRes}\n`;
  if (posSeq) p += `Position dans la séquence pédagogique : ${posSeq}\n`;
  if (lienEval) p += `Lien avec l'évaluation sommative : ${lienEval}\n`;
  if (referentiel) p += `Référentiel institutionnel : ${referentiel}\n`;
  p += '\n---\n\n';

  // ---- NIVEAU TAXONOMIQUE (BLOOM) ----
  if (bloomStr) {
    p += '## NIVEAU TAXONOMIQUE VISÉ (BLOOM RÉVISÉ)\n\n';
    p += `[OBLIGATOIRE] ${bloomStr}\n`;
    p += '\nToutes les questions, activités et exercices de la ressource doivent viser ce niveau taxonomique. ';
    p += `Utiliser prioritairement des verbes d'action du niveau ${bloomData.nom}. `;
    p += `Ne pas descendre en dessous du niveau ${bloomData.id === 'N1' ? 'N1' : 'N' + (parseInt(bloomData.id[1]) - 1)} sauf dans les rappels.\n`;
    p += '\n---\n\n';
  }

  // ---- PROFIL DES ÉLÈVES ----
  p += '## PROFIL DES ÉLÈVES\n\n';
  p += `- Niveau : ${niveau}\n`;
  p += `- Pré-requis validés : ${prerequis}\n`;
  if (isNsi) {
    p += `- Langage de programmation : ${g('langage')}\n`;
    p += `- Environnement d'exécution : ${g('environnement')}\n`;
  }
  if (isMath) {
    p += `- Outils autorisés : ${g('outils-maths')}\n`;
    p += `- Durée de la séance : ${g('duree-maths')}\n`;
  }
  if (profil) p += `- Profil et contraintes particulières : ${profil}\n`;
  if (diffAcc) {
    p += `\n### Adaptations pédagogiques requises\n\n`;
    p += `[OBLIGATOIRE] Les besoins spécifiques suivants doivent être pris en compte dans la conception de la ressource : ${diffAcc}.\n`;
    p += `Adapter en conséquence : longueur des consignes, taille de police, contrastes, structuration visuelle, reformulations.\n`;
  }
  p += '\n---\n\n';

  // ---- OBJECTIFS PÉDAGOGIQUES & BO ----
  p += '## OBJECTIFS PÉDAGOGIQUES ET CONFORMITÉ AU BULLETIN OFFICIEL\n\n';
  p += '[OBLIGATOIRE] Cette section est le référentiel de la ressource. Chaque exercice et chaque section de cours doit contribuer à atteindre au moins un des objectifs listés ci-dessous.\n\n';

  if (objectifs) {
    p += `### Objectif général\n\n${objectifs}\n\n`;
  }

  if (isNsi) {
    const caps = [
      ...Array.from(document.querySelectorAll('#caps-nsi input:checked')).map(el => el.value),
      ...Array.from(document.querySelectorAll('#caps-extraites-tags input:checked')).map(el => el.value)
    ];
    if (caps.length) {
      p += '### Capacités exigibles du BO NSI (à couvrir obligatoirement)\n\n';
      caps.forEach(c => { p += `- ${c}\n`; });
      p += '\n[OBLIGATOIRE] Chaque capacité listée ci-dessus doit être couverte par au moins un exercice ou une section de cours dans la ressource produite.\n\n';
    }
  }

  if (isMath) {
    const comps = [
      ...Array.from(document.querySelectorAll('#comp-maths input:checked')).map(el => el.value),
      ...Array.from(document.querySelectorAll('#caps-extraites-tags input:checked')).map(el => el.value)
    ];
    const savoirs     = g('savoirs-maths');
    const savoirFaire = g('savoir-faire-maths');

    if (comps.length) {
      p += '### Compétences mathématiques visées (BO Maths)\n\n';
      comps.forEach(c => { p += `- ${c}\n`; });
      p += '\n[OBLIGATOIRE] Chaque compétence cochée doit être explicitement mobilisée dans au moins un exercice.\n\n';
    }
    if (savoirs)     p += `### Savoirs (définitions et théorèmes à connaître)\n\n${savoirs}\n\n`;
    if (savoirFaire) p += `### Savoir-faire (types de calculs et de démonstrations)\n\n${savoirFaire}\n\n`;
    if (g('notation-maths')) p += `### [OBLIGATOIRE] Conventions de notation\n\n${g('notation-maths')}\n\n`;
  }

  p += '---\n\n';

  // ---- PRINCIPES PÉDAGOGIQUES ----
  p += '## PRINCIPES PÉDAGOGIQUES FONDAMENTAUX\n\n';
  p += 'Ces règles s\'appliquent à chaque section, cours comme exercice, sans exception :\n\n';
  p += principe + '\n';
  p += '\n---\n\n';

  // ---- STRUCTURE ----
  p += '## STRUCTURE DE LA RESSOURCE\n\n';
  p += `Le ${typeRes || 'document'} doit suivre cette progression exacte :\n\n`;
  sections.split('\n').forEach(l => { if (l.trim()) p += l.trim() + '\n'; });

  if (vocabInter) {
    p += '\n### Vocabulaire interdit en introduction\n\n';
    p += 'Les termes suivants sont INTERDITS dans la section d\'introduction — ils ne peuvent apparaître que dans les sections de cours, après illustration concrète :\n';
    p += vocabInter + '\n';
  }
  p += '\n---\n\n';

  // ---- CONTRAINTES DES EXERCICES ----
  p += '## CONTRAINTES DES EXERCICES\n\n';

  if (isNsi) {
    const compos = [];
    if (ck('cb-sit')) compos.push('Mise en situation narrative');
    if (ck('cb-eno')) compos.push('Énoncé numéroté');
    if (ck('cb-ind')) compos.push('Indices progressifs masqués (minimum 2 niveaux)');
    if (ck('cb-edi')) compos.push('Éditeur de code Python exécutable (PyScript)');
    if (ck('cb-cor')) compos.push('Correction cachée déverrouillable');
    if (ck('cb-tst')) compos.push('Fonctions de test pré-écrites [OBLIGATOIRE]');

    p += '### Structure obligatoire de chaque exercice\n\n';
    compos.forEach(c => { p += `- ${c}\n`; });
    p += '\n';

    p += `### [OBLIGATOIRE] Fonctions de test dans tous les blocs de code\n\n${g('regle-tests')}\n\n`;
    const exTest = g('ex-test');
    if (exTest) p += `Exemple de fonction de test attendu :\n\n\`\`\`python\n${exTest}\n\`\`\`\n\n`;
  }

  if (isMath) {
    const composM = [];
    if (ck('cbm-ctx'))   composM.push('Contexte ou mise en situation');
    if (ck('cbm-quest')) composM.push('Questions numérotées progressives (du plus guidé au plus ouvert)');
    if (ck('cbm-ind'))   composM.push('Aide ou indication masquable');
    if (ck('cbm-bar'))   composM.push('Barème par question');
    if (ck('cbm-cor'))   composM.push('Correction détaillée (LaTeX, développements complets)');
    if (ck('cbm-comp'))  composM.push('Compétences mathématiques mobilisées indiquées en marge');

    p += '### Structure obligatoire de chaque exercice\n\n';
    composM.forEach(c => { p += `- ${c}\n`; });
    p += '\n';
    p += `### Niveau de rigueur\n\n${g('rigueur-maths')}\n\n`;
    const bareme = g('bareme-total');
    if (bareme) p += `### Barème total : ${bareme} points\n\n`;
  }

  p += '---\n\n';

  // ---- CONTRAINTES TECHNIQUES ----
  p += '## CONTRAINTES TECHNIQUES\n\n';

  if (isNsi) {
    const cdn      = g('cdn');
    const charte   = g('charte');
    const polices  = g('polices');
    const compsUI  = g('composants');
    const reglesHTML = g('regles-html');

    if (cdn)      { p += '### [OBLIGATOIRE] CDN et versions exactes\n\n'; cdn.split('\n').filter(l => l.trim()).forEach(l => { p += l.trim() + '\n'; }); p += '\n'; }
    if (charte)   { p += '### [OBLIGATOIRE] Charte graphique\n\n'; charte.split('\n').filter(l => l.trim()).forEach(l => { p += l.trim() + '\n'; }); p += '\n'; }
    if (polices)  { p += '### Polices de caractères\n\n'; polices.split('\n').filter(l => l.trim()).forEach(l => { p += l.trim() + '\n'; }); p += '\n'; }
    if (compsUI)  { p += '### [OBLIGATOIRE] Composants UI\n\n'; compsUI.split('\n').filter(l => l.trim()).forEach(l => { p += l.trim() + '\n'; }); p += '\n'; }
    if (reglesHTML){ p += '### [OBLIGATOIRE] Règles HTML critiques\n\n'; reglesHTML.split('\n').filter(l => l.trim()).forEach(l => { p += l.trim() + '\n'; }); p += '\n'; }
  }

  if (isMath) {
    const classe  = g('latex-classe');
    const moteur  = g('latex-moteur');
    const geo     = g('latex-geo');
    const entete  = g('latex-entete');
    const regles  = g('latex-regles');

    p += '### Format de sortie LaTeX\n\n';
    p += `[OBLIGATOIRE] Produire un unique fichier .tex complet et compilable sans fichier externe.\n\n`;
    p += `**Classe :** \`\\documentclass{${classe}}\`\n`;
    p += `**Moteur :** ${moteur}\n\n`;

    const pkgs = [];
    if (ck('pkg-babel')) {
      if (moteur === 'pdflatex') { pkgs.push('\\usepackage[utf8]{inputenc}'); pkgs.push('\\usepackage[T1]{fontenc}'); }
      else pkgs.push('\\usepackage{fontspec}');
      pkgs.push('\\usepackage[french]{babel}');
    }
    if (ck('pkg-geo'))  pkgs.push(`\\usepackage[${geo}]{geometry}`);
    if (ck('pkg-ams'))  pkgs.push('\\usepackage{amsmath, amssymb, amsthm}');
    if (ck('pkg-xcol')) pkgs.push('\\usepackage[dvipsnames,svgnames,x11names]{xcolor}');
    if (ck('pkg-tcol')) pkgs.push('\\usepackage[most]{tcolorbox}');
    if (ck('pkg-tikz')) pkgs.push('\\usepackage{tikz}\n\\usepackage{pgfplots}\n\\pgfplotsset{compat=newest}');
    if (ck('pkg-enum')) pkgs.push('\\usepackage{enumitem}');
    if (ck('pkg-mdfr')) pkgs.push('\\usepackage{mdframed}');
    if (ck('pkg-mcol')) pkgs.push('\\usepackage{multicol}');
    if (ck('pkg-arr'))  pkgs.push('\\usepackage{array, booktabs}');
    if (ck('pkg-gfx'))  pkgs.push('\\usepackage{graphicx}');
    if (ck('pkg-href')) pkgs.push('\\usepackage[colorlinks=true,linkcolor=blue]{hyperref} % TOUJOURS EN DERNIER');

    if (pkgs.length) {
      p += `**Préambule — packages dans cet ordre exact :**\n\n\`\`\`latex\n\\documentclass{${classe}}\n`;
      pkgs.forEach(pk => { p += pk + '\n'; });
      p += '```\n\n';
    }

    const envs = [];
    if (ck('env-exo'))  envs.push('\\newcounter{exercice}\n\\newenvironment{exercice}[1][]{\\refstepcounter{exercice}\\par\\medskip\\noindent\\textbf{Exercice~\\theexercice~#1.}\\space}{\\par\\medskip}');
    if (ck('env-sol'))  envs.push('\\newif\\ifshowanswers\\showanswersfalse\n\\newenvironment{solution}{\\ifshowanswers\\par\\textit{Solution :}\\space}{\\fi}');
    if (ck('env-def'))  envs.push('\\newtheorem{definition}{Définition}[section]');
    if (ck('env-thm'))  envs.push('\\newtheorem{theoreme}[definition]{Théorème}');
    if (ck('env-prop')) envs.push('\\newtheorem{propriete}[definition]{Propriété}');
    if (ck('env-rem'))  envs.push('\\newtheorem*{remarque}{Remarque}');
    if (ck('env-ex'))   envs.push('\\newtheorem*{exemple}{Exemple}');
    if (ck('env-meth')) envs.push('\\newtheorem*{methode}{Méthode}');

    if (envs.length) {
      p += `**Environnements pédagogiques (dans le préambule) :**\n\n\`\`\`latex\n`;
      envs.forEach(e => { p += e + '\n'; });
      p += '```\n\n';
    }

    if (entete) {
      p += '**En-tête :**\n';
      entete.split('\n').filter(l => l.trim()).forEach(l => { p += `- ${l.trim()}\n`; });
      p += '\n';
    }

    if (regles) {
      p += '**[OBLIGATOIRE] Règles de compilation critiques :**\n\n';
      regles.split('\n').filter(l => l.trim()).forEach(l => { p += `- ${l.trim()}\n`; });
    }
  }

  p += '\n---\n\n';

  // ---- LINGUISTIQUE ----
  p += '## EXIGENCES LINGUISTIQUES\n\n';
  if (typo) p += `### Typographie\n\n${typo}\n\n`;
  if (ton)  p += `### Ton et registre\n\n${ton}\n\n`;
  if (isNsi && g('langue-py')) p += `### Langue des identifiants Python\n\n${g('langue-py')}\n\n`;
  p += '---\n\n';

  // ---- FORMAT DE SORTIE ----
  p += '## FORMAT DE SORTIE\n\n';
  if (isNsi) {
    p += 'Produire une seule page HTML complète et autonome (de <!DOCTYPE html> à </html>).\n';
    p += '- Fonctionne sans serveur, directement dans un navigateur moderne\n';
    p += '- Styles dans <style> dans le <head>, scripts JavaScript en fin de <body>\n';
    p += `- Pied de page : « ${piedPage} »\n`;
  }
  if (isMath) {
    p += `Produire un unique fichier .tex complet (de \\documentclass à \\end{document}).\n`;
    p += `- Compilable sans fichier externe, en une seule passe ${g('latex-moteur')}\n`;
    p += `- Colophon/pied de page : « ${piedPage} »\n`;
  }
  if (isAutre) {
    p += `Produire une ressource complète au format ${g('format-sortie-autre') || 'adapté au contexte'}.\n`;
    p += `- Pied de page : « ${piedPage} »\n`;
  }
  if (autoVerif) p += `\n**Rappel critique avant de clore la ressource :** ${autoVerif}\n`;
  p += '\n---\n\n';

  // ---- CHECKLIST QUALITÉ ----
  p += '## CONTRÔLE QUALITÉ FINAL\n\n';
  p += 'Lire cette checklist AVANT de commencer à générer. La parcourir à nouveau avant de clore la ressource et corriger immédiatement tout point non satisfait.\n\n';

  if (bloomData) {
    p += `### Niveau taxonomique (${bloomData.nom})\n`;
    p += `- [ ] Les questions utilisent des verbes d'action du niveau ${bloomData.nom} (${bloomData.verbes.split(',')[0].trim()}…)\n`;
    p += `- [ ] Aucune question ne se limite à la simple restitution si le niveau visé est ≥ N3\n\n`;
  }

  p += '### Pédagogie\n';
  p += '- [ ] L\'introduction ne contient aucun terme technique interdit\n';
  p += '- [ ] Chaque concept est illustré avant d\'être nommé\n';
  p += '- [ ] Chaque paragraphe introduit au maximum un concept nouveau\n';
  p += '- [ ] Ton oral, tutoiement, questions rhétoriques\n';
  p += '- [ ] Chaque section de cours reprend là où la précédente s\'est arrêtée\n\n';

  if (diffAcc) {
    p += '### Accessibilité et différenciation\n';
    p += `- [ ] Les adaptations suivantes sont intégrées : ${diffAcc}\n\n`;
  }

  p += '### Conformité au Bulletin Officiel\n';
  p += '- [ ] Toutes les capacités/compétences BO cochées sont couvertes par au moins un exercice\n';
  p += '- [ ] Le thème du programme est respecté — aucun contenu hors programme\n';
  if (isMath) {
    p += '- [ ] Toutes les notations mathématiques respectent les conventions officielles du BO\n';
    p += '- [ ] Le niveau de rigueur est conforme aux attendus du baccalauréat\n';
  }
  p += '\n';

  if (isNsi) {
    p += '### [OBLIGATOIRE] Fonctions de test\n';
    p += '- [ ] Chaque bloc de code contenant une fonction est suivi d\'une fonction test_ avec 3 assertions\n';
    p += '- [ ] Toutes les valeurs attendues sont des littéraux pré-calculés et exacts\n';
    p += '- [ ] Chaque fonction test_ se termine par print("Les tests sont validés.")\n';
    p += '- [ ] Chaque fonction test_ est appelée immédiatement après sa définition\n';
    p += '- [ ] Les éditeurs d\'exercices contiennent la fonction de test pré-écrite\n';
    p += '- [ ] Les corrections contiennent les mêmes assertions que les énoncés\n\n';
  }

  if (isMath) {
    p += '### LaTeX\n';
    p += '- [ ] Le fichier .tex est compilable sans fichier externe\n';
    p += '- [ ] Tous les packages sont dans le préambule dans le bon ordre (hyperref en dernier)\n';
    p += '- [ ] Les environnements personnalisés sont définis dans le préambule\n';
    p += '- [ ] Aucun placeholder % TODO ni section vide\n\n';
  }

  p += '### Technique\n';
  if (isNsi) {
    p += '- [ ] Aucun id ou class HTML ne contient un caractère non-ASCII\n';
    p += '- [ ] Les versions exactes des CDN sont utilisées\n';
    p += '- [ ] Navigation sticky + bouton retour en haut présents\n';
  }
  p += `- [ ] Le pied de page correspond exactement à : ${piedPage}\n`;
  p += '- [ ] Tous les accents français sont présents dans le texte courant\n';
  p += '\n---\n\n';

  // ---- RAPPELS ----
  p += '## RAPPELS DE DERNIÈRE MINUTE\n\n';
  p += '*Ce bloc est lu juste avant de commencer à générer. Il récapitule les contraintes les plus susceptibles d\'être oubliées.*\n\n';
  rappels.split('\n').forEach(l => {
    const li = l.trim();
    if (li) {
      p += (/^\d+\./.test(li) ? li : `- ${li}`) + '\n';
    }
  });

  return p;
}

/* ============================================================
   AFFICHAGE APERÇU + STATS
   ============================================================ */
function afficherApercu() {
  const el = document.getElementById('apercu-prompt');
  if (el) el.textContent = STATE.prompt;
  setModePrompt('apercu');
  afficherStats();
}

function afficherStats() {
  const chars  = STATE.prompt.length;
  const mots   = STATE.prompt.split(/\s+/).filter(Boolean).length;
  const tokens = Math.round(chars / 4);
  const lignes = STATE.prompt.split('\n').length;
  const el = document.getElementById('stats-prompt');
  if (el) el.innerHTML =
    sb(chars.toLocaleString('fr-FR'),  'Caractères') +
    sb(mots.toLocaleString('fr-FR'),   'Mots') +
    sb(tokens.toLocaleString('fr-FR'), 'Tokens est.') +
    sb(lignes.toLocaleString('fr-FR'), 'Lignes');
}

function sb(v, l) {
  return `<div class="stat"><span class="stat-v">${v}</span><span class="stat-l">${l}</span></div>`;
}

/* ============================================================
   MODE ÉDITION DU PROMPT
   ============================================================ */
function setModePrompt(mode) {
  const apercu   = document.getElementById('apercu-prompt');
  const editZone = document.getElementById('prompt-edit-zone');
  const textarea = document.getElementById('prompt-edit-textarea');
  const btnAp    = document.getElementById('btn-mode-apercu');
  const btnEd    = document.getElementById('btn-mode-edit');

  if (mode === 'edit') {
    if (apercu)   apercu.style.display = 'none';
    if (editZone) editZone.classList.add('visible');
    if (textarea) textarea.value = STATE.prompt;
    if (btnAp)    { btnAp.style.borderColor = ''; btnAp.style.color = ''; }
    if (btnEd)    { btnEd.style.borderColor = 'var(--bleu-lt)'; btnEd.style.color = 'var(--bleu-lt)'; }
  } else {
    if (apercu)   apercu.style.display = 'block';
    if (editZone) editZone.classList.remove('visible');
    if (textarea && textarea.value !== STATE.prompt) {
      STATE.prompt = textarea.value;
      if (apercu) apercu.textContent = STATE.prompt;
      afficherStats();
    }
    if (btnAp)    { btnAp.style.borderColor = 'var(--bleu-lt)'; btnAp.style.color = 'var(--bleu-lt)'; }
    if (btnEd)    { btnEd.style.borderColor = ''; btnEd.style.color = ''; }
  }
}

/* ============================================================
   CONTRÔLE QUALITÉ — basé sur l'état du formulaire (robuste)
   ============================================================ */
function afficherCQ() {
  const p     = STATE.prompt;
  const isMath = STATE.disc === 'math';
  const isNsi  = STATE.disc === 'nsi';
  const has    = s => p.includes(s);

  function li(ok, crit, lbl, conseil) {
    const ic = ok ? '<span class="ck-ok">✓</span>'
                  : (crit ? '<span class="ck-ko">✗</span>' : '<span class="ck-warn">△</span>');
    const cs = (!ok && conseil) ? ` <span class="cq-conseil">— ${conseil}</span>` : '';
    return `<li>${ic} ${lbl}${cs}</li>`;
  }

  // Volet 1 : Pédagogie
  const bloomOk    = !!STATE.bloom;
  const principOk  = !!g('principe');
  const sectionsOk = !!g('sections');

  const v1 = [
    li(bloomOk,   false, 'Niveau taxonomique de Bloom sélectionné', 'Sélectionne un niveau dans la Section 02'),
    li(principOk, false, 'Principe pédagogique central renseigné', 'Remplis le champ "Principe pédagogique central"'),
    li(sectionsOk, true, 'Structure de la ressource (sections) définie', 'La section "Sections" est obligatoire'),
    li(has('AVANT') || has('illustré') || has('ressent'),     false, 'Principe "illustrer avant de nommer" présent'),
    li(has('tutoiement') || has('"tu"') || has('ton oral'),   false, 'Consigne de tutoiement présente'),
    li(has('Vocabulaire interdit') || has('INTERDITS'),        false, 'Contrainte de vocabulaire interdit définie')
  ];

  // Volet 2 : Exercices
  const v2 = [];
  if (isNsi) {
    document.getElementById('v2-titre').textContent = 'Volet 2 — Fonctions de test [OBLIGATOIRE]';
    v2.push(li(has('test_') && has('assert'),        true, 'Convention test_ et assertions présentes'));
    v2.push(li(has('minimum 3') || has('3 assertions'), true, 'Minimum 3 assertions exigé'));
    v2.push(li(has('Les tests sont valid'),           true, 'print("Les tests sont validés.") requis'));
    v2.push(li(has('pré-écrite') || has('fournie'),   true, 'Fonction de test pré-écrite dans les éditeurs'));
    v2.push(li(has('mêmes assertions'),               false, 'Concordance énoncé/correction exigée'));
    v2.push(li(has('```python') && has('def test_'),  true, 'Exemple few-shot Python fourni'));
  }
  if (isMath) {
    document.getElementById('v2-titre').textContent = 'Volet 2 — Exercices mathématiques';
    v2.push(li(has('numérotées') || has('numéroté'),  false, 'Questions numérotées et progressives'));
    v2.push(li(has('barème') || has('Barème'),         false, 'Barème par question'));
    v2.push(li(has('rigueur') || has('démonstration'), false, 'Niveau de rigueur précisé'));
    v2.push(li(has('notation') || has('convention'),   false, 'Conventions de notation imposées'));
  }

  // Volet 3 : Technique
  const v3 = [];
  if (isNsi) {
    document.getElementById('v3-titre').textContent = 'Volet 3 — Technique HTML';
    v3.push(li(has('PyScript') && has('2026'),         true,  'Version exacte PyScript 2026.3.1 spécifiée'));
    v3.push(li(has('Bootstrap') && has('5.3'),         false, 'Version Bootstrap spécifiée'));
    v3.push(li(has('ASCII') && (has('id') || has('class')), true, 'Règle ASCII sur id et class présente'));
    v3.push(li(has('--bg') || has('--accent'),         false, 'Charte graphique (variables CSS) présente'));
    v3.push(li(has('sticky'),                          false, 'Navigation sticky mentionnée'));
  }
  if (isMath) {
    document.getElementById('v3-titre').textContent = 'Volet 3 — Technique LaTeX';
    v3.push(li(has('documentclass') || has('\\documentclass'), true, 'Classe de document spécifiée'));
    v3.push(li(has('hyperref') && has('dernier'),      true,  'Règle hyperref en dernier présente'));
    v3.push(li(has('inputenc') || has('fontspec'),     true,  "Package d'encodage spécifié"));
    v3.push(li(has('babel') && has('french'),          false, 'babel avec option french inclus'));
    v3.push(li(has('compilable') || has('une seule passe'), true, 'Contrainte "compilable" présente'));
  }
  v3.push(li(has('RAPPELS DE DERNIÈRE MINUTE') || has('RAPPELS DE DERNIERE'), true, 'Bloc rappels de dernière minute présent'));
  v3.push(li(has('auto-vérification') || has('avant de clore') || has('checklist'), false, "Instruction d'auto-vérification présente"));

  // Volet 4 : Conformité BO + Bloom
  const v4 = [
    li(!!STATE.bloom, true, `Niveau Bloom sélectionné (${STATE.bloom || 'non sélectionné'}) et intégré au prompt`, 'Sélectionne un niveau Bloom dans la Section 02'),
    li(has('Bulletin Officiel') || has('BO NSI') || has('BO Maths') || has('Programme de référence'), true, 'Référence explicite au programme officiel (BO)'),
    li(has('Capacités exigibles') || has('Compétences mathématiques') || has('capacités') || has('compétences'), true, 'Capacités/compétences listées dans le prompt'),
    li(has('hors programme') || has('OBLIGATOIRE'), false, 'Contrainte "aucun contenu hors programme" présente'),
    li(!!g('objectifs'), false, 'Objectifs opérationnels formulés')
  ];

  document.getElementById('cq-v1').innerHTML = v1.join('');
  document.getElementById('cq-v2').innerHTML = v2.join('');
  document.getElementById('cq-v3').innerHTML = v3.join('');
  document.getElementById('cq-v4').innerHTML = v4.join('');

  // Score global
  const all = [...v1, ...v2, ...v3, ...v4].join('');
  const ok  = (all.match(/ck-ok/g)  || []).length;
  const tot = (all.match(/ck-ok|ck-ko|ck-warn/g) || []).length;
  const pct = tot ? Math.round(ok / tot * 100) : 0;

  const col = pct >= 85 ? 'var(--vert-lt)' : pct >= 65 ? 'var(--or-lt)' : 'var(--rouge-lt)';
  const lbl = pct >= 85 ? 'Prompt de qualité professionnelle'
            : pct >= 65 ? 'Prompt correct — améliorations possibles'
            : 'Prompt incomplet — points critiques manquants';

  const scoreN = document.getElementById('score-n');
  if (scoreN) { scoreN.textContent = `${ok}/${tot}`; scoreN.style.color = col; }
  const scoreLbl = document.getElementById('score-label');
  if (scoreLbl) scoreLbl.textContent = lbl;
  const scoreDetail = document.getElementById('score-detail');
  if (scoreDetail) scoreDetail.textContent = `${pct}% des critères validés — ${tot - ok} point(s) à corriger`;

  // Alerte points critiques
  const critiques = [sectionsOk, bloomOk];
  if (isNsi)  critiques.push(has('test_') && has('assert'), has('Les tests sont valid'), has('PyScript') && has('2026'), has('ASCII'));
  if (isMath) critiques.push(has('documentclass') || has('\\documentclass'), has('hyperref') && has('dernier'));
  critiques.push(has('RAPPELS DE DERNIÈRE MINUTE') || has('RAPPELS DE DERNIERE'));

  const critiquesMnq = critiques.filter(b => !b).length;
  const alEl = document.getElementById('cq-alerte');
  if (alEl) {
    if (critiquesMnq > 0) {
      alEl.textContent = `${critiquesMnq} point(s) critique(s) manquant(s). Les points marqués ✗ doivent être corrigés avant export.`;
      alEl.classList.add('visible');
    } else {
      alEl.classList.remove('visible');
    }
  }
}

/* ============================================================
   GROQ — TEST + ÉVALUATION
   ============================================================ */
async function testerAPI() {
  const cle    = document.getElementById('api-key').value.trim();
  const statEl = document.getElementById('api-st');
  const errEl  = document.getElementById('err-api');
  const okEl   = document.getElementById('ok-api');

  errEl.classList.remove('visible');
  okEl.classList.remove('visible');

  if (!cle) { statEl.className = 'api-st ko'; statEl.textContent = 'Clé manquante'; return; }
  statEl.className = 'api-st idle'; statEl.textContent = 'Test…';

  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 10000);
    const r = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${cle}` },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (r.ok) {
      statEl.className = 'api-st ok'; statEl.textContent = 'Connexion OK';
      okEl.textContent = 'Connexion établie. Vous pouvez évaluer le prompt.';
      okEl.classList.add('visible');
    } else {
      statEl.className = 'api-st ko'; statEl.textContent = 'Clé invalide';
      errEl.textContent = 'Clé API invalide ou expirée. Vérifiez sur console.groq.com.';
      errEl.classList.add('visible');
    }
  } catch (e) {
    statEl.className = 'api-st ko'; statEl.textContent = 'Erreur réseau';
    errEl.textContent = e.name === 'AbortError'
      ? 'Délai dépassé (10 s). Vérifiez la connexion internet.'
      : 'Impossible de contacter Groq. Vérifiez la connexion internet.';
    errEl.classList.add('visible');
  }
}

async function evaluerPrompt() {
  const cle    = document.getElementById('api-key').value.trim();
  const errEl  = document.getElementById('err-api');
  const btnEval = document.getElementById('btn-eval');

  if (!cle) {
    errEl.textContent = 'Saisissez votre clé API avant d\'évaluer.';
    errEl.classList.add('visible');
    return;
  }

  errEl.classList.remove('visible');
  showLoader('Évaluation spécialisée en cours…');
  btnEval.disabled = true;

  const disc = STATE.disc === 'math'
    ? 'mathématiques (BO Maths Terminale spécialité)'
    : STATE.disc === 'nsi'
    ? 'NSI (BO NSI Terminale)'
    : 'discipline générale';

  const bloomInfo = STATE.bloom
    ? `Le niveau taxonomique Bloom visé est ${STATE.bloom} — ${BLOOM.find(b=>b.id===STATE.bloom)?.nom}. `
    : '';

  const sysPmt = `Tu es un expert en ingénierie pédagogique et en prompt engineering pour l'enseignement secondaire français.
Tu évalues des prompts destinés à générer des ressources pédagogiques pour des lycéens en ${disc}.
${bloomInfo}
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte avant ou après.
Format exact :
{"criteres":[{"nom":"Clarté pédagogique","note":4,"commentaire":"..."},{"nom":"Conformité au BO","note":3,"commentaire":"..."},{"nom":"Cohérence Bloom","note":4,"commentaire":"..."},{"nom":"Précision technique","note":4,"commentaire":"..."},{"nom":"Résistance à l'oubli (anti lost-in-middle)","note":4,"commentaire":"..."}],"note_globale":4,"resume":"Phrase de résumé global.","suggestions":["Suggestion 1.","Suggestion 2.","Suggestion 3."]}`;

  const usrPmt = `Évalue ce prompt pédagogique pour la discipline ${disc} en analysant :\n1. Clarté pédagogique\n2. Conformité au BO\n3. Cohérence du niveau taxonomique Bloom avec les objectifs et les exercices\n4. Précision technique\n5. Résistance à l'oubli\n\nVoici le prompt :\n\n${STATE.prompt.substring(0, 6000)}`;

  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 30000);

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1400,
        temperature: 0.25,
        messages: [
          { role: 'system', content: sysPmt },
          { role: 'user',   content: usrPmt }
        ]
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await r.json();
    if (!r.ok) {
      if (r.status === 429) throw new Error('Limite de requêtes dépassée (429). Attendez quelques secondes.');
      throw new Error(data.error?.message || `Erreur API ${r.status}`);
    }

    const txt = data.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
    const d   = JSON.parse(txt);
    afficherEval(d);

  } catch (e) {
    errEl.textContent = `Erreur : ${e.message}`;
    errEl.classList.add('visible');
  } finally {
    hideLoader();
    btnEval.disabled = false;
  }
}

function afficherEval(d) {
  const critEl = document.getElementById('eval-criteres');
  if (!critEl) return;
  critEl.innerHTML = '';

  d.criteres.forEach(c => {
    const cls = `n${Math.min(5, Math.max(1, Math.round(c.note)))}`;
    critEl.innerHTML += `<div class="eval-crit"><div class="eval-note ${cls}">${c.note}/5</div><div class="eval-corps"><h4>${c.nom}</h4><p>${c.commentaire}</p></div></div>`;
  });

  const n = d.note_globale;
  document.getElementById('eval-global').innerHTML =
    `<div class="eval-global"><div class="eval-global-n">${n}/5</div><div class="eval-global-t"><strong>Note globale</strong><br>${d.resume || ''}</div></div>`;

  if (d.suggestions?.length) {
    let html = '<div class="eval-sugg"><h4>Suggestions d\'amélioration</h4><ul>';
    d.suggestions.forEach(s => { html += `<li>${s}</li>`; });
    document.getElementById('eval-sugg').innerHTML = html + '</ul></div>';
  }

  document.getElementById('eval-zone').style.display = 'block';
  document.getElementById('btn-p2').style.display    = 'none';
}

/* ============================================================
   EXTRACTION BO (PDF → Groq)
   ============================================================ */
function boDragOver(e) {
  e.preventDefault();
  document.getElementById('bo-drop-zone').classList.add('dragover');
}

function boDragLeave() {
  document.getElementById('bo-drop-zone').classList.remove('dragover');
}

function boDrop(e) {
  e.preventDefault();
  document.getElementById('bo-drop-zone').classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) traiterFichierBO(e.dataTransfer.files[0]);
}

function boFileChange(e) {
  if (e.target.files.length > 0) traiterFichierBO(e.target.files[0]);
}

function traiterFichierBO(file) {
  const statEl  = document.getElementById('bo-status');
  const btnExtr = document.getElementById('btn-extraire-bo');
  const zone    = document.getElementById('bo-drop-zone');

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    statEl.textContent = 'Format non supporté — PDF uniquement.';
    statEl.className   = 'bo-status visible err';
    return;
  }

  statEl.textContent = 'Lecture du PDF en cours…';
  statEl.className   = 'bo-status visible load';

  const reader = new FileReader();
  reader.onload = ev => {
    STATE.boTexteExtrait = ev.target.result;
    zone.querySelector('p').innerHTML = `✓ <strong>${file.name}</strong> chargé (${Math.round(file.size/1024)} ko)`;
    statEl.textContent = 'PDF chargé — cliquez sur « Extraire les capacités » pour analyser.';
    statEl.className   = 'bo-status visible ok';
    if (btnExtr) btnExtr.disabled = false;
  };
  reader.onerror = () => {
    statEl.textContent = 'Erreur de lecture du fichier.';
    statEl.className   = 'bo-status visible err';
  };
  reader.readAsDataURL(file);
}

async function extraireCapsBO() {
  const cle = document.getElementById('api-key')?.value?.trim() || '';
  if (!cle) { alert('Saisissez d\'abord votre clé API Groq à l\'étape 2, puis revenez extraire les capacités.'); return; }
  if (!STATE.boTexteExtrait) { alert('Chargez d\'abord un fichier PDF.'); return; }

  const statEl  = document.getElementById('bo-status');
  const capsEl  = document.getElementById('caps-extraites');
  const tagsEl  = document.getElementById('caps-extraites-tags');
  const btnExtr = document.getElementById('btn-extraire-bo');

  statEl.textContent = 'Analyse du BO par Groq en cours…';
  statEl.className   = 'bo-status visible load';
  if (btnExtr) btnExtr.disabled = true;

  showLoader('Extraction des capacités BO…');

  const discipline = STATE.disc === 'math' ? 'mathématiques' : STATE.disc === 'nsi' ? 'NSI' : 'discipline scolaire';

  try {
    const base64Data = STATE.boTexteExtrait.split(',')[1];
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 45000);

    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en programmes scolaires français. On te fournit un extrait de Bulletin Officiel pour la discipline ${discipline}. Extrait UNIQUEMENT les capacités exigibles, savoir-faire et compétences attendues, formulées exactement comme dans le texte officiel. Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks : {"capacites": ["capacité 1 exacte", "capacité 2 exacte", ...]}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Voici un extrait du Bulletin Officiel. Extrais toutes les capacités exigibles et savoir-faire attendus sous forme de liste JSON.' },
              { type: 'text', text: `Données PDF (base64, partiel pour analyse) : ${base64Data.substring(0, 4000)}` }
            ]
          }
        ]
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || `Erreur ${resp.status}`);

    const txt  = data.choices[0].message.content.trim().replace(/```json|```/g,'').trim();
    const json = JSON.parse(txt);

    if (json.capacites?.length) {
      tagsEl.innerHTML = '';
      json.capacites.forEach(cap => {
        const lbl = document.createElement('label');
        lbl.className = 'tag bo-tag';
        lbl.innerHTML = `<input type="checkbox" value="${cap}" checked> ${cap.substring(0, 70)}${cap.length > 70 ? '…' : ''}`;
        tagsEl.appendChild(lbl);
      });
      capsEl.classList.add('visible');
      statEl.textContent = `${json.capacites.length} capacités extraites.`;
      statEl.className   = 'bo-status visible ok';
    } else {
      throw new Error('Aucune capacité extraite — vérifiez le fichier PDF.');
    }

  } catch (e) {
    statEl.textContent = `Erreur : ${e.message}`;
    statEl.className   = 'bo-status visible err';
    if (btnExtr) btnExtr.disabled = false;
  } finally {
    hideLoader();
  }
}

/* ============================================================
   EXPORT
   ============================================================ */
function dlTxt() {
  const nom = (g('theme') || 'prompt').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const b   = new Blob([STATE.prompt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(b);
  const a   = document.createElement('a');
  a.href = url;
  a.download = `prompt-${STATE.disc || 'gen'}-${nom}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copier() {
  try {
    await navigator.clipboard.writeText(STATE.prompt);
    const m = document.getElementById('msg-copie');
    if (m) { m.classList.add('visible'); setTimeout(() => m.classList.remove('visible'), 3000); }
  } catch {
    alert("Copie impossible — sélectionne le texte dans l'aperçu et copie manuellement (Ctrl+A puis Ctrl+C).");
  }
}

/* ============================================================
   RETOUR D'EXPÉRIENCE
   ============================================================ */
function sauvegarderRetex() {
  const disc    = STATE.disc || 'autre';
  const typeRes = g('type-res') || '';
  const satisfaction = document.querySelector('input[name="satisfaction"]:checked')?.value || '';
  const qualite      = document.querySelector('input[name="qualite"]:checked')?.value || '';
  const commentaire  = g('retex-commentaire');

  const entry = { date: new Date().toISOString().slice(0,10), disc, typeRes, satisfaction, qualite, commentaire };

  let retex = [];
  try { retex = JSON.parse(localStorage.getItem('pfv4_retex') || '[]'); } catch {}
  retex.push(entry);
  localStorage.setItem('pfv4_retex', JSON.stringify(retex));

  const ok = document.getElementById('retex-ok');
  if (ok) { ok.classList.add('visible'); setTimeout(() => ok.classList.remove('visible'), 3000); }
}

function exporterRetex() {
  let retex = [];
  try { retex = JSON.parse(localStorage.getItem('pfv4_retex') || '[]'); } catch {}
  if (!retex.length) { alert('Aucun retour d\'expérience enregistré.'); return; }

  const headers = ['Date','Discipline','Type de ressource','Satisfaction (1-5)','Qualité estimée (1-5)','Commentaire'];
  const rows    = retex.map(r => [r.date, r.disc, r.typeRes, r.satisfaction, r.qualite, r.commentaire].join(';'));
  const csv     = [headers.join(';'), ...rows].join('\n');

  const b   = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(b);
  const a   = document.createElement('a');
  a.href = url; a.download = 'retex-prompt-forge.csv';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ============================================================
   PROMPT MODE ÉLÈVE
   ============================================================ */
function genererPromptEleve() {
  const sujet   = g('eleve-sujet');
  const blocage = g('eleve-blocage');
  const essai   = g('eleve-essai');
  const disc    = g('eleve-disc');
  const niveau  = g('eleve-niveau');

  if (!sujet || !blocage) {
    const err = document.getElementById('eleve-err');
    if (err) { err.classList.add('visible'); setTimeout(() => err.classList.remove('visible'), 3000); }
    return;
  }

  let p = `## Demande d'aide — ${disc || 'discipline'} — ${niveau || 'lycée'}\n\n`;
  p += `Je suis élève au lycée et j'ai besoin d'aide sur le sujet suivant : **${sujet}**\n\n`;
  p += `### Ce que je ne comprends pas\n\n${blocage}\n\n`;
  if (essai) p += `### Ce que j'ai déjà essayé\n\n${essai}\n\n`;
  p += `### Ce que j'attends de toi\n\n`;
  p += `- Explique-moi le concept de façon simple, avec un exemple concret de la vie quotidienne\n`;
  p += `- Pose-moi des questions pour vérifier que j'ai bien compris\n`;
  p += `- Ne donne pas la solution directement — guide-moi par étapes\n`;
  p += `- Si je ne comprends toujours pas, essaie une autre approche ou une autre analogie\n`;

  const apercu = document.getElementById('eleve-apercu');
  if (apercu) apercu.textContent = p;
  document.getElementById('eleve-result').style.display = 'block';
  STATE.prompt = p;
}

async function copierPromptEleve() {
  try {
    await navigator.clipboard.writeText(STATE.prompt);
    const m = document.getElementById('eleve-copie-ok');
    if (m) { m.classList.add('visible'); setTimeout(() => m.classList.remove('visible'), 3000); }
  } catch {
    alert("Copie impossible — sélectionne le texte et copie manuellement.");
  }
}

/* ============================================================
   DOCUMENTATION INSTITUTIONNELLE
   ============================================================ */
function ouvrirDoc() {
  document.getElementById('modal-doc').classList.add('open');
}

function fermerDoc() {
  document.getElementById('modal-doc').classList.remove('open');
}

/* ============================================================
   LOADER
   ============================================================ */
function showLoader(msg) {
  const el = document.getElementById('loader');
  const lm = document.getElementById('loader-msg');
  if (lm) lm.textContent = msg || 'Chargement…';
  if (el) el.classList.add('on');
}

function hideLoader() {
  const el = document.getElementById('loader');
  if (el) el.classList.remove('on');
}

/* ============================================================
   RÉINITIALISATION
   ============================================================ */
function nouveauPrompt() {
  if (!confirm('Réinitialiser tous les champs ? Cette action est irréversible.')) return;
  localStorage.removeItem('pfv4_form');
  location.reload();
}

/* ============================================================
   SAUVEGARDE LOCALE
   ============================================================ */
const CHAMPS = [
  'niveau','type-res','num-res','theme','sous-titre','prerequis','profil',
  'langage','environnement','outils-maths','duree-maths',
  'objectifs','sections','principe','vocab-interdit',
  'regle-tests','ex-test','cdn','charte','polices','composants','regles-html',
  'savoirs-maths','savoir-faire-maths','notation-maths',
  'rigueur-maths','bareme-total','latex-classe','latex-moteur',
  'latex-geo','latex-entete','latex-regles',
  'typographie','ton','langue-py','pied-page','rappels','auto-verif',
  'disc-autre-nom','bo-autre','format-sortie-autre',
  'pos-sequence','lien-evaluation','referentiel'
];

function sauvegarder() {
  if (!STATE.disc) return;
  const data = { disc: STATE.disc, bloom: STATE.bloom, profil: STATE.profil, version: STATE.version };
  CHAMPS.forEach(id => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });
  document.querySelectorAll('input[type="checkbox"]').forEach(el => {
    if (el.id) data[`cb_${el.id}`] = el.checked;
  });
  localStorage.setItem('pfv4_form', JSON.stringify(data));
}

function chargerSauvegarde() {
  const raw = localStorage.getItem('pfv4_form');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    // Migration de version
    if (!data.version || data.version < STATE.version) {
      localStorage.removeItem('pfv4_form');
      return;
    }
    if (data.disc) {
      choisirDisc(data.disc);
      setTimeout(() => {
        CHAMPS.forEach(id => {
          if (data[id] !== undefined) {
            const el = document.getElementById(id);
            if (el) el.value = data[id];
          }
        });
        Object.keys(data).forEach(k => {
          if (k.startsWith('cb_')) {
            const el = document.getElementById(k.slice(3));
            if (el && el.type === 'checkbox') el.checked = data[k];
          }
        });
        if (data.bloom) selectionnerBloom(data.bloom);
      }, 100);
    }
  } catch { localStorage.removeItem('pfv4_form'); }
}

/* ============================================================
   DÉMARRAGE
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  genererCartesBlooom();

  // Vérifier si un profil est sauvegardé
  const profilSaved = localStorage.getItem('pfv4_profil');

  if (profilSaved) {
    choisirProfil(profilSaved);
    chargerSauvegarde();
  } else {
    document.getElementById('profil-screen').style.display = 'flex';
    document.getElementById('app-shell').style.display = 'none';
  }

  // Fermer la modale au clic sur l'overlay
  const overlay = document.getElementById('modal-doc');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) fermerDoc();
    });
  }

  // Sauvegarde automatique
  setInterval(sauvegarder, 10000);
  document.addEventListener('change', sauvegarder);
  document.addEventListener('input',  sauvegarder);
});
