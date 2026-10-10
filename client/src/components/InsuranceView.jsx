import React, { useState } from 'react';
import {
  Umbrella,
  ShieldCheck,
  HeartPulse,
  Car,
  Home,
  Laptop,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileText,
  Plus,
  Sparkles,
  Printer,
  X,
  Clock,
  Check,
} from 'lucide-react';
import * as api from '../services/bankingService.js';
import { formatMoney } from '../constants.js';

export function InsuranceView({
  policies = [],
  claims = [],
  accountData = {},
  onRefreshData,
}) {
  const [activeTab, setActiveTab] = useState('policies');
  const [selectedPolicyForCert, setSelectedPolicyForCert] = useState(null);

  const [payingPolicyId, setPayingPolicyId] = useState(null);
  const [payFeedback, setPayFeedback] = useState(null);

  const [buyType, setBuyType] = useState('Health Insurance');
  const [sumInsured, setSumInsured] = useState(1000000);
  const [frequency, setFrequency] = useState('Monthly');
  const [nomineeName, setNomineeName] = useState('Priya Kumar');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [buyFeedback, setBuyFeedback] = useState(null);
  const [isBuying, setIsBuying] = useState(false);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimPolicyNum, setClaimPolicyNum] = useState(policies[0]?.policyNumber || '');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [claimHospital, setClaimHospital] = useState('');
  const [claimFeedback, setClaimFeedback] = useState(null);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const { balance = 0, accountHolder = 'Subham Kumar' } = accountData || {};

  const planCatalog = {
    'Health Insurance': {
      planName: 'Arogya Sanjeevani Total Health Shield',
      description: 'Comprehensive mediclaim with 100% cashless hospitalization, zero room rent capping, and modern daycare.',
      icon: HeartPulse,
      minSum: 500000,
      maxSum: 5000000,
      step: 250000,
      baseRatePerLakh: 145,
      taxBenefit: 'Section 80D (Up to ₹25,000 tax deduction)',
      features: [
        'Cashless in 14,000+ top hospitals pan-India',
        'Pre & post hospitalization expenses (60/90 days)',
        'Zero room rent capping & ICU limit restriction',
        'AYUSH & modern day-care procedures covered',
      ],
    },
    'Life Term Insurance': {
      planName: 'Bharat Jeevan Suraksha Pure Term Plan',
      description: 'Pure life protection providing guaranteed financial shield to your family in your absence.',
      icon: Umbrella,
      minSum: 5000000,
      maxSum: 20000000,
      step: 1000000,
      baseRatePerLakh: 9.8,
      taxBenefit: 'Section 80C (Up to ₹1.5 Lakh tax exemption)',
      features: [
        'Guaranteed lump-sum payout to nominee',
        'Immediate fast-track 24-hr claim settlement',
        'Accelerated critical terminal illness payout rider',
        'Waiver of premium on accidental total disability',
      ],
    },
    'Vehicle / Motor Insurance': {
      planName: 'DriveGuard Comprehensive Auto & Two-Wheeler',
      description: 'Zero-depreciation bumper-to-bumper vehicle insurance with 24x7 roadside towing assistance.',
      icon: Car,
      minSum: 300000,
      maxSum: 2500000,
      step: 100000,
      baseRatePerLakh: 180,
      taxBenefit: 'Commercial & Personal Motor Tariff Cover',
      features: [
        'Zero Depreciation add-on included',
        'Engine & Gearbox hydrostatic lock protection',
        '24x7 Emergency roadside assistance across national highways',
        'Cashless network with 8,500+ authorized brand garages',
      ],
    },
    'Home Protection': {
      planName: 'Bharat Griha Raksha Complete Shield',
      description: 'Protection for your home building and household assets against fire, flood, earthquake and burglary.',
      icon: Home,
      minSum: 1500000,
      maxSum: 15000000,
      step: 500000,
      baseRatePerLakh: 45,
      taxBenefit: 'Property Disaster & Content Protection',
      features: [
        'Full building reconstruction cost coverage',
        'Household appliances, jewelry & valuable items covered',
        'Alternative accommodation rent reimbursement',
        'Natural disaster (earthquake, flood, storm) protection',
      ],
    },
    'Cyber Fraud Shield': {
      planName: 'Digital Banking & UPI Cyber Suraksha',
      description: 'Guaranteed cover against unauthorized digital banking debits, phishing, SIM swapping, and identity theft.',
      icon: Laptop,
      minSum: 100000,
      maxSum: 1000000,
      step: 50000,
      baseRatePerLakh: 79.6,
      taxBenefit: 'Digital Financial Security Guarantee',
      features: [
        'Covers unauthorized UPI, NetBanking & ATM frauds',
        'Protection against phishing scams & SIM swap fraud',
        'Identity theft restoration & credit bureau clearing',
        'Legal litigation defense expenses up to ₹50,000',
      ],
    },
  };

  const activePlanConfig = planCatalog[buyType] || planCatalog['Health Insurance'];
  const calculatedMonthlyPremium = Math.round((sumInsured / 100000) * activePlanConfig.baseRatePerLakh);
  const calculatedPremium =
    frequency === 'Yearly'
      ? Math.round(calculatedMonthlyPremium * 12 * 0.9)
      : calculatedMonthlyPremium;

  const handlePayPremium = async (policy) => {
    if (balance < policy.premiumAmount) {
      setPayFeedback({
        message: `You don't have enough balance (₹${balance.toLocaleString('en-IN')}) to pay the premium of ₹${policy.premiumAmount.toLocaleString('en-IN')}.`,
        type: 'error',
      });
      return;
    }

    setPayingPolicyId(policy._id);
    setPayFeedback(null);

    try {
      await api.payInsurancePremium(policy._id);
      await onRefreshData();
      setPayFeedback({
        message: `Paid premium of ₹${policy.premiumAmount.toLocaleString('en-IN')} for ${policy.planName}. Next due date extended!`,
        type: 'success',
      });
      setTimeout(() => setPayFeedback(null), 4000);
    } catch (err) {
      setPayFeedback({ message: err.message || 'Could not pay premium', type: 'error' });
    } finally {
      setPayingPolicyId(null);
    }
  };

  const handleBuyPolicy = async (e) => {
    e.preventDefault();
    setBuyFeedback(null);

    if (balance < calculatedPremium) {
      setBuyFeedback({
        message: `You need ₹${calculatedPremium.toLocaleString('en-IN')} for the first premium, but your balance is ₹${balance.toLocaleString('en-IN')}.`,
        type: 'error',
      });
      return;
    }

    setIsBuying(true);
    try {
      await api.buyInsurancePolicy({
        type: buyType,
        planName: activePlanConfig.planName,
        sumInsured,
        premiumAmount: calculatedPremium,
        frequency,
        nominee: nomineeName.trim() || 'Subham Kumar',
        nomineeRelation: nomineeRelation.trim() || 'Self',
        taxBenefit: activePlanConfig.taxBenefit,
        coverageFeatures: activePlanConfig.features,
        debitFirstPremium: true,
      });

      await onRefreshData();
      setBuyFeedback({
        message: `Your ${activePlanConfig.planName} is now active! First premium debited from your account.`,
        type: 'success',
      });
      setActiveTab('policies');
      setTimeout(() => setBuyFeedback(null), 5000);
    } catch (err) {
      setBuyFeedback({ message: err.message || 'Could not buy policy', type: 'error' });
    } finally {
      setIsBuying(false);
    }
  };

  const handleFileClaim = async (e) => {
    e.preventDefault();
    setClaimFeedback(null);

    const val = parseFloat(claimAmount);
    if (isNaN(val) || val <= 0) {
      setClaimFeedback({ message: 'Please enter a valid claim amount', type: 'error' });
      return;
    }

    if (!claimReason.trim()) {
      setClaimFeedback({ message: 'Please write down why you are filing this claim', type: 'error' });
      return;
    }

    setIsSubmittingClaim(true);
    try {
      await api.fileInsuranceClaim({
        policyNumber: claimPolicyNum,
        claimAmount: val,
        reason: claimReason.trim(),
        hospitalOrParty: claimHospital.trim() || 'Network Healthcare Provider',
      });

      await onRefreshData();
      setClaimFeedback({
        message: 'Your claim has been submitted! Our team is reviewing it.',
        type: 'success',
      });
      setClaimAmount('');
      setClaimReason('');
      setClaimHospital('');
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimFeedback(null);
        setActiveTab('claims');
      }, 1500);
    } catch (err) {
      setClaimFeedback({ message: err.message || 'Could not file claim', type: 'error' });
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const totalCoverage = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const activeCount = policies.filter((p) => p.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Protection */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-800/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-cyan-300 uppercase tracking-wider">Total Sum Insured</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Umbrella className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {formatMoney(totalCoverage)}
          </div>
          <p className="mt-1 text-xs text-slate-400">Total Active Family & Asset Protection</p>
        </div>

        {/* Active Policies */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Policies</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              IRDAI Licensed
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {activeCount} Policies
          </div>
          <p className="mt-1 text-xs text-slate-500">Health, Life & Cyber Shield</p>
        </div>

        {/* Tax Deductions */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tax Saving Benefit</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-300">
            Section 80D & 80C
          </div>
          <p className="mt-1 text-xs text-slate-500">Eligible for up to ₹1,75,000 Deduction</p>
        </div>

        {/* Claims Assistance */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Claims Desk</span>
            <div className="mt-2 text-base font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Cashless Support
            </div>
          </div>
          <button
            onClick={() => setShowClaimModal(true)}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            File a Claim
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Umbrella className="w-3.5 h-3.5" />
          <span>My Active Policies ({policies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('buy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'buy'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Explore & Buy Insurance</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Claims Tracker ({claims.length})</span>
        </button>
      </div>

      {payFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in ${
            payFeedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {payFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{payFeedback.message}</span>
        </div>
      )}

      {/* TAB 1: ACTIVE POLICIES */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {policies.map((policy) => {
              const Icon = planCatalog[policy.type]?.icon || Umbrella;

              return (
                <div
                  key={policy._id}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {policy.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-bold text-white text-sm">{policy.planName}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {policy.policyNumber}
                      </p>
                    </div>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        Sum Insured / Coverage
                      </span>
                      <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
                        {formatMoney(policy.sumInsured)}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Premium:</span>
                        <span className="text-white font-mono font-medium">
                          {formatMoney(policy.premiumAmount)} / {policy.frequency}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Next Premium Due:</span>
                        <span className="text-amber-400 font-mono">
                          {new Date(policy.nextPremiumDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Nominee:</span>
                        <span className="text-slate-200">
                          {policy.nominee} ({policy.nomineeRelation})
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {policy.taxBenefit}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                      {policy.coverageFeatures.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => handlePayPremium(policy)}
                      disabled={payingPolicyId === policy._id}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{payingPolicyId === policy._id ? 'Processing...' : 'Pay Premium'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedPolicyForCert(policy)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                      title="View Policy Certificate"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EXPLORE & BUY INSURANCE */}
      {activeTab === 'buy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Select Protection Category
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize your coverage, calculate instant IRDAI-compliant premium, and activate policy instantly.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(planCatalog).map((type) => {
                const item = planCatalog[type];
                const Icon = item.icon;
                const isSelected = buyType === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setBuyType(type);
                      setSumInsured(item.minSum);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div className="text-xs font-bold leading-tight">{type}</div>
                  </button>
                );
              })}
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{activePlanConfig.planName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Instant Digital Issuance
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{activePlanConfig.description}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Desired Sum Insured (Coverage Amount)
                  </label>
                  <span className="text-lg font-bold font-mono text-cyan-400">
                    {formatMoney(sumInsured)}
                  </span>
                </div>

                <input
                  type="range"
                  min={activePlanConfig.minSum}
                  max={activePlanConfig.maxSum}
                  step={activePlanConfig.step}
                  value={sumInsured}
                  onChange={(e) => setSumInsured(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>Min: {formatMoney(activePlanConfig.minSum)}</span>
                  <span>Max: {formatMoney(activePlanConfig.maxSum)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Payment Frequency
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFrequency('Monthly')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      frequency === 'Monthly'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Monthly (₹{calculatedMonthlyPremium.toLocaleString('en-IN')}/mo)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFrequency('Yearly')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      frequency === 'Yearly'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Annual (10% Discount)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Guaranteed Plan Inclusions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activePlanConfig.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-xl">
            <form onSubmit={handleBuyPolicy} className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Nominee & Activation
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nominee Full Name
                </label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  placeholder="e.g. Priya Kumar"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nominee Relationship
                </label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Self">Self</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Premium</span>
                  <span className="font-mono text-white">{formatMoney(calculatedPremium)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18% Exemption for Term/Health)</span>
                  <span className="font-mono text-emerald-400">₹0.00 (Zero GST)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Issuance Mode</span>
                  <span className="text-cyan-400">Paperless E-Policy</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-white">First Premium Payable</span>
                  <span className="font-mono text-cyan-400">{formatMoney(calculatedPremium)}</span>
                </div>
              </div>

              {buyFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    buyFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {buyFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{buyFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isBuying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isBuying ? 'Issuing E-Policy...' : `Instant Buy & Activate (${formatMoney(calculatedPremium)})`}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              Backed by Bharat General Assurance · Claim settlement ratio 98.9%
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLAIMS TRACKER */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Submitted Claims & Cashless History</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Track your real-time claim settlement status with our 24x7 Claims Concierge.
              </p>
            </div>

            <button
              onClick={() => setShowClaimModal(true)}
              className="py-2 px-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              File a New Claim
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
            {claims.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs">
                No active claims filed yet.
              </div>
            ) : (
              claims.map((claim) => (
                <div
                  key={claim._id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{claim.reason}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            claim.status === 'Settled' || claim.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-mono">
                        <span>Claim No: {claim.claimNumber}</span>
                        <span>Policy: {claim.policyNumber}</span>
                        <span>Facility: {claim.hospitalOrParty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-base font-bold font-mono text-white">
                      {formatMoney(claim.claimAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Filed on {new Date(claim.filedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Policy Certificate Modal */}
      {selectedPolicyForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setSelectedPolicyForCert(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto mb-2 flex items-center justify-center">
                <Umbrella className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-base font-bold text-white">Bharat Trust Bank & Assurance</h2>
              <p className="text-xs text-slate-400 font-mono">Certificate of Insurance & 80D / 80C Tax Schedule</p>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                IRDAI Regulatory Compliant
              </div>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Policy Number</span>
                <span className="text-white font-mono font-bold">{selectedPolicyForCert.policyNumber}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Plan Name</span>
                <span className="text-slate-200 font-medium">{selectedPolicyForCert.planName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Policyholder</span>
                <span className="text-slate-200">{accountHolder}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Nominee</span>
                <span className="text-slate-200">
                  {selectedPolicyForCert.nominee} ({selectedPolicyForCert.nomineeRelation})
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Sum Insured (Guaranteed)</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {formatMoney(selectedPolicyForCert.sumInsured)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Premium Amount</span>
                <span className="text-white font-mono">
                  {formatMoney(selectedPolicyForCert.premiumAmount)} ({selectedPolicyForCert.frequency})
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Tax Exemption Section</span>
                <span className="text-amber-400 font-medium">{selectedPolicyForCert.taxBenefit}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-semibold">{selectedPolicyForCert.status}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              Print / Save Certificate PDF
            </button>
          </div>
        </div>
      )}

      {/* File Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              File Insurance Claim
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Submit your cashless or reimbursement claim directly to the 24x7 Claims TPA Desk.
            </p>

            <form onSubmit={handleFileClaim} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Policy
                </label>
                <select
                  value={claimPolicyNum}
                  onChange={(e) => setClaimPolicyNum(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  {policies.map((p) => (
                    <option key={p._id} value={p.policyNumber}>
                      {p.planName} ({p.policyNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Claim Amount (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full pl-8 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hospital / Garage / Entity Name
                </label>
                <input
                  type="text"
                  value={claimHospital}
                  onChange={(e) => setClaimHospital(e.target.value)}
                  placeholder="e.g. Manipal Hospital, Whitefield"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Incident Reason & Diagnosis
                </label>
                <textarea
                  rows={2}
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder="e.g. Emergency hospitalization, dengue fever treatment"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {claimFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    claimFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {claimFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{claimFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingClaim}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingClaim ? 'Filing Claim...' : 'Submit Claim'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
