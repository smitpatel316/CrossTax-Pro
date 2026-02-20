// CrossTax Pro - Real-Time Tax Liability Dashboard
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTax } from '../context/TaxContext';
import { TaxEngine } from '../services/taxEngine';

// Real-time tax liability calculator
export const useTaxLiability = () => {
  const { taxData } = useTax();
  
  const calculateLiability = () => {
    const usIncome = taxData.income.us?.reduce((sum, i) => sum + i.amount, 0) || 0;
    const caIncome = taxData.income.ca?.reduce((sum, i) => sum + i.amount, 0) || 0;
    const usDeductions = taxData.deductions.us?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const caDeductions = taxData.deductions.ca?.reduce((sum, d) => sum + d.amount, 0) || 0;
    
    const usTaxable = Math.max(0, usIncome - usDeductions);
    const caTaxable = Math.max(0, caIncome - caDeductions);
    
    const usTax = usTaxable > 0 ? TaxEngine.calculateUSTax(usTaxable) : { tax: 0 };
    const caTax = caTaxable > 0 ? TaxEngine.calculateCanadaTax(caTaxable) : { totalTax: 0 };
    
    // Convert to USD
    const cadToUsd = 1.36;
    const totalUS = usTax.tax + caTax.totalTax * cadToUsd;
    
    // Quarterly estimates
    const quarterly = totalUS / 4;
    
    return {
      usIncome,
      caIncome,
      usTaxable,
      caTaxable,
      usTax: usTax.tax,
      caTax: caTax.totalTax,
      totalUS: Math.round(totalUS),
      quarterly: Math.round(quarterly),
      effectiveRate: usTaxable + caTaxable * cadToUsd > 0 
        ? ((totalUS / (usTaxable + caTaxable * cadToUsd)) * 100).toFixed(1)
        : 0
    };
  };
  
  return calculateLiability();
};

export default function TaxDashboard() {
  const liability = useTaxLiability();
  const [projection, setProjection] = useState({
    endOfYear: 0,
    nextQuarter: 0,
    monthlyRunRate: 0
  });
  
  // Calculate projections based on current income
  useEffect(() => {
    const monthsElapsed = new Date().getMonth() + 1; // 1-12
    const monthsRemaining = 12 - monthsElapsed;
    
    // Project to end of year
    const monthlyIncome = liability.totalUS / monthsElapsed;
    const projectedYearEnd = monthlyIncome * 12;
    
    setProjection({
      endOfYear: Math.round(projectedYearEnd),
      nextQuarter: Math.round(monthlyIncome * 3),
      monthlyRunRate: Math.round(monthlyIncome)
    });
  }, [liability.totalUS]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>📊 Tax Liability Dashboard</Text>
        
        {/* Current Liability */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Year Liability</Text>
          <View style={styles.row}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>🇺🇸 US Tax</Text>
              <Text style={styles.statValue}>${liability.usTax.toLocaleString()}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>🇨🇦 Canada Tax</Text>
              <Text style={styles.statValue}>${liability.caTax.toLocaleString()} CAD</Text>
            </View>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total (USD)</Text>
            <Text style={styles.totalValue}>${liability.totalUS.toLocaleString()}</Text>
          </View>
        </View>

        {/* Quarterly Estimates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Quarterly Estimated Payments</Text>
          <View style={styles.quarterlyGrid}>
            <View style={styles.quarter}>
              <Text style={styles.quarterLabel}>Q1 (Apr 15)</Text>
              <Text style={styles.quarterValue}>${liability.quarterly.toLocaleString()}</Text>
            </View>
            <View style={styles.quarter}>
              <Text style={styles.quarterLabel}>Q2 (Jun 15)</Text>
              <Text style={styles.quarterValue}>${liability.quarterly.toLocaleString()}</Text>
            </View>
            <View style={styles.quarter}>
              <Text style={styles.quarterLabel}>Q3 (Sep 15)</Text>
              <Text style={styles.quarterValuearterly.toLocale}>${liability.quString()}</Text>
            </View>
            <View style={styles.quarter}>
              <Text style={styles.quarterLabel}>Q4 (Jan 15)</Text>
              <Text style={styles.quarterValue}>${liability.quarterly.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Projections */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔮 Projections</Text>
          <View style={styles.row}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Monthly Run Rate</Text>
              <Text style={styles.statValue}>${projection.monthlyRunRate.toLocaleString()}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Year End Est.</Text>
              <Text style={styles.statValue}>${projection.endOfYear.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Effective Rate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Effective Tax Rate</Text>
          <View style={styles.rateContainer}>
            <Text style={styles.rateValue}>{liability.effectiveRate}%</Text>
            <Text style={styles.rateNote}>
              {parseFloat(liability.effectiveRate) < 20 
                ? '✅ Below average - great tax efficiency!' 
                : parseFloat(liability.effectiveRate) < 30 
                  ? '📊 Average effective rate'
                  : '⚠️ High effective rate - consider deductions'}
            </Text>
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ Action Items</Text>
          {liability.quarterly > 0 && (
            <Text style={styles.actionItem}>
              • Set aside ${liability.quarterly.toLocaleString()} for quarterly payment
            </Text>
          )}
          {parseFloat(liability.effectiveRate) > 25 && (
            <Text style={styles.actionItem}>
              • Consider maximizing retirement contributions
            </Text>
          )}
          {projection.endOfYear > 100000 && (
            <Text style={styles.actionItem}>
              • Consider tax-loss harvesting opportunities
            </Text>
          )}
          <Text style={styles.actionItem}>
            • Review deductions before year end
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16213e' },
  content: { padding: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statLabel: { color: '#A0AEC0', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2D3748' },
  totalLabel: { color: '#fff', fontSize: 18, fontWeight: '600' },
  totalValue: { color: '#E53E3E', fontSize: 24, fontWeight: 'bold' },
  quarterlyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quarter: { width: '48%', backgroundColor: '#16213e', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  quarterLabel: { color: '#A0AEC0', fontSize: 12 },
  quarterValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  rateContainer: { alignItems: 'center' },
  rateValue: { color: '#38A169', fontSize: 48, fontWeight: 'bold' },
  rateNote: { color: '#A0AEC0', fontSize: 14, marginTop: 8, textAlign: 'center' },
  actionItem: { color: '#A0AEC0', fontSize: 14, marginBottom: 8 },
});
