import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  X,
  Printer,
  PlusCircle,
  ShieldCheck,
  Building2,
  QrCode,
  CreditCard,
  Umbrella,
  Globe,
  Clock,
} from 'lucide-react';
import { formatMoney } from '../constants.js';

export function TransactionsView({
  accountData,
  onTransaction,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState(null);
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(null);

  const [newTxType, setNewTxType] = useState('deposit');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxDesc, setNewTxDesc] = useState('');
  const [newTxUpiId, setNewTxUpiId] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { transactions = [], balance = 0 } = accountData || {};

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(id);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedFilter === 'credit') {
        const isCredit = tx.type === 'deposit' || tx.type === 'upi_received' || tx.type === 'loan_disbursement' || tx.type === 'insurance_claim_credit';
        if (!isCredit) return false;
      } else if (selectedFilter === 'debit') {
        const isDebit = tx.type === 'withdrawal' || tx.type === 'upi_transfer' || tx.type === 'loan_emi' || tx.type === 'insurance_premium';
        if (!isDebit) return false;
      } else if (selectedFilter === 'upi') {
        if (!tx.type.startsWith('upi')) return false;
      } else if (selectedFilter === 'loans') {
        if (tx.type !== 'loan_disbursement' && tx.type !== 'loan_emi') return false;
      } else if (selectedFilter === 'insurance') {
        if (tx.type !== 'insurance_premium' && tx.type !== 'insurance_claim_credit') return false;
      } else if (selectedFilter === 'forex') {
        if (!tx.originalCurrency) return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesDesc = tx.description?.toLowerCase().includes(q);
        const matchesUtr = tx.utrNumber?.includes(q);
        const matchesUpi = tx.upiId?.toLowerCase().includes(q);
        const matchesLoan = tx.loanNumber?.toLowerCase().includes(q);
        const matchesPolicy = tx.policyNumber?.toLowerCase().includes(q);
        const matchesAmount = tx.amount?.toString().includes(q);
        return matchesDesc || matchesUtr || matchesUpi || matchesLoan || matchesPolicy || matchesAmount;
      }

      return true;
    });
  }, [transactions, selectedFilter, searchTerm]);

  const stats = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const tx of transactions) {
      if (tx.type === 'deposit' || tx.type === 'upi_received' || tx.type === 'loan_disbursement' || tx.type === 'insurance_claim_credit') {
        inflow += tx.amount;
      } else {
        outflow += tx.amount;
      }
    }
    return {
      inflow,
      outflow,
      net: inflow - outflow,
      count: transactions.length,
    };
  }, [transactions]);

  const downloadCSVStatement = () => {
    const headers = ['Date', 'Transaction ID', 'Type', 'Amount (INR)', 'Description', 'Party / VPA / Account', 'UTR Reference'];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.date).toLocaleString('en-IN'),
      tx._id,
      tx.type,
      tx.amount,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.upiId || tx.loanNumber || tx.policyNumber || 'Bharat Trust Bank A/C',
      tx.utrNumber || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bharat_Trust_Bank_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const val = parseFloat(newTxAmount);
    if (isNaN(val) || val <= 0) {
      setFormError('Please enter an amount greater than ₹0');
      return;
    }

    if ((newTxType === 'withdrawal' || newTxType === 'upi_transfer') && val > balance) {
      setFormError(`You don't have enough balance (₹${balance.toLocaleString('en-IN')}) for this.`);
      return;
    }

    if (newTxType === 'upi_transfer' && !newTxUpiId.trim()) {
      setFormError('Please enter a recipient UPI ID like friend@okhdfcbank');
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransaction({
        type: newTxType,
        amount: val,
        description: newTxDesc.trim() || undefined,
        upiId: newTxType === 'upi_transfer' ? newTxUpiId.trim() : undefined,
      });

      setFormSuccess(`Successfully executed ${newTxType.replace('_', ' ')} of ${formatMoney(val)}`);
      setNewTxAmount('');
      setNewTxDesc('');
      setNewTxUpiId('');
      setTimeout(() => {
        setShowNewTxModal(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTransactionBadge = (tx) => {
    const isCredit =
      tx.type === 'deposit' ||
      tx.type === 'upi_received' ||
      tx.type === 'loan_disbursement' ||
      tx.type === 'insurance_claim_credit';

    if (tx.type === 'insurance_premium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Umbrella className="w-3 h-3" />
          Insurance Premium
        </span>
      );
    }
    if (tx.type === 'insurance_claim_credit') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          Claim Settled
        </span>
      );
    }
    if (tx.type === 'loan_emi') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <CreditCard className="w-3 h-3" />
          Loan EMI
        </span>
      );
    }
    if (tx.type === 'loan_disbursement') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Building2 className="w-3 h-3" />
          Loan Disbursal
        </span>
      );
    }
    if (tx.type.startsWith('upi')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <QrCode className="w-3 h-3" />
          {tx.upiApp || 'UPI Payment'}
        </span>
      );
    }
    if (isCredit) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ArrowDownLeft className="w-3 h-3" />
          Deposit (Credit)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <ArrowUpRight className="w-3 h-3" />
        Withdrawal (Debit)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account Balance</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{formatMoney(balance)}</div>
          <p className="mt-1 text-xs text-slate-500">Live Real-time Ledger Balance</p>
        </div>

        {/* Total Inflow */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Inflow (Credits)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">+{formatMoney(stats.inflow)}</div>
          <p className="mt-1 text-xs text-slate-500">Salary, UPI Received, Disbursals</p>
        </div>

        {/* Total Outflow */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Outflow (Debits)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-400">-{formatMoney(stats.outflow)}</div>
          <p className="mt-1 text-xs text-slate-500">UPI, Cash, EMIs, Premiums</p>
        </div>

        {/* Total Transactions & Quick Action */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Transactions</span>
            <div className="mt-2 text-xl font-bold font-mono text-white">{stats.count} Records</div>
          </div>
          <button
            onClick={() => setShowNewTxModal(true)}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Transaction
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description, UTR, UPI, amount..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={downloadCSVStatement}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download CSV Statement</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] text-slate-500 uppercase font-mono mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Passbook' },
            { id: 'credit', label: 'Inflows / Credits' },
            { id: 'debit', label: 'Outflows / Debits' },
            { id: 'upi', label: 'UPI Payments' },
            { id: 'loans', label: 'Loans & EMI' },
            { id: 'insurance', label: 'Insurance' },
            { id: 'forex', label: 'Forex' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Passbook & Account Statement</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
              Showing {filteredTransactions.length} of {transactions.length}
            </span>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-slate-300 font-medium">No transactions found</p>
            <p className="text-slate-500 text-xs mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredTransactions.map((tx) => {
              const isCredit =
                tx.type === 'deposit' ||
                tx.type === 'upi_received' ||
                tx.type === 'loan_disbursement' ||
                tx.type === 'insurance_claim_credit';

              return (
                <div
                  key={tx._id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  {/* Left: Direction Icon + Details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCredit
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm text-white">{tx.description}</span>
                        {getTransactionBadge(tx)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
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
                        </span>

                        {tx.upiId && (
                          <span className="text-slate-300">
                            VPA: <span className="text-emerald-400">{tx.upiId}</span>
                          </span>
                        )}

                        {tx.loanNumber && (
                          <span className="text-indigo-300">Loan: {tx.loanNumber}</span>
                        )}

                        {tx.policyNumber && (
                          <span className="text-cyan-300">Policy: {tx.policyNumber}</span>
                        )}

                        {tx.utrNumber && (
                          <button
                            onClick={() => copyToClipboard(tx.utrNumber, tx._id)}
                            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                            title="Click to copy UTR"
                          >
                            <span>UTR: {tx.utrNumber}</span>
                            {copiedUtr === tx._id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Receipt Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <div
                        className={`text-base font-bold font-mono ${
                          isCredit ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatMoney(tx.amount)}
                      </div>
                      {tx.originalCurrency && tx.originalAmount && (
                        <div className="text-[10px] text-amber-400 font-mono">
                          Forex: {tx.originalCurrency} {tx.originalAmount}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedTxForReceipt(tx)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 flex items-center gap-1 transition-colors cursor-pointer"
                      title="View Official Bank Receipt"
                    >
                      <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Transaction Receipt Modal */}
      {selectedTxForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setSelectedTxForReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-[1px] mx-auto mb-2">
                <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Bharat Trust Bank</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Official E-Receipt & Payment Advice
              </p>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                NPCI & RBI Verified Transaction
              </div>
            </div>

            {/* Amount Badge */}
            <div className="text-center py-5 border-b border-slate-800/60 bg-slate-950/40 rounded-xl my-4">
              <span className="text-xs text-slate-400 uppercase font-mono">Transaction Amount</span>
              <div
                className={`text-3xl font-extrabold font-mono mt-1 ${
                  selectedTxForReceipt.type === 'deposit' ||
                  selectedTxForReceipt.type === 'upi_received' ||
                  selectedTxForReceipt.type === 'loan_disbursement' ||
                  selectedTxForReceipt.type === 'insurance_claim_credit'
                    ? 'text-emerald-400'
                    : 'text-white'
                }`}
              >
                {formatMoney(selectedTxForReceipt.amount)}
              </div>
              <div className="text-xs text-emerald-400 flex items-center justify-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Status: Completed Successfully
              </div>
            </div>

            {/* Details Table */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Transaction Type</span>
                <span className="text-slate-200 font-medium capitalize">
                  {selectedTxForReceipt.type.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Date & Timestamp</span>
                <span className="text-slate-200 font-mono">
                  {new Date(selectedTxForReceipt.date).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">UTR / Ref Number</span>
                <span className="text-emerald-400 font-mono font-medium">
                  {selectedTxForReceipt.utrNumber || '428190010199'}
                </span>
              </div>

              {selectedTxForReceipt.upiId && (
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Recipient UPI ID</span>
                  <span className="text-slate-200 font-mono">{selectedTxForReceipt.upiId}</span>
                </div>
              )}

              {selectedTxForReceipt.loanNumber && (
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Loan Account</span>
                  <span className="text-indigo-400 font-mono">{selectedTxForReceipt.loanNumber}</span>
                </div>
              )}

              {selectedTxForReceipt.policyNumber && (
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Insurance Policy</span>
                  <span className="text-cyan-400 font-mono">{selectedTxForReceipt.policyNumber}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Remarks</span>
                <span className="text-slate-200 text-right max-w-[200px] truncate">
                  {selectedTxForReceipt.description}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Bank Convenience Fee</span>
                <span className="text-emerald-400 font-mono">₹0.00 (Zero Fee)</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                Print / Save Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Transaction Action Modal */}
      {showNewTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setShowNewTxModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              Execute Bank Transaction
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add deposit, withdraw funds, or transfer money with immediate ledger reflection.
            </p>

            <form onSubmit={handleCreateTransaction} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'deposit', label: 'Deposit' },
                  { id: 'withdrawal', label: 'Withdrawal' },
                  { id: 'upi_transfer', label: 'UPI Pay' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNewTxType(t.id)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      newTxType === t.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {newTxType === 'upi_transfer' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Recipient UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={newTxUpiId}
                    onChange={(e) => setNewTxUpiId(e.target.value)}
                    placeholder="e.g. merchant@okaxis or friend@upi"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Remark / Description (Optional)
                </label>
                <input
                  type="text"
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  placeholder="e.g. Monthly Savings, Grocery Store, Gift"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Processing Transaction...' : `Confirm & Process ${newTxType.replace('_', ' ')}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
