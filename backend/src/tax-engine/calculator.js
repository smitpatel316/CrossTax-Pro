/**
 * Tax Engine - Tax Liability Calculator
 * US and Canada tax bracket calculations with treaty handling
 */

const US_TAX_BRACKETS_2025 = {
  single: [
    { max: 11600, rate: 0.10 },
    { max: 47150, rate: 0.12 },
    { max: 100525, rate: 0.22 },
    { max: 191950, rate: 0.24 },
    { max: 243725, rate: 0.32 },
    { max: 609350, rate: 0.35 },
    { max: Infinity, rate: 0.37 }
  ],
  married_jointly: [
    { max: 23200, rate: 0.10 },
    { max: 94300, rate: 0.12 },
    { max: 201050, rate: 0.22 },
    { max: 383900, rate: 0.24 },
    { max: 487450, rate: 0.32 },
    { max: 731200, rate: 0.35 },
    { max: Infinity, rate: 0.37 }
  ]
};

const CA_TAX_BRACKETS_2025 = [
  { max: 55867, rate: 0.15 },
  { max: 111733, rate: 0.205 },
  { max: 173205, rate: 0.26 },
  { max: 246752, rate: 0.29 },
  { max: Infinity, rate: 0.33 }
];

// Federal brackets (simplified - provincial would add more layers)
const CA_PROVINCIAL_RATES = {
  ON: [ // Ontario
    { max: 49231, rate: 0.0505 },
    { max: 98463, rate: 0.0915 },
    { max: 150000, rate: 0.1116 },
    { max: 220000, rate: 0.1216 },
    { max: Infinity, rate: 0.1316 }
  ],
  BC: [ // British Columbia
    { max: 47937, rate: 0.0506 },
    { max: 95875, rate: 0.077 },
    { max: 110076, rate: 0.105 },
    { max: 133664, rate: 0.1229 },
    { max: 181232, rate: 0.147 },
    { max: Infinity, rate: 0.168 }
  ]
};

class TaxCalculator {
  /**
   * Calculate US Federal Tax
   */
  static calculateUSTax(income, filingStatus = 'single', deductions = 0) {
    const taxableIncome = Math.max(0, income - deductions);
    
    const brackets = US_TAX_BRACKETS_2025[filingStatus] || US_TAX_BRACKETS_2025.single;
    let tax = 0;
    let previousMax = 0;
    const breakdown = [];

    for (const bracket of brackets) {
      if (taxableIncome > previousMax) {
        const taxableAtBracket = Math.min(taxableIncome, bracket.max) - previousMax;
        const taxAtBracket = taxableAtBracket * bracket.rate;
        tax += taxAtBracket;
        
        breakdown.push({
          bracket: `${(bracket.rate * 100).toFixed(0)}%`,
          incomeInBracket: taxableAtBracket,
          tax: taxAtBracket
        });
        
        previousMax = bracket.max;
      }
    }

    return {
      grossIncome: income,
      deductions,
      taxableIncome,
      tax,
      effectiveRate: (tax / taxableIncome * 100).toFixed(2),
      breakdown,
      citation: 'IRC Section 1'
    };
  }

  /**
   * Calculate Canada Federal Tax
   */
  static calculateCanadaTax(income, province = 'ON') {
    const brackets = CA_TAX_BRACKETS_2025;
    let federalTax = 0;
    let previousMax = 0;
    const breakdown = [];

    for (const bracket of brackets) {
      if (income > previousMax) {
        const taxableAtBracket = Math.min(income, bracket.max) - previousMax;
        const taxAtBracket = taxableAtBracket * bracket.rate;
        federalTax += taxAtBracket;
        
        breakdown.push({
          type: 'Federal',
          bracket: `${(bracket.rate * 100).toFixed(1)}%`,
          incomeInBracket: taxableAtBracket,
          tax: taxAtBracket
        });
        
        previousMax = bracket.max;
      }
    }

    // Add provincial tax
    const provincialBrackets = CA_PROVINCIAL_RATES[province] || CA_PROVINCIAL_RATES.ON;
    let provincialTax = 0;
    previousMax = 0;

    for (const bracket of provincialBrackets) {
      if (income > previousMax) {
        const taxableAtBracket = Math.min(income, bracket.max) - previousMax;
        const taxAtBracket = taxableAtBracket * bracket.rate;
        provincialTax += taxAtBracket;
        
        breakdown.push({
          type: province,
          bracket: `${(bracket.rate * 100).toFixed(2)}%`,
          incomeInBracket: taxableAtBracket,
          tax: taxAtBracket
        });
        
        previousMax = bracket.max;
      }
    }

    const totalTax = federalTax + provincialTax;

    return {
      grossIncome: income,
      province,
      federalTax,
      provincialTax,
      totalTax,
      effectiveRate: (totalTax / income * 100).toFixed(2),
      breakdown,
      citation: 'ITA 117, Provincial Acts'
    };
  }

  /**
   * Calculate Foreign Tax Credit (US)
   * IRC Section 904 - Limitation
   */
  static calculateUSFTC(foreignIncome, foreignTaxPaid, totalUSTax, totalUSIncome) {
    // FTC cannot exceed US tax attributable to foreign income
    const ftcLimit = totalUSTax * (foreignIncome / totalUSIncome);
    
    // Credit is lesser of tax paid or limit
    const credit = Math.min(foreignTaxPaid, ftcLimit);
    const carryforward = Math.max(0, foreignTaxPaid - ftcLimit);

    return {
      foreignIncome,
      foreignTaxPaid,
      ftcLimit: Math.round(ftcLimit),
      credit: Math.round(credit),
      carryforward: Math.round(carryforward),
      excessTaxUsed: foreignTaxPaid - credit,
      citation: 'IRC Section 901, 904'
    };
  }

  /**
   * Calculate Foreign Tax Credit (Canada)
   * ITA 126 - Foreign tax credit
   */
  static calculateCanadaFTC(foreignIncome, foreignTaxPaid, totalCanadaTax, totalCanadaIncome) {
    // Simplified - Canada has both non-refundable and refundable calculations
    const ftcNonRefundable = Math.min(
      foreignTaxPaid * 0.15, // Simplified rate
      totalCanadaTax * (foreignIncome / totalCanadaIncome)
    );

    return {
      foreignIncome,
      foreignTaxPaid,
      ftcNonRefundable: Math.round(ftcNonRefundable),
      carryforwardYears: 10,
      citation: 'ITA 126'
    };
  }

  /**
   * Treaty Benefit Calculator
   * Check which income items qualify for reduced withholding
   */
  static calculateTreatyBenefits(incomeItems, residencyCountry, treatyCountry) {
    const benefits = [];

    for (const item of incomeItems) {
      let reducedRate = null;
      let article = null;

      // US-Canada Treaty Article 7 - Business Profits
      if (item.type === 'business_income' && item.hasPE === false) {
        reducedRate = 0;
        article = 'Article 7';
        benefits.push({
          income: item.amount,
          type: item.type,
          article,
          reducedRate,
          reason: 'No PE in source country - exempt from withholding'
        });
      }

      // Article 10 - Dividends
      if (item.type === 'dividends') {
        if (item.ownership >= 10) {
          reducedRate = 5;
          article = 'Article 10(2)';
        } else {
          reducedRate = 15;
          article = 'Article 10(1)';
        }
        benefits.push({
          income: item.amount,
          type: item.type,
          article,
          reducedRate: `${reducedRate}%`,
          reason: 'Dividend withholding per treaty'
        });
      }

      // Article 11 - Interest
      if (item.type === 'interest') {
        reducedRate = 10;
        article = 'Article 11';
        benefits.push({
          income: item.amount,
          type: item.type,
          article,
          reducedRate: `${reducedRate}%`,
          reason: 'Interest withholding per treaty'
        });
      }

      // Article 18 - Pensions
      if (item.type === 'pension') {
        // CPP/QPP treated differently than private pensions
        if (item.source === 'government') {
          reducedRate = 0;
          article = 'Article 18(2)';
        } else {
          reducedRate = 15;
          article = 'Article 18(1)';
        }
        benefits.push({
          income: item.amount,
          type: item.type,
          article,
          reducedRate: reducedRate === 0 ? 'Exempt' : `${reducedRate}%`,
          reason: 'Pension taxation per treaty'
        });
      }
    }

    return benefits;
  }

  /**
   * Social Security Totalization
   * Determine which country's SS applies
   */
  static calculateTotalization(employeeCountry, employerCountry, daysWorkedInEach, income) {
    const result = {
      usCoverage: false,
      caCoverage: false,
      exemption: null,
      details: []
    };

    // US-Canada Totalization Agreement
    if (employeeCountry === 'US' && employerCountry === 'CA') {
      // Working for Canadian employer
      if (income > 3500) { // 2025 threshold USD
        result.caCoverage = true;
        result.usCoverage = false;
        result.details.push('Subject to Canada CPP, exempt from US SS');
      } else {
        result.usCoverage = true;
        result.details.push('Below threshold - US SS only');
      }
    } else if (employeeCountry === 'CA' && employerCountry === 'US') {
      // Working for US employer
      if (income > 3500) {
        result.usCoverage = true;
        result.caCoverage = false;
        result.details.push('Subject to US SS, exempt from Canada CPP');
      } else {
        result.caCoverage = true;
        result.details.push('Below threshold - Canada CPP only');
      }
    }

    return result;
  }
}

module.exports = TaxCalculator;
