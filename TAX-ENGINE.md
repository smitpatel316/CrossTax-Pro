# Tax Engine Architecture

## Overview
Modular rule-based tax calculation engine designed for CPA-level accuracy in US-Canada cross-border scenarios.

---

## Core Components

### 1. Rule Engine
```
/tax-engine/rules/
├── us/
│   ├── residency-rules.js      # Substantial presence test
│   ├── income-classification.js
│   ├── deductions.js
│   ├── credits.js
│   └── treaty-articles.js
├── ca/
│   ├── residency-rules.js      # Significant residential ties
│   ├── income-classification.js
││   ├── deductions.js
│   ├── credits.js
│   └── treaty-articles.js
└── cross-border/
    ├── tax-credit-allocator.js
    ├── currency-converter.js
    ├── treaty-optimizer.js
    └── totalization-handler.js
```

### 2. Key Tax Rules

#### US Residency (Substantial Presence Test)
```
IF days_in_us >= 183:
  tax_resident = true
ELSE IF days_in_us >= 31:
  weighted_days = (current_year * 1) + (prev_year_1 * 1/3) + (prev_year_2 * 1/6)
  IF weighted_days >= 183:
    tax_resident = true
ELSE:
  tax_resident = false
```

#### Canada Residency (Significant Residential Ties)
```
IF days_in_canada >= 183:
  residential_ties += 1
IF homeowner_in_canada:
  residential_ties += 1
IF spouse_in_canada:
  residential_ties += 1
IF dependents_in_canada:
  residential_ties += 1

IF residential_ties >= 1 AND days_in_canada >= 183:
  tax_resident = true
```

#### Foreign Tax Credit (US)
```
US_tax_liability = calculate_us_tax(income)
Canadian_tax_paid = convert_cad_to_us(canada_tax)
FTC_limit = US_tax_liability * (foreign_income / total_us_income)
FTC_claimed = MIN(Canadian_tax_paid, FTC_limit)
```

#### Foreign Tax Credit (Canada)
```
Canada_tax_liability = calculate_canada_tax(income)
US_tax_paid = convert_usd_to_cad(us_tax)
FTC_limit = Canada_tax_liability * (foreign_income / total_canada_income)
FTC_claimed = MIN(US_tax_paid, FTC_limit)
```

---

## Form Mapping

| Tax Situation | US Forms | Canada Forms |
|--------------|----------|--------------|
| Basic income | 1040 | T1 |
| Self-employment | Schedule C | T2125 |
| Rental income | Schedule E | T776 |
| Capital gains | Schedule D | T1(3) |
| Dividends | B | T1(3) |
| Foreign accounts | FBAR 114 | T1135 |
| Foreign corporation | 5471 | T1135 |
| Foreign trust | 3520/3520-A | T1145/1146 |
| Foreign tax credit | 1116 | T2036 |

---

## Currency Handling

### Historical Rates
- Use Bank of Canada daily rates
- Store rates in database
- Fallback to IRS yearly average

### Income Types & Conversion
| Type | Rate to Use |
|------|-------------|
| Employment | Average for year OR date received |
| Self-employment | Date received |
| Dividend | Date paid |
| Interest | Accrued |
| Rental | Date received |

---

## Treaty Optimization Rules

### Article 7 - Business Profits
- Only US-source income taxable in US
- PE threshold = 183 days

### Article 18 - Pensions
- US pensions: taxed in US (some exceptions)
- CPP/QPP: split per treaty
- RRSP: not recognized by US (taxed as ordinary income)

### Article 24 - Relief from Double Taxation
- Foreign Tax Credit method
- Credit cannot exceed tax attributable to foreign income
- 10-year carryforward (US)

---

## Audit Trail

Every calculation must log:
- Input values (normalized)
- Rule applied
- Result
- Citation (IRS/ CRA publication)
- Timestamp
- User ID

---

## Validation Checks

### Pre-Submission
- [ ] All required forms identified
- [ ] Residency status confirmed in both countries
- [ ] Income categorized correctly
- [ ] FTC calculated (not exceed limit)
- [ ] Currency conversions applied
- [ ] Treaty claims validated
- [ ] Carryforwards tracked
- [ ] Deadline alerts set

### Cross-Border Consistency
- [ ] Same income not claimed in both countries
- [ ] FTC totals match between US/Canada
- [ ] RRSP/FBIT sync with US reporting
- [ ] Dates align for day-count tests

---

## Accuracy Targets

| Calculation | Target Accuracy |
|-------------|-----------------|
| Residency determination | 100% |
| Tax bracket application | 100% |
| FTC optimization | 99% |
| Treaty benefits | 100% |
| Currency conversion | 100% (verified) |

---

## CPA Review System

1. Each rule module requires:
   - Logic explanation
   - Source citation (IRC/CRA Act)
   - Case law references
   - Edge case handling

2. Quarterly review:
   - Update for law changes
   - Test new edge cases
   - Benchmark against CPA calculations

---

## Tech Stack

- **Rule Engine:** JSON Schema + TypeScript
- **Tax Data:** PostgreSQL with temporal tables
- **Calculations:** Server-side (Node.js)
- **Validation:** Constraint checks in database
