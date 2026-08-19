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
  return (
    <div className="py-2 sm:py-4 space-y-8 sm:space-y-12">
      {PAIRS.map((pair) => (
        <section key={pair.label}>
          <h3 className="mb-3 text-base sm:text-lg font-semibold text-gray-800">
            {pair.label}
          </h3>

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
              width: '100%',
              maxHeight: '70vh',
              touchAction: 'pan-y',
            }}
          />

          <p className="mt-3 text-center text-xs text-gray-500">
            <strong>{pair.caption}</strong>
          </p>
        </section>
      ))}

      <p className="text-center text-xs text-gray-500">
        Images © Google Maps. Imagery dates vary by location and are shown for
        comparison purposes only.
      </p>
    </div>
  );
}