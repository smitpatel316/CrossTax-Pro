import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { ArrowLeft, FileText, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import './Documents.css';

export default function Documents() {
  const { taxData, setStep } = useTax();
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState(taxData.documents || []);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newDocs = Array.from(files).map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: getDocType(file.name),
        size: (file.size / 1024).toFixed(1) + ' KB',
        uploadedAt: new Date().toISOString()
      }));
      setDocuments([...documents, ...newDocs]);
      setUploading(false);
    }, 1000);
  };

  const getDocType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      'w2': 'W-2',
      't4': 'T4',
      'pdf': 'PDF',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
    };
    return types[ext] || 'Other';
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const requiredDocs = [
    { type: 'W-2', country: 'US', description: 'Wage and Tax Statement' },
    { type: 'T4', country: 'CA', description: 'Employment Insurance slip' },
    { type: '1099', country: 'US', description: 'Interest, dividends, or other income' },
    { type: 'T5', country: 'CA', description: 'Statement of Investment Income' },
    { type: 'Mortgage', country: 'Both', description: 'Mortgage interest statement' },
    { type: 'Charity', country: 'Both', description: 'Charitable donations receipt' },
  ];

  const uploadedTypes = documents.map(d => d.type);

  return (
    <div className="documents-page">
      <div className="page-header">
        <h1>📁 Documents</h1>
        <p>Upload your tax documents securely</p>
      </div>

      {/* Upload Area */}
      <div 
        className={`upload-area ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload size={48} />
        <h3>Drop files here or click to upload</h3>
        <p>Supports: PDF, JPG, PNG (max 10MB each)</p>
        <input 
          type="file" 
          multiple 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span>Uploading...</span>
        </div>
      )}

      {/* Required Documents Checklist */}
      <div className="required-section">
        <h2>Required Documents</h2>
        <div className="required-grid">
          {requiredDocs.map((doc, idx) => {
            const isUploaded = uploadedTypes.includes(doc.type);
            return (
              <div key={idx} className={`required-item ${isUploaded ? 'uploaded' : ''}`}>
                {isUploaded ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <div className="doc-info">
                  <span className="doc-type">
                    {doc.country === 'US' ? '🇺🇸' : doc.country === 'CA' ? '🇨🇦' : '🌎'} {doc.type}
                  </span>
                  <span className="doc-desc">{doc.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="uploaded-section">
          <h2>Uploaded Documents ({documents.length})</h2>
          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <FileText size={24} />
                <div className="doc-details">
                  <span className="doc-name">{doc.name}</span>
                  <span className="doc-meta">{doc.type} • {doc.size}</span>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeDocument(doc.id)}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="security-note">
        <ShieldIcon />
        <div>
          <strong>Your documents are encrypted</strong>
          <p>All uploads are encrypted with bank-level security. We never share your data.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button className="btn-secondary" onClick={() => setStep('review')}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn-primary" onClick={() => setStep('filing')}>
          Next: File <CheckCircle size={16} />
        </button>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
