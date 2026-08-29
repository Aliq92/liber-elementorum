/**
 * Elemental archive + spell records.
 *
 * SOURCING POLICY
 * ---------------
 * Two categories only, and they are labelled honestly in the UI:
 *
 *   status: "verified"   The quoted text is short, extremely widely
 *                        reproduced, and given here as it is standardly
 *                        printed. Manuscript/edition is named.
 *   status: "paraphrase"  Our own descriptive summary of a practice that is
 *                        genuinely attested in the named source. NOT a
 *                        quotation, and never presented as one.
 *
 * Nothing here is invented: no fabricated Latin/Greek/Old English, no made-up
 * grimoires, shelfmarks, authors, dates, or translations. Where a reading is
 * disputed (SATOR, "Erce") the dispute is stated rather than smoothed over.
 *
 * ON THE ELEMENTAL FILING
 * -----------------------
 * Most historical charms were not classified by element. Grouping them under
 * fire/water/earth/air is a curatorial decision made by THIS interface for
 * navigation, and every record says so in `associationNote`. We do not claim
 * the sources themselves made that association.
 */

export const FRAMEWORK_NOTE =
  "The four-element scheme used here is the classical one transmitted through " +
  "Aristotle and systematised for magical purposes in Renaissance works such as " +
  "Agrippa's. The Ars Paulina of the Lemegeton is often associated with this " +
  "framework, but its own divisions are by the twenty-four hours and by the " +
  "degrees of the zodiac; the elemental connection runs indirectly, through the " +
  "grouping of the zodiac signs into triplicities.";

export const DISCLAIMER =
  "Presented as historical record. No claim is made that these operations have any effect.";

export const STATUS_LABEL = {
  verified: "Verified historical text",
  paraphrase: "Historical paraphrase",
};

const CLASSIFICATION = "Paraphrased from historical source";

const AGRIPPA = {
  title: "De occulta philosophia libri tres, Book I",
  author: "Heinrich Cornelius Agrippa",
  tradition: "Renaissance Hermetic / Western ceremonial magic",
  period: "Drafted c. 1510; printed Cologne, 1533",
  language: "Latin",
};

const TETRABIBLOS = {
  title: "Tetrabiblos",
  author: "Claudius Ptolemy",
  tradition: "Hellenistic astrology",
  period: "2nd century AD",
  language: "Greek",
};

/* ------------------------------------------------------------------ *
 * ELEMENTS — shown on SHORT PRESS (the informational / archive mode)
 * ------------------------------------------------------------------ */

export const ELEMENTS = [
  {
    id: "ignis",
    name: "Ignis",
    element: "Fire",
    qualities: "Hot · Dry",
    catalogMark: "ELEM I / IV",
    color: "#ff5a1f",
    colorSoft: "#ffb37a",
    glow: "rgba(255, 90, 31, 0.55)",
    classification: CLASSIFICATION,
    fragment: [
      "Reckoned hot and dry among the four qualities.",
      "Its triplicity: Aries, Leo, Sagittarius.",
      "Noted by the upward triangle.",
    ],
    sources: [AGRIPPA, TETRABIBLOS],
    notes:
      "In the Aristotelian scheme each element is defined by a pair of qualities; " +
      "fire takes hot with dry. The triangle notation is standard in alchemical " +
      "manuscripts and later printed tables.",
    glyph: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 7 43 40H5Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "aqua",
    name: "Aqua",
    element: "Water",
    qualities: "Cold · Moist",
    catalogMark: "ELEM II / IV",
    color: "#29b6f6",
    colorSoft: "#9fe8ff",
    glow: "rgba(41, 182, 246, 0.55)",
    classification: CLASSIFICATION,
    fragment: [
      "Reckoned cold and moist among the four qualities.",
      "Its triplicity: Cancer, Scorpio, Pisces.",
      "Noted by the downward triangle.",
    ],
    sources: [AGRIPPA, TETRABIBLOS],
    notes:
      "Water is placed opposite fire in the classical arrangement, holding the " +
      "contrary of both its qualities. The inverted triangle is its usual " +
      "alchemical sign.",
    glyph: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 41 5 8h38Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "terra",
    name: "Terra",
    element: "Earth",
    qualities: "Cold · Dry",
    catalogMark: "ELEM III / IV",
    color: "#a97c50",
    colorSoft: "#d9b98a",
    glow: "rgba(169, 124, 80, 0.5)",
    classification: CLASSIFICATION,
    fragment: [
      "Reckoned cold and dry among the four qualities.",
      "Its triplicity: Taurus, Virgo, Capricorn.",
      "Noted by the downward triangle, barred.",
    ],
    sources: [AGRIPPA, TETRABIBLOS],
    notes:
      "Earth is the heaviest of the four in the classical ordering and is placed " +
      "lowest in the sublunary sphere. Its sign is the water triangle crossed by " +
      "a single bar.",
    glyph: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M24 41 5 8h38Z"/><path d="M10 17h28"/></g></svg>`,
  },
  {
    id: "aeris",
    name: "Aeris",
    element: "Air",
    qualities: "Hot · Moist",
    catalogMark: "ELEM IV / IV",
    color: "#bcd4ff",
    colorSoft: "#eef5ff",
    glow: "rgba(188, 212, 255, 0.55)",
    classification: CLASSIFICATION,
    fragment: [
      "Reckoned hot and moist among the four qualities.",
      "Its triplicity: Gemini, Libra, Aquarius.",
      "Noted by the upward triangle, barred.",
    ],
    sources: [AGRIPPA, TETRABIBLOS],
    notes:
      "Air shares heat with fire and moisture with water, and was often described " +
      "as the mean between them. Its sign is the fire triangle crossed by a " +
      "single bar.",
    glyph: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M24 7 43 40H5Z"/><path d="M11 30h26"/></g></svg>`,
  },
];

/* ------------------------------------------------------------------ *
 * SPELLBOOK — shown on LONG PRESS (the manifestation mode)
 * 3 records per element, 12 total.
 * ------------------------------------------------------------------ */

const PGM = {
  source: "Papyri Graecae Magicae (Greek Magical Papyri)",
  tradition: "Graeco-Egyptian ritual practice",
  period: "Texts range c. 2nd century BC – 5th century AD",
  language: "Koine Greek, with Egyptian and Semitic elements",
  edition: "Collected by K. Preisendanz (1928–31); English edn. ed. H. D. Betz (1986)",
};

export const SPELLBOOK = {
  ignis: [
    {
      id: "ig-abracadabra",
      title: "The Diminishing Word",
      classification: "Historical charm",
      status: "verified",
      form: "grid",
      invocation: [
        "ABRACADABRA",
        "ABRACADABR",
        "ABRACADAB",
        "ABRACADA",
        "ABRACAD",
        "ABRACA",
        "ABRAC",
        "ABRA",
        "ABR",
        "AB",
        "A",
      ],
      invocationLang: "Latin text; the word itself is of uncertain origin",
      translation: null,
      source: "Liber Medicinalis (De medicina praecepta)",
      author: "Quintus Serenus Sammonicus",
      tradition: "Roman medical–magical writing",
      period: "Early 3rd century AD",
      language: "Latin",
      historicalNote:
        "The work instructs that the word be written out repeatedly, losing a " +
        "letter each line so that it tapers to a point, and worn as an amulet " +
        "against fever. The diminishing shape is the operative part: the illness " +
        "is meant to dwindle as the word does. The origin and meaning of the word " +
        "are not known.",
      associationNote:
        "Filed under Fire by this archive because it treats fever — bodily heat. " +
        "The source does not classify it by element.",
    },
    {
      id: "ig-lychnomancy",
      title: "Divination by Lamp",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "A lamp of undyed clay is lit in a darkened room.",
        "The practitioner sits facing the flame, speaks the formula,",
        "and watches the fire for the figure that answers.",
      ],
      invocationLang: null,
      translation: null,
      source: PGM.source,
      author: null,
      tradition: PGM.tradition,
      period: PGM.period,
      language: PGM.language,
      edition: PGM.edition,
      historicalNote:
        "Lamp divination (lychnomancy) appears repeatedly in the magical papyri. " +
        "The procedures typically specify the lamp, the oil, the darkened room and " +
        "a spoken formula, then direct the operator to watch the flame for a vision " +
        "or an answering figure. The wording above is our summary of that pattern, " +
        "not a translation of any single papyrus.",
      associationNote:
        "Filed under Fire by this archive: the flame is the instrument of the rite.",
    },
    {
      id: "ig-needfire",
      title: "The Need-Fire",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "Every hearth in the settlement is put out.",
        "New fire is drawn by friction, from wood alone,",
        "and the cattle are driven through its smoke.",
      ],
      invocationLang: null,
      translation: null,
      source: "Deutsche Mythologie",
      author: "Jacob Grimm",
      tradition: "Northern European folk practice, as recorded by 19th-c. folklorists",
      period: "Practice attested from the medieval period; Grimm's collection 1835",
      language: "Recorded in German; practices variously Germanic and Celtic",
      historicalNote:
        "The need-fire (German Notfeuer) was kindled by friction after all existing " +
        "household fires had been extinguished, and livestock were driven through " +
        "the smoke as a protection against murrain. Accounts survive from several " +
        "regions of northern Europe and were gathered by 19th-century folklorists. " +
        "Details vary considerably between accounts.",
      associationNote: "Filed under Fire by this archive: fire is the substance of the rite.",
    },
  ],

  aqua: [
    {
      id: "aq-lecanomancy",
      title: "Divination by Bowl",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "A vessel is filled with water, and oil poured upon it.",
        "The formula is spoken over the surface.",
        "The answer is read in what moves there.",
      ],
      invocationLang: null,
      translation: null,
      source: PGM.source,
      author: null,
      tradition: PGM.tradition,
      period: PGM.period,
      language: PGM.language,
      edition: PGM.edition,
      historicalNote:
        "Bowl divination (lecanomancy) is described in several of the magical " +
        "papyri: a vessel of water, often with oil floated on it, is used as a " +
        "scrying surface after a spoken formula. The practice is considerably older " +
        "than the papyri and is attested in Mesopotamian sources as well. The lines " +
        "above summarise the procedure; they are not a quotation.",
      associationNote: "Filed under Water by this archive: water is the scrying medium.",
    },
    {
      id: "aq-jordan",
      title: "The Staunching of the River",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "As the river Jordan is said to have stood still",
        "when Christ was baptised in it,",
        "so let this blood stand still.",
      ],
      invocationLang: null,
      translation: null,
      source: "European blood-staunching charm tradition ('Flum Jordan' type)",
      author: null,
      tradition: "Medieval and early modern Christian folk charm",
      period: "Attested from the medieval period into the 19th century",
      language: "Recorded in German, English, Scandinavian and other vernaculars",
      historicalNote:
        "A widespread charm type built on a comparison: the Jordan halted at the " +
        "baptism of Christ, therefore the bleeding should halt likewise. Charm " +
        "scholarship treats it as a recognised family with many regional variants " +
        "rather than a single fixed text, which is why it is given here as a " +
        "paraphrase of the pattern rather than as a quotation.",
      associationNote:
        "Filed under Water by this archive: the charm's power turns on the stopping " +
        "of a river.",
    },
    {
      id: "aq-aquaesulis",
      title: "What Was Given to the Spring",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "The petition is written on a sheet of lead,",
        "the wrong done is named, and the thief with it,",
        "and the tablet is committed to the hot spring.",
      ],
      invocationLang: null,
      translation: null,
      source: "Curse tablets from the sacred spring at Aquae Sulis (Bath)",
      author: null,
      tradition: "Romano-British religious practice",
      period: "Roughly 2nd–4th century AD",
      language: "Latin, in everyday hands",
      historicalNote:
        "Well over a hundred inscribed lead tablets were recovered from the spring " +
        "at Bath. Many concern petty theft: the writer describes the loss, sometimes " +
        "lists suspects, and hands the matter to the goddess Sulis Minerva, asking " +
        "that the thief be given no rest until restitution is made. The lines above " +
        "describe the practice; individual tablets vary widely in wording.",
      associationNote:
        "Filed under Water by this archive: the spring itself receives the petition.",
    },
  ],

  terra: [
    {
      id: "te-aecerbot",
      title: "Remedy for Fields",
      classification: "Historical invocation",
      status: "verified",
      form: "lines",
      invocation: ["Erce, Erce, Erce, eorþan modor", "Hal wes þu, folde, fira modor"],
      invocationLang: "Old English",
      translation: [
        "Erce, Erce, Erce, mother of earth",
        "Hale be thou, Earth, mother of men",
      ],
      source: "The Æcerbot (Field Remedy), British Library, Cotton MS Caligula A. vii",
      author: null,
      tradition: "Anglo-Saxon charm, Christian and pre-Christian elements combined",
      period: "Manuscript 11th century",
      language: "Old English",
      historicalNote:
        "A long ritual for land that will not yield, combining Christian liturgy " +
        "with older material: turves are cut and blessed, seed and oil are used, and " +
        "these addresses to the earth are spoken. The meaning of 'Erce' is not " +
        "settled — it has been read as a proper name, as a title, and as something " +
        "else entirely; no reading commands agreement.",
      associationNote:
        "Filed under Earth by this archive, and here the source agrees: the address " +
        "is to the earth itself.",
    },
    {
      id: "te-sator",
      title: "The Sator Square",
      classification: "Historical inscription",
      status: "verified",
      form: "grid",
      invocation: ["S A T O R", "A R E P O", "T E N E T", "O P E R A", "R O T A S"],
      invocationLang: "Latin",
      translation: null,
      source: "Wall inscriptions at Pompeii; later widely copied across Europe",
      author: null,
      tradition: "Roman, later absorbed into medieval Christian charm use",
      period: "Attested before AD 79; in continuous use for many centuries after",
      language: "Latin",
      historicalNote:
        "A word square reading the same across, down, and both reversed. Examples " +
        "were found at Pompeii, giving a firm date before the eruption of AD 79. " +
        "Later it was used across Europe as a protective charm, against fire and " +
        "illness among other things. Its meaning is genuinely disputed: AREPO is " +
        "otherwise unattested, and no proposed translation is accepted as settled.",
      associationNote:
        "Filed under Earth by this archive because 'sator' is a sower and the square's " +
        "later use was largely agricultural and domestic. The square is not " +
        "historically an elemental object.",
    },
    {
      id: "te-nineherbs",
      title: "The Nine Herbs",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "Nine herbs are named and addressed in turn,",
        "each told what it has power against;",
        "they are then ground together and worked into a salve.",
      ],
      invocationLang: null,
      translation: null,
      source: "The Nine Herbs Charm, in the Lacnunga, British Library, Harley MS 585",
      author: null,
      tradition: "Anglo-Saxon medical–magical compilation",
      period: "Manuscript 10th–11th century",
      language: "Old English",
      historicalNote:
        "The charm addresses nine plants one after another, recounting what each is " +
        "proficient against, before instructions for preparing them. It names Woden " +
        "in one passage alongside Christian material. Identification of some of the " +
        "nine herbs is uncertain. Summarised here rather than quoted.",
      associationNote:
        "Filed under Earth by this archive: the working is with plants and soil.",
    },
  ],

  aeris: [
    {
      id: "ae-breath",
      title: "Drawing Breath from the Rays",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "Draw breath from the rays, inward, three times;",
        "the body is said to lighten,",
        "and the ascent begins.",
      ],
      invocationLang: null,
      translation: null,
      source: "The so-called 'Mithras Liturgy', within PGM IV",
      author: null,
      tradition: PGM.tradition,
      period: PGM.period,
      language: PGM.language,
      edition: PGM.edition,
      historicalNote:
        "A section of the great Paris magical papyrus describes a rite of ascent in " +
        "which the practitioner draws in breath from the sun's rays and is raised up. " +
        "The name 'Mithras Liturgy' was given to it by a modern editor and its " +
        "connection to Mithraic religion is debated. Summarised, not quoted.",
      associationNote:
        "Filed under Air by this archive: breath is the instrument of the rite.",
    },
    {
      id: "ae-windknots",
      title: "Wind Sold in Knots",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "A cord is sold to the sailor with three knots tied in it.",
        "Loose the first for a fair wind, the second for a strong one.",
        "The third is not to be loosed.",
      ],
      invocationLang: null,
      translation: null,
      source: "Historia de gentibus septentrionalibus",
      author: "Olaus Magnus",
      tradition: "Northern European maritime folk belief",
      period: "Printed Rome, 1555; describing beliefs of its own time and earlier",
      language: "Latin",
      historicalNote:
        "Olaus Magnus reports that sailors in the far north bought wind from local " +
        "weather-workers in the form of knotted cords, to be untied at sea as more " +
        "wind was wanted. Similar accounts recur in later folklore collections from " +
        "Scotland and Scandinavia. The number of knots and the warning attached to " +
        "the last vary between tellings.",
      associationNote: "Filed under Air by this archive: the wind is the thing traded.",
    },
    {
      id: "ae-augury",
      title: "The Watching of Birds",
      classification: "Paraphrased from historical source",
      status: "paraphrase",
      form: "lines",
      invocation: [
        "A quarter of the sky is marked out and fixed by words.",
        "The augur waits within it, facing the appointed way,",
        "and reads what crosses: by flight, or by cry.",
      ],
      invocationLang: null,
      translation: null,
      source: "De divinatione",
      author: "Marcus Tullius Cicero",
      tradition: "Roman state religion",
      period: "Written 44 BC; the practice considerably older",
      language: "Latin",
      historicalNote:
        "Roman augury involved marking out a region of the sky (a templum) by formula " +
        "and observing birds within it — distinguishing those that signified by flight " +
        "from those that signified by call. Cicero's dialogue is a principal source, " +
        "though he argues against the validity of divination in it. Described here, " +
        "not quoted.",
      associationNote:
        "Filed under Air by this archive: the sky is the field of observation.",
    },
  ],
};

/** Pick a spell for an element, avoiding an immediate repeat where possible. */
export function pickSpell(elementId, lastSpellId) {
  const pool = SPELLBOOK[elementId];
  if (!pool || pool.length === 0) return null;
  const candidates = pool.length > 1 ? pool.filter((s) => s.id !== lastSpellId) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Boot-time integrity check. Catches the failure modes that would otherwise
 * only show up as "undefined" rendered into the card: missing metadata,
 * an element pool of the wrong size, or ids leaking across elements.
 * Returns a list of problems (empty when healthy) and warns in the console.
 */
export function validateSpellData() {
  const problems = [];
  const REQUIRED = [
    "id",
    "title",
    "classification",
    "status",
    "invocation",
    "source",
    "tradition",
    "period",
    "language",
    "historicalNote",
    "associationNote",
  ];
  const ID_PREFIX = { ignis: "ig-", aqua: "aq-", terra: "te-", aeris: "ae-" };
  const seenIds = new Set();

  ELEMENTS.forEach((el) => {
    if (!SPELLBOOK[el.id]) problems.push(`No spell pool for element "${el.id}"`);
  });

  Object.entries(SPELLBOOK).forEach(([elementId, pool]) => {
    if (pool.length !== 3) {
      problems.push(`Element "${elementId}" has ${pool.length} spells, expected 3`);
    }
    pool.forEach((spell, i) => {
      const where = `${elementId}[${i}] (${spell.id || "no id"})`;

      REQUIRED.forEach((field) => {
        const v = spell[field];
        if (v === undefined || v === null || v === "") {
          problems.push(`${where}: missing "${field}"`);
        }
      });

      if (!Array.isArray(spell.invocation) || spell.invocation.length === 0) {
        problems.push(`${where}: invocation must be a non-empty array`);
      }
      if (spell.translation !== null && !Array.isArray(spell.translation)) {
        problems.push(`${where}: translation must be an array or null`);
      }
      if (!STATUS_LABEL[spell.status]) {
        problems.push(`${where}: unknown status "${spell.status}"`);
      }
      // guards against Ignis text ending up under Aqua metadata
      if (ID_PREFIX[elementId] && !String(spell.id).startsWith(ID_PREFIX[elementId])) {
        problems.push(`${where}: id should start with "${ID_PREFIX[elementId]}"`);
      }
      if (seenIds.has(spell.id)) problems.push(`${where}: duplicate id`);
      seenIds.add(spell.id);
    });
  });

  if (problems.length) {
    console.warn("[arcane] spell data problems:\n" + problems.join("\n"));
  }
  return problems;
}
