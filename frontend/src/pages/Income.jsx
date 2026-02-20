import React, { useState, useEffect } from 'react';
import { useTax } from '../context/TaxContext';
import { ArrowRight, ArrowLeft, Plus, Trash2, DollarSign, Calculator } from 'lucide-react';
import { TaxEngine } from '../services/taxEngine';
import './Income.css';

const INCOME_TYPES = {
  US: [
    { value: 'wages', label: 'Wages (W-2)' },
    { value: 'self_employment', label: 'Self-Employment' },
    { value: 'interest', label: 'Interest (1099-INT)' },
    { value: 'dividends', label: 'Dividends (1099-DIV)' },
    { value: 'capital_gains', label: 'Capital Gains' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'pension', label: 'Pension/Retirement' },
    { value: 'other', label: 'Other Income' },
  ],
  CA: [
    { value: 'employment', label: 'Employment (T4)' },
    { value: 'self_employment', label: 'Self-Employment' },
    { value: 'interest', label: 'Interest (T5)' },
    { value: 'dividends', label: 'Dividends (T5)' },
    { value: 'capital_gains', label: 'Capital Gains' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'pension', label: 'CPP/QPP Benefits' },
    { value: 'other', label: 'Other Income' },
  ],
};

export default function Income() {
  const { taxData, addIncome, removeIncome, setStep, updateTaxData } = useTax();
  const [activeTab, setActiveTab] = useState('us');
  
  const [newIncome, setNewIncome] = useState({
    type: '',
    source: '',
    amount: '',
    currency: 'USD',
  });

  const [taxEstimate, setTaxEstimate] = useState({ us: null, ca: null });

  // Calculate taxes whenever income changes
  useEffect(() => {
    const usTotal = usIncome.reduce((sum, i) => sum + i.amount, 0);
    const caTotal = caIncome.reduce((sum, i) => sum + i.amount, 0);
    
    if (usTotal > 0) {
      const usTax = TaxEngine.calculateUSTax(usTotal);
      setTaxEstimate(prev => ({ ...prev, us: usTax }));
    } else {
      setTaxEstimate(prev => ({ ...prev, us: null }));
    }
    
    if (caTotal > 0) {
      const caTax = TaxEngine.calculateCanadaTax(caTotal);
      setTaxEstimate(prev => ({ ...prev, ca: caTax }));
    } else {
      setTaxEstimate(prev => ({ ...prev, ca: null }));
    }
  }, [taxData.income]);

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!newIncome.type || !newIncome.amount) return;

    addIncome(activeTab, {
      type: newIncome.type,
      source: newIncome.source || 'Self-reported',
      amount: parseFloat(newIncome.amount),
      currency: activeTab === 'us' ? 'USD' : 'CAD',
    });

    setNewIncome({ type: '', source: '', amount: '', currency: activeTab === 'us' ? 'USD' : 'CAD' });
  };

  const handleRemoveIncome = (incomeId) => {
    removeIncome(activeTab, incomeId);
  };

  const usIncome = taxData.income.us || [];
  const caIncome = taxData.income.ca || [];
  
  const totalUS = usIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalCA = caIncome.reduce((sum, i) => sum + i.amount, 0);

  // Calculate combined in USD
  const cadToUsd = 1.36;
  const totalCombinedUSD = totalUS + (totalCA * cadToUsd);

  const incomeTypes = activeTab === 'us' ? INCOME_TYPES.US : INCOME_TYPES.CA;

  return (
    <div className="income-page">
      <div className="page-header">
        <h1>Income</h1>
        <p>Enter all income earned in the US and Canada</p>
      </div>

      {/* Tabs */}
      <div className="income-tabs">
        <button 
          className={`tab ${activeTab === 'us' ? 'active' : ''}`}
          onClick={() => setActiveTab('us')}
        >
          <span className="tab-flag">🇺🇸</span>
          US Income
          <span className="tab-total">${totalUS.toLocaleString()}</span>
        </button>
        <button 
          className={`tab ${activeTab === 'ca' ? 'active' : ''}`}
          onClick={() => setActiveTab('ca')}
        >
          <span className="tab-flag">🇨🇦</span>
          Canadian Income
          <span className="tab-total">${totalCA.toLocaleString()} CAD</span>
        </button>
      </div>

      {/* Income List */}
      <div className="income-content">
        <div className="income-list">
          <h3>
            {activeTab === 'us' ? '🇺🇸' : '🇨🇦'} 
            {activeTab === 'us' ? ' US' : ' Canadian'} Income Entries
          </h3>
          
          {(activeTab === 'us' ? usIncome : caIncome).length === 0 ? (
            <div className="empty-state">
              <DollarSign size={40} />
              <p>No income added yet</p>
              <span>Use the form below to add your income</span>
            </div>
          ) : (
            <div className="income-items">
              {(activeTab === 'us' ? usIncome : caIncome).map((item) => (
                <div key={item.id} className="income-item">
                  <div className="income-info">
                    <span className="income-type">
                      {incomeTypes.find(t => t.value === item.type)?.label || item.type}
                    </span>
                    <span className="income-source">{item.source}</span>
                  </div>
                  <div className="income-amount">
                    <span>{item.currency === 'USD' ? '$' : 'C$'}{item.amount.toLocaleString()}</span>
                    <button 
                      className="delete-btn"
                      onClick={() => handleRemoveIncome(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {(activeTab === 'us' ? usIncome : caIncome).length > 0 && (
            <div className="income-total">
              <span>Total {activeTab === 'us' ? 'US' : 'Canadian'} Income</span>
              <span className="total-amount">
                {activeTab === 'us' ? '$' : 'C$'}{(activeTab === 'us' ? totalUS : totalCA).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Add Income Form */}
        <div className="add-income-form">
          <h3>Add Income</h3>
          <form onSubmit={handleAddIncome}>
            <div className="form-group">
              <label>Income Type</label>
              <select 
                value={newIncome.type}
                onChange={(e) => setNewIncome({...newIncome, type: e.target.value})}
                required
              >
                <option value="">Select type...</option>
                {incomeTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Source / Employer</label>
              <input 
                type="text"
                value={newIncome.source}
                onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                placeholder="e.g., Acme Corp"
              />
            </div>

            <div className="form-group">
              <label>Amount ({activeTab === 'us' ? 'USD' : 'CAD'})</label>
              <input 
                type="number"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <button type="submit" className="add-btn">
              <Plus size={16} /> Add Income
            </button>
          </form>
        </div>
      </div>

      {/* Live Tax Calculator */}
      {(taxEstimate.us || taxEstimate.ca) && (
        <div className="income-summary">
          <h3><Calculator size={18} /> Live Tax Estimate</h3>
          <div className="summary-grid">
            {taxEstimate.us && (
              <div className="summary-item">
                <span className="summary-label">🇺🇸 US Tax</span>
                <span className="summary-value">${taxEstimate.us.tax.toLocaleString()}</span>
                <span className="summary-rate">{taxEstimate.us.effectiveRate}% effective</span>
              </div>
            )}
            {taxEstimate.ca && (
              <div className="summary-item">
                <span className="summary-label">🇨🇦 Canada Tax</span>
                <span className="summary-value">${taxEstimate.ca.totalTax.toLocaleString()} CAD</span>
                <span className="summary-rate">{taxEstimate.ca.effectiveRate}% effective</span>
              </div>
            )}
            <div className="summary-item total">
              <span className="summary-label">Combined (USD)</span>
              <span className="summary-value">
                ${((taxEstimate.us?.tax || 0) + (taxEstimate.ca?.totalTax || 0) * cadToUsd).toLocaleString()}
              </span>
              <span className="summary-rate">estimated total</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="income-summary">
        <h3>📊 Income Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">🇺🇸 US Income</span>
            <span className="summary-value">${totalUS.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🇨🇦 Canadian Income</span>
            <span className="summary-value">${totalCA.toLocaleString()} CAD</span>
          </div>
          <div className="summary-item total">
            <span className="summary-label">Combined (USD)</span>
            <span className="summary-value">${totalCombinedUSD.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={() => setStep('residency')}>
          <ArrowLeft size={16} /> Back
        </button>
        <button type="button" className="btn-primary" onClick={() => setStep('deductions')}>
          Next: Deductions <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
