/**
 * calculator.js — Pure calculation engine (no DOM access)
 * Handles net salary computation for all employment types
 */

/**
 * Calculate net salary for a given country
 * @param {number} grossEUR  - Gross annual salary in EUR
 * @param {string} countryKey - Country code (e.g. "de")
 * @param {string} type      - "employee" | "selfemployed"
 * @returns {Object} Full breakdown
 */
function calculateNetSalary(grossEUR, countryKey, type = "employee") {
  const country = COUNTRIES[countryKey];
  if (!country) throw new Error(`Unknown country: ${countryKey}`);

  const ssRate = type === "selfemployed"
    ? country.socialSecurity.selfEmployed
    : country.socialSecurity.employee;

  // 1. Social Security deduction
  const socialSecurity = grossEUR * ssRate;

  // 2. Taxable income = gross minus SS (most EU countries)
  const taxableIncome = Math.max(0, grossEUR - socialSecurity);

  // 3. Income tax via country's bracket function
  const incomeTax = country.incomeTaxFn(taxableIncome);

  // 4. Net salary
  const net = grossEUR - socialSecurity - incomeTax;

  // 5. Effective total deduction rate
  const effectiveRate = ((grossEUR - net) / grossEUR) * 100;

  // 6. Net kept percentage
  const netKeptPct = (net / grossEUR) * 100;

  return {
    countryKey,
    countryName: country.name,
    flag:        country.flag,
    gross:       grossEUR,
    socialSecurity,
    incomeTax,
    net:         Math.max(0, net),
    effectiveRate,
    netKeptPct,
    notes:       country.notes
  };
}

/**
 * Run calculation for multiple countries
 * @param {number} grossEUR
 * @param {string[]} countryKeys
 * @param {string} type
 * @returns {Object[]} sorted by net desc
 */
function calculateAll(grossEUR, countryKeys, type = "employee") {
  const results = countryKeys.map(key => calculateNetSalary(grossEUR, key, type));
  results.sort((a, b) => b.net - a.net);
  return results;
}

/**
 * Convert EUR amount to display currency
 * @param {number} eur
 * @param {string} toCurrency
 * @param {Object} rates  - { USD: 1.08, GBP: 0.86, CHF: 0.96 }
 */
function convertCurrency(eur, toCurrency, rates) {
  if (toCurrency === "EUR" || !rates[toCurrency]) return eur;
  return eur * rates[toCurrency];
}

/**
 * Format a number as currency string
 * @param {number} amount
 * @param {string} currency
 */
function formatCurrency(amount, currency = "EUR") {
  const symbols = { EUR: "€", USD: "$", GBP: "£", CHF: "₣" };
  const symbol = symbols[currency] || currency + " ";
  return symbol + Math.round(amount).toLocaleString("en-EU");
}
