import React from 'react';
import { useTax } from '../context/TaxContext';
import { useAuth } from '../context/AuthContext';
import { FileText, DollarSign, Upload, Calendar, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const INCOME_TYPES = {
  US: [
    { value: 'wages', label: 'Wages (W-2)' },
    { value: 'self_employment', label: 'Self-Employment Income' },
    { value: 'interest', label: 'Interest (1099-INT)' },
    { value: 'dividends', label: 'Dividends (1099-DIV)' },
    { value: 'capital_gains', label: 'Capital Gains' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'pension', label: 'Pension/Retirement' },
    { value: 'other', label: 'Other Income' },
  ],
  CA: [
    { value: 'employment', label: 'Employment Income (T4)' },
    { value: 'self_employment', label: 'Self-Employment' },
    { value: 'interest', label: 'Interest (T5)' },
    { value: 'dividends', label: 'Dividends (T5)' },
    { value: 'capital_gains', label: 'Capital Gains' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'pension', label: 'CPP/QPP Benefits' },
    { value: 'other', label: 'Other Income' },
  ],
};

export default function Dashboard() {
  const { taxData, setStep, calculateTotals } = useTax();
  const { user } = useAuth();

  const totals = calculateTotals();
  
  const hasUSResidency = taxData.residency?.us?.calculatedStatus?.status === 'resident';
  const hasCAResidency = taxData.residency?.ca?.calculatedStatus?.status === 'resident';
  const hasIncome = (taxData.income.us?.length > 0) || (taxData.income.ca?.length > 0);

  const steps = [
    {
      id: 'residency',
      title: 'Residency Status',
      description: 'Determine your US and Canada tax status',
      icon: FileText,
      status: hasUSResidency || hasCAResidency ? 'complete' : 'pending',
      action: () => setStep('residency'),
    },
    {
      id: 'income',
      title: 'Income',
      description: 'Enter your income from both countries',
      icon: DollarSign,
      status: hasIncome ? 'complete' : (hasUSResidency || hasCAResidency) ? 'current' : 'locked',
      action: () => setStep('income'),
    },
    {
      id: 'deductions',
      title: 'Deductions',
      description: 'Claim deductions and credits',
      icon: CheckCircle,
      status: 'locked',
      action: () => {},
    },
    {
      id: 'review',
      title: 'Review & File',
      description: 'Review calculations and submit',
      icon: FileText,
      status: 'locked',
      action: () => {},
    },
  ];

  const deadlines = [
    { country: 'US', date: 'April 15, 2026', daysLeft: 54, icon: '🇺🇸' },
    { country: 'Canada', date: 'April 30, 2026', daysLeft: 69, icon: '🇨🇦' },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">
          <span className="logo-icon">🧾</span>
          <span className="logo-text">CrossTax Pro</span>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.firstName || 'Demo User'}</span>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h1>Your Tax Filing Dashboard</h1>
          <p>Complete each step to file your cross-border taxes with confidence.</p>
        </div>

        {/* Progress Steps */}
        <div className="steps-container">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLocked = step.status === 'locked';
            const isComplete = step.status === 'complete';
            const isCurrent = step.status === 'current';

            return (
              <div 
                key={step.id} 
                className={`step-card ${step.status} ${!isLocked ? 'clickable' : ''}`}
                onClick={step.action}
              >
                <div className="step-number">
                  {isComplete ? <CheckCircle size={20} /> : index + 1}
                </div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className="step-icon">
                  <Icon size={24} />
                </div>
                {!isLocked && <ArrowRight className="step-arrow" size={20} />}
                {isLocked && <AlertCircle className="step-lock" size={20} />}
              </div>
            );
          })}
        </div>

        {/* Tax Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card us">
            <div className="card-header">
              <span className="flag">🇺🇸</span>
              <h3>US Tax Return</h3>
            </div>
            <div className="card-body">
              <div className="stat">
                <span className="stat-label">Status</span>
                <span className={`stat-value ${hasUSResidency ? 'resident' : 'pending'}`}>
                  {hasUSResidency ? 'Resident' : 'Not Started'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Income</span>
                <span className="stat-value">${totals.usIncome.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Deductions</span>
                <span className="stat-value">${totals.usDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="summary-card ca">
            <div className="card-header">
              <span className="flag">🇨🇦</span>
              <h3>Canada Tax Return</h3>
            </div>
            <div className="card-body">
              <div className="stat">
                <span className="stat-label">Status</span>
                <span className={`stat-value ${hasCAResidency ? 'resident' : 'pending'}`}>
                  {hasCAResidency ? 'Resident' : 'Not Started'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Income</span>
                <span className="stat-value">${totals.caIncome.toLocaleString()} CAD</span>
              </div>
              <div className="stat">
                <span className="stat-label">Deductions</span>
                <span className="stat-value">${totals.caDeductions.toLocaleString()} CAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deadlines */}
        <div className="deadlines-section">
          <h2>📅 Filing Deadlines</h2>
          <div className="deadlines-grid">
            {deadlines.map((deadline) => (
              <div key={deadline.country} className="deadline-card">
                <span className="deadline-flag">{deadline.icon}</span>
                <div className="deadline-info">
                  <span className="deadline-country">{deadline.country}</span>
                  <span className="deadline-date">{deadline.date}</span>
                </div>
                <div className="deadline-countdown">
                  <span className="days-left">{deadline.daysLeft}</span>
                  <span className="days-label">days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="documents-section">
          <div className="section-header">
            <h2>📁 Documents</h2>
            <button className="upload-btn">
              <Upload size={16} /> Upload
            </button>
          </div>
          <div className="documents-list">
            <div className="document-item">
              <FileText size={20} />
              <span>No documents uploaded yet</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
