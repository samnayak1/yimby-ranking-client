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
      'USD'
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
      'US','CA','GB','DE','FR','AU','JP','IN','BR','MX','ES','IT','NL','SE','NO','DK','FI','NZ','SG','KR'
    ],
  },
};

export const PRICE_RANGES = [
  { key: 'any',    label: 'Any Price',       value: undefined },
  { key: '<200k',  label: 'Under $200k',     value: { min: 0,       max: 200000   } },
  { key: '200-400',label: '$200k – $400k',   value: { min: 200000,  max: 400000   } },
  { key: '400-600',label: '$400k – $600k',   value: { min: 400000,  max: 600000   } },
  { key: '600-800',label: '$600k – $800k',   value: { min: 600000,  max: 800000   } },
  { key: '800-1m', label: '$800k – $1M',     value: { min: 800000,  max: 1000000  } },
  { key: '>1m',    label: 'Over $1M',        value: { min: 1000000, max: undefined } },
];