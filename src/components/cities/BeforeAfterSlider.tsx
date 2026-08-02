import { useState } from 'react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

import austinBefore from '../../assets/austin-pic-1.png';
import austinAfter from '../../assets/austin-pic-2.png';
import seattleBefore from '../../assets/seattle-pic-1.png';
import seattleAfter from '../../assets/seattle-pic-2.png';
import brickellBefore from '../../assets/brickell-pic-1.png';
import brickellAfter from '../../assets/brickell-pic-2.png';

const PAIRS = [
  {
    label: 'Austin',
    before: austinBefore,
    after: austinAfter,
    caption: 'Austin — Google Maps imagery (2019 vs 2025)',
  },
  {
    label: 'Seattle',
    before: seattleBefore,
    after: seattleAfter,
    caption: 'Seattle — Google Maps imagery (2009 vs 2025)',
  },
  {
    label: 'Brickell',
    before: brickellBefore,
    after: brickellAfter,
    caption: 'Brickell (Miami) — Google Maps imagery (2007 vs 2025)',
  },
];

export default function BeforeAfterSlider() {
  const [current, setCurrent] = useState(0);
  const pair = PAIRS[current];

  return (
    <div className="py-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {PAIRS.map((p, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={
              i === current
                ? 'px-4 py-1.5 rounded-lg border bg-yimby-100 text-yimby-700 border-yimby-300 text-sm'
                : 'px-4 py-1.5 rounded-lg border bg-white text-gray-500 border-gray-200 text-sm hover:bg-gray-50'
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={pair.before}
            alt={`${pair.label} before`}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={pair.after}
            alt={`${pair.label} after`}
          />
        }
        style={{
          borderRadius: 12,
          border: '0.5px solid #d1fae5',
        }}
      />

      <p className="mt-3 text-center text-xs text-gray-500">
        <strong>{pair.caption}</strong>
        <br />
        Images © Google Maps. Imagery dates vary by location and are shown for
        comparison purposes only.
      </p>
    </div>
  );
}