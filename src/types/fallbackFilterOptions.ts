export const FALLBACK_FILTER_OPTIONS = {
  cities: {
    countries: [
      'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
      'Australia', 'Japan', 'India', 'Brazil', 'Mexico', 'Spain', 'Italy',
      'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'New Zealand',
      'Singapore', 'South Korea',
    ],
    regions: [
      'California', 'Texas', 'New York', 'Florida', 'Ontario', 'Quebec',
      'British Columbia', 'London', 'Berlin', 'Paris', 'Tokyo', 'Mumbai',
      'São Paulo', 'Mexico City', 'Madrid', 'Rome', 'Amsterdam', 'Stockholm',
      'Oslo', 'Copenhagen',
    ],
    currencies: [
      'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR',
      'BRL', 'MXN', 'SEK', 'NOK', 'DKK', 'NZD', 'SGD', 'KRW',
    ],
  },
  politicians: {
    designations: [
      'Mayor', 'Senator', 'Governor', 'City Council Member', 'Congressman',
      'MP', 'Minister', 'President', 'Prime Minister', 'Assembly Member',
      'Alderman', 'Commissioner', 'Supervisor',
    ],
    politicalLeanings: [
      'Liberal', 'Conservative', 'Democratic Socialist', 'Libertarian',
      'Nationalist', 'Green', 'Independent', 'Progressive', 'Moderate',
      'Centrist', 'Far Left', 'Far Right',
    ],
    nationalities: [
      'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
      'Australia', 'Japan', 'India', 'Brazil', 'Mexico', 'Spain', 'Italy',
      'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'New Zealand',
      'Singapore', 'South Korea',
    ],
  },
};

export const SCORE_RANGES = [
  { key: 'all',     label: 'All Scores',         value: undefined },
  { key: '9-10',    label: '9–10 (Excellent)',    value: { min: 9,  max: 10 } },
  { key: '7-8',     label: '7–8 (Good)',          value: { min: 7,  max: 8  } },
  { key: '5-6',     label: '5–6 (Average)',       value: { min: 5,  max: 6  } },
  { key: '3-4',     label: '3–4 (Below Average)', value: { min: 3,  max: 4  } },
  { key: '0-2',     label: '0–2 (Poor)',          value: { min: 0,  max: 2  } },
];

export const PRICE_RANGES = [
  { key: 'any',    label: 'Any Price',       value: undefined },
  { key: '<200k',  label: 'Under $200k',     value: { min: 0,       max: 200000   } },
  { key: '200-400',label: '$200k – $400k',   value: { min: 200000,  max: 400000   } },
  { key: '400-600',label: '$400k – $600k',   value: { min: 400000,  max: 600000   } },
  { key: '600-800',label: '$600k – $800k',   value: { min: 600000,  max: 800000   } },
  { key: '800-1m', label: '$800k – $1M',     value: { min: 800000,  max: 1000000  } },
  { key: '>1m',    label: 'Over $1M',        value: { min: 1000000, max: undefined } },
];