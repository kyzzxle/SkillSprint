// Original vocabulary content written for SkillSprint.
// level: 1 = everyday, 2 = intermediate, 3 = advanced

export interface VocabEntry {
  word: string;
  pos: 'adjective' | 'verb' | 'noun' | 'adverb';
  definition: string;
  synonyms: string[];
  antonyms: string[];
  level: 1 | 2 | 3;
}

export const VOCAB: VocabEntry[] = [
  // ---- Level 1 ----
  { word: 'ancient', pos: 'adjective', definition: 'belonging to the very distant past', synonyms: ['old', 'aged'], antonyms: ['modern', 'new'], level: 1 },
  { word: 'brave', pos: 'adjective', definition: 'ready to face danger or pain without showing fear', synonyms: ['courageous', 'bold'], antonyms: ['cowardly', 'timid'], level: 1 },
  { word: 'fragile', pos: 'adjective', definition: 'easily broken or damaged', synonyms: ['delicate', 'breakable'], antonyms: ['sturdy', 'robust'], level: 1 },
  { word: 'generous', pos: 'adjective', definition: 'willing to give more money, time or help than is expected', synonyms: ['giving', 'charitable'], antonyms: ['stingy', 'selfish'], level: 1 },
  { word: 'rapid', pos: 'adjective', definition: 'happening or moving very quickly', synonyms: ['swift', 'speedy'], antonyms: ['slow', 'sluggish'], level: 1 },
  { word: 'enormous', pos: 'adjective', definition: 'extremely large in size or amount', synonyms: ['huge', 'immense'], antonyms: ['tiny', 'minute'], level: 1 },
  { word: 'cautious', pos: 'adjective', definition: 'careful to avoid risks or mistakes', synonyms: ['careful', 'wary'], antonyms: ['reckless', 'careless'], level: 1 },
  { word: 'gloomy', pos: 'adjective', definition: 'dark or dull in a way that feels sad', synonyms: ['dismal', 'dreary'], antonyms: ['cheerful', 'bright'], level: 1 },
  { word: 'polite', pos: 'adjective', definition: 'behaving with good manners and respect for others', synonyms: ['courteous', 'respectful'], antonyms: ['rude', 'impolite'], level: 1 },
  { word: 'abundant', pos: 'adjective', definition: 'existing in large quantities; more than enough', synonyms: ['plentiful', 'ample'], antonyms: ['scarce', 'sparse'], level: 1 },
  { word: 'vacant', pos: 'adjective', definition: 'not occupied or in use', synonyms: ['empty', 'unoccupied'], antonyms: ['occupied', 'full'], level: 1 },
  { word: 'expand', pos: 'verb', definition: 'to become or make larger', synonyms: ['enlarge', 'grow'], antonyms: ['shrink', 'contract'], level: 1 },
  { word: 'conceal', pos: 'verb', definition: 'to keep something hidden from view or knowledge', synonyms: ['hide', 'cover'], antonyms: ['reveal', 'expose'], level: 1 },
  { word: 'purchase', pos: 'verb', definition: 'to get something by paying money for it', synonyms: ['buy', 'acquire'], antonyms: ['sell'], level: 1 },
  { word: 'assist', pos: 'verb', definition: 'to help someone do something', synonyms: ['help', 'aid'], antonyms: ['hinder', 'obstruct'], level: 1 },
  { word: 'accurate', pos: 'adjective', definition: 'correct in every detail; free from error', synonyms: ['precise', 'exact'], antonyms: ['inaccurate', 'wrong'], level: 1 },
  { word: 'frequent', pos: 'adjective', definition: 'happening often', synonyms: ['regular', 'common'], antonyms: ['rare', 'occasional'], level: 1 },
  { word: 'humble', pos: 'adjective', definition: 'not proud; having a modest view of your own importance', synonyms: ['modest', 'unassuming'], antonyms: ['arrogant', 'proud'], level: 1 },
  { word: 'victory', pos: 'noun', definition: 'success in a game, contest or battle', synonyms: ['win', 'triumph'], antonyms: ['defeat', 'loss'], level: 1 },
  { word: 'reluctant', pos: 'adjective', definition: 'unwilling and hesitant to do something', synonyms: ['unwilling', 'hesitant'], antonyms: ['eager', 'willing'], level: 1 },
  { word: 'shallow', pos: 'adjective', definition: 'having little depth', synonyms: ['superficial'], antonyms: ['deep'], level: 1 },
  { word: 'calm', pos: 'adjective', definition: 'peaceful and free from strong emotion or disturbance', synonyms: ['tranquil', 'serene'], antonyms: ['agitated', 'frantic'], level: 1 },
  { word: 'permanent', pos: 'adjective', definition: 'lasting for a very long time or for ever', synonyms: ['lasting', 'enduring'], antonyms: ['temporary', 'brief'], level: 1 },
  { word: 'clumsy', pos: 'adjective', definition: 'moving or handling things in an awkward, careless way', synonyms: ['awkward', 'ungainly'], antonyms: ['graceful', 'agile'], level: 1 },

  // ---- Level 2 ----
  { word: 'candid', pos: 'adjective', definition: 'honest and direct, even when the truth is uncomfortable', synonyms: ['frank', 'forthright'], antonyms: ['evasive', 'guarded'], level: 2 },
  { word: 'diligent', pos: 'adjective', definition: 'showing steady, careful effort in work or duties', synonyms: ['hardworking', 'industrious'], antonyms: ['lazy', 'negligent'], level: 2 },
  { word: 'obsolete', pos: 'adjective', definition: 'no longer produced or used because something newer has replaced it', synonyms: ['outdated', 'outmoded'], antonyms: ['current', 'up-to-date'], level: 2 },
  { word: 'resilient', pos: 'adjective', definition: 'able to recover quickly from difficulties', synonyms: ['tough', 'hardy'], antonyms: ['vulnerable', 'brittle'], level: 2 },
  { word: 'meticulous', pos: 'adjective', definition: 'showing great attention to small details', synonyms: ['thorough', 'painstaking'], antonyms: ['sloppy', 'slapdash'], level: 2 },
  { word: 'ambiguous', pos: 'adjective', definition: 'open to more than one interpretation', synonyms: ['unclear', 'equivocal'], antonyms: ['clear', 'unambiguous'], level: 2 },
  { word: 'benevolent', pos: 'adjective', definition: 'kind and well-meaning towards others', synonyms: ['kindly', 'compassionate'], antonyms: ['malicious', 'cruel'], level: 2 },
  { word: 'concise', pos: 'adjective', definition: 'giving a lot of information clearly in few words', synonyms: ['brief', 'succinct'], antonyms: ['wordy', 'verbose'], level: 2 },
  { word: 'feasible', pos: 'adjective', definition: 'possible to do easily or conveniently', synonyms: ['achievable', 'workable'], antonyms: ['impractical', 'impossible'], level: 2 },
  { word: 'hostile', pos: 'adjective', definition: 'unfriendly and ready to argue or fight', synonyms: ['antagonistic', 'aggressive'], antonyms: ['friendly', 'welcoming'], level: 2 },
  { word: 'lenient', pos: 'adjective', definition: 'more merciful or tolerant than expected when punishing', synonyms: ['tolerant', 'forgiving'], antonyms: ['strict', 'harsh'], level: 2 },
  { word: 'novice', pos: 'noun', definition: 'a person who is new to an activity and lacks experience', synonyms: ['beginner', 'newcomer'], antonyms: ['expert', 'veteran'], level: 2 },
  { word: 'prudent', pos: 'adjective', definition: 'acting with care and thought for the future', synonyms: ['sensible', 'judicious'], antonyms: ['rash', 'foolish'], level: 2 },
  { word: 'tedious', pos: 'adjective', definition: 'too long, slow or dull; tiresome', synonyms: ['boring', 'monotonous'], antonyms: ['exciting', 'engaging'], level: 2 },
  { word: 'vivid', pos: 'adjective', definition: 'producing strong, clear images in the mind; intensely bright', synonyms: ['striking', 'graphic'], antonyms: ['dull', 'faint'], level: 2 },
  { word: 'deteriorate', pos: 'verb', definition: 'to become progressively worse', synonyms: ['decline', 'worsen'], antonyms: ['improve', 'recover'], level: 2 },
  { word: 'mitigate', pos: 'verb', definition: 'to make something bad less severe or serious', synonyms: ['alleviate', 'lessen'], antonyms: ['aggravate', 'intensify'], level: 2 },
  { word: 'scrutinize', pos: 'verb', definition: 'to examine closely and thoroughly', synonyms: ['inspect', 'examine'], antonyms: ['overlook', 'skim'], level: 2 },
  { word: 'advocate', pos: 'verb', definition: 'to publicly support or recommend a cause or policy', synonyms: ['champion', 'endorse'], antonyms: ['oppose', 'criticize'], level: 2 },
  { word: 'compliant', pos: 'adjective', definition: 'willing to follow rules or the wishes of others', synonyms: ['obedient', 'cooperative'], antonyms: ['defiant', 'rebellious'], level: 2 },
  { word: 'transparent', pos: 'adjective', definition: 'allowing light through so objects behind can be seen clearly; also, open and honest', synonyms: ['clear', 'see-through'], antonyms: ['opaque'], level: 2 },
  { word: 'futile', pos: 'adjective', definition: 'incapable of producing any useful result', synonyms: ['pointless', 'useless'], antonyms: ['worthwhile', 'fruitful'], level: 2 },
  { word: 'vigilant', pos: 'adjective', definition: 'keeping careful watch for possible danger or difficulty', synonyms: ['watchful', 'alert'], antonyms: ['inattentive', 'unwary'], level: 2 },
  { word: 'sincere', pos: 'adjective', definition: 'free from pretence; genuinely meant', synonyms: ['genuine', 'heartfelt'], antonyms: ['insincere', 'fake'], level: 2 },

  // ---- Level 3 ----
  { word: 'ephemeral', pos: 'adjective', definition: 'lasting for a very short time', synonyms: ['fleeting', 'transient'], antonyms: ['everlasting', 'perpetual'], level: 3 },
  { word: 'gregarious', pos: 'adjective', definition: 'fond of company; sociable', synonyms: ['sociable', 'outgoing'], antonyms: ['reclusive', 'introverted'], level: 3 },
  { word: 'laconic', pos: 'adjective', definition: 'using very few words', synonyms: ['terse', 'curt'], antonyms: ['talkative', 'loquacious'], level: 3 },
  { word: 'obstinate', pos: 'adjective', definition: 'stubbornly refusing to change an opinion or course of action', synonyms: ['stubborn', 'headstrong'], antonyms: ['flexible', 'amenable'], level: 3 },
  { word: 'pragmatic', pos: 'adjective', definition: 'dealing with things sensibly and realistically', synonyms: ['practical', 'realistic'], antonyms: ['idealistic', 'impractical'], level: 3 },
  { word: 'ubiquitous', pos: 'adjective', definition: 'present, appearing or found everywhere', synonyms: ['omnipresent', 'pervasive'], antonyms: ['rare', 'uncommon'], level: 3 },
  { word: 'magnanimous', pos: 'adjective', definition: 'generous or forgiving, especially towards a rival or someone less powerful', synonyms: ['big-hearted', 'forgiving'], antonyms: ['petty', 'vindictive'], level: 3 },
  { word: 'innocuous', pos: 'adjective', definition: 'not harmful or offensive', synonyms: ['harmless', 'inoffensive'], antonyms: ['harmful', 'noxious'], level: 3 },
  { word: 'esoteric', pos: 'adjective', definition: 'intended for or understood by only a small group with specialised knowledge', synonyms: ['obscure', 'arcane'], antonyms: ['mainstream', 'well-known'], level: 3 },
  { word: 'ameliorate', pos: 'verb', definition: 'to make something bad or unsatisfactory better', synonyms: ['improve', 'enhance'], antonyms: ['worsen', 'impair'], level: 3 },
  { word: 'exacerbate', pos: 'verb', definition: 'to make a problem or bad situation worse', synonyms: ['aggravate', 'inflame'], antonyms: ['relieve', 'soothe'], level: 3 },
  { word: 'capricious', pos: 'adjective', definition: 'given to sudden, unaccountable changes of mood or behaviour', synonyms: ['fickle', 'unpredictable'], antonyms: ['consistent', 'steady'], level: 3 },
  { word: 'didactic', pos: 'adjective', definition: 'intended to teach, often with a moral lesson', synonyms: ['instructive', 'educational'], antonyms: ['entertaining'], level: 3 },
  { word: 'fastidious', pos: 'adjective', definition: 'very concerned about accuracy, detail and cleanliness', synonyms: ['fussy', 'particular'], antonyms: ['easygoing', 'careless'], level: 3 },
  { word: 'garrulous', pos: 'adjective', definition: 'excessively talkative, especially about trivial matters', synonyms: ['chatty', 'voluble'], antonyms: ['reticent', 'taciturn'], level: 3 },
  { word: 'insipid', pos: 'adjective', definition: 'lacking flavour, interest or vigour', synonyms: ['bland', 'flavourless'], antonyms: ['flavourful', 'zesty'], level: 3 },
  { word: 'obfuscate', pos: 'verb', definition: 'to make something unclear or hard to understand, often deliberately', synonyms: ['confuse', 'obscure'], antonyms: ['clarify', 'illuminate'], level: 3 },
  { word: 'sagacious', pos: 'adjective', definition: 'having or showing good judgement and keen insight', synonyms: ['wise', 'shrewd'], antonyms: ['foolish', 'unwise'], level: 3 },
  { word: 'tenacious', pos: 'adjective', definition: 'holding firmly to something; persistent', synonyms: ['persistent', 'determined'], antonyms: ['irresolute', 'wavering'], level: 3 },
  { word: 'zealous', pos: 'adjective', definition: 'showing great energy and enthusiasm for a cause or goal', synonyms: ['fervent', 'passionate'], antonyms: ['apathetic', 'indifferent'], level: 3 },
  { word: 'benign', pos: 'adjective', definition: 'gentle and kind; also, not harmful', synonyms: ['gentle', 'mild'], antonyms: ['malignant', 'hostile'], level: 3 },
  { word: 'superfluous', pos: 'adjective', definition: 'more than is needed; unnecessary', synonyms: ['excess', 'redundant'], antonyms: ['essential', 'necessary'], level: 3 },
  { word: 'equanimity', pos: 'noun', definition: 'mental calmness, especially in a difficult situation', synonyms: ['composure', 'serenity'], antonyms: ['agitation', 'anxiety'], level: 3 },
  { word: 'cacophony', pos: 'noun', definition: 'a harsh, unpleasant mixture of sounds', synonyms: ['din', 'racket'], antonyms: ['harmony', 'silence'], level: 3 },
];

export interface SpellingEntry {
  word: string;
  hint: string;
  wrong: [string, string, string];
  level: 1 | 2 | 3;
  tip: string;
}

// Commonly misspelled words with plausible misspellings and a memory tip.
export const SPELLING: SpellingEntry[] = [
  { word: 'believe', hint: 'to accept that something is true', wrong: ['beleive', 'belive', 'beleeve'], level: 1, tip: '"i before e except after c": bel-I-E-ve.' },
  { word: 'friend', hint: 'a person you know well and like', wrong: ['freind', 'frend', 'friennd'], level: 1, tip: 'You are a friEND to the END.' },
  { word: 'beginning', hint: 'the point where something starts', wrong: ['begining', 'beginnning', 'beggining'], level: 1, tip: 'Double n before -ing: begi-NN-ing.' },
  { word: 'tomorrow', hint: 'the day after today', wrong: ['tommorow', 'tomorow', 'tommorrow'], level: 1, tip: 'One m, two r: to-M-o-RR-ow.' },
  { word: 'different', hint: 'not the same as another', wrong: ['diffrent', 'diferent', 'differant'], level: 1, tip: 'Double f and -ent: di-FF-er-ENT.' },
  { word: 'separate', hint: 'forming a unit by itself; apart', wrong: ['seperate', 'separete', 'seprate'], level: 1, tip: 'There is "a rat" in sep-A-RAT-e.' },
  { word: 'receive', hint: 'to be given or sent something', wrong: ['recieve', 'receeve', 'receve'], level: 1, tip: 'After c, e comes before i: rec-E-I-ve.' },
  { word: 'business', hint: 'the activity of buying, selling or providing services', wrong: ['buisness', 'busness', 'bussiness'], level: 1, tip: 'Think "bus-i-ness".' },
  { word: 'calendar', hint: 'a chart showing the days, weeks and months of a year', wrong: ['calender', 'calandar', 'callendar'], level: 1, tip: 'Ends in -dAR.' },
  { word: 'definitely', hint: 'without doubt', wrong: ['definately', 'definitly', 'defanitely'], level: 1, tip: 'It contains the word "finite": de-FINITE-ly.' },
  { word: 'necessary', hint: 'needed; essential', wrong: ['neccessary', 'necesary', 'neccesary'], level: 2, tip: 'One collar (c), two sleeves (ss).' },
  { word: 'accommodate', hint: 'to provide room or lodging for', wrong: ['accomodate', 'acommodate', 'acomodate'], level: 2, tip: 'Big enough to accommodate two c\'s and two m\'s.' },
  { word: 'occurrence', hint: 'an incident or event', wrong: ['occurence', 'ocurrence', 'occurrance'], level: 2, tip: 'Double c, double r, and -ence.' },
  { word: 'embarrass', hint: 'to make someone feel awkward or ashamed', wrong: ['embarass', 'embaras', 'embarrasse'], level: 2, tip: 'Double r and double s — you go Really Red and Smile Shyly.' },
  { word: 'conscience', hint: 'your inner sense of right and wrong', wrong: ['concience', 'conscence', 'consience'], level: 2, tip: 'It is "con" + "science".' },
  { word: 'rhythm', hint: 'a strong, regular repeated pattern of sound or movement', wrong: ['rythm', 'rhythem', 'rhytm'], level: 2, tip: 'Rhythm Helps Your Two Hips Move.' },
  { word: 'maintenance', hint: 'the process of keeping something in good condition', wrong: ['maintainance', 'maintenence', 'maintanance'], level: 2, tip: 'main-TEN-ance: the "ai" of maintain becomes "e".' },
  { word: 'privilege', hint: 'a special right or advantage', wrong: ['priviledge', 'privelege', 'privilige'], level: 2, tip: 'No d: privi-LEGE.' },
  { word: 'occasion', hint: 'a particular time or event', wrong: ['occassion', 'ocasion', 'ocassion'], level: 2, tip: 'Two c\'s, one s.' },
  { word: 'government', hint: 'the group that runs a country or state', wrong: ['goverment', 'govenment', 'governmant'], level: 2, tip: 'You GOVERN, then add -ment.' },
  { word: 'questionnaire', hint: 'a set of printed questions used for a survey', wrong: ['questionaire', 'questionnare', 'questionnair'], level: 3, tip: 'Double n, ends in -aire.' },
  { word: 'millennium', hint: 'a period of a thousand years', wrong: ['millenium', 'milennium', 'millenneum'], level: 3, tip: 'Double l and double n.' },
  { word: 'liaison', hint: 'communication or cooperation between groups', wrong: ['liason', 'liasion', 'laison'], level: 3, tip: 'Two i\'s: L-I-A-I-son.' },
  { word: 'pharaoh', hint: 'a ruler in ancient Egypt', wrong: ['pharoah', 'pharoh', 'faraoh'], level: 3, tip: 'The a comes before the o: phar-A-OH.' },
  { word: 'mischievous', hint: 'causing or showing a fondness for playful trouble', wrong: ['mischievious', 'mischevious', 'mischivous'], level: 3, tip: 'Three syllables: mis-chie-vous (no extra "i").' },
  { word: 'connoisseur', hint: 'an expert judge in matters of taste', wrong: ['conoisseur', 'connoiseur', 'connoisseure'], level: 3, tip: 'Double n, double s: co-NN-oi-SS-eur.' },
  { word: 'entrepreneur', hint: 'a person who sets up a business, taking on financial risk', wrong: ['entrepeneur', 'entreprenuer', 'enterpreneur'], level: 3, tip: 'entre-PRE-neur: "pre" in the middle.' },
  { word: 'bureaucracy', hint: 'a system of government with many complicated rules and officials', wrong: ['beaurocracy', 'bureacracy', 'burocracy'], level: 3, tip: 'Starts with "bureau".' },
  { word: 'idiosyncrasy', hint: 'a habit or way of behaving peculiar to one person', wrong: ['idiosyncracy', 'ideosyncrasy', 'idiosincrasy'], level: 3, tip: 'Ends in -crasy (with an s), not -cracy.' },
  { word: 'supersede', hint: 'to take the place of something older', wrong: ['supercede', 'superseed', 'surpersede'], level: 3, tip: 'The only common English word ending in -sede.' },
];
