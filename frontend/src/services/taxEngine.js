// Tax calculation service - connects to backend API
const API_URL = 'http://localhost:4000/api';

// Residency calculations
export async function calculateUSResidency(params) {
  const response = await fetch(`${API_URL}/calculations/us-residency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}

export async function calculateCanadaResidency(params) {
  const response = await fetch(`${API_URL}/calculations/ca-residency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}

// Tax calculations
export async function calculateUSTax(income, filingStatus = 'single') {
  const response = await fetch(`${API_URL}/calculations/us-tax`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ income, filingStatus })
  });
  return response.json();
}

export async function calculateCanadaTax(income, province = 'ON') {
  const response = await fetch(`${API_URL}/calculations/ca-tax`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ income, province })
  });
  return response.json();
}

// Foreign Tax Credit
export async function calculateFTC(foreignIncome, foreignTaxPaid, totalTax, totalIncome) {
  const response = await fetch(`${API_URL}/calculations/ftc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foreignIncome, foreignTaxPaid, totalTax, totalIncome })
  });
  return response.json();
}

// Treaty benefits
export async function calculateTreatyBenefits(incomeItems) {
  const response = await fetch(`${API_URL}/calculations/treaty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incomeItems })
  });
  return response.json();
}

// Local tax engine (fallback when API not available)
export const TaxEngine = {
  // US Substantial Presence Test
  calculateUSResidency: (params) => {
    const { daysInUS, daysInUSPrior1, daysInUSPrior2, greenCard } = params;
    
    if (greenCard) {
      return { isResident: true, type: 'Lawful Permanent Resident', citation: 'IRC 7701(b)(1)' };
    }
    
    const weighted = daysInUS + (daysInUSPrior1 / 3) + (daysInUSPrior2 / 6);
    
    if (weighted >= 183) {
      return { isResident: true, type: 'Substantial Presence', weightedDays: weighted, citation: 'IRC 7701(b)(3)' };
    }
    
    return { isResident: false, type: 'Non-resident', weightedDays: weighted };
  },
  
  // Canada Residency
  calculateCanadaResidency: (params) => {
    const { daysInCanada, homeInCanada, spouseInCanada, dependentsInCanada } = params;
    
    let ties = 0;
    if (homeInCanada) ties += 2;
    if (spouseInCanada) ties += 1;
    if (dependentsInCanada) ties += 1;
    
    if (daysInCanada >= 183) {
      return { isResident: true, type: 'Factual Resident', citation: 'ITA 2(1)' };
    }
    if (ties >= 1) {
      return { isResident: true, type: 'Deemed Resident', residentialTies: ties, citation: 'ITA 2(1)' };
    }
    
    return { isResident: false, type: 'Non-resident' };
  },
  
  // US Tax Brackets 2025
  calculateUSTax: (income, filingStatus = 'single') => {
    const brackets = filingStatus === 'married_jointly' ? [
      { max: 23200, rate: 0.10 },
      { max: 94300, rate: 0.12 },
      { max: 201050, rate: 0.22 },
      { max: 383900, rate: 0.24 },
      { max: 487450, rate: 0.32 },
      { max: 731200, rate: 0.35 },
      { max: Infinity, rate: 0.37 }
    ] : [
      { max: 11600, rate: 0.10 },
      { max: 47150, rate: 0.12 },
      { max: 100525, rate: 0.22 },
      { max: 191950, rate: 0.24 },
      { max: 243725, rate: 0.32 },
      { max: 609350, rate: 0.35 },
      { max: Infinity, rate: 0.37 }
    ];
    
    let tax = 0;
    let prevMax = 0;
    
    for (const bracket of brackets) {
      if (income > prevMax) {
        const taxable = Math.min(income, bracket.max) - prevMax;
        tax += taxable * bracket.rate;
        prevMax = bracket.max;
      }
    }
    
    return {
      tax: Math.round(tax),
      effectiveRate: ((tax / income) * 100).toFixed(2),
      citation: 'IRC Section 1'
    };
  },
  
  // Canada Tax (Federal + Ontario)
  calculateCanadaTax: (income, province = 'ON') => {
    const federal = [
      { max: 55867, rate: 0.15 },
      { max: 111733, rate: 0.205 },
      { max: 173205, rate: 0.26 },
      { max: 246752, rate: 0.29 },
      { max: Infinity, rate: 0.33 }
    ];
    
    const provincial = {
      ON: [
        { max: 49231, rate: 0.0505 },
        { max: 98463, rate: 0.0915 },
        { max: 150000, rate: 0.1116 },
        { max: 220000, rate: 0.1216 },
        { max: Infinity, rate: 0.1316 }
      ],
      BC: [
        { max: 47937, rate: 0.0506 },
        { max: 95875, rate: 0.077 },
        { max: 110076, rate: 0.105 },
        { max: 133664, rate: 0.1229 },
        { max: Infinity, rate: 0.168 }
      ]
    };
    
    let fedTax = 0, provTax = 0, prevMax = 0;
    
    for (const bracket of federal) {
      if (income > prevMax) {
        fedTax += (Math.min(income, bracket.max) - prevMax) * bracket.rate;
        prevMax = bracket.max;
      }
    }
    
    prevMax = 0;
    const provBrackets = provincial[province] || provincial.ON;
    for (const bracket of provBrackets) {
      if (income > prevMax) {
        provTax += (Math.min(income, bracket.max) - prevMax) * bracket.rate;
        prevMax = bracket.max;
      }
    }
    
    const total = fedTax + provTax;
    return {
      federalTax: Math.round(fedTax),
      provincialTax: Math.round(provTax),
      totalTax: Math.round(total),
      effectiveRate: ((total / income) * 100).toFixed(2),
      citation: 'ITA 117'
    };
  },
  
  // Foreign Tax Credit
  calculateFTC: (foreignIncome, foreignTaxPaid, totalTax, totalIncome) => {
    const limit = totalTax * (foreignIncome / totalIncome);
    const credit = Math.min(foreignTaxPaid, limit);
    return {
      credit: Math.round(credit),
      carryforward: Math.round(Math.max(0, foreignTaxPaid - limit)),
      citation: 'IRC Section 901'
    };
  }
};
