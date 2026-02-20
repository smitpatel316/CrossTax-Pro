import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { ArrowRight, ArrowLeft, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import './Residency.css';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

const CA_PROVINCES = ['ON','BC','AB','QC','MB','SK','NS','NB','NL','PE','NT','YT','NU'];

export default function Residency() {
  const { taxData, updateTaxData, setStep } = useTax();
  const [errors, setErrors] = useState({});

  const [usResidency, setUsResidency] = useState({
    status: taxData.residency?.us?.status || '',
    daysInUS: taxData.residency?.us?.daysInUS || 0,
    daysInUSPrior1: taxData.residency?.us?.daysInUSPrior1 || 0,
    daysInUSPrior2: taxData.residency?.us?.daysInUSPrior2 || 0,
    greenCard: taxData.residency?.us?.greenCard || false,
    visaType: taxData.residency?.us?.visaType || '',
    homeInUS: taxData.residency?.us?.homeInUS || false,
    spouseInUS: taxData.residency?.us?.spouseInUS || false,
    workInUS: taxData.residency?.us?.workInUS || false,
  });

  const [caResidency, setCaResidency] = useState({
    status: taxData.residency?.ca?.status || '',
    daysInCanada: taxData.residency?.ca?.daysInCanada || 0,
    homeInCanada: taxData.residency?.ca?.homeInCanada || false,
    spouseInCanada: taxData.residency?.ca?.spouseInCanada || false,
    dependentsInCanada: taxData.residency?.ca?.dependentsInCanada || false,
    workInCanada: taxData.residency?.ca?.workInCanada || false,
    healthCard: taxData.residency?.ca?.healthCard || false,
    bankAccount: taxData.residency?.ca?.bankAccount || false,
    departureDate: taxData.residency?.ca?.departureDate || '',
    returnDate: taxData.residency?.ca?.returnDate || '',
  });

  const calculateUSStatus = () => {
    const { daysInUS, daysInUSPrior1, daysInUSPrior2 } = usResidency;
    const weighted = daysInUS + (daysInUSPrior1 / 3) + (daysInUSPrior2 / 6);
    
    if (usResidency.greenCard) return { status: 'resident', type: 'Lawful Permanent Resident' };
    if (weighted >= 183) return { status: 'resident', type: 'Substantial Presence' };
    return { status: 'nonresident', type: 'Non-resident' };
  };

  const calculateCAStatus = () => {
    const { daysInCanada, homeInCanada, spouseInCanada, dependentsInCanada } = caResidency;
    
    let ties = 0;
    if (homeInCanada) ties += 2;
    if (spouseInCanada) ties += 1;
    if (dependentsInCanada) ties += 1;
    
    if (daysInCanada >= 183) return { status: 'resident', type: 'Factual Resident' };
    if (ties >= 1) return { status: 'resident', type: 'Deemed Resident' };
    return { status: 'nonresident', type: 'Non-resident' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const usStatus = calculateUSStatus();
    const caStatus = calculateCAStatus();

    updateTaxData({
      residency: {
        us: { ...usResidency, calculatedStatus: usStatus },
        ca: { ...caResidency, calculatedStatus: caStatus }
      }
    });

    setStep('income');
  };

  const usResult = calculateUSStatus();
  const caResult = calculateCAStatus();

  return (
    <div className="residency-page">
      <div className="page-header">
        <h1>Tax Residency Status</h1>
        <p>Tell us where you live and work to determine your filing requirements</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* US Section */}
        <section className="residency-section">
          <div className="section-header">
            <span className="flag">🇺🇸</span>
            <h2>United States</h2>
          </div>

          <div className="form-group">
            <label>Are you a US citizen or lawful permanent resident (green card holder)?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="greenCard"
                  checked={usResidency.greenCard}
                  onChange={(e) => setUsResidency({...usResidency, greenCard: true})}
                />
                Yes, I'm a US citizen or green card holder
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="greenCard"
                  checked={!usResidency.greenCard}
                  onChange={(e) => setUsResidency({...usResidency, greenCard: false})}
                />
                No
              </label>
            </div>
          </div>

          {!usResidency.greenCard && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Days physically present in US this year</label>
                  <input
                    type="number"
                    min="0"
                    max="366"
                    value={usResidency.daysInUS}
                    onChange={(e) => setUsResidency({...usResidency, daysInUS: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Days in US (prior year)</label>
                  <input
                    type="number"
                    min="0"
                    max="366"
                    value={usResidency.daysInUSPrior1}
                    onChange={(e) => setUsResidency({...usResidency, daysInUSPrior1: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Days in US (2 years ago)</label>
                  <input
                    type="number"
                    min="0"
                    max="366"
                    value={usResidency.daysInUSPrior2}
                    onChange={(e) => setUsResidency({...usResidency, daysInUSPrior2: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Significant ties to the US:</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={usResidency.homeInUS}
                      onChange={(e) => setUsResidency({...usResidency, homeInUS: e.target.checked})}
                    />
                    Home in the US
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={usResidency.spouseInUS}
                      onChange={(e) => setUsResidency({...usResidency, spouseInUS: e.target.checked})}
                    />
                    Spouse/partner in the US
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={usResidency.workInUS}
                      onChange={(e) => setUsResidency({...usResidency, workInUS: e.target.checked})}
                    />
                    Work in the US
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="result-card">
            <div className="result-header">
              <span className="result-label">US Tax Status:</span>
              <span className={`result-value ${usResult.status}`}>
                {usResult.status === 'resident' ? (
                  <><CheckCircle size={16} /> Resident - {usResult.type}</>
                ) : (
                  <><AlertCircle size={16} /> Non-resident</>
                )}
              </span>
            </div>
            {usResult.status === 'resident' && (
              <p className="result-note">You must file a US federal return (Form 1040)</p>
            )}
          </div>
        </section>

        {/* Canada Section */}
        <section className="residency-section">
          <div className="section-header">
            <span className="flag">🇨🇦</span>
            <h2>Canada</h2>
          </div>

          <div className="form-group">
            <label>Days physically present in Canada this year</label>
            <input
              type="number"
              min="0"
              max="366"
              value={caResidency.daysInCanada}
              onChange={(e) => setCaResidency({...caResidency, daysInCanada: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Significant residential ties:</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={caResidency.homeInCanada}
                  onChange={(e) => setCaResidency({...caResidency, homeInCanada: e.target.checked})}
                />
                Home in Canada
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={caResidency.spouseInCanada}
                  onChange={(e) => setCaResidency({...caResidency, spouseInCanada: e.target.checked})}
                />
                Spouse/partner in Canada
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={caResidency.dependentsInCanada}
                  onChange={(e) => setCaResidency({...caResidency, dependentsInCanada: e.target.checked})}
                />
                Dependents in Canada
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={caResidency.workInCanada}
                  onChange={(e) => setCaResidency({...caResidency, workInCanada: e.target.checked})}
                />
                Work in Canada
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={caResidency.healthCard}
                  onChange={(e) => setCaResidency({...caResidency, healthCard: e.target.checked})}
                />
                Health card
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={caResidency.bankAccount}
                  onChange={(e) => setCaResidency({...caResidency, bankAccount: e.target.checked})}
                />
                Bank account in Canada
              </label>
            </div>
          </div>

          <div className="result-card">
            <div className="result-header">
              <span className="result-label">Canada Tax Status:</span>
              <span className={`result-value ${caResult.status}`}>
                {caResult.status === 'resident' ? (
                  <><CheckCircle size={16} /> Resident - {caResult.type}</>
                ) : (
                  <><AlertCircle size={16} /> Non-resident</>
                )}
              </span>
            </div>
            {caResult.status === 'resident' && (
              <p className="result-note">You must file a Canadian T1 return</p>
            )}
          </div>
        </section>

        {/* Cross-Border Summary */}
        {(usResult.status === 'resident' || caResult.status === 'resident') && (
          <section className="cross-border-summary">
            <h3>📋 Cross-Border Filing Requirements</h3>
            <div className="summary-grid">
              {usResult.status === 'resident' && (
                <div className="summary-item us">
                  <strong>🇺🇸 United States</strong>
                  <ul>
                    <li>Form 1040 - Individual Income Tax Return</li>
                    {usResidency.daysInUS >= 183 && <li>State return (if applicable)</li>}
                    <li>FBAR (if foreign accounts >$10k)</li>
                  </ul>
                </div>
              )}
              {caResult.status === 'resident' && (
                <div className="summary-item ca">
                  <strong>🇨🇦 Canada</strong>
                  <ul>
                    <li>T1 General - Individual Income Tax Return</li>
                    <li>Provincial return (if applicable)</li>
                    <li>T1135 (if foreign property >$100k)</li>
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setStep('dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="submit" className="btn-primary">
            Next: Income <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
