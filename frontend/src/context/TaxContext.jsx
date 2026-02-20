import React, { createContext, useContext, useState } from 'react';

const TaxContext = createContext(null);

const STEPS = ['dashboard', 'residency', 'income', 'deductions', 'documents', 'filing', 'review'];

export function TaxProvider({ children }) {
  const [taxData, setTaxData] = useState({
    user: {
      firstName: '',
      lastName: '',
      email: '',
    },
    taxYear: new Date().getFullYear() - 1,
    residency: {
      us: {},
      ca: {},
    },
    income: {
      us: [],
      ca: [],
    },
    deductions: {
      us: [],
      ca: [],
    },
    credits: {
      us: [],
      ca: [],
    },
    documents: [],
    calculations: {},
  });

  const [currentStep, setCurrentStep] = useState('dashboard');

  const updateTaxData = (updates) => {
    setTaxData(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const addIncome = (country, incomeItem) => {
    setTaxData(prev => ({
      ...prev,
      income: {
        ...prev.income,
        [country]: [...prev.income[country], { ...incomeItem, id: Date.now() }],
      },
    }));
  };

  const removeIncome = (country, incomeId) => {
    setTaxData(prev => ({
      ...prev,
      income: {
        ...prev.income,
        [country]: prev.income[country].filter(i => i.id !== incomeId),
      },
    }));
  };

  const addDeduction = (country, deductionItem) => {
    setTaxData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [country]: [...prev.deductions[country], { ...deductionItem, id: Date.now() }],
      },
    }));
  };

  const removeDeduction = (country, deductionId) => {
    setTaxData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [country]: prev.deductions[country].filter(d => d.id !== deductionId),
      },
    }));
  };

  const setStep = (step) => {
    if (STEPS.includes(step)) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const calculateTotals = () => {
    const usIncome = taxData.income.us.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const caIncome = taxData.income.ca.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const usDeductions = taxData.deductions.us.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const caDeductions = taxData.deductions.ca.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    return {
      usIncome,
      caIncome,
      usDeductions,
      caDeductions,
      totalUSIncome: usIncome + (caIncome * 1.36), // Simplified conversion
    };
  };

  return (
    <TaxContext.Provider
      value={{
        taxData,
        updateTaxData,
        addIncome,
        removeIncome,
        addDeduction,
        removeDeduction,
        currentStep,
        setStep,
        nextStep,
        prevStep,
        calculateTotals,
        steps: STEPS,
      }}
    >
      {children}
    </TaxContext.Provider>
  );
}

export function useTax() {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTax must be used within a TaxProvider');
  }
  return context;
}

export default TaxContext;
