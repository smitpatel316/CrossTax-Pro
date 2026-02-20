// CrossTax Pro - Enhanced Tax Engine with more features
// Advanced deductions, credits, and calculations

// Itemized Deductions Calculator
export const ItemizedDeductions = {
  // Standard deductions 2025
  standard: {
    single: 14600,
    married_jointly: 29200,
    head_of_household: 21900,
  },

  // Common itemized deductions
  calculate( deductions) {
    let total = 0;
    const details = [];

    // Medical expenses (only above 7.5% of AGI)
    const medical = deductions.filter(d => d.type === 'medical');
    if (medical.length > 0) {
      const medicalTotal = medical.reduce((sum, d) => sum + d.amount, 0);
      details.push({ type: 'Medical', amount: medicalTotal, note: 'Subject to 7.5% AGI limit' });
      total += medicalTotal;
    }

    // State and Local Taxes (SALT) - $10k cap
    const salt = deductions.filter(d => d.type === 'state_local');
    const saltTotal = salt.reduce((sum, d) => sum + d.amount, 0);
    const saltCapped = Math.min(saltTotal, 10000);
    details.push({ type: 'SALT', amount: saltCapped, note: saltTotal > 10000 ? 'Capped at $10,000' : '' });
    total += saltCapped;

    // Mortgage interest
    const mortgage = deductions.filter(d => d.type === 'mortgage');
    const mortgageTotal = mortgage.reduce((sum, d) => sum + d.amount, 0);
    details.push({ type: 'Mortgage Interest', amount: mortgageTotal });
    total += mortgageTotal;

    // Charitable contributions
    const charity = deductions.filter(d => d.type === 'charity');
    const charityTotal = charity.reduce((sum, d) => sum + d.amount, 0);
    const charityCapped = Math.min(charityTotal, charityTotal * 0.6); // 60% of AGI limit
    details.push({ type: 'Charity', amount: charityCapped });
    total += charityCapped;

    return { total, details };
  },

  // Compare standard vs itemized
  compare( filingStatus, income, itemizedTotal) {
    const standardDeduction = this.standard[filingStatus] || this.standard.single;
    const better = itemizedTotal > standardDeduction ? 'itemized' : 'standard';
    const savings = Math.abs(itemizedTotal - standardDeduction);
    
    return {
      standard: standardDeduction,
      itemized: itemizedTotal,
      better,
      savings,
      recommendation: better === 'itemized' 
        ? `Itemized saves $${savings.toLocaleString()}`
        : `Standard deduction saves $${savings.toLocaleString()}`
    };
  }
};

// Tax Credits Calculator
export const TaxCredits = {
  // Common US credits
  usCredits: [
    { id: 'child_tax', name: 'Child Tax Credit', max: 2000, perChild: true, phaseout: { start: 200000, rate: 0.05 } },
    { id: 'earned_income', name: 'Earned Income Tax Credit', max: 7000, type: 'refundable' },
    { id: 'education', name: 'American Opportunity Credit', max: 2500, perStudent: true },
    { id: 'lifetime_learning', name: 'Lifetime Learning Credit', max: 2000, type: 'nonrefundable' },
    { id: 'child_care', name: 'Child and Dependent Care Credit', max: 3500, type: 'partial' },
    { id: 'retirement', name: 'Saver\'s Credit', max: 2000, type: 'nonrefundable' },
  ],

  // Canadian credits
  caCredits: [
    { id: 'basic_personal', name: 'Basic Personal Amount', max: 15705 },
    { id: 'spouse', name: 'Spouse/Partner Credit', max: 15705 },
    { id: 'child_care', name: 'Child Care Expense Deduction', max: 8000 },
    { id: 'tuition', name: 'Tuition Tax Credit', max: 5000 },
    { id: 'disability', name: 'Disability Tax Credit', max: 8877 },
    { id: 'medical', name: "Medical Expense Tax Credit", type: 'refundable' },
  ],

  calculate( income, credits, filingStatus) {
    const results = [];
    let totalNonRefundable = 0;
    let totalRefundable = 0;

    for (const credit of credits) {
      let amount = 0;
      let note = '';

      // Calculate based on credit type
      switch (credit.id) {
        case 'child_tax':
          amount = credit.children * 2000;
          if (income > 200000) {
            const reduction = (income - 200000) * 0.05;
            amount = Math.max(0, amount - reduction);
            note = `Reduced by $${reduction.toLocaleString()} due to income`;
          }
          break;
        case 'earned_income':
          // Simplified EITC calculation
          if (income > 0 && income < 50000) {
            amount = Math.min(7000, income * 0.15);
          }
          break;
        default:
          amount = credit.max || 0;
      }

      if (amount > 0) {
        results.push({
          ...credit,
          amount: Math.round(amount),
          note
        });

        if (credit.type === 'refundable') {
          totalRefundable += amount;
        } else {
          totalNonRefundable += amount;
        }
      }
    }

    return {
      credits: results,
      totalNonRefundable: Math.round(totalNonRefundable),
      totalRefundable: Math.round(totalRefundable),
      total: Math.round(totalNonRefundable + totalRefundable)
    };
  }
};

// Tax Loss Harvesting
export const TaxLossHarvesting = {
  // Analyze investments for tax loss harvesting opportunities
  analyze(investments, shortTermLosses, longTermLosses) {
    const opportunities = [];
    
    // Short-term losses (taxed as ordinary income)
    const stLosses = shortTermLosses || [];
    const stGains = investments.filter(i => i.gain > 0 && i.term === 'short');
    
    // Long-term losses
    const ltLosses = longTermLosses || [];
    const ltGains = investments.filter(i => i.gain > 0 && i.term === 'long');

    // harvesting opportunity
    const totalLosses = [...stLosses, ...ltLosses].reduce((sum, l) => sum + Math.abs(l.amount), 0);
    const maxHarvest = Math.min(totalLosses, 3000); // Can deduct $3k against ordinary income
    
    opportunities.push({
      type: 'Short-term',
      losses: stLosses.reduce((sum, l) => sum + Math.abs(l.amount), 0),
      potential: 'Taxed at ordinary income rate'
    });

    opportunities.push({
      type: 'Long-term', 
      losses: ltLosses.reduce((sum, l) => sum + Math.abs(l.amount), 0),
      potential: 'Offset capital gains + carryforward'
    });

    return {
      opportunities,
      totalHarvestable: totalLosses,
      immediateDeduction: maxHarvest,
      carryforward: Math.max(0, totalLosses - 3000),
      recommendation: totalLosses > 0 
        ? `Harvest $${maxHarvest} this year, carry forward $${Math.max(0, totalLosses - 3000)}`
        : 'No harvesting opportunities identified'
    };
  }
};

// Quarterly Estimated Tax Calculator
export const EstimatedTax = {
  calculate(income, filingStatus, previousYearTax) {
    const annualTax = previousYearTax || 10000;
    const quarterly = annualTax / 4;
    
    // Safe harbor amounts
    const safeHarbor90 = annualTax * 0.9;
    const safeHarbor100 = annualTax; // If no tax last year
    
    return {
      quarterlyPayment: Math.round(quarterly),
      annualTax,
      safeHarbor90: Math.round(safeHarbor90),
      safeHarbor100: Math.round(safeHarbor100),
      dueDates: [
        { quarter: 'Q1', due: 'April 15', amount: quarterly },
        { quarter: 'Q2', due: 'June 15', amount: quarterly },
        { quarter: 'Q3', due: 'September 15', amount: quarterly },
        { quarter: 'Q4', due: 'January 15 (next year)', amount: quarterly },
      ]
    };
  }
};
