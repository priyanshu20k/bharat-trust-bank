import React, { useState, useEffect, useCallback } from 'react';
import * as api from './services/bankingService.js';
import { Header } from './components/Header.jsx';
import { BankingDashboard } from './components/BankingDashboard.jsx';
import { TransactionsView } from './components/TransactionsView.jsx';
import { UpiPaymentView } from './components/UpiPaymentView.jsx';
import { LoansView } from './components/LoansView.jsx';
import { InsuranceView } from './components/InsuranceView.jsx';
import { CurrencyConverterView } from './components/CurrencyConverterView.jsx';
import { DEFAULT_ACCOUNT } from './constants.js';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [account, setAccount] = useState(DEFAULT_ACCOUNT);
  const [loans, setLoans] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [accData, loansList, policiesList, claimsList] = await Promise.all([
        api.getAccount(),
        api.getLoans().catch(() => []),
        api.getPolicies().catch(() => []),
        api.getClaims().catch(() => []),
      ]);
      setAccount(accData);
      setLoans(loansList);
      setPolicies(policiesList);
      setClaims(claimsList);
    } catch (err) {
      console.error('Failed to load bank data:', err);
      setError(err.message || 'Could not connect to the bank server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const doTransaction = async (payload) => {
    await api.sendTransaction(payload);
    await loadData();
  };

  const sendUpi = async (payload) => {
    await api.sendTransaction(payload);
    await loadData();
  };

  const receiveUpi = async (payload) => {
    await api.sendTransaction(payload);
    await loadData();
  };

  const applyLoan = async (payload) => {
    await api.applyLoan(payload);
    await loadData();
  };

  const payEmi = async (payload) => {
    await api.payEmi(payload);
    await loadData();
  };

  const depositForex = async (payload) => {
    await api.sendTransaction(payload);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header
        activeTab={tab}
        onTabChange={setTab}
        upiId={account.upiId}
        activeLoansCount={account.activeLoansCount}
        activeInsuranceCount={account.activeInsuranceCount}
        transactionCount={account.transactionCount}
        onRefresh={loadData}
        loading={loading}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between text-rose-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-200 font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {tab === 'dashboard' && (
          <BankingDashboard
            accountData={account}
            onTransaction={doTransaction}
            onOpenUpiTab={() => setTab('upi')}
            onOpenConverterTab={() => setTab('converter')}
            onOpenTransactionsTab={() => setTab('transactions')}
            onOpenInsuranceTab={() => setTab('insurance')}
            loading={loading}
          />
        )}

        {tab === 'transactions' && (
          <TransactionsView
            accountData={account}
            onTransaction={doTransaction}
            onRefresh={loadData}
          />
        )}

        {tab === 'upi' && (
          <UpiPaymentView
            balance={account.balance}
            myUpiId={account.upiId}
            onSendUpi={sendUpi}
            onReceiveUpi={receiveUpi}
          />
        )}

        {tab === 'loans' && (
          <LoansView
            loans={loans}
            balance={account.balance}
            onApplyLoan={applyLoan}
            onPayEmi={payEmi}
          />
        )}

        {tab === 'insurance' && (
          <InsuranceView
            policies={policies}
            claims={claims}
            accountData={account}
            onRefreshData={loadData}
          />
        )}

        {tab === 'converter' && (
          <CurrencyConverterView
            onDepositForeignFunds={depositForex}
          />
        )}
      </main>
    </div>
  );
}
