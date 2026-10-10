import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  Globe2,
  CheckCircle2,
  ArrowDownLeft,
} from 'lucide-react';
import { fetchFXRates } from '../services/bankingService.js';

export function CurrencyConverterView({ onDepositForeignFunds }) {
  const [rates, setRates] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('100');
  const [convertedResult, setConvertedResult] = useState(8392);
  const [activeRate, setActiveRate] = useState(83.92);

  const [crediting, setCrediting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchFXRates().then((data) => {
      setRates(data);
      recalculate('100', fromCurrency, toCurrency, data);
    });
  }, []);

  const recalculate = (amtStr, from, to, rateList = rates) => {
    const num = parseFloat(amtStr);
    if (isNaN(num) || num < 0) {
      setConvertedResult(null);
      return;
    }

    const fromR = rateList.find((r) => r.code === from);
    const toR = rateList.find((r) => r.code === to);

    if (fromR && toR) {
      const inInr = num * fromR.rateToInr;
      const finalVal = inInr / toR.rateToInr;
      const currentFx = fromR.rateToInr / toR.rateToInr;
      setConvertedResult(Math.round(finalVal * 100) / 100);
      setActiveRate(Math.round(currentFx * 10000) / 10000);
    }
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    recalculate(val, fromCurrency, toCurrency);
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    recalculate(amount, toCurrency, temp);
  };

  const handleCreditToBank = async () => {
    const num = parseFloat(amount);
    if (!convertedResult || isNaN(num) || num <= 0) return;

    setCrediting(true);
    setFeedback(null);
    try {
      const inrCreditAmount = fromCurrency === 'INR' ? num : convertedResult;
      const description = `Foreign Inward Remittance (${fromCurrency} ${num.toFixed(2)} @ ₹${activeRate}/${fromCurrency})`;

      await onDepositForeignFunds({
        type: 'deposit',
        amount: inrCreditAmount,
        description,
        originalCurrency: fromCurrency,
        originalAmount: num,
        fxRate: activeRate,
      });

      setFeedback(`Added ₹${inrCreditAmount.toLocaleString('en-IN')} to your bank balance!`);
    } catch (err) {
      setFeedback(`Could not add funds: ${err.message}`);
    } finally {
      setCrediting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Globe2 className="w-3.5 h-3.5" />
          <span>Real-Time Foreign Exchange (Forex) & Wire Remittance</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Live Currency Converter & Inward Remittance
        </h2>
        <p className="text-xs text-slate-400">
          Convert global currencies to Indian Rupees (INR) at interbank rates and deposit directly into your bank balance.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* Main Converter Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
          {/* FROM */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 block">From Currency</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-base font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <select
                aria-label="From Currency"
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  recalculate(amount, e.target.value, toCurrency);
                }}
                className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-xs font-mono font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                {rates.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.code} ({r.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              onClick={handleSwap}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer border border-slate-700"
              title="Swap Currencies"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* TO */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 block">To Currency</label>
            <div className="flex gap-2">
              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-base font-bold text-emerald-400 flex items-center">
                {convertedResult !== null ? convertedResult.toLocaleString('en-IN') : '0.00'}
              </div>
              <select
                aria-label="To Currency"
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  recalculate(amount, fromCurrency, e.target.value);
                }}
                className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-xs font-mono font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                {rates.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.code} ({r.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exchange Rate Badge */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-slate-300">
              1 {fromCurrency} = <strong className="text-emerald-400">{activeRate} {toCurrency}</strong>
            </span>
          </div>

          <span className="text-[10px] text-slate-500 font-mono">
            Interbank Mid-Market Rate · No Hidden Markup
          </span>
        </div>

        {/* Deposit into Bank Action */}
        <button
          onClick={handleCreditToBank}
          disabled={crediting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>
            {crediting
              ? 'Converting and crediting...'
              : `Deposit ${fromCurrency} ${amount} (Credit ₹${convertedResult?.toLocaleString('en-IN')} to Account)`}
          </span>
        </button>
      </div>

      {/* Live Exchange Rate Board */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Current Exchange Rates vs Indian Rupee (INR)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rates.filter((r) => r.code !== 'INR').map((r) => (
            <div
              key={r.code}
              onClick={() => {
                setFromCurrency(r.code);
                setToCurrency('INR');
                recalculate(amount, r.code, 'INR');
              }}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-200">{r.code}</span>
                <span className="text-xs text-slate-400">{r.symbol}</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{r.name}</p>
              <div className="mt-2 text-sm font-bold font-mono text-emerald-400">
                ₹{r.rateToInr.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
