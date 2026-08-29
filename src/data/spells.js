/**
 * Elemental archive + protective invocation records.
 *
 * CONTENT POLICY
 * --------------
 * The long-press archive (`SPELLBOOK` below) holds authentic Islamic du'a,
 * adhkar, Qur'anic protection verses and prophetic ruqyah — never fantasy
 * "spells". Every record's Arabic, transliteration, meaning, and source
 * citation was checked against sunnah.com/quran.com before being included.
 * Where a hadith's authenticity grading could not be confirmed, the record
 * was left out rather than guessed at. Nothing here is paraphrased and
 * presented as if it were the primary text — see each record's `notes` for
 * what is commentary versus the recitation itself.
 *
 * `type` is the label actually shown on screen (Du'a / Dhikr / Qur'anic
 * Recitation / Ruqyah) — never "spell". The interface chrome around it
 * (INVOKE, MANIFEST RECORD, CASTING) is fictional framing for the app's own
 * interaction model and makes no claim about the text itself.
 *
 * ON THE ELEMENTAL FILING
 * ------------------------
 * IGNIS / AQUA / TERRA / AERIS are a curatorial device of THIS interface —
 * a way to browse a themed archive with four buttons — not an Islamic
 * classification. See FRAMEWORK_NOTE, shown in every record's source panel.
 */

import { nextInPool } from "../rotation.js";

export const FRAMEWORK_NOTE =
  "The four-element scheme used here (Ignis / Aqua / Terra / Aeris) is the " +
  "classical one transmitted through Aristotle and systematised for magical " +
  "purposes in Renaissance works such as Agrippa's; it governs only the " +
  "elemental archive descriptions below. The protective recitations filed " +
  "under each element are grouped by theme (strength, healing, refuge, " +
  "protection) as a navigation choice made by this interface. This filing " +
  "is not a claim that Islam associates these four elements with specific " +
  "prayers, powers, or correspondences.";

export const DISCLAIMER =
  "Religious texts are presented for reflection and historical/devotional context. " +
  "The interface does not claim supernatural guarantees.";

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
 * ELEMENTS — shown on SHORT PRESS (the informational / archive mode).
 * Unrelated to the protective-recitation content below: this is general
 * Western classical-element history, not Islamic material.
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
 * SPELLBOOK — shown on LONG PRESS (the manifestation / reading mode).
 * Authentic du'a, adhkar, Qur'anic protection verses and ruqyah, filed by
 * theme: Ignis (strength/steadfastness), Aqua (healing/relief), Terra
 * (grounding/refuge), Aeris (protection/clarity). Pool sizes vary — quality
 * over an arbitrary target count. See CONTENT POLICY above.
 * ------------------------------------------------------------------ */

export const SPELLBOOK = {
  ignis: [
    {
      id: "ig-hasbunallah",
      title: "Hasbunallahu wa ni'mal Wakil",
      category: "steadfastness",
      type: "Qur'anic Recitation",
      arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      transliteration: "Hasbunallahu wa ni'mal Wakil",
      meaning: "Allah is sufficient for us, and He is the best Disposer of affairs.",
      source: "The Qur'an",
      reference: "Surah Aal 'Imran 3:173",
      sourceType: "Qur'an",
      authenticity: "Qur'anic Text",
      purpose: "Courage, steadfastness",
      recommendedContext: "When facing overwhelming fear or opposition",
      repetition: null,
      notes:
        "Said by the believers on being told a great force had gathered against " +
        "them — and it increased their faith rather than their fear (3:173).",
    },
    {
      id: "ig-rabbana-afrigh",
      title: "Rabbana Afrigh 'Alayna Sabran",
      category: "steadfastness",
      type: "Qur'anic Recitation",
      arabic:
        "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
      transliteration:
        "Rabbana afrigh 'alayna sabran wa thabbit aqdamana wansurna 'alal-qawmil-kafirin",
      meaning:
        "Our Lord, pour upon us patience, make firm our feet, and give us victory over the disbelieving people.",
      source: "The Qur'an",
      reference: "Surah Al-Baqarah 2:250",
      sourceType: "Qur'an",
      authenticity: "Qur'anic Text",
      purpose: "Steadfastness under pressure",
      recommendedContext: "Before or during a daunting confrontation or trial",
      repetition: null,
      notes:
        "The supplication of Talut's (Saul's) small army as they advanced on a much larger force led by Jalut (Goliath).",
    },
    {
      id: "ig-usri-yusra",
      title: "Fa-inna Ma'al-'Usri Yusra",
      category: "resilience",
      type: "Qur'anic Recitation",
      arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا، إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      transliteration: "Fa-inna ma'al-'usri yusra, inna ma'al-'usri yusra",
      meaning: "So indeed, with hardship comes ease. Indeed, with hardship comes ease.",
      source: "The Qur'an",
      reference: "Surah Ash-Sharh 94:5-6",
      sourceType: "Qur'an",
      authenticity: "Qur'anic Text",
      purpose: "Resilience, hope under hardship",
      recommendedContext: "During prolonged difficulty",
      repetition: null,
      notes: "The promise is stated twice in immediate succession in the surah.",
    },
    {
      id: "ig-la-hawla",
      title: "La Hawla wa la Quwwata illa Billah",
      category: "reliance",
      type: "Dhikr",
      arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
      transliteration: "La hawla wa la quwwata illa billah",
      meaning: "There is no power and no strength except with Allah.",
      source: "Sahih al-Bukhari; Sahih Muslim",
      reference: "Bukhari 6384; Muslim 2704",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Reliance on Allah, inner strength",
      recommendedContext: "General use, especially when feeling powerless",
      repetition: null,
      notes:
        "The Prophet ﷺ told Abu Musa al-Ash'ari he would teach him a sentence " +
        "from the treasures of Paradise, then taught him this phrase.",
    },
    {
      id: "ig-la-sahla",
      title: "Allahumma la Sahla illa ma Ja'altahu Sahla",
      category: "steadfastness",
      type: "Du'a",
      arabic:
        "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
      transliteration:
        "Allahumma la sahla illa ma ja'altahu sahla, wa anta taj'alul-hazna idha shi'ta sahla",
      meaning:
        "O Allah, nothing is easy except what You make easy, and You make the difficult, if You wish, easy.",
      source: "Ibn Hibban; also recorded by Ibn as-Sunni",
      reference: "Ibn Hibban 2427",
      sourceType: "Hadith",
      authenticity: "Sahih (graded by al-Albani and Ibn Hajar)",
      purpose: "Courage to begin a hard task",
      recommendedContext: "Facing a difficult undertaking",
      repetition: null,
      notes: "Narrated by Anas ibn Malik.",
    },
  ],

  aqua: [
    {
      id: "aq-dua-yunus",
      title: "Du'a of Yunus",
      category: "distress relief",
      type: "Qur'anic Recitation",
      arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
      transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
      meaning: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
      source: "The Qur'an",
      reference: "Surah Al-Anbiya 21:87",
      sourceType: "Qur'an",
      authenticity: "Qur'anic Text",
      purpose: "Relief from distress",
      recommendedContext: "In hardship or entrapment",
      repetition: null,
      notes:
        "Called upon by Prophet Yunus (Jonah) from within the whale. Jami' " +
        "at-Tirmidhi 3505 records that no believer supplicates with it in any " +
        "matter except that Allah answers him — graded Sahih by al-Hakim, " +
        "concurred by al-Dhahabi.",
    },
    {
      id: "aq-hamm-hazan",
      title: "Refuge from Anxiety and Sorrow",
      category: "relief",
      type: "Du'a",
      arabic:
        "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
      transliteration:
        "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, " +
        "wal-jubni wal-bukhl, wa dala'id-dayni wa ghalabatir-rijal",
      meaning:
        "O Allah, I seek refuge in You from anxiety and sorrow, weakness and " +
        "laziness, cowardice and miserliness, the burden of debts and being " +
        "overpowered by other men.",
      source: "Sahih al-Bukhari",
      reference: "Bukhari 6369",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Relief from anxiety and grief",
      recommendedContext: "Morning and evening, or whenever burdened",
      repetition: null,
      notes: "Narrated by Anas ibn Malik, who said the Prophet ﷺ used to say this often.",
    },
    {
      id: "aq-ruqyah-pain",
      title: "Ruqyah for Pain",
      category: "healing",
      type: "Ruqyah",
      arabic:
        "بِسْمِ اللَّهِ (×٣) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (×٧)",
      transliteration:
        "Bismillah (three times); a'udhu billahi wa qudratihi min sharri ma ajidu wa uhadhir (seven times)",
      meaning:
        "In the name of Allah (three times). I seek refuge in Allah and in His " +
        "power from the evil of what I feel and what I am wary of (seven times).",
      source: "Sahih Muslim",
      reference: "Muslim 2202",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Relief from bodily pain",
      recommendedContext: "Place the hand on the site of the pain while reciting",
      repetition: "Bismillah 3×; the refuge formula 7×",
      notes:
        "Taught by the Prophet ﷺ to Uthman ibn Abi al-'As, who had complained " +
        "of pain he had felt since becoming Muslim.",
    },
    {
      id: "aq-ruqyah-jibril",
      title: "Ruqyah of Jibril",
      category: "healing",
      type: "Ruqyah",
      arabic:
        "بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ",
      transliteration:
        "Bismillahi arqik, min kulli shay'in yu'dhik, min sharri kulli nafsin aw " +
        "'ayni hasid, Allahu yashfik, bismillahi arqik",
      meaning:
        "In the name of Allah I recite over you, from everything that harms you, " +
        "from the evil of every soul or envious eye — may Allah heal you. In " +
        "the name of Allah I recite over you.",
      source: "Sahih Muslim",
      reference: "Muslim 2186",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Healing; protection from envy",
      recommendedContext: "Recited over someone who is unwell",
      repetition: null,
      notes:
        "The angel Jibril (Gabriel) recited this over the Prophet ﷺ when he was " +
        "unwell, as narrated by Abu Sa'id al-Khudri.",
    },
    {
      id: "aq-ruqyah-rabban-nas",
      title: "Ruqyah for the Sick",
      category: "healing",
      type: "Ruqyah",
      arabic:
        "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
      transliteration:
        "Allahumma Rabban-nas, adhhibil-ba's, ishfi anta ash-Shafi, la shifa'a " +
        "illa shifa'uk, shifa'an la yughadiru saqama",
      meaning:
        "O Allah, Lord of mankind, remove the affliction. Heal — You are the " +
        "Healer; there is no healing but Your healing, a healing that leaves no illness.",
      source: "Sahih al-Bukhari; Sahih Muslim",
      reference: "Bukhari 5743; Muslim 2191",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Healing from illness",
      recommendedContext: "Recited while visiting or touching the sick",
      repetition: null,
      notes: "Narrated by Aisha, describing what the Prophet ﷺ would say when visiting the unwell.",
    },
    {
      id: "aq-fatiha-ruqyah",
      title: "Ruqyah by Surah Al-Fatiha",
      category: "healing",
      type: "Qur'anic Recitation",
      arabic:
        "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَٰنِ " +
        "الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ " +
        "الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      transliteration:
        "Bismillahir-Rahmanir-Rahim. Alhamdu lillahi Rabbil-'alamin. " +
        "Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na'budu wa iyyaka nasta'in. " +
        "Ihdinas-siratal-mustaqim. Siratal-ladhina an'amta 'alayhim ghayril-maghdubi 'alayhim wa lad-dallin.",
      meaning:
        "In the name of Allah, the Most Gracious, the Most Merciful. All praise " +
        "is for Allah, Lord of all worlds. The Most Gracious, the Most Merciful. " +
        "Master of the Day of Judgment. You alone we worship, and You alone we " +
        "ask for help. Guide us to the straight path — the path of those You " +
        "have blessed, not of those who have earned Your anger, nor of those who are astray.",
      source: "The Qur'an; incident recorded in Sahih al-Bukhari",
      reference: "Surah Al-Fatiha 1:1-7; Bukhari 5736",
      sourceType: "Qur'an / Hadith",
      authenticity: "Qur'anic Text; incident Sahih",
      purpose: "Healing",
      recommendedContext: "Recited as ruqyah over someone injured or ill",
      repetition: null,
      notes:
        "A companion recited Al-Fatiha over a tribal chief stung by a scorpion; " +
        "on hearing of it the Prophet ﷺ smiled and asked, 'How did you know that " +
        "it is a ruqyah?', confirming the practice.",
    },
  ],

  terra: [
    {
      id: "te-ayat-kursi",
      title: "Ayat al-Kursi",
      category: "protection",
      type: "Qur'anic Recitation",
      arabic:
        "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي " +
        "السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ " +
        "أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ " +
        "السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      transliteration:
        "Allahu la ilaha illa huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la " +
        "nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u " +
        "'indahu illa bi-idhnih, ya'lamu ma bayna aydihim wa ma khalfahum, wa la " +
        "yuhituna bi-shay'in min 'ilmihi illa bima sha'a, wasi'a kursiyyuhus-" +
        "samawati wal-ard, wa la ya'uduhu hifzuhuma, wa huwal-'Aliyyul-'Azim",
      meaning:
        "Allah — there is no deity except Him, the Ever-Living, the Sustainer " +
        "of existence. Neither drowsiness overtakes Him nor sleep. To Him " +
        "belongs whatever is in the heavens and whatever is on the earth. Who " +
        "is it that can intercede with Him except by His permission? He knows " +
        "what is before them and what will be after them, and they encompass " +
        "nothing of His knowledge except what He wills. His Kursi extends over " +
        "the heavens and the earth, and their preservation tires Him not. He is " +
        "the Most High, the Most Great.",
      source: "The Qur'an",
      reference: "Surah Al-Baqarah 2:255",
      sourceType: "Qur'an",
      authenticity: "Qur'anic Text",
      purpose: "Protection, especially overnight",
      recommendedContext: "Before sleep; morning and evening",
      repetition: null,
      notes:
        "Widely regarded as the greatest verse of the Qur'an. Sahih al-Bukhari " +
        "3275 records that reciting it before sleep keeps a guardian from Allah " +
        "near until morning and wards off a devil.",
    },
    {
      id: "te-la-yadurru",
      title: "Bismillahil-ladhi la Yadurru",
      category: "protection",
      type: "Dhikr",
      arabic:
        "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      transliteration:
        "Bismillahil-ladhi la yadurru ma'a ismihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim",
      meaning:
        "In the name of Allah, with whose name nothing on earth or in heaven " +
        "can cause harm, and He is the All-Hearing, the All-Knowing.",
      source: "Jami' at-Tirmidhi; Sunan Ibn Majah",
      reference: "Tirmidhi 3388; Ibn Majah 3869",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Protection from harm",
      recommendedContext: "Morning and evening",
      repetition: "Three times",
      notes:
        "Narrated by Uthman ibn Affan: whoever recites this three times each " +
        "morning and evening will not be harmed by anything until the next.",
    },
    {
      id: "te-tammati-manzil",
      title: "Refuge on Entering a Place",
      category: "safety",
      type: "Du'a",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      transliteration: "A'udhu bikalimatillahi at-tammati min sharri ma khalaq",
      meaning: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
      source: "Sahih Muslim",
      reference: "Muslim 2708a",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Safety when entering or staying in a place",
      recommendedContext: "Upon stopping or settling somewhere, including while travelling",
      repetition: null,
      notes:
        "Narrated by Khawlah bint Hakim: whoever says this on stopping at a " +
        "place will not be harmed until they depart from it.",
    },
    {
      id: "te-sleep-waking",
      title: "Sleep and Waking",
      category: "safety",
      type: "Du'a",
      arabic:
        "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا. الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
      transliteration:
        "Bismika Allahumma amutu wa ahya. Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
      meaning:
        "With Your name, O Allah, I die and I live. All praise is for Allah, " +
        "who gave us life after having taken it from us [in sleep], and unto " +
        "Him is the resurrection.",
      source: "Sahih al-Bukhari",
      reference: "Bukhari 6324",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Safety and grounding through sleep",
      recommendedContext: "Upon lying down to sleep, and upon waking",
      repetition: null,
      notes:
        "The first line is said on lying down; the second on waking, per the Prophet's ﷺ nightly practice.",
    },
  ],

  aeris: [
    {
      id: "ae-al-ikhlas",
      title: "Surah Al-Ikhlas",
      category: "protection",
      type: "Qur'anic Recitation",
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ.",
      transliteration: "Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.",
      meaning:
        "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither " +
        "begets nor is born. Nor is there to Him any equivalent.",
      source: "The Qur'an",
      reference: "Surah Al-Ikhlas 112:1-4",
      sourceType: "Qur'an",
      authenticity: "Qur'anic Text",
      purpose: "Protection; clarity of belief",
      recommendedContext: "Morning and evening; often recited with Al-Falaq and An-Nas",
      repetition: null,
      notes:
        "Traditionally recited together with Surah Al-Falaq and Surah An-Nas — " +
        "a set sometimes called 'the three Quls' after their opening word, Qul ('Say').",
    },
    {
      id: "ae-al-falaq",
      title: "Surah Al-Falaq",
      category: "protection",
      type: "Qur'anic Recitation",
      arabic:
        "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ. مِنْ شَرِّ مَا خَلَقَ. وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ. " +
        "وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ. وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ.",
      transliteration:
        "Qul a'udhu bi-Rabbil-falaq. Min sharri ma khalaq. Wa min sharri " +
        "ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
      meaning:
        "Say: I seek refuge in the Lord of daybreak, from the evil of that " +
        "which He created, and from the evil of darkness when it settles, and " +
        "from the evil of the blowers in knots, and from the evil of an envier when he envies.",
      source: "The Qur'an",
      reference: "Surah Al-Falaq 113:1-5",
      sourceType: "Qur'an",
      authenticity: "Qur'anic Text",
      purpose: "Protection from harm and envy",
      recommendedContext: "Morning and evening",
      repetition: null,
      notes: "One of the two 'Mu'awwidhatan' (refuge surahs), often paired with An-Nas.",
    },
    {
      id: "ae-an-nas",
      title: "Surah An-Nas",
      category: "protection",
      type: "Qur'anic Recitation",
      arabic:
        "قُلْ أَعُوذُ بِرَبِّ النَّاسِ. مَلِكِ النَّاسِ. إِلَٰهِ النَّاسِ. مِنْ شَرِّ الْوَسْوَاسِ " +
        "الْخَنَّاسِ. الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ. مِنَ الْجِنَّةِ وَالنَّاسِ.",
      transliteration:
        "Qul a'udhu bi-Rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-" +
        "waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.",
      meaning:
        "Say: I seek refuge in the Lord of mankind, the King of mankind, the " +
        "God of mankind, from the evil of the retreating whisperer, who " +
        "whispers in the breasts of mankind, from among the jinn and mankind.",
      source: "The Qur'an",
      reference: "Surah An-Nas 114:1-6",
      sourceType: "Qur'an",
      authenticity: "Qur'anic Text",
      purpose: "Protection from harmful whispers",
      recommendedContext: "Morning and evening",
      repetition: null,
      notes: "The second of the two Mu'awwidhatan, addressing whispered harm specifically.",
    },
    {
      id: "ae-hasan-husain",
      title: "Refuge for Hasan and Husain",
      category: "protection",
      type: "Du'a",
      arabic:
        "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
      transliteration:
        "U'idhukuma bikalimatillahi at-tammati min kulli shaytanin wa hammatin wa min kulli 'aynin lammah",
      meaning:
        "I seek refuge for you both in the perfect words of Allah, from every " +
        "devil and every poisonous creature, and from every harmful, envious eye.",
      source: "Sahih al-Bukhari",
      reference: "Bukhari 3371",
      sourceType: "Hadith",
      authenticity: "Sahih",
      purpose: "Protection from envy and the evil eye",
      recommendedContext: "Said over children or loved ones",
      repetition: null,
      notes:
        "Narrated by Ibn 'Abbas: the Prophet ﷺ used this for Hasan and Husain, " +
        "and said Ibrahim used to seek refuge for Isma'il and Ishaq with the same words.",
    },
  ],
};

/** Pick an invocation for an element via the shuffle-bag rotation (see rotation.js). */
export function pickSpell(elementId) {
  const pool = SPELLBOOK[elementId];
  if (!pool || pool.length === 0) return null;
  const id = nextInPool(elementId, pool);
  return pool.find((s) => s.id === id) || pool[0];
}

/**
 * Boot-time integrity check. Catches the failure modes that would otherwise
 * only show up as "undefined" rendered into the card: missing metadata or an
 * id leaking across elements.
 * Returns a list of problems (empty when healthy) and warns in the console.
 */
export function validateSpellData() {
  const problems = [];
  const REQUIRED = [
    "id",
    "title",
    "category",
    "type",
    "arabic",
    "transliteration",
    "meaning",
    "source",
    "reference",
    "sourceType",
    "authenticity",
    "purpose",
  ];
  const ID_PREFIX = { ignis: "ig-", aqua: "aq-", terra: "te-", aeris: "ae-" };
  const seenIds = new Set();

  ELEMENTS.forEach((el) => {
    if (!SPELLBOOK[el.id]) problems.push(`No invocation pool for element "${el.id}"`);
  });

  Object.entries(SPELLBOOK).forEach(([elementId, pool]) => {
    if (pool.length === 0) {
      problems.push(`Element "${elementId}" has an empty invocation pool`);
    }
    pool.forEach((entry, i) => {
      const where = `${elementId}[${i}] (${entry.id || "no id"})`;

      REQUIRED.forEach((field) => {
        const v = entry[field];
        if (v === undefined || v === null || v === "") {
          problems.push(`${where}: missing "${field}"`);
        }
      });

      // guards against Ignis text ending up under Aqua metadata
      if (ID_PREFIX[elementId] && !String(entry.id).startsWith(ID_PREFIX[elementId])) {
        problems.push(`${where}: id should start with "${ID_PREFIX[elementId]}"`);
      }
      if (seenIds.has(entry.id)) problems.push(`${where}: duplicate id`);
      seenIds.add(entry.id);
    });
  });

  if (problems.length) {
    console.warn("[arcane] invocation data problems:\n" + problems.join("\n"));
  }
  return problems;
}
