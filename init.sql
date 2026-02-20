-- CrossTax Pro Database Schema
-- PostgreSQL 15+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (encrypted PII)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Encrypted PII
    first_name_encrypted BYTEA,
    last_name_encrypted BYTEA,
    ssn_encrypted BYTEA,  -- Last 4 only stored
    tin_encrypted BYTEA,  -- US TIN
    sin_encrypted BYTEA,  -- Canadian SIN
    
    -- Metadata_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE
);

-- Tax Profiles (one per jurisdiction)
CREATE TABLE tax_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Jurisdiction
    country CHAR(2) CHECK (country IN ('US', 'CA')),
    
    -- Residency
    tax_resident BOOLEAN,
    residency_type VARCHAR(50), -- 'citizen', 'permanent_resident', 'non-resident'
    residency_start_date DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, submitted, accepted
    
    -- Tax Year
    tax_year INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, country, tax_year)
);

-- Income Records
CREATE TABLE income_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
    
    -- Income type
    income_type VARCHAR(50) NOT NULL, -- 'wages', 'self_employment', 'rental', 'dividend', 'interest', 'capital_gain', 'pension', 'other'
    
    -- Source
    source_name VARCHAR(255),
    source_country CHAR(2),
    
    -- Amounts
    amount NUMERIC(15,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    amount_usd NUMERIC(15,2), -- Converted
    amount_cad NUMERIC(15,2), -- Converted
    
    -- Metadata
    form_type VARCHAR(50), -- 'W2', 'T4', '1099', etc.
    box_reference VARCHAR(50), -- W2 box number, T4 slip row
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (amount >= 0)
);

-- Deductions
CREATE TABLE deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
    
    deduction_type VARCHAR(50) NOT NULL, -- 'standard', 'itemized', 'rrsp', 'tfsa', 'home_office', etc.
    
    amount NUMERIC(15,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (amount >= 0)
);

-- Tax Credits
CREATE TABLE tax_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
    
    credit_type VARCHAR(50) NOT NULL, -- 'foreign_tax', 'child', 'education', 'disability', etc.
    
    amount NUMERIC(15,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    
    -- For FTC
    source_country CHAR(2),
    foreign_tax_paid NUMERIC(15,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (amount >= 0)
);

-- Calculations Log (Audit Trail)
CREATE TABLE calculation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
    
    -- What was calculated
    calculation_type VARCHAR(100) NOT NULL, -- 'tax_liability', 'residency', 'ftc', 'treaty', etc.
    
    -- Inputs (JSON)
    inputs JSONB,
    
    -- Rule applied
    rule_applied VARCHAR(255),
    rule_version VARCHAR(50),
    
    -- Result
    result JSONB,
    
    -- Citation
    irs_citation VARCHAR(100),
    cra_citation VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    document_type VARCHAR(50) NOT NULL, -- 'w2', 't4', '1099', 'receipt', 'other'
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_hash VARCHAR(64), -- SHA-256
    
    -- Metadata
    tax_year INTEGER,
    country CHAR(2),
    
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Filing Status
CREATE TABLE filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES tax_profiles(id) ON DELETE CASCADE,
    
    -- Filing info
    jurisdiction CHAR(2) NOT NULL, -- 'US' or 'CA'
    form_type VARCHAR(50) NOT NULL, -- '1040', 'T1', etc.
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, prepared, filed, accepted, rejected
    filed_date DATE,
    acceptance_date DATE,
    
    -- E-file
    efile_id VARCHAR(100),
    efile_status VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user ON tax_profiles(user_id);
CREATE INDEX idx_profiles_status ON tax_profiles(status);
CREATE INDEX idx_income_profile ON income_records(profile_id);
CREATE INDEX idx_income_type ON income_records(income_type);
CREATE INDEX idx_deductions_profile ON deductions(profile_id);
CREATE INDEX idx_credits_profile ON tax_credits(profile_id);
CREATE INDEX idx_logs_profile ON calculation_logs(profile_id);
CREATE INDEX idx_logs_type ON calculation_logs(calculation_type);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_filings_profile ON filings(profile_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON tax_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER filings_updated_at BEFORE UPDATE ON filings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
