import { Router } from 'express';
import { bankDb, FX_RATES } from '../db/mongo.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

router.get('/account', async (_req, res) => {
  try {
    const data = await bankDb.getAccountData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Could not load account data', details: err.message });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const { type, search, limit } = req.query;
    const filter = {};
    if (type && type !== 'all') {
      filter.type = type;
    }

    const options = { sort: { date: -1 } };
    if (limit) options.limit = parseInt(limit, 10);

    let list = await bankDb.transactions.find(filter, options);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.utrNumber?.includes(q) ||
          t.upiId?.toLowerCase().includes(q) ||
          t.loanNumber?.toLowerCase().includes(q) ||
          t.policyNumber?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ error: 'Could not load transactions', details: err.message });
  }
});

router.post('/transactions', async (req, res) => {
  const {
    type,
    amount,
    description,
    upiId,
    upiApp,
    loanNumber,
    policyNumber,
    originalCurrency,
    originalAmount,
    fxRate,
  } = req.body;

  if (!type || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Please supply a transaction type and amount' });
  }

  try {
    const tx = await bankDb.addTransaction({
      type,
      amount,
      description,
      upiId,
      upiApp,
      loanNumber,
      policyNumber,
      originalCurrency,
      originalAmount,
      fxRate,
    });
    res.status(201).json(tx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/loans', async (_req, res) => {
  try {
    const list = await bankDb.getLoans();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ error: 'Could not load loans', details: err.message });
  }
});

router.post('/loans/apply', async (req, res) => {
  try {
    const { type, principalAmount, interestRate, tenureMonths, disburseToAccount } = req.body;
    if (!type || !principalAmount || !interestRate || !tenureMonths) {
      return res.status(400).json({ error: 'Missing required loan parameters' });
    }

    const loan = await bankDb.applyLoan({
      type,
      principalAmount: Number(principalAmount),
      interestRate: Number(interestRate),
      tenureMonths: Number(tenureMonths),
      disburseToAccount: disburseToAccount !== false,
    });

    res.status(201).json({ success: true, data: loan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/loans/pay-emi', async (req, res) => {
  try {
    const { loanId, amount } = req.body;
    if (!loanId) {
      return res.status(400).json({ error: 'Please provide a loan ID' });
    }

    const result = await bankDb.payLoanEmi({
      loanId,
      amount: amount ? Number(amount) : undefined,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/insurance/policies', async (_req, res) => {
  try {
    const list = await bankDb.getInsurancePolicies();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ error: 'Could not load policies', details: err.message });
  }
});

router.get('/insurance/claims', async (_req, res) => {
  try {
    const list = await bankDb.getInsuranceClaims();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ error: 'Could not load claims', details: err.message });
  }
});

router.post('/insurance/pay-premium', async (req, res) => {
  try {
    const { policyId } = req.body;
    if (!policyId) {
      return res.status(400).json({ error: 'Please provide a policy ID' });
    }

    const result = await bankDb.payInsurancePremium(policyId);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/insurance/buy', async (req, res) => {
  try {
    const {
      type,
      planName,
      sumInsured,
      premiumAmount,
      frequency,
      nominee,
      nomineeRelation,
      taxBenefit,
      coverageFeatures,
      debitFirstPremium,
    } = req.body;

    if (!type || !planName || !sumInsured || !premiumAmount || !frequency) {
      return res.status(400).json({ error: 'Missing required insurance details' });
    }

    const policy = await bankDb.buyInsurancePolicy({
      type,
      planName,
      sumInsured: Number(sumInsured),
      premiumAmount: Number(premiumAmount),
      frequency,
      nominee,
      nomineeRelation,
      taxBenefit,
      coverageFeatures,
      debitFirstPremium: debitFirstPremium !== false,
    });

    res.status(201).json({ success: true, data: policy });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/insurance/claim', async (req, res) => {
  try {
    const { policyNumber, claimAmount, reason, hospitalOrParty, incidentDate } = req.body;
    if (!policyNumber || !claimAmount || !reason) {
      return res.status(400).json({ error: 'Policy number, amount, and reason are required' });
    }

    const claim = await bankDb.fileInsuranceClaim({
      policyNumber,
      claimAmount: Number(claimAmount),
      reason,
      hospitalOrParty,
      incidentDate,
    });

    res.status(201).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/rates', (_req, res) => {
  res.json({
    base: 'INR',
    updatedAt: new Date().toISOString(),
    rates: FX_RATES,
  });
});

router.post('/convert', (req, res) => {
  const { amount, from, to } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount < 0) {
    return res.status(400).json({ error: 'Please enter a valid amount' });
  }

  const fromRate = FX_RATES.find((r) => r.code === from);
  const toRate = FX_RATES.find((r) => r.code === to);

  if (!fromRate || !toRate) {
    return res.status(400).json({ error: 'Unsupported currency code' });
  }

  const inInr = numAmount * fromRate.rateToInr;
  const convertedAmount = Math.round((inInr / toRate.rateToInr) * 100) / 100;
  const effectiveRate = Math.round((fromRate.rateToInr / toRate.rateToInr) * 10000) / 10000;

  res.json({
    from,
    to,
    originalAmount: numAmount,
    convertedAmount,
    rate: effectiveRate,
  });
});

router.post('/db/seed', async (_req, res) => {
  try {
    await bankDb.resetSeedData();
    res.json({ success: true, message: 'Database reset to initial demo data' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed', details: err.message });
  }
});

router.get('/db/status', async (_req, res) => {
  try {
    const status = await bankDb.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Status check failed', details: err.message });
  }
});

export default router;
