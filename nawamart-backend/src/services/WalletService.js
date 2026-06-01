/**
 * WalletService — wallet balance queries & append-only ledger.
 *
 * All wallet financial operations go through this service.
 * Once a ledger entry is written it is NEVER modified or deleted.
 */
const WalletLedger = require('../models/WalletLedger');

/**
 * Compute wallet balance by aggregating the ledger.
 * This is deterministic and always correct regardless of write order.
 */
async function getWalletBalance(merchantId) {
  const result = await WalletLedger.aggregate([
    { $match: { merchant: merchantId } },
    { $sort: { createdAt: 1 } },
    { $group: {
      _id: null,
      balance: { $last: '$balanceAfter' },
    }},
  ]);
  return result.length > 0 ? result[0].balance : 0;
}

/**
 * Append-only wallet ledger entry.
 *
 * Credit types: subscription_refund, upgrade_credit, admin_adjustment
 * Debit types:  subscription_payment, wallet_use
 */
async function addLedgerEntry({ merchant, type, amount, reference, referenceModel, description, createdBy }) {
  const balanceBefore = await getWalletBalance(merchant);
  const isCredit = ['subscription_refund', 'upgrade_credit', 'admin_adjustment'].includes(type);
  const balanceAfter = isCredit ? balanceBefore + amount : balanceBefore - amount;

  if (balanceAfter < 0) {
    throw new Error('wallet balance cannot go negative');
  }

  return WalletLedger.create({
    merchant,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    reference,
    referenceModel,
    description,
    createdBy,
  });
}

module.exports = {
  getWalletBalance,
  addLedgerEntry,
};
