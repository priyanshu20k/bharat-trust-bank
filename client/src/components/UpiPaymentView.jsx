import React, { useState } from 'react';
import {
  QrCode,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowDownLeft,
} from 'lucide-react';

const POPULAR_APPS = [
  { name: 'Google Pay', color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/30' },
  { name: 'PhonePe', color: 'text-purple-400 bg-purple-500/10', border: 'border-purple-500/30' },
  { name: 'Paytm', color: 'text-sky-400 bg-sky-500/10', border: 'border-sky-500/30' },
  { name: 'CRED', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/30' },
  { name: 'BHIM', color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/30' },
];

export function UpiPaymentView({
  balance = 0,
  myUpiId = '',
  onSendUpi,
  onReceiveUpi,
}) {
  const [activeTab, setActiveTab] = useState('send');

  const [payeeUpi, setPayeeUpi] = useState('rahul.verma@okhdfcbank');
  const [amount, setAmount] = useState('450');
  const [note, setNote] = useState('Dinner split & coffee');
  const [selectedApp, setSelectedApp] = useState('Google Pay');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [qrAmount, setQrAmount] = useState('500');
  const [qrNote, setQrNote] = useState('Payment request');
  const [copiedLink, setCopiedLink] = useState(false);
  const [simulatingReceive, setSimulatingReceive] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setFeedback({ msg: 'Please enter an amount greater than ₹0', type: 'error' });
      return;
    }
    if (val > balance) {
      setFeedback({
        msg: `You only have ₹${balance.toLocaleString('en-IN')}, so you cannot send ₹${val.toLocaleString('en-IN')}.`,
        type: 'error',
      });
      return;
    }
    if (!payeeUpi.includes('@')) {
      setFeedback({ msg: 'Please enter a valid UPI address like name@okhdfcbank', type: 'error' });
      return;
    }

    setSending(true);
    setFeedback(null);
    try {
      await onSendUpi({
        type: 'upi_transfer',
        amount: val,
        description: note.trim() || `UPI payment to ${payeeUpi}`,
        upiId: payeeUpi.trim(),
        upiApp: selectedApp,
      });
      setFeedback({
        msg: `Sent ₹${val.toFixed(2)} to ${payeeUpi} using ${selectedApp}!`,
        type: 'success',
      });
      setAmount('');
    } catch (err) {
      setFeedback({ msg: err.message || 'Payment failed', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleSimulateIncoming = async () => {
    const val = parseFloat(qrAmount) || 500;
    setSimulatingReceive(true);
    setFeedback(null);
    try {
      await onReceiveUpi({
        type: 'upi_received',
        amount: val,
        description: qrNote || 'UPI QR Payment Received',
        upiId: 'client.payment@paytm',
        upiApp: 'PhonePe',
      });
      setFeedback({
        msg: `Received ₹${val.toFixed(2)} via UPI QR payment! Credited to your account.`,
        type: 'success',
      });
    } catch (err) {
      setFeedback({ msg: err.message || 'Simulation failed', type: 'error' });
    } finally {
      setSimulatingReceive(false);
    }
  };

  const upiDeepLink = `upi://pay?pa=${myUpiId}&pn=Subham%20Kumar&am=${qrAmount || '0'}&cu=INR&tn=${encodeURIComponent(qrNote || 'BharatBank')}`;

  const copyUpiLink = () => {
    navigator.clipboard.writeText(upiDeepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Zap className="w-3.5 h-3.5" />
          <span>National Payments Corporation of India (NPCI) · Unified Payments Interface</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          UPI Instant Payments & QR Center
        </h2>
        <p className="text-xs text-slate-400">
          Transfer money 24x7 instantly to any VPA, phone number, or scan QR code with zero transaction fees.
        </p>

        {/* Switcher */}
        <div className="flex justify-center pt-3">
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs w-full max-w-sm">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-2 px-4 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'send'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via UPI</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`py-2 px-4 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'qr'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Receive / QR Code</span>
            </button>
          </div>
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
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* SEND UPI TAB */}
      {activeTab === 'send' && (
        <form onSubmit={handleSend} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Pay Anyone via UPI ID
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Balance: <strong className="text-emerald-400">₹{balance.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Payee Virtual Payment Address (VPA / UPI ID)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. merchant@okaxis, friend@paytm"
              value={payeeUpi}
              onChange={(e) => setPayeeUpi(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <div className="flex flex-wrap gap-1.5 mt-2">
              {['@okhdfcbank', '@okaxis', '@paytm', '@ybl', '@upi'].map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => {
                    const prefix = payeeUpi.split('@')[0] || 'merchant';
                    setPayeeUpi(`${prefix}${handle}`);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-emerald-400 cursor-pointer"
                >
                  {handle}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Amount to Transfer (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base font-semibold">
                ₹
              </span>
              <input
                type="number"
                step="1"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 font-mono text-base font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[100, 250, 500, 1000, 2500].map((pts) => (
              <button
                key={pts}
                type="button"
                onClick={() => setAmount(pts.toString())}
                className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 cursor-pointer"
              >
                ₹{pts}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Select Payment App Route
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {POPULAR_APPS.map((app) => (
                <button
                  key={app.name}
                  type="button"
                  onClick={() => setSelectedApp(app.name)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                    selectedApp === app.name
                      ? `${app.color} ${app.border} shadow-sm ring-1 ring-emerald-500/50`
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {app.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Add a Note / Purpose
            </label>
            <input
              type="text"
              placeholder="e.g. Split grocery bill, Chai, Dinner"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Authenticating UPI PIN...' : `Pay ₹${amount || '0'} via ${selectedApp}`}</span>
          </button>
        </form>
      )}

      {/* RECEIVE / QR TAB */}
      {activeTab === 'qr' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-5 bg-white rounded-3xl shadow-2xl flex flex-col items-center relative group">
              <div className="w-48 h-48 bg-slate-950 p-2 rounded-2xl flex items-center justify-center relative">
                <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="5" y="5" width="26" height="26" fill="black" />
                  <rect x="8" y="8" width="20" height="20" fill="white" />
                  <rect x="12" y="12" width="12" height="12" fill="#059669" />

                  <rect x="69" y="5" width="26" height="26" fill="black" />
                  <rect x="72" y="8" width="20" height="20" fill="white" />
                  <rect x="76" y="12" width="12" height="12" fill="#059669" />

                  <rect x="5" y="69" width="26" height="26" fill="black" />
                  <rect x="8" y="72" width="20" height="20" fill="white" />
                  <rect x="12" y="76" width="12" height="12" fill="#059669" />

                  <rect x="36" y="8" width="8" height="8" fill="white" />
                  <rect x="48" y="8" width="8" height="8" fill="white" />
                  <rect x="36" y="20" width="12" height="8" fill="white" />
                  <rect x="8" y="36" width="12" height="8" fill="white" />
                  <rect x="24" y="36" width="8" height="16" fill="white" />
                  <rect x="36" y="36" width="28" height="28" fill="#10b981" />
                  <rect x="68" y="36" width="16" height="8" fill="white" />
                  <rect x="8" y="56" width="16" height="8" fill="white" />
                  <rect x="68" y="56" width="24" height="8" fill="white" />
                  <rect x="36" y="68" width="16" height="16" fill="white" />
                  <rect x="56" y="68" width="16" height="8" fill="white" />
                  <rect x="76" y="76" width="16" height="16" fill="white" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center font-bold text-[10px] text-white">
                    BHARAT
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-[11px] font-bold text-slate-900 font-mono block">
                  Scan to Pay: {myUpiId}
                </span>
                <span className="text-[10px] text-slate-500">
                  Accepted via GPay, PhonePe, Paytm, BHIM, CRED
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Your UPI ID:</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                {myUpiId}
              </span>
              <button
                onClick={copyUpiLink}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Copy UPI Payment Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200">
              Create Amount-Specific Payment Request
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Request Amount (₹)</label>
                <input
                  type="number"
                  value={qrAmount}
                  onChange={(e) => setQrAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Purpose / Note</label>
                <input
                  type="text"
                  value={qrNote}
                  onChange={(e) => setQrNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleSimulateIncoming}
              disabled={simulatingReceive}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>
                {simulatingReceive
                  ? 'Simulating Payment...'
                  : `Simulate Payer Scanning & Paying ₹${qrAmount || '500'}`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
