import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  TrendingUp,
  TrendingDown,
  QrCode,
  ArrowLeftRight,
  Zap,
} from 'lucide-react';
import { formatMoney } from '../constants.js';

export function BankingDashboard({
  accountData,
  onTransaction,
  onOpenUpiTab,
  onOpenConverterTab,
  onOpenTransactionsTab,
  onOpenInsuranceTab,
  loading = false,
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    balance = 0,
    upiId = '',
    transactions = [],
    totalDeposited = 0,
    totalWithdrawn = 0,
    totalUpiSpent = 0,
    transactionCount = 0,
  } = accountData || {};

  const submitTransfer = async (type) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setFeedback({ message: 'Please enter an amount greater than ₹0', type: 'error' });
      return;
    }

    if (type === 'withdrawal' && val > balance) {
      setFeedback({
        message: `You only have ₹${balance.toLocaleString('en-IN')}, so you cannot withdraw ₹${val.toLocaleString('en-IN')}.`,
        type: 'error',
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      await onTransaction({
        type,
        amount: val,
        description: description.trim() || undefined,
      });
      setAmount('');
      setDescription('');
      setFeedback({
        message: `${type === 'deposit' ? 'Deposited' : 'Withdrew'} ${formatMoney(val)} successfully!`,
        type: 'success',
      });
    } catch (err) {
      setFeedback({ message: err.message || 'Something went wrong', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const pickAmount = (val) => {
    setAmount(val.toString());
  };

  const upiBadge = (tx) => {
    if (tx.upiApp) {
      let bg = 'bg-slate-800 text-slate-300';
      if (tx.upiApp === 'Google Pay') bg = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      if (tx.upiApp === 'PhonePe') bg = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      if (tx.upiApp === 'Paytm') bg = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${bg}`}>
          {tx.upiApp}
        </span>
      );
    }
    return null;
  };

  const recentList = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Account Balance Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Savings Balance
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                RBI / NPCI Live
              </span>
            </div>

            <h2
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight my-2 ${
                balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatMoney(balance)}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>UPI VPA:</span>
              <span className="font-mono text-slate-200 font-semibold">{upiId}</span>
              <span>·</span>
              <span>Account: •••• 1029</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onOpenUpiTab}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan / Pay UPI</span>
            </button>

            <button
              onClick={onOpenConverterTab}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-amber-400" />
              <span>Forex Convert</span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Inflows</span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-100">
              {formatMoney(totalDeposited)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Total Outflows</span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-100">
              {formatMoney(totalWithdrawn)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>UPI Payments</span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-100">
              {formatMoney(totalUpiSpent)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Transactions</span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-100">
              {transactionCount} Records
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Quick Deposit & Withdrawal Desk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Instant Deposit / Credit</span>
            </h3>
            <span className="text-[11px] text-slate-400">Immediate ledger update</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Deposit Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Description / Note</label>
              <input
                type="text"
                placeholder="e.g. Salary, Client payment, Savings"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[500, 1000, 2000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => pickAmount(preset)}
                  className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 cursor-pointer"
                >
                  +₹{preset}
                </button>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => submitTransfer('deposit')}
                disabled={saving || loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{saving ? 'Processing...' : 'Deposit Funds'}</span>
              </button>

              <button
                type="button"
                onClick={() => submitTransfer('withdrawal')}
                disabled={saving || loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{saving ? 'Processing...' : 'Withdraw Funds'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links & Safety Banner */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Digital Banking Services</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Direct access to our banking features, verified through NPCI and RBI security standards.
            </p>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={onOpenTransactionsTab}
                className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                  Passbook & Statement
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Download CSV, UTR receipt
                </div>
              </button>

              <button
                onClick={onOpenUpiTab}
                className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                  UPI & QR Pay
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Instant peer-to-peer VPA
                </div>
              </button>

              <button
                onClick={onOpenConverterTab}
                className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                  Forex Remittance
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  USD, EUR, GBP to INR
                </div>
              </button>

              <button
                onClick={onOpenInsuranceTab}
                className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400">
                  Insurance & Cover
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Health, Life & Cyber protection
                </div>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>IFSC Code:</span>
            <span className="font-mono text-emerald-400 font-bold">BHAR0001042</span>
          </div>
        </div>
      </div>

      {/* Recent Passbook Transactions List */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
          </div>

          {onOpenTransactionsTab && (
            <button
              onClick={onOpenTransactionsTab}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              View Full Passbook →
            </button>
          )}
        </div>

        {recentList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No transactions yet. Use Deposit or UPI above to make your first transaction!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentList.map((tx) => {
              const isCredit =
                tx.type === 'deposit' ||
                tx.type === 'upi_received' ||
                tx.type === 'loan_disbursement' ||
                tx.type === 'insurance_claim_credit';

              return (
                <div
                  key={tx._id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="font-medium text-slate-200 flex items-center gap-2">
                        <span>{tx.description}</span>
                        {upiBadge(tx)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        ·{' '}
                        {new Date(tx.date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {tx.utrNumber ? ` · UTR: ${tx.utrNumber}` : ''}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`font-mono font-bold ${
                      isCredit ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {isCredit ? '+' : '-'}
                    {formatMoney(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
