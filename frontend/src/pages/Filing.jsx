import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { ArrowLeft, Send, CheckCircle, FileCheck, Shield } from 'lucide-react';
import './Filing.css';

export default function Filing() {
  const { taxData, setStep } = useTax();
  const [filing, setFiling] = useState({
    us: { status: 'ready', efileId: null },
    ca: { status: 'ready', efileId: null }
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const usResidency = taxData.residency?.us?.calculatedStatus?.status === 'resident';
  const caResidency = taxData.residency?.ca?.calculatedStatus?.status === 'resident';
  
  const usIncome = taxData.income.us?.reduce((sum, i) => sum + i.amount, 0) || 0;
  const caIncome = taxData.income.ca?.reduce((sum, i) => sum + i.amount, 0) || 0;

  const handleSubmit = () => {
    setSubmitting(true);
    // Simulate filing submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="filing-page">
        <div className="success-screen">
          <CheckCircle size={64} />
          <h1>🎉 Filing Submitted!</h1>
          <p>Your tax returns have been successfully filed.</p>
          
          <div className="confirmation-cards">
            {usResidency && (
              <div className="confirmation-card">
                <span className="flag">🇺🇸</span>
                <div>
                  <strong>US Return</strong>
                  <span>Confirmation #: US-{Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            )}
            {caResidency && (
              <div className="confirmation-card">
                <span className="flag">🇨🇦</span>
                <div>
                  <strong>Canada Return</strong>
                  <span>Confirmation #: CA-{Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="next-steps">
            <h3>What happens next?</h3>
            <ul>
              <li>📧 You'll receive email confirmations within 24 hours</li>
              <li>📅 US refund (if due) typically processes in 21 days</li>
              <li>📅 Canada refund (if due) typically processes in 2 weeks</li>
              <li>📬 CRA/IRS may contact you for additional information</li>
            </ul>
          </div>

          <button className="btn-primary" onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="filing-page">
      <div className="page-header">
        <h1>📝 File Your Returns</h1>
        <p>Review and submit your tax returns</p>
      </div>

      {/* Summary */}
      <div className="filing-summary">
        <h2>📋 Filing Summary</h2>
        
        {usResidency && (
          <div className="filing-item us">
            <div className="filing-header">
              <span className="flag">🇺🇸</span>
              <h3>United States</h3>
            </div>
            <div className="filing-details">
              <div className="detail-row">
                <span>Status</span>
                <span className="status ready">Ready to file</span>
              </div>
              <div className="detail-row">
                <span>Income Reported</span>
                <span>${usIncome.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span>Forms</span>
                <span>Form 1040</span>
              </div>
            </div>
          </div>
        )}

        {caResidency && (
          <div className="filing-item ca">
            <div className="filing-header">
              <span className="flag">🇨🇦</span>
              <h3>Canada</h3>
            </div>
            <div className="filing-details">
              <div className="detail-row">
                <span>Status</span>
                <span className="status ready">Ready to file</span>
              </div>
              <div className="detail-row">
                <span>Income Reported</span>
                <span>${caIncome.toLocaleString()} CAD</span>
              </div>
              <div className="detail-row">
                <span>Forms</span>
                <span>T1 General</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consent */}
      <div className="consent-section">
        <label className="consent-checkbox">
          <input type="checkbox" defaultChecked />
          <span>I confirm that the information provided is accurate and complete to the best of my knowledge.</span>
        </label>
        <label className="consent-checkbox">
          <input type="checkbox" defaultChecked />
          <span>I authorize CrossTax Pro to electronically file my tax returns.</span>
        </label>
      </div>

      {/* Security */}
      <div className="security-banner">
        <Shield size={24} />
        <div>
          <strong>Secure Filing</strong>
          <p>Your data is encrypted and transmitted securely to IRS and CRA.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button className="btn-secondary" onClick={() => setStep('documents')}>
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          className="btn-primary filing-btn" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>Submitting...</>
          ) : (
            <>File Now <Send size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}
