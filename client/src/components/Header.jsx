import React, { useState } from 'react';
import {
  Landmark,
  LayoutDashboard,
  Receipt,
  QrCode,
  CreditCard,
  Umbrella,
  ArrowLeftRight,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

export function Header({
  activeTab,
  onTabChange,
  upiId,
  activeLoansCount = 0,
  activeInsuranceCount = 0,
  transactionCount = 0,
  onRefresh,
  loading = false,
}) {
  const [copied, setCopied] = useState(false);

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-500 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Landmark className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Bharat Trust Bank
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  RBI Licensed
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                A/C •••• 1029 · IFSC: BHAR0001042 · UPI 2.0 & IRDAI Verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={copyUpiId}
              title="Click to copy UPI ID"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-slate-500 uppercase font-mono">UPI ID:</span>
              <span className="font-mono font-medium text-emerald-400">{upiId}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Account Data"
              className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/70 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-800/60 pt-1 -mb-px overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Banking Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('transactions')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>Passbook & Transactions</span>
            {transactionCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                {transactionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('upi')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'upi'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>UPI & QR</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
              Instant
            </span>
          </button>

          <button
            onClick={() => onTabChange('loans')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'loans'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Loans & EMI</span>
            {activeLoansCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300">
                {activeLoansCount} Active
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('insurance')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'insurance'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Umbrella className="w-3.5 h-3.5 text-cyan-400" />
            <span>Insurance & Protection</span>
            {activeInsuranceCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300">
                {activeInsuranceCount} Cover
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('converter')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'converter'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Forex Rates</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
              Live
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
