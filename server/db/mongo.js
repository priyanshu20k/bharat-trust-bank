import { MongoClient } from 'mongodb';

export function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomChars = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return (timestamp + randomChars).toLowerCase();
}

export function generateUTR() {
  return `${Math.floor(400000000000 + Math.random() * 599999999999)}`;
}

export function calculateEMI(principal, annualRate, tenureMonths) {
  if (tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.round(principal / tenureMonths);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

export const FX_RATES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateToInr: 1.0 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToInr: 83.92 },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToInr: 91.45 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToInr: 109.80 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rateToInr: 22.85 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateToInr: 64.20 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rateToInr: 61.50 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateToInr: 0.56 },
];

export class MongoCollection {
  constructor(name, initialDocs = []) {
    this.name = name;
    this.docs = [...initialDocs];
  }

  getRawDocs() {
    return [...this.docs];
  }

  setRawDocs(docs) {
    this.docs = [...docs];
  }

  async countDocuments(filter = {}) {
    return (await this.find(filter)).length;
  }

  async find(filter = {}, options = {}) {
    let result = this.docs.filter((doc) => this.matchFilter(doc, filter));

    if (options?.sort) {
      const [field, direction] = Object.entries(options.sort)[0] || [];
      if (field) {
        result.sort((a, b) => {
          const valA = new Date(a[field]).getTime() || a[field];
          const valB = new Date(b[field]).getTime() || b[field];
          if (valA < valB) return direction === 1 ? -1 : 1;
          if (valA > valB) return direction === 1 ? 1 : -1;
          return 0;
        });
      }
    }

    if (options?.skip && options.skip > 0) {
      result = result.slice(options.skip);
    }

    if (options?.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }

    return JSON.parse(JSON.stringify(result));
  }

  async findOne(filter) {
    const found = this.docs.find((doc) => this.matchFilter(doc, filter));
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async insertOne(doc) {
    const newDoc = {
      ...doc,
      _id: doc._id || generateObjectId(),
    };
    this.docs.unshift(newDoc);
    return JSON.parse(JSON.stringify(newDoc));
  }

  async updateOne(filter, update) {
    const index = this.docs.findIndex((doc) => this.matchFilter(doc, filter));
    if (index === -1) return false;

    const current = this.docs[index];
    let updated = { ...current };

    if (update.$set) {
      updated = { ...updated, ...update.$set };
    } else {
      updated = { ...updated, ...update };
    }

    this.docs[index] = updated;
    return true;
  }

  async deleteMany(filter) {
    const initialCount = this.docs.length;
    this.docs = this.docs.filter((doc) => !this.matchFilter(doc, filter));
    return initialCount - this.docs.length;
  }

  matchFilter(doc, filter) {
    for (const [key, expected] of Object.entries(filter)) {
      const actual = doc[key];
      if (actual !== expected) return false;
    }
    return true;
  }
}

const initialLoans = [
  {
    _id: '6614a11f8b3c4f001a000001',
    loanNumber: 'BHAR-HL-8491',
    type: 'Home Loan',
    principalAmount: 2500000.0,
    outstandingAmount: 2180000.0,
    interestRate: 8.65,
    tenureMonths: 180,
    remainingMonths: 156,
    monthlyEmi: 24850.0,
    startDate: '2024-10-15T00:00:00.000Z',
    nextDueDate: '2026-11-05',
    status: 'Active',
  },
  {
    _id: '6614a11f8b3c4f001a000002',
    loanNumber: 'BHAR-PL-4412',
    type: 'Personal Loan',
    principalAmount: 150000.0,
    outstandingAmount: 95000.0,
    interestRate: 11.5,
    tenureMonths: 24,
    remainingMonths: 14,
    monthlyEmi: 7025.0,
    startDate: '2025-12-10T00:00:00.000Z',
    nextDueDate: '2026-11-10',
    status: 'Active',
  },
];

const initialInsurancePolicies = [
  {
    _id: '6615a11f8b3c4f001a000001',
    policyNumber: 'BHAR-INS-HLTH-8821',
    type: 'Health Insurance',
    planName: 'Arogya Sanjeevani Total Health Shield',
    provider: 'Bharat Health Assurance Co.',
    sumInsured: 1000000.0,
    premiumAmount: 1450.0,
    frequency: 'Monthly',
    status: 'Active',
    startDate: '2025-01-10T00:00:00.000Z',
    nextPremiumDate: '2026-10-25',
    nominee: 'Priya Kumar',
    nomineeRelation: 'Spouse',
    taxBenefit: 'Section 80D (Up to ₹25,000 deduction)',
    coverageFeatures: [
      'Cashless in 14,000+ network hospitals pan-India',
      'Pre & post hospitalization expenses (60/90 days)',
      'Zero room rent capping & ICU limit restriction',
      'AYUSH treatments & Daycare surgeries covered',
    ],
  },
  {
    _id: '6615a11f8b3c4f001a000002',
    policyNumber: 'BHAR-INS-LIFE-3094',
    type: 'Life Term Insurance',
    planName: 'Bharat Jeevan Suraksha Pure Term Plan',
    provider: 'Bharat Life Assurance Ltd.',
    sumInsured: 10000000.0,
    premiumAmount: 980.0,
    frequency: 'Monthly',
    status: 'Active',
    startDate: '2024-06-15T00:00:00.000Z',
    nextPremiumDate: '2026-11-15',
    nominee: 'Ramesh Kumar',
    nomineeRelation: 'Father',
    taxBenefit: 'Section 80C (Up to ₹1.5 Lakh tax exemption)',
    coverageFeatures: [
      '₹1.00 Crore guaranteed sum assured payout',
      'Fast-track 24-hr claim settlement commitment',
      'Terminal critical illness early payout acceleration',
      'Accidental total permanent disability waiver',
    ],
  },
  {
    _id: '6615a11f8b3c4f001a000003',
    policyNumber: 'BHAR-INS-CYB-1402',
    type: 'Cyber Fraud Shield',
    planName: 'Digital Banking & UPI Cyber Suraksha',
    provider: 'National Cyber Security Insurance',
    sumInsured: 250000.0,
    premiumAmount: 199.0,
    frequency: 'Monthly',
    status: 'Active',
    startDate: '2025-08-01T00:00:00.000Z',
    nextPremiumDate: '2026-11-01',
    nominee: 'Subham Kumar',
    nomineeRelation: 'Self',
    taxBenefit: 'Digital Financial Security Guarantee',
    coverageFeatures: [
      'Covers unauthorized UPI, NetBanking & ATM debits',
      'Protection against phishing scams & SIM swap fraud',
      'Identity restoration & credit file monitoring',
      'Legal defense and litigation expenses covered up to ₹50k',
    ],
  },
];

const initialInsuranceClaims = [
  {
    _id: '6616a11f8b3c4f001a000001',
    claimNumber: 'CLM-2026-8812',
    policyNumber: 'BHAR-INS-HLTH-8821',
    policyType: 'Health Insurance',
    planName: 'Arogya Sanjeevani Total Health Shield',
    claimAmount: 18500.0,
    reason: 'Emergency Appendicitis Daycare Laparoscopy',
    hospitalOrParty: 'Apollo Multi-Speciality Hospital, Bengaluru',
    incidentDate: '2026-08-14',
    status: 'Settled',
    filedAt: '2026-08-15T11:00:00.000Z',
  },
];

const initialTransactions = [
  {
    _id: '6613a11f8b3c4f001a000001',
    type: 'deposit',
    amount: 125000.0,
    date: '2026-10-01T09:30:00.000Z',
    description: 'Monthly Salary Credit - Tech Corp Payroll',
    utrNumber: '428190010101',
  },
  {
    _id: '6613a11f8b3c4f001a000002',
    type: 'upi_transfer',
    amount: 480.0,
    date: '2026-10-02T13:45:00.000Z',
    description: 'Swiggy Food Delivery - Weekend Lunch',
    upiId: 'swiggy@icici',
    upiApp: 'Google Pay',
    utrNumber: '428190010102',
  },
  {
    _id: '6613a11f8b3c4f001a000003',
    type: 'withdrawal',
    amount: 22000.0,
    date: '2026-10-03T11:00:00.000Z',
    description: 'Apartment Rent & Society Maintenance',
    utrNumber: '428190010103',
  },
  {
    _id: '6613a11f8b3c4f001a000004',
    type: 'upi_received',
    amount: 3500.0,
    date: '2026-10-05T15:20:00.000Z',
    description: 'Freelance UI Design Milestone Received',
    upiId: 'rahul.verma@okhdfcbank',
    upiApp: 'PhonePe',
    utrNumber: '428190010104',
  },
  {
    _id: '6613a11f8b3c4f001a000005',
    type: 'upi_transfer',
    amount: 60.0,
    date: '2026-10-06T17:10:00.000Z',
    description: 'Chai & Samosa Stall via Merchant QR',
    upiId: 'chaipoint@paytm',
    upiApp: 'Paytm',
    utrNumber: '428190010105',
  },
  {
    _id: '6613a11f8b3c4f001a000006',
    type: 'deposit',
    amount: 41960.0,
    date: '2026-10-07T10:15:00.000Z',
    description: 'US Wire Foreign Inward Remittance ($500.00 USD @ ₹83.92/USD)',
    originalCurrency: 'USD',
    originalAmount: 500.0,
    fxRate: 83.92,
    utrNumber: '428190010106',
  },
  {
    _id: '6613a11f8b3c4f001a000007',
    type: 'upi_transfer',
    amount: 1299.0,
    date: '2026-10-08T19:30:00.000Z',
    description: 'Amazon India Shopping via CRED UPI',
    upiId: 'amazonpay@apl',
    upiApp: 'CRED',
    utrNumber: '428190010107',
  },
  {
    _id: '6613a11f8b3c4f001a000008',
    type: 'insurance_premium',
    amount: 1450.0,
    date: '2026-09-25T11:20:00.000Z',
    description: 'Health Insurance Premium - Arogya Sanjeevani (BHAR-INS-HLTH-8821)',
    policyNumber: 'BHAR-INS-HLTH-8821',
    utrNumber: '428190010108',
  },
];

class BankDB {
  constructor() {
    this.client = null;
    this.nativeDb = null;
    this.connectionMode = 'embedded';
    this.connectionUri = '';
    this.isConnected = true;
    this.lastPingMs = 2;
    this.serverStartTime = Date.now();

    this.transactions = new MongoCollection('transactions', initialTransactions);
    this.loans = new MongoCollection('loans', initialLoans);
    this.insurancePolicies = new MongoCollection('insurance_policies', initialInsurancePolicies);
    this.insuranceClaims = new MongoCollection('insurance_claims', initialInsuranceClaims);
  }

  async init() {
    const uri = process.env.MONGODB_URI;
    if (uri) {
      await this.connectNative(uri).catch((err) => {
        console.log('MongoDB remote failed, using in-memory store instead:', err.message);
      });
    } else {
      console.log('Running on in-memory bank database');
    }
  }

  async connectNative(uri) {
    try {
      const start = Date.now();
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      const db = client.db('bharat_bank_db');
      await db.command({ ping: 1 });

      this.client = client;
      this.nativeDb = db;
      this.connectionMode = 'native';
      this.connectionUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      this.isConnected = true;
      this.lastPingMs = Date.now() - start;

      const count = await db.collection('transactions').countDocuments();
      if (count === 0) {
        await db.collection('transactions').insertMany(initialTransactions);
        await db.collection('loans').insertMany(initialLoans);
      }

      return { success: true, message: 'Connected to MongoDB' };
    } catch (err) {
      this.connectionMode = 'embedded';
      return { success: false, message: `MongoDB error: ${err.message}` };
    }
  }

  async getAccountData() {
    const txs = await this.transactions.find({}, { sort: { date: -1 } });
    const allLoans = await this.loans.find({});
    const allPolicies = await this.insurancePolicies.find({});

    let balance = 0;
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let totalUpiSpent = 0;

    for (const tx of txs) {
      if (
        tx.type === 'deposit' ||
        tx.type === 'upi_received' ||
        tx.type === 'loan_disbursement' ||
        tx.type === 'insurance_claim_credit'
      ) {
        balance += tx.amount;
        totalDeposited += tx.amount;
      } else {
        balance -= tx.amount;
        totalWithdrawn += tx.amount;
        if (tx.type === 'upi_transfer') {
          totalUpiSpent += tx.amount;
        }
      }
    }

    const activeLoans = allLoans.filter((l) => l.status === 'Active');
    const totalLoanOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingAmount, 0);

    const activePolicies = allPolicies.filter((p) => p.status === 'Active');
    const totalInsuranceCoverage = activePolicies.reduce((sum, p) => sum + p.sumInsured, 0);
    const insuranceTx = txs.filter((t) => t.type === 'insurance_premium');
    const totalInsurancePremiumsPaid = insuranceTx.reduce((sum, t) => sum + t.amount, 0);

    return {
      balance: Math.round(balance * 100) / 100,
      upiId: 'subham@bharatbank',
      accountNumber: '918237461029',
      ifscCode: 'BHAR0001042',
      accountHolder: 'Subham Kumar',
      transactions: txs,
      totalDeposited: Math.round(totalDeposited * 100) / 100,
      totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
      totalUpiSpent: Math.round(totalUpiSpent * 100) / 100,
      transactionCount: txs.length,
      activeLoansCount: activeLoans.length,
      totalLoanOutstanding: Math.round(totalLoanOutstanding * 100) / 100,
      activeInsuranceCount: activePolicies.length,
      totalInsuranceCoverage: Math.round(totalInsuranceCoverage),
      totalInsurancePremiumsPaid: Math.round(totalInsurancePremiumsPaid * 100) / 100,
    };
  }

  async addTransaction(data) {
    const {
      type,
      amount,
      description,
      upiId,
      upiApp,
      loanNumber,
      policyNumber,
      claimNumber,
      originalCurrency,
      originalAmount,
      fxRate,
    } = data;

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Please enter an amount greater than 0');
    }

    const account = await this.getAccountData();
    const isSpending =
      type === 'withdrawal' ||
      type === 'upi_transfer' ||
      type === 'loan_emi' ||
      type === 'insurance_premium';

    if (isSpending && amount > account.balance) {
      throw new Error(
        `Insufficient funds. You have ₹${account.balance.toLocaleString('en-IN')}, but tried to use ₹${amount.toLocaleString('en-IN')}.`
      );
    }

    const newTx = {
      type,
      amount: Math.round(amount * 100) / 100,
      date: new Date().toISOString(),
      description: description || 'Bank Transaction',
      upiId: upiId || undefined,
      upiApp: upiApp || (type.startsWith('upi') ? 'Google Pay' : undefined),
      loanNumber: loanNumber || undefined,
      policyNumber: policyNumber || undefined,
      claimNumber: claimNumber || undefined,
      utrNumber: generateUTR(),
      originalCurrency,
      originalAmount,
      fxRate,
    };

    return await this.transactions.insertOne(newTx);
  }

  async getLoans() {
    return await this.loans.find({});
  }

  async applyLoan(params) {
    const { type, principalAmount, interestRate, tenureMonths, disburseToAccount = true } = params;

    if (principalAmount <= 0 || tenureMonths <= 0) {
      throw new Error('Principal and tenure must be greater than 0');
    }

    const prefixMap = {
      'Personal Loan': 'PL',
      'Home Loan': 'HL',
      'Vehicle Loan': 'VL',
      'Education Loan': 'EL',
      'Business Loan': 'BL',
    };

    const count = await this.loans.countDocuments();
    const loanNumber = `BHAR-${prefixMap[type] || 'LN'}-${4000 + count + 1}`;
    const monthlyEmi = calculateEMI(principalAmount, interestRate, tenureMonths);

    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    nextDueDate.setDate(5);

    const newLoan = {
      loanNumber,
      type,
      principalAmount: Math.round(principalAmount),
      outstandingAmount: Math.round(principalAmount),
      interestRate,
      tenureMonths,
      remainingMonths: tenureMonths,
      monthlyEmi,
      startDate: new Date().toISOString(),
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      status: 'Active',
    };

    const created = await this.loans.insertOne(newLoan);

    if (disburseToAccount) {
      await this.addTransaction({
        type: 'loan_disbursement',
        amount: principalAmount,
        description: `Instant Digital Loan Disbursement (${created.loanNumber} - ${type})`,
        loanNumber: created.loanNumber,
      });
    }

    return created;
  }

  async payLoanEmi(params) {
    const { loanId, amount } = params;
    const loan = await this.loans.findOne({ _id: loanId });
    if (!loan) throw new Error('Loan account not found');
    if (loan.status === 'Closed') throw new Error('This loan account is already fully paid and closed.');

    const emiAmount = amount || loan.monthlyEmi;

    const account = await this.getAccountData();
    if (account.balance < emiAmount) {
      throw new Error(`Insufficient funds: you have ₹${account.balance.toLocaleString('en-IN')}, need ₹${emiAmount.toLocaleString('en-IN')} for EMI.`);
    }

    const tx = await this.addTransaction({
      type: 'loan_emi',
      amount: emiAmount,
      description: `Monthly EMI Auto-Debit for Loan ${loan.loanNumber}`,
      loanNumber: loan.loanNumber,
    });

    const newOutstanding = Math.max(0, Math.round((loan.outstandingAmount - emiAmount) * 100) / 100);
    const newRemainingMonths = Math.max(0, loan.remainingMonths - 1);
    const newStatus = newOutstanding === 0 ? 'Closed' : 'Active';

    await this.loans.updateOne(
      { _id: loanId },
      {
        $set: {
          outstandingAmount: newOutstanding,
          remainingMonths: newRemainingMonths,
          status: newStatus,
        },
      }
    );

    const updatedLoan = await this.loans.findOne({ _id: loanId });
    return { loan: updatedLoan, transaction: tx };
  }

  async getInsurancePolicies() {
    return await this.insurancePolicies.find({});
  }

  async getInsuranceClaims() {
    return await this.insuranceClaims.find({}, { sort: { filedAt: -1 } });
  }

  async payInsurancePremium(policyId) {
    const policy = await this.insurancePolicies.findOne({ _id: policyId });
    if (!policy) throw new Error('Policy not found');

    const account = await this.getAccountData();
    if (account.balance < policy.premiumAmount) {
      throw new Error(
        `Insufficient funds: you have ₹${account.balance.toLocaleString('en-IN')}, need ₹${policy.premiumAmount.toLocaleString('en-IN')} for premium.`
      );
    }

    const tx = await this.addTransaction({
      type: 'insurance_premium',
      amount: policy.premiumAmount,
      description: `Insurance Premium Auto-Debit: ${policy.planName} (${policy.policyNumber})`,
      policyNumber: policy.policyNumber,
    });

    const currentDue = new Date(policy.nextPremiumDate);
    if (policy.frequency === 'Monthly') {
      currentDue.setMonth(currentDue.getMonth() + 1);
    } else {
      currentDue.setFullYear(currentDue.getFullYear() + 1);
    }

    await this.insurancePolicies.updateOne(
      { _id: policyId },
      {
        $set: {
          nextPremiumDate: currentDue.toISOString().split('T')[0],
          status: 'Active',
        },
      }
    );

    const updatedPolicy = await this.insurancePolicies.findOne({ _id: policyId });
    return { policy: updatedPolicy, transaction: tx };
  }

  async buyInsurancePolicy(params) {
    const {
      type,
      planName,
      sumInsured,
      premiumAmount,
      frequency,
      nominee,
      nomineeRelation,
      taxBenefit = 'Eligible for Tax Deduction under Indian IT Act',
      coverageFeatures = [],
      debitFirstPremium = true,
    } = params;

    if (sumInsured <= 0 || premiumAmount <= 0) {
      throw new Error('Sum insured and premium must be greater than 0');
    }

    const prefixMap = {
      'Health Insurance': 'HLTH',
      'Life Term Insurance': 'LIFE',
      'Vehicle / Motor Insurance': 'AUTO',
      'Home Protection': 'HOME',
      'Cyber Fraud Shield': 'CYB',
    };

    const count = await this.insurancePolicies.countDocuments();
    const policyNumber = `BHAR-INS-${prefixMap[type] || 'GEN'}-${9100 + count + 1}`;

    const nextDue = new Date();
    if (frequency === 'Monthly') nextDue.setMonth(nextDue.getMonth() + 1);
    else nextDue.setFullYear(nextDue.getFullYear() + 1);

    const newPolicy = {
      policyNumber,
      type,
      planName,
      provider: 'Bharat Assurance Co. (Govt Recognized)',
      sumInsured: Math.round(sumInsured),
      premiumAmount: Math.round(premiumAmount),
      frequency,
      status: 'Active',
      startDate: new Date().toISOString(),
      nextPremiumDate: nextDue.toISOString().split('T')[0],
      nominee: nominee || 'Subham Kumar',
      nomineeRelation: nomineeRelation || 'Self',
      taxBenefit,
      coverageFeatures:
        coverageFeatures.length > 0
          ? coverageFeatures
          : ['Instant Digital Policy Certificate', 'Paperless Cashless Network Pan-India'],
    };

    const created = await this.insurancePolicies.insertOne(newPolicy);

    if (debitFirstPremium) {
      await this.addTransaction({
        type: 'insurance_premium',
        amount: premiumAmount,
        description: `Initial Premium Payment: ${planName} (${policyNumber})`,
        policyNumber,
      });
    }

    return created;
  }

  async fileInsuranceClaim(params) {
    const { policyNumber, claimAmount, reason, hospitalOrParty = 'General Healthcare Center', incidentDate } = params;
    const policy = await this.insurancePolicies.findOne({ policyNumber });
    if (!policy) throw new Error('Policy not found');

    const count = await this.insuranceClaims.countDocuments();
    const claimNumber = `CLM-${new Date().getFullYear()}-${8900 + count + 1}`;

    const claim = {
      claimNumber,
      policyNumber,
      policyType: policy.type,
      planName: policy.planName,
      claimAmount: Math.round(claimAmount),
      reason,
      hospitalOrParty,
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      status: 'Under Review',
      filedAt: new Date().toISOString(),
    };

    return await this.insuranceClaims.insertOne(claim);
  }

  async resetSeedData() {
    this.transactions.setRawDocs(initialTransactions);
    this.loans.setRawDocs(initialLoans);
    this.insurancePolicies.setRawDocs(initialInsurancePolicies);
    this.insuranceClaims.setRawDocs(initialInsuranceClaims);
    if (this.connectionMode === 'native' && this.nativeDb) {
      await this.nativeDb.collection('transactions').deleteMany({});
      await this.nativeDb.collection('loans').deleteMany({});
      await this.nativeDb.collection('insurance_policies').deleteMany({});
      await this.nativeDb.collection('insurance_claims').deleteMany({});
      await this.nativeDb.collection('transactions').insertMany(initialTransactions);
      await this.nativeDb.collection('loans').insertMany(initialLoans);
      await this.nativeDb.collection('insurance_policies').insertMany(initialInsurancePolicies);
      await this.nativeDb.collection('insurance_claims').insertMany(initialInsuranceClaims);
    }
  }

  async getStatus() {
    const txCount = await this.transactions.countDocuments();
    const loanCount = await this.loans.countDocuments();
    const policyCount = await this.insurancePolicies.countDocuments();
    const claimCount = await this.insuranceClaims.countDocuments();
    return {
      status: this.isConnected ? 'connected' : 'disconnected',
      mode: this.connectionMode,
      dbName: 'bharat_bank_db',
      latencyMs: this.lastPingMs,
      uptimeSeconds: Math.floor((Date.now() - this.serverStartTime) / 1000),
      collections: [
        { name: 'transactions', count: txCount },
        { name: 'loans', count: loanCount },
        { name: 'insurance_policies', count: policyCount },
        { name: 'insurance_claims', count: claimCount },
      ],
    };
  }
}

export const bankDb = new BankDB();
export const dbService = bankDb;
bankDb.init().catch(console.error);
