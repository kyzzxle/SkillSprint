// Country reference data used by the Geography Challenge.
// iso2: ISO 3166-1 alpha-2 (lowercase, matches the flag file names)
// num:  ISO 3166-1 numeric (matches feature ids in the Natural Earth / world-atlas map)
// capital: null when the capital is disputed, in transition or otherwise ambiguous —
//          those countries are excluded from capital-city questions.
// tier: 1 = widely known, 2 = moderately known, 3 = harder
// transcontinental: excluded from "which continent" questions to avoid ambiguous answers.

export type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';

export interface Country {
  name: string;
  iso2: string;
  num: string;
  capital: string | null;
  capitalNote?: string;
  continent: Continent;
  tier: 1 | 2 | 3;
  transcontinental?: boolean;
}

export const CONTINENTS: Continent[] = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

export const COUNTRIES: Country[] = [
  // North America (incl. Central America & Caribbean)
  { name: 'United States', iso2: 'us', num: '840', capital: 'Washington, D.C.', continent: 'North America', tier: 1 },
  { name: 'Canada', iso2: 'ca', num: '124', capital: 'Ottawa', continent: 'North America', tier: 1 },
  { name: 'Mexico', iso2: 'mx', num: '484', capital: 'Mexico City', continent: 'North America', tier: 1 },
  { name: 'Cuba', iso2: 'cu', num: '192', capital: 'Havana', continent: 'North America', tier: 2 },
  { name: 'Jamaica', iso2: 'jm', num: '388', capital: 'Kingston', continent: 'North America', tier: 2 },
  { name: 'Costa Rica', iso2: 'cr', num: '188', capital: 'San José', continent: 'North America', tier: 2 },
  { name: 'Panama', iso2: 'pa', num: '591', capital: 'Panama City', continent: 'North America', tier: 2 },
  { name: 'Guatemala', iso2: 'gt', num: '320', capital: 'Guatemala City', continent: 'North America', tier: 3 },
  { name: 'Honduras', iso2: 'hn', num: '340', capital: 'Tegucigalpa', continent: 'North America', tier: 3 },
  { name: 'Nicaragua', iso2: 'ni', num: '558', capital: 'Managua', continent: 'North America', tier: 3 },
  { name: 'El Salvador', iso2: 'sv', num: '222', capital: 'San Salvador', continent: 'North America', tier: 3 },
  { name: 'Dominican Republic', iso2: 'do', num: '214', capital: 'Santo Domingo', continent: 'North America', tier: 3 },
  { name: 'Haiti', iso2: 'ht', num: '332', capital: 'Port-au-Prince', continent: 'North America', tier: 3 },
  { name: 'Bahamas', iso2: 'bs', num: '044', capital: 'Nassau', continent: 'North America', tier: 3 },

  // South America
  { name: 'Brazil', iso2: 'br', num: '076', capital: 'Brasília', continent: 'South America', tier: 1 },
  { name: 'Argentina', iso2: 'ar', num: '032', capital: 'Buenos Aires', continent: 'South America', tier: 1 },
  { name: 'Chile', iso2: 'cl', num: '152', capital: 'Santiago', continent: 'South America', tier: 2 },
  { name: 'Colombia', iso2: 'co', num: '170', capital: 'Bogotá', continent: 'South America', tier: 2 },
  { name: 'Peru', iso2: 'pe', num: '604', capital: 'Lima', continent: 'South America', tier: 2 },
  { name: 'Venezuela', iso2: 've', num: '862', capital: 'Caracas', continent: 'South America', tier: 2 },
  { name: 'Ecuador', iso2: 'ec', num: '218', capital: 'Quito', continent: 'South America', tier: 3 },
  { name: 'Uruguay', iso2: 'uy', num: '858', capital: 'Montevideo', continent: 'South America', tier: 3 },
  { name: 'Paraguay', iso2: 'py', num: '600', capital: 'Asunción', continent: 'South America', tier: 3 },
  {
    name: 'Bolivia', iso2: 'bo', num: '068', capital: 'Sucre', continent: 'South America', tier: 3,
    capitalNote: 'Sucre is the constitutional capital; La Paz is the seat of government.',
  },
  { name: 'Guyana', iso2: 'gy', num: '328', capital: 'Georgetown', continent: 'South America', tier: 3 },
  { name: 'Suriname', iso2: 'sr', num: '740', capital: 'Paramaribo', continent: 'South America', tier: 3 },

  // Europe
  { name: 'United Kingdom', iso2: 'gb', num: '826', capital: 'London', continent: 'Europe', tier: 1 },
  { name: 'France', iso2: 'fr', num: '250', capital: 'Paris', continent: 'Europe', tier: 1 },
  { name: 'Germany', iso2: 'de', num: '276', capital: 'Berlin', continent: 'Europe', tier: 1 },
  { name: 'Italy', iso2: 'it', num: '380', capital: 'Rome', continent: 'Europe', tier: 1 },
  { name: 'Spain', iso2: 'es', num: '724', capital: 'Madrid', continent: 'Europe', tier: 1 },
  { name: 'Portugal', iso2: 'pt', num: '620', capital: 'Lisbon', continent: 'Europe', tier: 1 },
  { name: 'Greece', iso2: 'gr', num: '300', capital: 'Athens', continent: 'Europe', tier: 1 },
  { name: 'Sweden', iso2: 'se', num: '752', capital: 'Stockholm', continent: 'Europe', tier: 1 },
  { name: 'Russia', iso2: 'ru', num: '643', capital: 'Moscow', continent: 'Europe', tier: 1, transcontinental: true },
  {
    name: 'Netherlands', iso2: 'nl', num: '528', capital: 'Amsterdam', continent: 'Europe', tier: 2,
    capitalNote: 'Amsterdam is the constitutional capital; the government sits in The Hague.',
  },
  { name: 'Belgium', iso2: 'be', num: '056', capital: 'Brussels', continent: 'Europe', tier: 2 },
  { name: 'Switzerland', iso2: 'ch', num: '756', capital: 'Bern', continent: 'Europe', tier: 2 },
  { name: 'Austria', iso2: 'at', num: '040', capital: 'Vienna', continent: 'Europe', tier: 2 },
  { name: 'Norway', iso2: 'no', num: '578', capital: 'Oslo', continent: 'Europe', tier: 2 },
  { name: 'Finland', iso2: 'fi', num: '246', capital: 'Helsinki', continent: 'Europe', tier: 2 },
  { name: 'Denmark', iso2: 'dk', num: '208', capital: 'Copenhagen', continent: 'Europe', tier: 2 },
  { name: 'Ireland', iso2: 'ie', num: '372', capital: 'Dublin', continent: 'Europe', tier: 2 },
  { name: 'Iceland', iso2: 'is', num: '352', capital: 'Reykjavík', continent: 'Europe', tier: 2 },
  { name: 'Poland', iso2: 'pl', num: '616', capital: 'Warsaw', continent: 'Europe', tier: 2 },
  { name: 'Czechia', iso2: 'cz', num: '203', capital: 'Prague', continent: 'Europe', tier: 2 },
  { name: 'Hungary', iso2: 'hu', num: '348', capital: 'Budapest', continent: 'Europe', tier: 2 },
  { name: 'Romania', iso2: 'ro', num: '642', capital: 'Bucharest', continent: 'Europe', tier: 2 },
  { name: 'Ukraine', iso2: 'ua', num: '804', capital: 'Kyiv', continent: 'Europe', tier: 2 },
  { name: 'Slovakia', iso2: 'sk', num: '703', capital: 'Bratislava', continent: 'Europe', tier: 3 },
  { name: 'Bulgaria', iso2: 'bg', num: '100', capital: 'Sofia', continent: 'Europe', tier: 3 },
  { name: 'Serbia', iso2: 'rs', num: '688', capital: 'Belgrade', continent: 'Europe', tier: 3 },
  { name: 'Croatia', iso2: 'hr', num: '191', capital: 'Zagreb', continent: 'Europe', tier: 3 },
  { name: 'Slovenia', iso2: 'si', num: '705', capital: 'Ljubljana', continent: 'Europe', tier: 3 },
  { name: 'Belarus', iso2: 'by', num: '112', capital: 'Minsk', continent: 'Europe', tier: 3 },
  { name: 'Lithuania', iso2: 'lt', num: '440', capital: 'Vilnius', continent: 'Europe', tier: 3 },
  { name: 'Latvia', iso2: 'lv', num: '428', capital: 'Riga', continent: 'Europe', tier: 3 },
  { name: 'Estonia', iso2: 'ee', num: '233', capital: 'Tallinn', continent: 'Europe', tier: 3 },
  { name: 'Albania', iso2: 'al', num: '008', capital: 'Tirana', continent: 'Europe', tier: 3 },
  { name: 'Moldova', iso2: 'md', num: '498', capital: 'Chișinău', continent: 'Europe', tier: 3 },
  { name: 'North Macedonia', iso2: 'mk', num: '807', capital: 'Skopje', continent: 'Europe', tier: 3 },
  { name: 'Bosnia and Herzegovina', iso2: 'ba', num: '070', capital: 'Sarajevo', continent: 'Europe', tier: 3 },
  { name: 'Montenegro', iso2: 'me', num: '499', capital: 'Podgorica', continent: 'Europe', tier: 3 },

  // Asia
  { name: 'China', iso2: 'cn', num: '156', capital: 'Beijing', continent: 'Asia', tier: 1 },
  { name: 'Japan', iso2: 'jp', num: '392', capital: 'Tokyo', continent: 'Asia', tier: 1 },
  { name: 'South Korea', iso2: 'kr', num: '410', capital: 'Seoul', continent: 'Asia', tier: 1 },
  { name: 'India', iso2: 'in', num: '356', capital: 'New Delhi', continent: 'Asia', tier: 1 },
  { name: 'Thailand', iso2: 'th', num: '764', capital: 'Bangkok', continent: 'Asia', tier: 1 },
  { name: 'Indonesia', iso2: 'id', num: '360', capital: null, continent: 'Asia', tier: 1 },
  { name: 'Turkey', iso2: 'tr', num: '792', capital: 'Ankara', continent: 'Asia', tier: 1, transcontinental: true },
  { name: 'North Korea', iso2: 'kp', num: '408', capital: 'Pyongyang', continent: 'Asia', tier: 2 },
  { name: 'Pakistan', iso2: 'pk', num: '586', capital: 'Islamabad', continent: 'Asia', tier: 2 },
  { name: 'Bangladesh', iso2: 'bd', num: '050', capital: 'Dhaka', continent: 'Asia', tier: 2 },
  { name: 'Vietnam', iso2: 'vn', num: '704', capital: 'Hanoi', continent: 'Asia', tier: 2 },
  { name: 'Philippines', iso2: 'ph', num: '608', capital: 'Manila', continent: 'Asia', tier: 2 },
  { name: 'Malaysia', iso2: 'my', num: '458', capital: 'Kuala Lumpur', continent: 'Asia', tier: 2 },
  { name: 'Singapore', iso2: 'sg', num: '702', capital: 'Singapore', continent: 'Asia', tier: 2 },
  { name: 'Saudi Arabia', iso2: 'sa', num: '682', capital: 'Riyadh', continent: 'Asia', tier: 2 },
  { name: 'Iran', iso2: 'ir', num: '364', capital: 'Tehran', continent: 'Asia', tier: 2 },
  { name: 'Iraq', iso2: 'iq', num: '368', capital: 'Baghdad', continent: 'Asia', tier: 2 },
  { name: 'Afghanistan', iso2: 'af', num: '004', capital: 'Kabul', continent: 'Asia', tier: 2 },
  { name: 'Nepal', iso2: 'np', num: '524', capital: 'Kathmandu', continent: 'Asia', tier: 2 },
  { name: 'Mongolia', iso2: 'mn', num: '496', capital: 'Ulaanbaatar', continent: 'Asia', tier: 2 },
  { name: 'Israel', iso2: 'il', num: '376', capital: null, continent: 'Asia', tier: 2 },
  { name: 'United Arab Emirates', iso2: 'ae', num: '784', capital: 'Abu Dhabi', continent: 'Asia', tier: 2 },
  {
    name: 'Sri Lanka', iso2: 'lk', num: '144', capital: 'Sri Jayawardenepura Kotte', continent: 'Asia', tier: 3,
    capitalNote: 'Sri Jayawardenepura Kotte is the legislative capital; Colombo is the commercial capital.',
  },
  { name: 'Myanmar', iso2: 'mm', num: '104', capital: 'Naypyidaw', continent: 'Asia', tier: 3 },
  { name: 'Kazakhstan', iso2: 'kz', num: '398', capital: 'Astana', continent: 'Asia', tier: 3, transcontinental: true },
  { name: 'Uzbekistan', iso2: 'uz', num: '860', capital: 'Tashkent', continent: 'Asia', tier: 3 },
  { name: 'Jordan', iso2: 'jo', num: '400', capital: 'Amman', continent: 'Asia', tier: 3 },
  { name: 'Lebanon', iso2: 'lb', num: '422', capital: 'Beirut', continent: 'Asia', tier: 3 },
  { name: 'Syria', iso2: 'sy', num: '760', capital: 'Damascus', continent: 'Asia', tier: 3 },
  { name: 'Qatar', iso2: 'qa', num: '634', capital: 'Doha', continent: 'Asia', tier: 3 },
  { name: 'Kuwait', iso2: 'kw', num: '414', capital: 'Kuwait City', continent: 'Asia', tier: 3 },
  { name: 'Oman', iso2: 'om', num: '512', capital: 'Muscat', continent: 'Asia', tier: 3 },
  { name: 'Cambodia', iso2: 'kh', num: '116', capital: 'Phnom Penh', continent: 'Asia', tier: 3 },
  { name: 'Laos', iso2: 'la', num: '418', capital: 'Vientiane', continent: 'Asia', tier: 3 },
  { name: 'Bhutan', iso2: 'bt', num: '064', capital: 'Thimphu', continent: 'Asia', tier: 3 },
  { name: 'Georgia', iso2: 'ge', num: '268', capital: 'Tbilisi', continent: 'Asia', tier: 3, transcontinental: true },
  { name: 'Armenia', iso2: 'am', num: '051', capital: 'Yerevan', continent: 'Asia', tier: 3, transcontinental: true },
  { name: 'Azerbaijan', iso2: 'az', num: '031', capital: 'Baku', continent: 'Asia', tier: 3, transcontinental: true },

  // Africa
  { name: 'Egypt', iso2: 'eg', num: '818', capital: 'Cairo', continent: 'Africa', tier: 1, transcontinental: true },
  {
    name: 'South Africa', iso2: 'za', num: '710', capital: 'Pretoria', continent: 'Africa', tier: 1,
    capitalNote: 'South Africa has three capitals: Pretoria (executive), Cape Town (legislative) and Bloemfontein (judicial).',
  },
  { name: 'Nigeria', iso2: 'ng', num: '566', capital: 'Abuja', continent: 'Africa', tier: 2 },
  { name: 'Kenya', iso2: 'ke', num: '404', capital: 'Nairobi', continent: 'Africa', tier: 2 },
  { name: 'Ethiopia', iso2: 'et', num: '231', capital: 'Addis Ababa', continent: 'Africa', tier: 2 },
  { name: 'Morocco', iso2: 'ma', num: '504', capital: 'Rabat', continent: 'Africa', tier: 2 },
  { name: 'Algeria', iso2: 'dz', num: '012', capital: 'Algiers', continent: 'Africa', tier: 2 },
  { name: 'Ghana', iso2: 'gh', num: '288', capital: 'Accra', continent: 'Africa', tier: 2 },
  { name: 'Tunisia', iso2: 'tn', num: '788', capital: 'Tunis', continent: 'Africa', tier: 2 },
  { name: 'Tanzania', iso2: 'tz', num: '834', capital: 'Dodoma', continent: 'Africa', tier: 3 },
  { name: 'Uganda', iso2: 'ug', num: '800', capital: 'Kampala', continent: 'Africa', tier: 3 },
  { name: 'Senegal', iso2: 'sn', num: '686', capital: 'Dakar', continent: 'Africa', tier: 3 },
  { name: 'Libya', iso2: 'ly', num: '434', capital: 'Tripoli', continent: 'Africa', tier: 3 },
  { name: 'Angola', iso2: 'ao', num: '024', capital: 'Luanda', continent: 'Africa', tier: 3 },
  { name: 'Mozambique', iso2: 'mz', num: '508', capital: 'Maputo', continent: 'Africa', tier: 3 },
  { name: 'Zimbabwe', iso2: 'zw', num: '716', capital: 'Harare', continent: 'Africa', tier: 3 },
  { name: 'Zambia', iso2: 'zm', num: '894', capital: 'Lusaka', continent: 'Africa', tier: 3 },
  { name: 'Madagascar', iso2: 'mg', num: '450', capital: 'Antananarivo', continent: 'Africa', tier: 3 },
  { name: 'Cameroon', iso2: 'cm', num: '120', capital: 'Yaoundé', continent: 'Africa', tier: 3 },
  { name: 'DR Congo', iso2: 'cd', num: '180', capital: 'Kinshasa', continent: 'Africa', tier: 3 },
  { name: 'Mali', iso2: 'ml', num: '466', capital: 'Bamako', continent: 'Africa', tier: 3 },
  { name: 'Namibia', iso2: 'na', num: '516', capital: 'Windhoek', continent: 'Africa', tier: 3 },
  { name: 'Botswana', iso2: 'bw', num: '072', capital: 'Gaborone', continent: 'Africa', tier: 3 },
  { name: 'Rwanda', iso2: 'rw', num: '646', capital: 'Kigali', continent: 'Africa', tier: 3 },
  { name: 'Somalia', iso2: 'so', num: '706', capital: 'Mogadishu', continent: 'Africa', tier: 3 },
  { name: 'Niger', iso2: 'ne', num: '562', capital: 'Niamey', continent: 'Africa', tier: 3 },

  // Oceania
  { name: 'Australia', iso2: 'au', num: '036', capital: 'Canberra', continent: 'Oceania', tier: 1 },
  { name: 'New Zealand', iso2: 'nz', num: '554', capital: 'Wellington', continent: 'Oceania', tier: 1 },
  { name: 'Papua New Guinea', iso2: 'pg', num: '598', capital: 'Port Moresby', continent: 'Oceania', tier: 3 },
  { name: 'Fiji', iso2: 'fj', num: '242', capital: 'Suva', continent: 'Oceania', tier: 3 },
];
