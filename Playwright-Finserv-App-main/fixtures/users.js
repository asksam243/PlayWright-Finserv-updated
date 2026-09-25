/**
 * Seeded users for the FinServe Retail Demo Platform.
 * Source: FinServe_Retail_Demo_Project_Handover_One_Pager / Combined QA Lab Learner Guide.
 * All seeded users share password Password@123 unless overridden via env vars.
 *
 * @typedef {Object} FinServeUser
 * @property {string} email
 * @property {string} password
 * @property {'qa'|'investor'|'new'|'insurance'|'locked'|'learner'} role
 * @property {string} description
 */

const DEFAULT_PASSWORD = 'Password@123';

/** @type {Record<string, FinServeUser>} */
const users = {
  qaUser: {
    email: process.env.QA_USER_EMAIL || 'qauser@finserve.test',
    password: process.env.QA_USER_PASSWORD || DEFAULT_PASSWORD,
    role: 'qa',
    description: 'Standard QA demo user with seeded portfolio and transaction history.',
  },
  investor: {
    email: process.env.INVESTOR_USER_EMAIL || 'investor1@finserve.test',
    password: process.env.INVESTOR_USER_PASSWORD || DEFAULT_PASSWORD,
    role: 'investor',
    description: 'Investor user with existing mutual fund holdings for redemption tests.',
  },
  newUser: {
    email: process.env.NEW_USER_EMAIL || 'newuser@finserve.test',
    password: process.env.NEW_USER_PASSWORD || DEFAULT_PASSWORD,
    role: 'new',
    description: 'Freshly seeded user with no holdings/policies, for empty-state validation.',
  },
  insuranceUser: {
    email: process.env.INSURANCE_USER_EMAIL || 'insurance1@finserve.test',
    password: process.env.INSURANCE_USER_PASSWORD || DEFAULT_PASSWORD,
    role: 'insurance',
    description: 'User with existing insurance policies for policy management tests.',
  },
  lockedUser: {
    email: process.env.LOCKED_USER_EMAIL || 'locked@finserve.test',
    password: process.env.LOCKED_USER_PASSWORD || DEFAULT_PASSWORD,
    role: 'locked',
    description: 'Locked account, used for negative authentication tests.',
  },
};

/**
 * learner001@finserve.test .. learner020@finserve.test
 * @param {number} n
 * @returns {FinServeUser}
 */
function learnerUser(n) {
  if (n < 1 || n > 20) throw new Error('Learner index must be between 1 and 20');
  const padded = String(n).padStart(3, '0');
  return {
    email: `learner${padded}@finserve.test`,
    password: DEFAULT_PASSWORD,
    role: 'learner',
    description: `Seeded learner account #${padded} for parallel/isolated test data.`,
  };
}

/** @type {FinServeUser} */
const invalidUser = {
  email: 'notreal@finserve.test',
  password: 'WrongPassword@1',
  role: 'new',
  description: 'Non-existent account used for negative login tests.',
};

module.exports = { users, learnerUser, invalidUser };
