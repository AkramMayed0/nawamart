require('dotenv').config();
const { calculateProration, validateUpgrade } = require('./src/services/BillingService');

const GREEN = '\x1b[32m';
const RED   = '\x1b[31m';
const CYAN  = '\x1b[36m';
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    console.error(`${RED}❌ FAIL: ${label}${RESET}`);
    console.error(`   expected ${expected}, got ${actual}`);
    failed++;
    process.exitCode = 1;
  } else {
    console.log(`  ${GREEN}✓${RESET} ${label}`);
    passed++;
  }
}

function assert(label, condition) {
  if (!condition) {
    console.error(`${RED}❌ FAIL: ${label}${RESET}`);
    failed++;
    process.exitCode = 1;
  } else {
    console.log(`  ${GREEN}✓${RESET} ${label}`);
    passed++;
  }
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function total() {
  console.log(`\n${BOLD}Results:${RESET} ${passed} passed, ${failed} failed, ${passed + failed} total`);
}

// ═══════════════════════════════════════════════════════════════════
console.log(CYAN + BOLD + '\n═══ Free Trial → Paid Plan (No Proration Credit) ═══' + RESET);

// ── Trial → Starter (10 days remaining) ───────────────────────────
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: daysFromNow(10),
    currentBilling: null,
    hasApprovedSub: false,
    isFreeTrial: true,
    newPlan: 'starter',
    newBilling: 'monthly',
  });
  assertEqual('Trial→Starter monthly: remainingValue = 0',        r.remainingValue, 0);
  assertEqual('Trial→Starter monthly: upgradeCost = 2500',        r.upgradeCost, 2500);
  assertEqual('Trial→Starter monthly: walletCredit = 0',          r.walletCredit, 0);
  assertEqual('Trial→Starter monthly: newPlanPrice = 2500',       r.newPlanPrice, 2500);
  assertEqual('Trial→Starter monthly: isUpgrade = false',         r.isUpgrade, false);
  assertEqual('Trial→Starter monthly: isDowngrade = false',       r.isDowngrade, false);
}

// ── Trial → Pro (5 days remaining) ────────────────────────────────
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: daysFromNow(5),
    currentBilling: null,
    hasApprovedSub: false,
    isFreeTrial: true,
    newPlan: 'pro',
    newBilling: 'monthly',
  });
  assertEqual('Trial→Pro monthly: remainingValue = 0',            r.remainingValue, 0);
  assertEqual('Trial→Pro monthly: upgradeCost = 8000',            r.upgradeCost, 8000);
  assertEqual('Trial→Pro monthly: walletCredit = 0',              r.walletCredit, 0);
  assertEqual('Trial→Pro monthly: newPlanPrice = 8000',           r.newPlanPrice, 8000);
  assertEqual('Trial→Pro monthly: isUpgrade = true',              r.isUpgrade, true);
  assertEqual('Trial→Pro monthly: isDowngrade = false',           r.isDowngrade, false);
}

// ── Trial → Business (1 day remaining) ────────────────────────────
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: daysFromNow(1),
    currentBilling: null,
    hasApprovedSub: false,
    isFreeTrial: true,
    newPlan: 'business',
    newBilling: 'monthly',
  });
  assertEqual('Trial→Business monthly: remainingValue = 0',       r.remainingValue, 0);
  assertEqual('Trial→Business monthly: upgradeCost = 13000',      r.upgradeCost, 13000);
  assertEqual('Trial→Business monthly: walletCredit = 0',         r.walletCredit, 0);
  assertEqual('Trial→Business monthly: newPlanPrice = 13000',     r.newPlanPrice, 13000);
  assertEqual('Trial→Business monthly: isUpgrade = true',         r.isUpgrade, true);
  assertEqual('Trial→Business monthly: isDowngrade = false',      r.isDowngrade, false);
}

// ── Trial → Pro yearly (yearly billing) ──────────────────────────
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: daysFromNow(7),
    currentBilling: null,
    hasApprovedSub: false,
    isFreeTrial: true,
    newPlan: 'pro',
    newBilling: 'yearly',
  });
  assertEqual('Trial→Pro yearly: remainingValue = 0',             r.remainingValue, 0);
  assertEqual('Trial→Pro yearly: upgradeCost = 79680',            r.upgradeCost, 79680);
  assertEqual('Trial→Pro yearly: walletCredit = 0',               r.walletCredit, 0);
  assertEqual('Trial→Pro yearly: newPlanPrice = 79680',           r.newPlanPrice, 79680);
  assertEqual('Trial→Pro yearly: isUpgrade = true',               r.isUpgrade, true);
}

// ═══════════════════════════════════════════════════════════════════
console.log(CYAN + BOLD + '\n═══ Non-Trial: Normal Proration Still Works ═══' + RESET);

// ── Non-trial: Starter (0 days remaining, expired) → Pro ─────────
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: daysFromNow(0),
    currentBilling: 'monthly',
    hasApprovedSub: true,
    isFreeTrial: false,
    newPlan: 'pro',
    newBilling: 'monthly',
  });
  assertEqual('Expired Starter→Pro: remainingValue = 0',          r.remainingValue, 0);
  assertEqual('Expired Starter→Pro: upgradeCost = 8000',          r.upgradeCost, 8000);
  assertEqual('Expired Starter→Pro: walletCredit = 0',            r.walletCredit, 0);
}

// ── Non-trial: Active Starter (15 days left) → Pro ───────────────
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: daysFromNow(15),
    currentBilling: 'monthly',
    hasApprovedSub: true,
    isFreeTrial: false,
    newPlan: 'pro',
    newBilling: 'monthly',
  });
  assert('Active Starter→Pro: remainingValue > 0',                r.remainingValue > 0);
  assert('Active Starter→Pro: upgradeCost < 8000',                r.upgradeCost < 8000);
  assertEqual('Active Starter→Pro: walletCredit = 0',             r.walletCredit, 0);
}

// ── Non-trial: Pro → Business upgrade (prorated) ──────────────────
{
  const r = calculateProration({
    currentPlan: 'pro',
    currentExpiresAt: daysFromNow(10),
    currentBilling: 'monthly',
    hasApprovedSub: true,
    isFreeTrial: false,
    newPlan: 'business',
    newBilling: 'monthly',
  });
  assert('Pro→Business upgrade: remainingValue > 0',              r.remainingValue > 0);
  assert('Pro→Business upgrade: upgradeCost < 13000',             r.upgradeCost < 13000);
  assert('Pro→Business upgrade: upgradeCost > 0',                 r.upgradeCost > 0);
  assertEqual('Pro→Business upgrade: walletCredit = 0',           r.walletCredit, 0);
  assertEqual('Pro→Business upgrade: isUpgrade = true',           r.isUpgrade, true);
}

// ── Non-trial: Downgrade Business → Starter (generates wallet credit) ──
{
  const r = calculateProration({
    currentPlan: 'business',
    currentExpiresAt: daysFromNow(20),
    currentBilling: 'monthly',
    hasApprovedSub: true,
    isFreeTrial: false,
    newPlan: 'starter',
    newBilling: 'monthly',
  });
  assertEqual('Business→Starter downgrade: isDowngrade = true',   r.isDowngrade, true);
  assert('Business→Starter downgrade: walletCredit > 0',          r.walletCredit > 0);
  assertEqual('Business→Starter downgrade: upgradeCost = 0',      r.upgradeCost, 0);
}

// ── Non-trial: Same-plan renewal ──────────────────────────────────
{
  const r = calculateProration({
    currentPlan: 'pro',
    currentExpiresAt: daysFromNow(5),
    currentBilling: 'monthly',
    hasApprovedSub: true,
    isFreeTrial: false,
    newPlan: 'pro',
    newBilling: 'monthly',
  });
  assertEqual('Pro→Pro renewal: isUpgrade = false',               r.isUpgrade, false);
  assertEqual('Pro→Pro renewal: isDowngrade = false',             r.isDowngrade, false);
  assert('Pro→Pro renewal: remainingValue > 0',                   r.remainingValue > 0);
  assert('Pro→Pro renewal: upgradeCost > 0 (fresh cycle)',        r.upgradeCost > 0);
  assert('Pro→Pro renewal: upgradeCost < 8000 (credit applied)',  r.upgradeCost < 8000);
  assertEqual('Pro→Pro renewal: walletCredit = 0',                r.walletCredit, 0);
}

// ═══════════════════════════════════════════════════════════════════
console.log(CYAN + BOLD + '\n═══ Edge Cases ═══' + RESET);

// ── isFreeTrial = false with hasApprovedSub = false (expired/no sub) ──
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: null,
    currentBilling: null,
    hasApprovedSub: false,
    isFreeTrial: false,
    newPlan: 'pro',
    newBilling: 'monthly',
  });
  assertEqual('No sub, no trial flag: remainingValue = 0',        r.remainingValue, 0);
  assertEqual('No sub, no trial flag: upgradeCost = 8000',        r.upgradeCost, 8000);
  assertEqual('No sub, no trial flag: walletCredit = 0',          r.walletCredit, 0);
}

// ── Phantom approved subscription (dangling status, no expiresAt) ──
// Simulates the exact bug: admin clicked approve, controller set status='approved',
// but approveWithProration failed before setting expiresAt. The subscription
// is 'approved' in DB but the store is still on trial.
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: daysFromNow(13),
    currentBilling: 'monthly',       // set from the dangling approved sub
    hasApprovedSub: true,            // true because the sub IS approved
    isFreeTrial: true,               // true because expiresAt is null → incomplete
    newPlan: 'starter',
    newBilling: 'monthly',
  });
  assertEqual('Phantom approved Trial→Starter: remainingValue = 0',    r.remainingValue, 0);
  assertEqual('Phantom approved Trial→Starter: upgradeCost = 2500',    r.upgradeCost, 2500);
  assertEqual('Phantom approved Trial→Starter: walletCredit = 0',      r.walletCredit, 0);
}

// ── isFreeTrial defaulting to false (backward compat) ─────────────
{
  const r = calculateProration({
    currentPlan: 'starter',
    currentExpiresAt: daysFromNow(10),
    currentBilling: 'monthly',
    hasApprovedSub: true,
    newPlan: 'pro',
    newBilling: 'monthly',
  });
  // isFreeTrial not passed → defaults to false, normal proration
  assert('No isFreeTrial param (default false): remainingValue > 0', r.remainingValue > 0);
  assert('No isFreeTrial param (default false): upgradeCost < 8000', r.upgradeCost < 8000);
}

// ═══════════════════════════════════════════════════════════════════
console.log(CYAN + BOLD + '\n═══ Upgrade Validation (No Billing) ═══' + RESET);

// Allowed upgrades (no billing passed — backward-compat defaults to null)
{
  const tests = [
    ['starter', 'pro',     'Starter → Pro (allowed)'],
    ['starter', 'business','Starter → Business (allowed)'],
    ['pro',     'business','Pro → Business (allowed)'],
  ];
  for (const [from, to, label] of tests) {
    try {
      validateUpgrade(from, to);
      passed++;
      console.log(`  ${GREEN}✓${RESET} ${label}`);
    } catch (e) {
      console.error(`${RED}❌ FAIL: ${label} — unexpected error: ${e.message}${RESET}`);
      failed++;
      process.exitCode = 1;
    }
  }
}

// Blocked: same plan
{
  const tests = [
    ['starter',  'starter',  'Starter → Starter (blocked)'],
    ['pro',      'pro',      'Pro → Pro (blocked)'],
    ['business', 'business', 'Business → Business (blocked)'],
  ];
  for (const [from, to, label] of tests) {
    try {
      validateUpgrade(from, to);
      console.error(`${RED}❌ FAIL: ${label} — should have thrown${RESET}`);
      failed++;
      process.exitCode = 1;
    } catch (e) {
      passed++;
      console.log(`  ${GREEN}✓${RESET} ${label} → "${e.message}"`);
    }
  }
}

// Blocked: downgrades
{
  const tests = [
    ['pro',     'starter',  'Pro → Starter (downgrade blocked)'],
    ['business','starter',  'Business → Starter (downgrade blocked)'],
    ['business','pro',      'Business → Pro (downgrade blocked)'],
  ];
  for (const [from, to, label] of tests) {
    try {
      validateUpgrade(from, to);
      console.error(`${RED}❌ FAIL: ${label} — should have thrown${RESET}`);
      failed++;
      process.exitCode = 1;
    } catch (e) {
      passed++;
      console.log(`  ${GREEN}✓${RESET} ${label} → "${e.message}"`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
console.log(CYAN + BOLD + '\n═══ Billing Cycle Validation ═══' + RESET);

// Allowed: same-cycle upgrades
{
  const tests = [
    ['starter', 'pro',     'monthly', 'monthly', 'Starter Monthly → Pro Monthly (allowed)'],
    ['starter', 'business','monthly', 'monthly', 'Starter Monthly → Business Monthly (allowed)'],
    ['pro',     'business','monthly', 'monthly', 'Pro Monthly → Business Monthly (allowed)'],
    ['starter', 'pro',     'yearly',  'yearly',  'Starter Yearly → Pro Yearly (allowed)'],
    ['starter', 'business','yearly',  'yearly',  'Starter Yearly → Business Yearly (allowed)'],
    ['pro',     'business','yearly',  'yearly',  'Pro Yearly → Business Yearly (allowed)'],
  ];
  for (const [from, to, currBilling, tgtBilling, label] of tests) {
    try {
      validateUpgrade(from, to, false, currBilling, tgtBilling);
      passed++;
      console.log(`  ${GREEN}✓${RESET} ${label}`);
    } catch (e) {
      console.error(`${RED}❌ FAIL: ${label} — unexpected error: ${e.message}${RESET}`);
      failed++;
      process.exitCode = 1;
    }
  }
}

// Blocked: cross-cycle upgrades
{
  const tests = [
    ['starter', 'pro',     'monthly', 'yearly',  'Starter Monthly → Pro Yearly (blocked)'],
    ['starter', 'business','monthly', 'yearly',  'Starter Monthly → Business Yearly (blocked)'],
    ['pro',     'business','monthly', 'yearly',  'Pro Monthly → Business Yearly (blocked)'],
    ['starter', 'pro',     'yearly',  'monthly', 'Starter Yearly → Pro Monthly (blocked)'],
    ['starter', 'business','yearly',  'monthly', 'Starter Yearly → Business Monthly (blocked)'],
    ['pro',     'business','yearly',  'monthly', 'Pro Yearly → Business Monthly (blocked)'],
  ];
  for (const [from, to, currBilling, tgtBilling, label] of tests) {
    try {
      validateUpgrade(from, to, false, currBilling, tgtBilling);
      console.error(`${RED}❌ FAIL: ${label} — should have thrown${RESET}`);
      failed++;
      process.exitCode = 1;
    } catch (e) {
      passed++;
      console.log(`  ${GREEN}✓${RESET} ${label} → "${e.message}"`);
    }
  }
}

// Free Trial bypasses billing cycle check
{
  const tests = [
    ['starter', 'pro',     'monthly', 'yearly', 'Free Trial: Starter → Pro Yearly (allowed)'],
    ['starter', 'business','yearly',  'monthly','Free Trial: Starter → Business Monthly (allowed)'],
  ];
  for (const [from, to, currBilling, tgtBilling, label] of tests) {
    try {
      validateUpgrade(from, to, true, currBilling, tgtBilling);
      passed++;
      console.log(`  ${GREEN}✓${RESET} ${label}`);
    } catch (e) {
      console.error(`${RED}❌ FAIL: ${label} — unexpected error: ${e.message}${RESET}`);
      failed++;
      process.exitCode = 1;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
total();
console.log('');
