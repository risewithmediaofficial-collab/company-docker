const DEFAULT_CURRENCY = 'INR';

let inrFormatter;

const getInrFormatter = () => {
  if (!inrFormatter) {
    inrFormatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return inrFormatter;
};

export const getCurrencyFormatter = () => getInrFormatter();

export const formatCurrency = (value) => getInrFormatter().format(Number(value || 0));

export const formatINR = (value) => formatCurrency(value);
