/**
 * Reusable test data for mutual fund, insurance, portfolio and transaction scenarios.
 * Adjust fund/product codes here once real seed data is confirmed in the environment.
 */

const mutualFunds = {
  confirmedSample: {
    id: 7,
    fundCode: 'FSBAL007',
    fundName: 'FinServe Balanced Allocation Fund',
    category: 'Hybrid Fund',
    riskLevel: 'Moderate',
  },
  largeCapEquity: {
    fundCode: 'MF_EQ_LARGE_001',
    fundName: 'Large Cap Equity Fund',
    riskLevel: 'High',
  },
  debtFund: {
    fundCode: 'MF_DEBT_001',
    fundName: 'Debt Fund',
    riskLevel: 'Low',
  },
  indexFund: {
    fundCode: 'MF_INDEX_001',
    fundName: 'Index Fund',
    riskLevel: 'Moderate',
  },
};

const investmentAmounts = {
  belowMinimum: 100, // expected to fail minimum-investment validation
  validSip: 5000,
  validLumpsum: 25000,
  boundaryMinimum: 500, // adjust to the platform's actual documented minimum
  largeAmount: 10_00_000,
};

const redemptionScenarios = {
  partialValidUnits: 10,
  exceedsHoldingUnits: 999_999, // should be rejected by balance validation
  exceedsHoldingAmount: 999_999_999,
  zeroAmount: 0,
};

const insuranceProducts = {
  termLife: {
    productCode: 'FSLIFE002',
    name: 'FinServe Secure Future Term Plan',
    category: 'Term Insurance',
    coverage: 5000000,
    premium: 9200,
    termYears: 20,
  },
};

const nomineeDetails = {
  valid: {
    name: 'Rahul Sharma',
    relationship: 'Spouse',
    dob: '1990-05-14',
  },
  missingName: {
    name: '',
    relationship: 'Spouse',
    dob: '1990-05-14',
  },
};

const routes = {
  login: '/login',
  dashboard: '/dashboard',
  mutualFunds: '/mutual-funds',
  fundDetail: (fundId) => `/mutual-funds/${fundId}`,
  invest: (fundId) => `/invest/${fundId}`,
  portfolio: '/portfolio',
  holdingDetail: (holdingId) => `/portfolio/${holdingId}`,
  redeem: (holdingId) => `/redeem/${holdingId}`,
  insurance: '/insurance',
  insuranceDetail: (productId) => `/insurance/${productId}`,
  buyInsurance: (productId) => `/buy-insurance/${productId}`,
  policies: '/policies',
  policyDetail: (policyId) => `/policies/${policyId}`,
  transactions: '/transactions',
  profile: '/profile',
  support: '/support',
};

const apiEndpoints = {
  health: 'health',
  login: 'login',
  funds: 'mutual-funds',
  fundDetail: (fundId) => `mutual-funds/${fundId}`,
  portfolio: 'portfolio',
  orders: 'transactions',
  policies: 'policies',
  transactions: 'transactions',
};

module.exports = {
  mutualFunds,
  investmentAmounts,
  redemptionScenarios,
  insuranceProducts,
  nomineeDetails,
  routes,
  apiEndpoints,
};
