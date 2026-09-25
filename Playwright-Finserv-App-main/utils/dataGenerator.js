/** Lightweight test data generators — no external dependency needed for a training project. */

function randomEmail(prefix = 'qa') {
  const stamp = Date.now();
  return `${prefix}_${stamp}@finserve.test`;
}

function randomPhone() {
  const n = Math.floor(1000000000 + Math.random() * 8999999999);
  return `+91${n}`;
}

function randomAmount(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

function todayPlusYears(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
}

function pastDobForAge(age) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  return d.toISOString().split('T')[0];
}

function randomZip() {
  return String(Math.floor(100000 + Math.random() * 899999));
}

function uniqueSuffix() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = {
  randomEmail,
  randomPhone,
  randomAmount,
  todayPlusYears,
  pastDobForAge,
  randomZip,
  uniqueSuffix,
};
