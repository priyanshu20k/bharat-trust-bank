// Default constants for our bank app

export const DEFAULT_ACCOUNT = {
  balance: 0,
  upiId: 'subham@bharatbank',
  accountNumber: '918237461029',
  ifscCode: 'BHAR0001042',
  accountHolder: 'Subham Kumar',
  transactions: [],
  totalDeposited: 0,
  totalWithdrawn: 0,
  totalUpiSpent: 0,
  transactionCount: 0,
  activeLoansCount: 0,
  totalLoanOutstanding: 0,
  activeInsuranceCount: 0,
  totalInsuranceCoverage: 0,
  totalInsurancePremiumsPaid: 0,
};

export function formatMoney(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val || 0);
}
