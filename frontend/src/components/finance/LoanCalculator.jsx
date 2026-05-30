import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Bank data with interest rates
const BANKS = [
  {
    id: 'pnb',
    name: 'PNB (Panjab National Bank)',
    minRate: 7.3,
    maxRate: 7.8,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    minRate: 7.3,
    maxRate: 7.8,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  {
    id: 'lic',
    name: 'LIC',
    minRate: 7.3,
    maxRate: 7.8,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'idbi',
    name: 'IDBI Bank',
    minRate: 6.7,
    maxRate: 7.5,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
];

// Utility functions
const calculateEMI = (principal, annualRate, months) => {
  if (principal <= 0 || annualRate < 0 || months <= 0) return 0;

  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const LoanCalculator = () => {
  const [principal, setPrincipal] = useState(500000);
  const [tenure, setTenure] = useState(60);
  const [selectedBank, setSelectedBank] = useState('idbi');
  const [interestRate, setInterestRate] = useState(6.7);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const bank = BANKS.find((b) => b.id === selectedBank);

  // Calculations
  const calculations = useMemo(() => {
    const emi = calculateEMI(principal, interestRate, tenure);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - principal;

    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
    };
  }, [principal, interestRate, tenure]);

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
    const newBank = BANKS.find((b) => b.id === bankId);
    setInterestRate(newBank.minRate);
    setIsDropdownOpen(false);
  };

  const handleInterestRateChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    if (value >= bank.minRate && value <= bank.maxRate) {
      setInterestRate(value);
    }
  };

  const handlePrincipalChange = (e) => {
    const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
    if (value >= 0) {
      setPrincipal(value);
    }
  };

  const handleTenureChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value > 0 && value <= 360) {
      setTenure(value);
    }
  };

  const copyToClipboard = () => {
    const text = `Loan Calculator Result:\nPrincipal: ${formatCurrency(principal)}\nTenure: ${tenure} months\nBank: ${bank.name}\nInterest Rate: ${interestRate.toFixed(2)}%\nMonthly EMI: ${formatCurrency(calculations.emi)}\nTotal Interest: ${formatCurrency(calculations.totalInterest)}\nTotal Amount: ${formatCurrency(calculations.totalAmount)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bank Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">Select Bank</label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  bank.borderColor
                } ${bank.bgColor} font-medium flex items-center justify-between transition-all hover:shadow-md ${
                  isDropdownOpen ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
              >
                <span className={bank.textColor}>{bank.name}</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ${bank.textColor}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                >
                  {BANKS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleBankSelect(b.id)}
                      className={`w-full px-4 py-3 text-left font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedBank === b.id
                          ? `${b.bgColor} ${b.textColor}`
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{b.name}</span>
                        <span className="text-xs">
                          {b.minRate}% - {b.maxRate}%
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Bank Rate Info */}
            <div className={`p-3 rounded-lg ${bank.bgColor} border ${bank.borderColor}`}>
              <p className={`text-sm ${bank.textColor}`}>
                <span className="font-semibold">Interest Rate Range:</span> {bank.minRate}% - {bank.maxRate}%
              </p>
            </div>
          </div>

          {/* Loan Amount Input */}
          <div className="space-y-3">
            <label htmlFor="principal" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Loan Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="text"
                id="principal"
                value={principal.toLocaleString('en-IN')}
                onChange={handlePrincipalChange}
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter loan amount"
              />
            </div>
            <input
              type="range"
              min="50000"
              max="10000000"
              step="50000"
              value={principal}
              onChange={(e) => setPrincipal(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>₹50K</span>
              <span>₹1Cr</span>
            </div>
          </div>

          {/* Tenure Input */}
          <div className="space-y-3">
            <label htmlFor="tenure" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Loan Tenure (Months)
            </label>
            <div className="relative">
              <input
                type="number"
                id="tenure"
                value={tenure}
                onChange={handleTenureChange}
                min="1"
                max="360"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter tenure in months"
              />
              <span className="absolute right-4 top-3 text-sm text-gray-500 dark:text-gray-400">months</span>
            </div>
            <input
              type="range"
              min="12"
              max="360"
              step="1"
              value={tenure}
              onChange={(e) => setTenure(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Interest Rate Input */}
          <div className="space-y-3">
            <label htmlFor="rate" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Interest Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                id="rate"
                value={interestRate.toFixed(2)}
                onChange={handleInterestRateChange}
                min={bank.minRate}
                max={bank.maxRate}
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter interest rate"
              />
              <span className="absolute right-4 top-3 text-sm text-gray-500 dark:text-gray-400">% p.a.</span>
            </div>
            <input
              type="range"
              min={bank.minRate}
              max={bank.maxRate}
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{bank.minRate}%</span>
              <span>{bank.maxRate}%</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1"
        >
          <div className={`rounded-lg border-2 ${bank.borderColor} ${bank.bgColor} p-6 sticky top-20`}>
            <h3 className={`text-lg font-bold ${bank.textColor} mb-6`}>Loan Summary</h3>

            <div className="space-y-4">
              {/* EMI */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Monthly EMI</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(calculations.emi)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">for {tenure} months</p>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-600 my-4" />

              {/* Principal */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Principal Amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(principal)}</span>
              </div>

              {/* Total Interest */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Interest</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(calculations.totalInterest)}</span>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-300 dark:border-gray-600">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(calculations.totalAmount)}
                </span>
              </div>

              {/* Additional Info */}
              <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 mt-4">
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Interest as % of Principal:</span>
                    <span className="font-semibold">
                      {((calculations.totalInterest / principal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Effective Annual Rate:</span>
                    <span className="font-semibold">{interestRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Copy Button */}
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full mt-4 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Details
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comparison Section */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">EMI Comparison Across Banks</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BANKS.map((b) => {
            const emi = calculateEMI(principal, b.minRate, tenure);
            const isSelected = b.id === selectedBank;

            return (
              <motion.div
                key={b.id}
                whileHover={{ translateY: -4 }}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected ? `${b.borderColor} ${b.bgColor}` : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleBankSelect(b.id)}
              >
                <p className={`font-semibold text-sm mb-3 ${isSelected ? b.textColor : 'text-gray-900 dark:text-white'}`}>
                  {b.name}
                </p>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rate Range</p>
                    <p className={`font-bold text-sm ${isSelected ? b.textColor : 'text-gray-900 dark:text-white'}`}>
                      {b.minRate}% - {b.maxRate}%
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Min EMI</p>
                    <p className={`font-bold text-lg ${isSelected ? b.textColor : 'text-gray-900 dark:text-white'}`}>
                      {formatCurrency(Math.round(emi))}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 inline-block px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                    Selected
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
