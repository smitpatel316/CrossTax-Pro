// Tax calculation service with currency conversion
export const CurrencyConverter = {
  // Historical CAD to USD rates (2025 averages)
  cadToUsd: 0.735,  // 1 CAD = 0.735 USD
  usdToCad: 1.361,  // 1 USD = 1.361 CAD
  
  convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'CAD' && toCurrency === 'USD') {
      return amount * this.cadToUsd;
    }
    if (fromCurrency === 'USD' && toCurrency === 'CAD') {
      return amount * this.usdToCad;
    }
    
    return amount;
  },
  
  // Get rate for specific date (simplified - would use API in production)
  getRate(currency, date = new Date()) {
    // In production, would fetch from Bank of Canada or IRS APIs
    return currency === 'CAD' ? this.cad 1;
  }
};

// Tax deadline calculatorToUsd :
export const DeadlineCalculator = {
  getDeadlines(taxYear = 2025) {
    const usDeadline = new Date(taxYear + 1, 3, 15); // April 15
    const caDeadline = new Date(taxYear + 1, 3, 30);  // April 30
    
    // US extended deadline (if applicable)
    const usExtended = new Date(taxYear + 1, 8, 15);   // October 15
    
    const today = new Date();
    
    return {
      us: {
        standard: usDeadline,
        extended: usExtended,
        daysRemaining: Math.ceil((usDeadline - today) / (1000 * 60 * 60 * 24)),
        isPassed: today > usDeadline
      },
      ca: {
        standard: caDeadline,
        daysRemaining: Math.ceil((caDeadline - today) / (1000 * 60 * 60 * 24)),
        isPassed: today > caDeadline
      }
    };
  }
};

// Form selector - determines which forms user needs
export const FormSelector = {
  // Based on income types and residency
  selectForms(income, residency) {
    const forms = [];
    
    // US Forms
    if (residency.us === 'resident') {
      forms.push({ code: '1040', name: 'U.S. Individual Income Tax Return', required: true });
      
      if (income.us?.some(i => i.type === 'wages')) {
        forms.push({ code: 'W-2', name: 'Wage and Tax Statement', required: true });
      }
      if (income.us?.some(i => i.type === 'self_employment')) {
        forms.push({ code: 'Schedule C', name: 'Profit or Loss From Business', required: true });
      }
      if (income.us?.some(i => i.type === 'rental')) {
        forms.push({ code: 'Schedule E', name: 'Supplemental Income and Loss', required: true });
      }
      if (income.us?.some(i => i.type === 'capital_gains')) {
        forms.push({ code: 'Schedule D', name: 'Capital Gains and Losses', required: true });
      }
    }
    
    // Canadian Forms
    if (residency.ca === 'resident') {
      forms.push({ code: 'T1', name: 'Income Tax and Benefit Return', required: true });
      
      if (income.ca?.some(i => i.type === 'employment')) {
        forms.push({ code: 'T4', name: 'Statement of Employment Insurance', required: true });
      }
      if (income.ca?.some(i => i.type === 'self_employment')) {
        forms.push({ code: 'T2125', name: 'Statement of Business Activities', required: true });
      }
      if (income.ca?.some(i => i.type === 'rental')) {
        forms.push({ code: 'T776', name: 'Statement of Real Estate Rentals', required: true });
      }
    }
    
    return forms;
  }
};
