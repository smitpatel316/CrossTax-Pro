import React from 'react';
import { useTax } from '../context/TaxContext';
import { ArrowLeft, FileCheck } from 'lucide-react';

export default function Review() {
  const { taxData, calculateTotals } = useTax();
  const totals = calculateTotals();

  const hasUSResidency = taxData.residency?.us?.calculatedStatus?.status === 'resident';
  const hasCAResidency = taxData.residency?.ca?.calculatedStatus?.status === 'resident';

  return (
    <div className="review-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div className="page-header">
        <h1>📋 Review & File</h1>
        <p style={{ color: '#718096' }}>Review your tax information before filing</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* US Summary */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🇺🇸</span>
            <h3 style={{ margin: 0, color: '#1A365D' }}>US Tax Return</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Status</span>
              <span style={{ 
                fontWeight: 600, 
                color: hasUSResidency ? '#276749' : '#D69E2E' 
              }}>
                {hasUSResidency ? 'Resident' : 'Non-resident'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Income</span>
              <span style={{ fontWeight: 600 }}>${totals.usIncome.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Deductions</span>
              <span style={{ fontWeight: 600 }}>${totals.usDeductions.toLocaleString()}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '0.75rem',
              marginTop: '0.5rem'
            }}>
              <span style={{ fontWeight: 600 }}>Taxable Income</span>
              <span style={{ fontWeight: 700, color: '#1A365D' }}>
                ${(totals.usIncome - totals.usDeductions).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Canada Summary */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🇨🇦</span>
            <h3 style={{ margin: 0, color: '#1A365D' }}>Canada Tax Return</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Status</span>
              <span style={{ 
                fontWeight: 600, 
                color: hasCAResidency ? '#276749' : '#D69E2E' 
              }}>
                {hasCAResidency ? 'Resident' : 'Non-resident'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Income</span>
              <span style={{ fontWeight: 600 }}>${totals.caIncome.toLocaleString()} CAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Deductions</span>
              <span style={{ fontWeight: 600 }}>${totals.caDeductions.toLocaleString()} CAD</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '0.75rem',
              marginTop: '0.5rem'
            }}>
              <span style={{ fontWeight: 600 }}>Taxable Income</span>
              <span style={{ fontWeight: 700, color: '#1A365D' }}>
                ${(totals.caIncome - totals.caDeductions).toLocaleString()} CAD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filing Status */}
      <div style={{ 
        background: '#F7FAFC', 
        borderRadius: '12px', 
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <FileCheck size={48} style={{ color: '#276749', marginBottom: '1rem' }} />
        <h2 style={{ color: '#1A365D', marginBottom: '0.5rem' }}>Ready to Review</h2>
        <p style={{ color: '#718096' }}>
          Complete the residency and income sections to proceed with filing.
        </p>
      </div>

      {/* Forms to File */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1A365D' }}>📄 Forms to File</h3>
        
        {hasUSResidency && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>🇺🇸 United States</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', color: '#4A5568' }}>
              <li>Form 1040 - Individual Income Tax Return</li>
              {totals.usIncome > 0 && <li>State return (if applicable)</li>}
            </ul>
          </div>
        )}
        
        {hasCAResidency && (
          <div>
            <strong>🇨🇦 Canada</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', color: '#4A5568' }}>
              <li>T1 General - Individual Income Tax Return</li>
              <li>Provincial tax return (if applicable)</li>
            </ul>
          </div>
        )}
        
        {!hasUSResidency && !hasCAResidency && (
          <p style={{ color: '#718096' }}>
            Complete your residency status to see required forms.
          </p>
        )}
      </div>

      {/* Back */}
      <div className="form-actions">
        <button className="btn-secondary" onClick={() => window.location.hash = 'deductions'}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <style>{`
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          background: white;
          color: #4A5568;
          border: 1px solid #E2E8F0;
          cursor: pointer;
        }
        .form-actions { display: flex; justify-content: flex-start; margin-top: 2rem; }
      `}</style>
    </div>
  );
}
