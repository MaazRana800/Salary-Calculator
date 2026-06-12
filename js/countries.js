/**
 * countries.js — EU Tax Data Layer
 * Sources: Official government tax authority websites (2025-2026)
 */

const COUNTRIES = {
  de: {
    name: "Germany", flag: "🇩🇪", popular: true,
    incomeTaxFn: (t) => {
      if (t <= 11604)  return 0;
      if (t <= 17005)  return (t - 11604) * 0.14;
      if (t <= 66760)  return 1532 + (t - 17005) * 0.24;
      if (t <= 277825) return 13478 + (t - 66760) * 0.42;
      return 102228 + (t - 277825) * 0.45;
    },
    socialSecurity: { employee: 0.2005, selfEmployed: 0.356 },
    taxFreeAllowance: 11604, notes: "Solidarity surcharge included for high earners"
  },
  nl: {
    name: "Netherlands", flag: "🇳🇱", popular: true,
    incomeTaxFn: (t) => {
      if (t <= 38441) return t * 0.3697;
      return 38441 * 0.3697 + (t - 38441) * 0.495;
    },
    socialSecurity: { employee: 0.2765, selfEmployed: 0.2765 },
    taxFreeAllowance: 8700, notes: "Box 1 rates include national insurance premiums"
  },
  fr: {
    name: "France", flag: "🇫🇷", popular: true,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 11294)  tax += (Math.min(t, 28797)  - 11294)  * 0.11;
      if (t > 28797)  tax += (Math.min(t, 82341)  - 28797)  * 0.30;
      if (t > 82341)  tax += (Math.min(t, 177106) - 82341)  * 0.41;
      if (t > 177106) tax += (t - 177106) * 0.45;
      return tax;
    },
    socialSecurity: { employee: 0.22, selfEmployed: 0.45 },
    taxFreeAllowance: 11294, notes: "CSG/CRDS included in SS rate"
  },
  es: {
    name: "Spain", flag: "🇪🇸", popular: true,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 12450)  tax += (Math.min(t, 20200)  - 12450)  * 0.19;
      if (t > 20200)  tax += (Math.min(t, 35200)  - 20200)  * 0.24;
      if (t > 35200)  tax += (Math.min(t, 60000)  - 35200)  * 0.30;
      if (t > 60000)  tax += (Math.min(t, 300000) - 60000)  * 0.37;
      if (t > 300000) tax += (t - 300000) * 0.47;
      return tax;
    },
    socialSecurity: { employee: 0.0635, selfEmployed: 0.306 },
    taxFreeAllowance: 5550, notes: "National rate only"
  },
  it: {
    name: "Italy", flag: "🇮🇹", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      tax += Math.min(t, 28000) * 0.23;
      if (t > 28000) tax += (Math.min(t, 50000) - 28000) * 0.35;
      if (t > 50000) tax += (t - 50000) * 0.43;
      return tax;
    },
    socialSecurity: { employee: 0.0919, selfEmployed: 0.26 },
    taxFreeAllowance: 8174, notes: "Regional IRAP not included"
  },
  pl: {
    name: "Poland", flag: "🇵🇱", popular: true,
    incomeTaxFn: (t) => {
      if (t <= 4800)  return 0;
      if (t <= 27600) return (t - 4800) * 0.12;
      return (27600 - 4800) * 0.12 + (t - 27600) * 0.32;
    },
    socialSecurity: { employee: 0.1371, selfEmployed: 0.192 },
    taxFreeAllowance: 4800, notes: "Converted from PLN"
  },
  pt: {
    name: "Portugal", flag: "🇵🇹", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 7703)  tax += (Math.min(t, 11623)  - 7703)  * 0.145;
      if (t > 11623) tax += (Math.min(t, 16472)  - 11623) * 0.21;
      if (t > 16472) tax += (Math.min(t, 21321)  - 16472) * 0.265;
      if (t > 21321) tax += (Math.min(t, 27146)  - 21321) * 0.285;
      if (t > 27146) tax += (Math.min(t, 39791)  - 27146) * 0.35;
      if (t > 39791) tax += (Math.min(t, 51997)  - 39791) * 0.37;
      if (t > 51997) tax += (Math.min(t, 81199)  - 51997) * 0.435;
      if (t > 81199) tax += (t - 81199) * 0.48;
      return tax;
    },
    socialSecurity: { employee: 0.11, selfEmployed: 0.214 },
    taxFreeAllowance: 7703, notes: "NHR regime not included"
  },
  se: {
    name: "Sweden", flag: "🇸🇪", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 24238) tax += (Math.min(t, 46000) - 24238) * 0.32;
      if (t > 46000) tax += (t - 46000) * 0.52;
      return tax;
    },
    socialSecurity: { employee: 0.07, selfEmployed: 0.286 },
    taxFreeAllowance: 24238, notes: "Municipal tax averaged at 32%. Converted from SEK."
  },
  dk: {
    name: "Denmark", flag: "🇩🇰", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 4600)  tax += (Math.min(t, 56800) - 4600) * 0.3841;
      if (t > 56800) tax += (t - 56800) * 0.559;
      return tax;
    },
    socialSecurity: { employee: 0.08, selfEmployed: 0.08 },
    taxFreeAllowance: 4600, notes: "Includes church tax. Converted from DKK."
  },
  at: {
    name: "Austria", flag: "🇦🇹", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 11693) tax += (Math.min(t, 19134)  - 11693) * 0.20;
      if (t > 19134) tax += (Math.min(t, 32075)  - 19134) * 0.30;
      if (t > 32075) tax += (Math.min(t, 62080)  - 32075) * 0.41;
      if (t > 62080) tax += (Math.min(t, 93120)  - 62080) * 0.48;
      if (t > 93120) tax += (t - 93120) * 0.50;
      return tax;
    },
    socialSecurity: { employee: 0.1812, selfEmployed: 0.265 },
    taxFreeAllowance: 11693, notes: "Standard employee deductions applied"
  },
  be: {
    name: "Belgium", flag: "🇧🇪", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 9270)  tax += (Math.min(t, 15820)  - 9270)  * 0.25;
      if (t > 15820) tax += (Math.min(t, 27920)  - 15820) * 0.40;
      if (t > 27920) tax += (Math.min(t, 48320)  - 27920) * 0.45;
      if (t > 48320) tax += (t - 48320) * 0.50;
      return tax;
    },
    socialSecurity: { employee: 0.1307, selfEmployed: 0.214 },
    taxFreeAllowance: 9270, notes: "Communal taxes not included"
  },
  ie: {
    name: "Ireland", flag: "🇮🇪", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 17000) tax += (Math.min(t, 42000) - 17000) * 0.20;
      if (t > 42000) tax += (t - 42000) * 0.40;
      if (t > 12012) tax += (Math.min(t, 25760) - 12012) * 0.02;
      if (t > 25760) tax += (Math.min(t, 70044) - 25760) * 0.04;
      if (t > 70044) tax += (t - 70044) * 0.08;
      return tax;
    },
    socialSecurity: { employee: 0.04, selfEmployed: 0.04 },
    taxFreeAllowance: 17000, notes: "USC included in calculation"
  },
  cz: {
    name: "Czechia", flag: "🇨🇿", popular: false,
    incomeTaxFn: (t) => {
      const taxable = Math.max(0, t - 3200);
      if (t <= 36000) return taxable * 0.15;
      return (36000 - 3200) * 0.15 + (t - 36000) * 0.23;
    },
    socialSecurity: { employee: 0.065, selfEmployed: 0.292 },
    taxFreeAllowance: 3200, notes: "Health insurance included in SS. Converted from CZK."
  },
  hu: {
    name: "Hungary", flag: "🇭🇺", popular: false,
    incomeTaxFn: (t) => t * 0.15,
    socialSecurity: { employee: 0.185, selfEmployed: 0.185 },
    taxFreeAllowance: 0, notes: "Flat 15% — lowest income tax in EU"
  },
  ro: {
    name: "Romania", flag: "🇷🇴", popular: false,
    incomeTaxFn: (t) => t * 0.10,
    socialSecurity: { employee: 0.35, selfEmployed: 0.35 },
    taxFreeAllowance: 0, notes: "Flat 10% income tax. High SS (35%)."
  },
  gr: {
    name: "Greece", flag: "🇬🇷", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 10000) tax += (Math.min(t, 20000) - 10000) * 0.22;
      if (t > 20000) tax += (Math.min(t, 30000) - 20000) * 0.28;
      if (t > 30000) tax += (Math.min(t, 40000) - 30000) * 0.36;
      if (t > 40000) tax += (t - 40000) * 0.44;
      return tax;
    },
    socialSecurity: { employee: 0.1387, selfEmployed: 0.267 },
    taxFreeAllowance: 10000, notes: "Solidarity levy suspended since 2023"
  },
  fi: {
    name: "Finland", flag: "🇫🇮", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 16000) tax += (Math.min(t, 24000)  - 16000) * 0.127;
      if (t > 24000) tax += (Math.min(t, 39200)  - 24000) * 0.225;
      if (t > 39200) tax += (Math.min(t, 70800)  - 39200) * 0.345;
      if (t > 70800) tax += (Math.min(t, 150000) - 70800) * 0.415;
      if (t > 150000) tax += (t - 150000) * 0.44;
      if (t > 16000) tax += (t - 16000) * 0.21;
      return tax;
    },
    socialSecurity: { employee: 0.0715, selfEmployed: 0.1485 },
    taxFreeAllowance: 16000, notes: "State + avg municipal (21%)"
  },
  lu: {
    name: "Luxembourg", flag: "🇱🇺", popular: false,
    incomeTaxFn: (t) => {
      let tax = 0;
      if (t > 13932)  tax += (Math.min(t, 17268)  - 13932)  * 0.08;
      if (t > 17268)  tax += (Math.min(t, 31500)  - 17268)  * 0.14;
      if (t > 31500)  tax += (Math.min(t, 45000)  - 31500)  * 0.23;
      if (t > 45000)  tax += (Math.min(t, 60000)  - 45000)  * 0.29;
      if (t > 60000)  tax += (Math.min(t, 80000)  - 60000)  * 0.335;
      if (t > 80000)  tax += (Math.min(t, 100000) - 80000)  * 0.37;
      if (t > 100000) tax += (Math.min(t, 120000) - 100000) * 0.39;
      if (t > 120000) tax += (t - 120000) * 0.42;
      return tax;
    },
    socialSecurity: { employee: 0.122, selfEmployed: 0.122 },
    taxFreeAllowance: 13932, notes: "High absolute salaries offset tax rates"
  },
  ch: {
    name: "Switzerland", flag: "🇨🇭", popular: false,
    incomeTaxFn: (t) => {
      let federal = 0;
      if (t > 17544) federal += (Math.min(t, 31600)  - 17544) * 0.0088;
      if (t > 31600) federal += (Math.min(t, 44900)  - 31600) * 0.0264;
      if (t > 44900) federal += (Math.min(t, 58600)  - 44900) * 0.0396;
      if (t > 58600) federal += (Math.min(t, 75300)  - 58600) * 0.0528;
      if (t > 75300) federal += (t - 75300) * 0.116;
      const cantonal = t > 17544 ? (t - 17544) * 0.13 : 0;
      return federal + cantonal;
    },
    socialSecurity: { employee: 0.0635, selfEmployed: 0.099 },
    taxFreeAllowance: 17544, notes: "Zurich cantonal rate. Non-EU top expat destination."
  },
  no: {
    name: "Norway", flag: "🇳🇴", popular: false,
    incomeTaxFn: (t) => {
      const base = t > 17544 ? (t - 17544) * 0.22 : 0;
      let bracket = 0;
      if (t > 20820)  bracket += (Math.min(t, 52686)  - 20820)  * 0.017;
      if (t > 52686)  bracket += (Math.min(t, 88562)  - 52686)  * 0.04;
      if (t > 88562)  bracket += (Math.min(t, 148714) - 88562)  * 0.136;
      if (t > 148714) bracket += (Math.min(t, 214430) - 148714) * 0.166;
      if (t > 214430) bracket += (t - 214430) * 0.176;
      return base + bracket;
    },
    socialSecurity: { employee: 0.079, selfEmployed: 0.111 },
    taxFreeAllowance: 17544, notes: "Non-EU Schengen. Converted from NOK."
  }
};

const POPULAR_COUNTRIES = ["de", "nl", "fr", "es", "pl"];
