import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Calculator,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatMoney } from '../constants.js';

const LOAN_TYPES_CONFIG = {
  'Personal Loan': { defaultRate: 11.5, maxTenure: 60, badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30', defaultAmount: 150000 },
  'Home Loan': { defaultRate: 8.65, maxTenure: 240, badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', defaultAmount: 2500000 },
  'Vehicle Loan': { defaultRate: 9.25, maxTenure: 84, badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30', defaultAmount: 600000 },
  'Education Loan': { defaultRate: 8.5, maxTenure: 120, badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', defaultAmount: 800000 },
  'Business Loan': { defaultRate: 12.0, maxTenure: 60, badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30', defaultAmount: 500000 },
};

export function LoansView({
  loans = [],
  balance = 0,
  onApplyLoan,
  onPayEmi,
}) {
  const [activeSection, setActiveSection] = useState('my-loans');

  const [calcPrincipal, setCalcPrincipal] = useState(500000);
  const [calcRate, setCalcRate] = useState(10.5);
  const [calcTenureMonths, setCalcTenureMonths] = useState(36);

  const [applyType, setApplyType] = useState('Personal Loan');
  const [applyAmount, setApplyAmount] = useState('200000');
  const [applyTenure, setApplyTenure] = useState(36);
  const [disburseImmediately, setDisburseImmediately] = useState(true);
  const [applying, setApplying] = useState(false);

  const [payingEmiId, setPayingEmiId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { monthlyEmi, totalInterest, totalRepayment, principalRatio } = useMemo(() => {
    const P = calcPrincipal;
    const r = calcRate / 12 / 100;
    const n = calcTenureMonths;

    if (P <= 0 || n <= 0) return { monthlyEmi: 0, totalInterest: 0, totalRepayment: 0, principalRatio: 100 };

    let emi = 0;
    if (r === 0) {
      emi = Math.round(P / n);
    } else {
      emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }

    const totalRepay = emi * n;
    const totalInt = Math.max(0, totalRepay - P);
    const ratio = Math.round((P / totalRepay) * 100);

    return { monthlyEmi: emi, totalInterest: totalInt, totalRepayment: totalRepay, principalRatio: ratio };
  }, [calcPrincipal, calcRate, calcTenureMonths]);

  const handlePayEmi = async (loan) => {
    if (balance < loan.monthlyEmi) {
      setFeedback({
        msg: `You don't have enough balance (₹${balance.toLocaleString('en-IN')}) to pay EMI of ₹${loan.monthlyEmi.toLocaleString('en-IN')}.`,
        type: 'error',
      });
      return;
    }

    setPayingEmiId(loan._id);
    setFeedback(null);
    try {
      await onPayEmi({ loanId: loan._id });
      setFeedback({
        msg: `Paid monthly EMI of ₹${loan.monthlyEmi.toLocaleString('en-IN')} for ${loan.loanNumber}!`,
        type: 'success',
      });
    } catch (err) {
      setFeedback({ msg: err.message || 'Could not pay EMI', type: 'error' });
    } finally {
      setPayingEmiId(null);
    }
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    const principal = parseFloat(applyAmount);
    if (isNaN(principal) || principal < 10000) {
      setFeedback({ msg: 'Please enter at least ₹10,000 for the loan amount', type: 'error' });
      return;
    }

    const rate = LOAN_TYPES_CONFIG[applyType].defaultRate;
    setApplying(true);
    setFeedback(null);

    try {
      await onApplyLoan({
        type: applyType,
        principalAmount: principal,
        interestRate: rate,
        tenureMonths: applyTenure,
        disburseToAccount: disburseImmediately,
      });

      setFeedback({
        msg: `Loan approved! ₹${principal.toLocaleString('en-IN')} has been ${
          disburseImmediately ? 'added directly to your bank balance.' : 'approved.'
        }`,
        type: 'success',
      });
      setActiveSection('my-loans');
    } catch (err) {
      setFeedback({ msg: err.message || 'Loan request failed', type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  const activeLoans = loans.filter((l) => l.status === 'Active');
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingAmount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant Digital Credit & Pre-Approved Loans</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Loans & EMI Management Center
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Calculate loan EMIs, manage active loan accounts, pay installments with one click,
              or apply for instant digital disbursements credited directly into your account balance.
            </p>
          </div>

          <div className="text-left sm:text-right p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Loan Outstanding</span>
            <span className="text-xl font-bold font-mono text-rose-400">
              {formatMoney(totalOutstanding)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Across {activeLoans.length} active loans
            </span>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-2 pt-6 border-t border-slate-800/80 mt-6">
          <button
            onClick={() => setActiveSection('my-loans')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeSection === 'my-loans'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            My Active Loans ({activeLoans.length})
          </button>

          <button
            onClick={() => setActiveSection('calculator')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'calculator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>EMI Calculator</span>
          </button>

          <button
            onClick={() => setActiveSection('apply')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'apply'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply Instant Loan</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 animate-fade-in ${
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
            <span>{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ×
          </button>
        </div>
      )}

      {activeSection === 'my-loans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Active Loan Accounts
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Available Balance: <strong className="text-emerald-400">₹{balance.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          {loans.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-3xl">
              <p className="text-xs">No active loan accounts found.</p>
              <button
                onClick={() => setActiveSection('apply')}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                + Apply for an Instant Loan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map((loan) => {
                const config = LOAN_TYPES_CONFIG[loan.type] || LOAN_TYPES_CONFIG['Personal Loan'];
                const repaidAmount = Math.max(0, loan.principalAmount - loan.outstandingAmount);
                const percentRepaid = Math.round((repaidAmount / loan.principalAmount) * 100);

                return (
                  <div
                    key={loan._id}
                    className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4 relative"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${config.badgeColor}`}>
                            {loan.type}
                          </span>
                          <span className="font-mono text-xs text-slate-400">{loan.loanNumber}</span>
                        </div>
                        <div className="mt-2 text-lg font-bold font-mono text-slate-100">
                          {formatMoney(loan.outstandingAmount)}
                          <span className="text-xs font-normal text-slate-500 font-sans ml-1">
                            outstanding of {formatMoney(loan.principalAmount)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          loan.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Repaid: {percentRepaid}%</span>
                        <span>{loan.remainingMonths} of {loan.tenureMonths} mos left</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentRepaid}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Monthly EMI</span>
                        <span className="font-mono font-bold text-slate-200">
                          {formatMoney(loan.monthlyEmi)}/mo
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Interest Rate</span>
                        <span className="font-mono font-bold text-indigo-400">
                          {loan.interestRate}% p.a.
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Next Due: {loan.nextDueDate}</span>
                      </div>

                      {loan.status === 'Active' && (
                        <button
                          onClick={() => handlePayEmi(loan)}
                          disabled={payingEmiId === loan._id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {payingEmiId === loan._id ? 'Processing...' : `Pay EMI (₹${loan.monthlyEmi.toLocaleString('en-IN')})`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSection === 'calculator' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Interactive Loan EMI Calculator</span>
            </h3>
            <span className="text-xs text-slate-500">Standard Reducing Balance Method</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Loan Amount (Principal)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatMoney(calcPrincipal)}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="5000000"
                  step="25000"
                  value={calcPrincipal}
                  onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>₹50,000</span>
                  <span>₹25,00,000</span>
                  <span>₹50,00,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Interest Rate (% p.a.)</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{calcRate}%</span>
                </div>
                <input
                  type="range"
                  min="7.0"
                  max="18.0"
                  step="0.25"
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>7.0%</span>
                  <span>12.5%</span>
                  <span>18.0%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Tenure (Duration)</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {calcTenureMonths} Months ({Math.round((calcTenureMonths / 12) * 10) / 10} Yrs)
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="120"
                  step="6"
                  value={calcTenureMonths}
                  onChange={(e) => setCalcTenureMonths(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>6 Months</span>
                  <span>5 Years</span>
                  <span>10 Years</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">
                Calculated Monthly Installment (EMI)
              </span>

              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                {formatMoney(monthlyEmi)}
                <span className="text-xs font-normal text-slate-500 font-sans"> / month</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-emerald-400">Principal: {principalRatio}%</span>
                  <span className="text-amber-400">Interest: {100 - principalRatio}%</span>
                </div>
                <div className="w-full bg-amber-500 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${principalRatio}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs text-left">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Total Interest Payable</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatMoney(totalInterest)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Total Amount Repaid</span>
                  <span className="font-mono font-bold text-slate-100 text-sm">
                    {formatMoney(totalRepayment)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setApplyAmount(calcPrincipal.toString());
                  setApplyTenure(calcTenureMonths);
                  setActiveSection('apply');
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Apply for this Loan with ₹{monthlyEmi.toLocaleString('en-IN')}/mo EMI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'apply' && (
        <form onSubmit={handleApplyLoan} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Instant Pre-Approved Digital Loan Application</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Funds can be disbursed directly into your Bharat Trust Bank account within seconds.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-2">Select Loan Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(LOAN_TYPES_CONFIG).map((type) => {
                const conf = LOAN_TYPES_CONFIG[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setApplyType(type);
                      setApplyAmount(conf.defaultAmount.toString());
                    }}
                    className={`p-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                      applyType === type
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>{type}</div>
                    <div className="text-[10px] font-normal opacity-80 mt-1">
                      From {conf.defaultRate}% p.a.
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Loan Amount Required (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  step="5000"
                  required
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 font-mono text-sm font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Repayment Tenure (Months)
              </label>
              <select
                aria-label="Loan Tenure in Months"
                value={applyTenure}
                onChange={(e) => setApplyTenure(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {[12, 24, 36, 48, 60, 84, 120, 180, 240].map((m) => (
                  <option key={m} value={m}>
                    {m} Months ({Math.round((m / 12) * 10) / 10} Years)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Instant Account Credit on Approval
                </span>
                <span className="text-[11px] text-slate-400">
                  Immediately deposit sanctioned funds into your Bharat Trust Bank savings balance.
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={disburseImmediately}
              onChange={(e) => setDisburseImmediately(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={applying}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{applying ? 'Evaluating & Disbursing Loan...' : 'Submit Application & Disburse Loan'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
