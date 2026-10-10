const API_BASE = '/api';

export async function getAccount() {
  const res = await fetch(`${API_BASE}/account`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
  return await res.json();
}

export async function getTransactions(params) {
  const query = new URLSearchParams();
  if (params?.type && params.type !== 'all') query.append('type', params.type);
  if (params?.search) query.append('search', params.search);
  if (params?.limit) query.append('limit', params.limit.toString());

  const url = `${API_BASE}/transactions${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch transactions');
  return data.data;
}

export async function sendTransaction(payload) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Transaction failed');
  }
  return data;
}

export async function getLoans() {
  const res = await fetch(`${API_BASE}/loans`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch loans');
  return data.data;
}

export async function applyLoan(payload) {
  const res = await fetch(`${API_BASE}/loans/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to apply for loan');
  return data.data;
}

export async function payEmi(payload) {
  const res = await fetch(`${API_BASE}/loans/pay-emi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to pay EMI');
  return data.data;
}

export async function getPolicies() {
  const res = await fetch(`${API_BASE}/insurance/policies`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch insurance policies');
  return data.data;
}

export async function getClaims() {
  const res = await fetch(`${API_BASE}/insurance/claims`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch claims');
  return data.data;
}

export async function payPremium(policyId) {
  const res = await fetch(`${API_BASE}/insurance/pay-premium`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ policyId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to pay premium');
  return data.data;
}

export async function buyPolicy(payload) {
  const res = await fetch(`${API_BASE}/insurance/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to buy policy');
  return data.data;
}

export async function submitClaim(payload) {
  const res = await fetch(`${API_BASE}/insurance/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to file claim');
  return data.data;
}

export async function getRates() {
  const res = await fetch(`${API_BASE}/rates`);
  const data = await res.json();
  return data.rates || [];
}

export async function convertMoney(amount, from, to) {
  const res = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, from, to }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to convert currency');
  }
  return data;
}

export async function resetDb() {
  const res = await fetch(`${API_BASE}/db/seed`, { method: 'POST' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to reset database');
}

// Friendly aliases so existing calls keep working
export const fetchAccountData = getAccount;
export const fetchTransactions = getTransactions;
export const postTransaction = sendTransaction;
export const fetchLoans = getLoans;
export const applyForLoan = applyLoan;
export const payLoanEmi = payEmi;
export const fetchInsurancePolicies = getPolicies;
export const fetchInsuranceClaims = getClaims;
export const payInsurancePremium = payPremium;
export const buyInsurancePolicy = buyPolicy;
export const fileInsuranceClaim = submitClaim;
export const fetchFXRates = getRates;
export const convertCurrency = convertMoney;
export const resetDatabase = resetDb;
