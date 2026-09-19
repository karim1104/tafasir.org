// resultCount.js
// Helpers for phrasing a result count in Arabic, which needs singular,
// dual and plural forms rather than a single "N items" template.

const formatNumber = (count) => count.toLocaleString('en-US');

/**
 * Builds an Arabic count phrase that agrees with the counted noun.
 *
 * forms: { singular, dual, plural, accusative }
 *   singular   - "آية واحدة"        (count === 1)
 *   dual       - "آيتين"            (count === 2)
 *   plural     - "آيات"             (3 - 10, e.g. "٧ آيات")
 *   accusative - "آية"              (0 or 11+, e.g. "٢٥ آية")
 */
export function formatArabicCount(count, forms) {
  if (count === 1) return forms.singular;
  if (count === 2) return forms.dual;

  const noun = count >= 3 && count <= 10 ? forms.plural : forms.accusative;
  return `${formatNumber(count)} ${noun}`;
}

export const AYAH_FORMS = {
  singular: 'آية واحدة',
  dual: 'آيتين',
  plural: 'آيات',
  accusative: 'آية',
};

export const PASSAGE_FORMS = {
  singular: 'مقطع واحد',
  dual: 'مقطعين',
  plural: 'مقاطع',
  accusative: 'مقطعاً',
};
