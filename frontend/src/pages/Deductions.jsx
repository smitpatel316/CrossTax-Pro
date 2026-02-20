import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { ArrowRight, ArrowLeft, Plus, Trash2, Shield } from 'lucide-react';
import './Deductions.css';

const DEDUCTION_TYPES = {
  US: [
    { value: 'standard', label: 'Standard Deduction', amount: 14600 },
    { value: 'mortgage', label: 'Mortgage Interest', amount: 0 },
    { value: 'state_local', label: 'State & Local Taxes (SALT)', amount: 0, max: 10000 },
    { value: 'charity', label: 'Charitable Contributions', amount: 0 },
    { value: 'medical', label: 'Medical Expenses', amount: 0 },
    { value: 'home_office', label: 'Home Office', amount: 0 },
    { value: 'student_loan', label: 'Student Loan Interest', amount: 0, max: 2500 },
    { value: '401k', label: '401(k) Contribution', amount: 0, max: 23000 },
    { value: 'ira', label: 'Traditional IRA', amount: 0, max: 7000 },
  ],
  CA: [
    { value: 'rrsp', label: 'RRSP Contribution', amount: 0, max: 30780 },
    { value: 'tfsa', label: 'TFSA Contribution', amount: 0, max: 7000 },
    { value: 'childcare', label: 'Child Care Expenses', amount: 0 },
    { value: 'medical', label: 'Medical Expenses', amount: 0 },
    { value: 'charity', label: 'Charitable Donations', amount: 0, max: 300 },
    { value: 'home_office', label: 'Home Office Expenses', amount: 0 },
    { value: 'moving', label: 'Moving Expenses', amount: 0 },
    { value: 'tuition', label: 'Tuition Credits', amount: 0 },
  ],
};

export default function Deductions() {
  const { taxData, addDeduction, removeDeduction, setStep } = useTax();
  const [activeTab, setActiveTab] = useState('us');
  
  const [newDeduction, setNewDeduction] = useState({
    type: '',
    amount: '',
    description: '',
  });

  const handleAddDeduction = (e) => {
    e.preventDefault();
    if (!newDeduction.type || !newDeduction.amount) return;

    const deductionType = DEDUCTION_TYPES[activeTab.toUpperCase()].find(t => t.value === newDeduction.type);
    
    addDeduction(activeTab, {
      type: newDeduction.type,
      label: deductionType?.label || newDeduction.type,
      amount: parseFloat(newDeduction.amount),
      description: newDeduction.description,
    });

    setNewDeduction({ type: '', amount: '', description: '' });
  };

  const handleRemoveDeduction = (deductionId) => {
    removeDeduction(activeTab, deductionId);
  };

  const usDeductions = taxData.deductions.us || [];
  const caDeductions = taxData.deductions.ca || [];
  
  const totalUSDeductions = usDeductions.reduce((sum, d) => sum + d.amount, 0);
  const totalCADeductions = caDeductions.reduce((sum, d) => sum + d.amount, 0);

  const deductionTypes = activeTab === 'us' ? DEDUCTION_TYPES.US : DEDUCTION_TYPES.CA;

  // Calculate taxable income after deductions
  const usIncome = taxData.income.us?.reduce((sum, i) => sum + i.amount, 0) || 0;
  const caIncome = taxData.income.ca?.reduce((sum, i) => sum + i.amount, 0) || 0;
  
  const usTaxableIncome = Math.max(0, usIncome - totalUSDeductions);
  const caTaxableIncome = Math.max(0, caIncome - totalCADeductions);

  return (
    <div className="deductions-page">
      <div className="page-header">
        <h1>🏦 Deductions & Credits</h1>
        <p>Reduce your taxable income with deductions</p>
      </div>

      {/* Tabs */}
      <div className="income-tabs">
        <button 
          className={`tab ${activeTab === 'us' ? 'active' : ''}`}
          onClick={() => setActiveTab('us')}
        >
          <span className="tab-flag">🇺🇸</span>
          US Deductions
          <span className="tab-total">-${totalUSDeductions.toLocaleString()}</span>
        </button>
        <button 
          className={`tab ${activeTab === 'ca' ? 'active' : ''}`}
          onClick={() => setActiveTab('ca')}
        >
          <span className="tab-flag">🇨🇦</span>
          Canadian Deductions
          <span className="tab-total">-${totalCADeductions.toLocaleString()} CAD</span>
        </button>
      </div>

      {/* Deductions List */}
      <div className="income-content">
        <div className="income-list">
          <h3>
            {activeTab === 'us' ? '🇺🇸' : '🇨🇦'} 
            {activeTab === 'us' ? ' US' : ' Canadian'} Deductions
          </h3>
          
          {(activeTab === 'us' ? usDeductions : caDeductions).length === 0 ? (
            <div className="empty-state">
              <Shield size={40} />
              <p>No deductions added yet</p>
              <span>Add deductions to reduce your tax</span>
            </div>
          ) : (
            <div className="income-items">
              {(activeTab === 'us' ? usDeductions : caDeductions).map((item) => (
                <div key={item.id} className="income-item">
                  <div className="income-info">
                    <span className="income-type">{item.label || item.type}</span>
                    {item.description && <span className="income-source">{item.description}</span>}
                  </div>
                  <div className="income-amount">
                    <span className="deduction-amount">
                      -{activeTab === 'us' ? '$' : 'C$'}{item.amount.toLocaleString()}
                    </span>
                    <button 
                      className="delete-btn"
                      onClick={() => handleRemoveDeduction(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'us' ? usDeductions : caDeductions).length > 0 && (
            <div className="income-total">
              <span>Total Deductions</span>
              <span className="total-amount deduction">
                -{activeTab === 'us' ? '$' : 'C$'}{(activeTab === 'us' ? totalUSDeductions : totalCADDeductions).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Add Deduction Form */}
        <div className="add-income-form">
          <h3>Add Deduction</h3>
          <form onSubmit={handleAddDeduction}>
            <div className="form-group">
              <label>Deduction Type</label>
              <select 
                value={newDeduction.type}
                onChange={(e) => setNewDeduction({...newDeduction, type: e.target.value})}
                required
              >
                <option value="">Select type...</option>
                {deductionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} {type.max ? `(max $${type.max.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount ({activeTab === 'us' ? 'USD' : 'CAD'})</label>
              <input 
                type="number"
                value={newDeduction.amount}
                onChange={(e) => setNewDeduction({...newDeduction, amount: e.target.value})}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <input 
                type="text"
                value={newDeduction.description}
                onChange={(e) => setNewDeduction({...newDeduction, description: e.target.value})}
                placeholder="Additional details..."
              />
            </div>

            <button type="submit" className="add-btn">
              <Plus size={16} /> Add Deduction
            </button>
          </form>

          {/* Standard Deduction Quick Add */}
          {activeTab === 'us' && usIncome > 0 && (
            <div className="quick-add">
              <button 
                className="quick-add-btn"
                onClick={() => {
                  addDeduction('us', {
                    type: 'standard',
                    label: 'Standard Deduction',
                    amount: 14600,
                  });
                }}
              >
                Add Standard Deduction ($14,600)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="income-summary">
        <h3>📊 Taxable Income After Deductions</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">🇺🇸 US Gross Income</span>
            <span className="summary-value">${usIncome.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🇺🇸 US Deductions</span>
            <span className="summary-value deduction">-${totalUSDeductions.toLocaleString()}</span>
          </div>
          <div className="summary-item total">
            <span className="summary-label">🇺🇸 US Taxable Income</span>
            <span className="summary-value">${usTaxableIncome.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-grid" style={{ marginTop: '1rem' }}>
          <div className="summary-item">
            <span className="summary-label">🇨🇦 CA Gross Income</span>
            <span className="summary-value">${caIncome.toLocaleString()} CAD</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🇨🇦 CA Deductions</span>
            <span className="summary-value deduction">-${totalCADeductions.toLocaleString()} CAD</span>
          </div>
          <div className="summary-item total">
            <span className="summary-label">🇨🇦 CA Taxable Income</span>
            <span className="summary-value">${caTaxableIncome.toLocaleString()} CAD</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={() => setStep('income')}>
          <ArrowLeft size={16} /> Back
        </button>
        <button type="button" className="btn-primary" onClick={() => setStep('documents')}>
          Next: Review <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
