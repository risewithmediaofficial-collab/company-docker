const DEFAULT_CURRENCY = 'INR';

const formatterCache = new Map();

const localeForCurrency = (currency) => (currency === 'INR' ? 'en-IN' : 'en-US');

export const getCurrencyFormatter = (currency = DEFAULT_CURRENCY) => {
  const code = currency || DEFAULT_CURRENCY;
  if (!formatterCache.has(code)) {
    formatterCache.set(
      code,
      new Intl.NumberFormat(localeForCurrency(code), {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    );
  }
  return formatterCache.get(code);
};

export const formatCurrency = (value, currency = DEFAULT_CURRENCY) =>
  getCurrencyFormatter(currency).format(Number(value || 0));

export const formatINR = (value) => formatCurrency(value, 'INR');
