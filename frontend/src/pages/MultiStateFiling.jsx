// CrossTax Pro - Multi-State Filing Support
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

// US State Tax Rates (simplified 2025)
const STATE_TAX_RATES = {
  AL: { name: 'Alabama', rate: 0.05, hasLocal: true },
  AK: { name: 'Alaska', rate: 0, hasLocal: false },
  AZ: { name: 'Arizona', rate: 0.025, hasLocal: false },
  AR: { name: 'Arkansas', rate: 0.044, hasLocal: true },
  CA: { name: 'California', rate: 0.0930, hasLocal: true },
  CO: { name: 'Colorado', rate: 0.044, hasLocal: true },
  CT: { name: 'Connecticut', rate: 0.0699, hasLocal: false },
  DE: { name: 'Delaware', rate: 0.066, hasLocal: false },
  FL: { name: 'Florida', rate: 0, hasLocal: false },
  GA: { name: 'Georgia', rate: 0.055, hasLocal: true },
  HI: { name: 'Hawaii', rate: 0.11, hasLocal: true },
  ID: { name: 'Idaho', rate: 0.058, hasLocal: false },
  IL: { name: 'Illinois', rate: 0.0495, hasLocal: true },
  IN: { name: 'Indiana', rate: 0.0315, hasLocal: false },
  IA: { name: 'Iowa', rate: 0.057, hasLocal: true },
  KS: { name: 'Kansas', rate: 0.057, hasLocal: true },
  KY: { name: 'Kentucky', rate: 0.04, hasLocal: true },
  LA: { name: 'Louisiana', rate: 0.0425, hasLocal: true },
  ME: { name: 'Maine', rate: 0.0715, hasLocal: true },
  MD: { name: 'Maryland', rate: 0.0575, hasLocal: true },
  MA: { name: 'Massachusetts', rate: 0.05, hasLocal: true },
  MI: { name: 'Michigan', rate: 0.0425, hasLocal: true },
  MN: { name: 'Minnesota', rate: 0.0985, hasLocal: true },
  MS: { name: 'Mississippi', rate: 0.05, hasLocal: true },
  MO: { name: 'Missouri', rate: 0.048, hasLocal: true },
  MT: { name: 'Montana', rate: 0.059, hasLocal: false },
  NE: { name: 'Nebraska', rate: 0.0664, hasLocal: true },
  NV: { name: 'Nevada', rate: 0, hasLocal: true },
  NH: { name: 'New Hampshire', rate: 0, hasLocal: false },
  NJ: { name: 'New Jersey', rate: 0.1075, hasLocal: true },
  NM: { name: 'New Mexico', rate: 0.059, hasLocal: true },
  NY: { name: 'New York', rate: 0.109, hasLocal: true },
  NC: { name: 'North Carolina', rate: 0.0525, hasLocal: true },
  ND: { name: 'North Dakota', rate: 0.029, hasLocal: false },
  OH: { name: 'Ohio', rate: 0.0399, hasLocal: true },
  OK: { name: 'Oklahoma', rate: 0.0475, hasLocal: true },
  OR: { name: 'Oregon', rate: 0.099, hasLocal: false },
  PA: { name: 'Pennsylvania', rate: 0.0307, hasLocal: true },
  RI: { name: 'Rhode Island', rate: 0.0599, hasLocal: true },
  SC: { name: 'South Carolina', rate: 0.064, hasLocal: true },
  SD: { name: 'South Dakota', rate: 0, hasLocal: false },
  TN: { name: 'Tennessee', rate: 0, hasLocal: false },
  TX: { name: 'Texas', rate: 0, hasLocal: false },
  UT: { name: 'Utah', rate: 0.0465, hasLocal: true },
  VT: { name: 'Vermont', rate: 0.0875, hasLocal: true },
  VA: { name: 'Virginia', rate: 0.0575, hasLocal: true },
  WA: { name: 'Washington', rate: 0, hasLocal: false },
  WV: { name: 'West Virginia', rate: 0.055, hasLocal: true },
  WI: { name: 'Wisconsin', rate: 0.0765, hasLocal: true },
  WY: { name: 'Wyoming', rate: 0, hasLocal: false },
  DC: { name: 'Washington DC', rate: 0.1075, hasLocal: false },
};

// No income tax states
const NO_TAX_STATES = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'];

export default function MultiStateFiling() {
  const [states, setStates] = useState([]);
  const [income, setIncome] = useState(0);
  const [workingStates, setWorkingStates] = useState([]);

  const addState = (stateCode) => {
    if (!states.find(s => s.code === stateCode)) {
      const stateInfo = STATE_TAX_RATES[stateCode];
      setStates([...states, {
        code: stateCode,
        name: stateInfo.name,
        rate: stateInfo.rate,
        income: 0,
        hasLocal: stateInfo.hasLocal,
        localRate: stateInfo.hasLocal ? 0.01 : 0
      }]);
    }
  };

  const updateStateIncome = (stateCode, amount) => {
    setStates(states.map(s => 
      s.code === stateCode ? { ...s, income: parseFloat(amount) || 0 } : s
    ));
    // Update working states for allocation
    const totalIncome = states.reduce((sum, s) => sum + (s.code === stateCode ? parseFloat(amount) || 0 : s.income), 0);
    setIncome(totalIncome);
  };

  const calculateTotalTax = () => {
    return states.reduce((total, state) => {
      const stateTax = state.income * state.rate;
      const localTax = state.income * state.localRate;
      return total + stateTax + localTax;
    }, 0);
  };

  const getStateSuggestions = () => {
    // Common states with income
    return Object.entries(STATE_TAX_RATES)
      .filter(([code]) => !states.find(s => s.code === code))
      .slice(0, 5)
      .map(([code, info]) => ({ code, ...info }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🌎 Multi-State Filing</Text>
        
        {/* Quick Add States */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add State</Text>
          <View style={styles.stateGrid}>
            {Object.entries(STATE_TAX_RATES)
              .filter(([code]) => !states.find(s => s.code === code))
              .slice(0, 12)
              .map(([code, info]) => (
                <TouchableOpacity
                  key={code}
                  style={styles.stateButton}
                  onPress={() => addState(code)}
                >
                  <Text style={styles.stateCode}>{code}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* State List */}
        {states.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your States</Text>
            {states.map(state => (
              <View key={state.code} style={styles.stateItem}>
                <View style={styles.stateHeader}>
                  <Text style={styles.stateName}>{state.name}</Text>
                  <TouchableOpacity
                    onPress={() => setStates(states.filter(s => s.code !== state.code))}
                  >
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.incomeRow}>
                  <Text style={styles.label}>Income in {state.code}:</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.dollarSign}>$</Text>
                    <input
                      type="number"
                      value={state.income || ''}
                      onChangeText={(val) => updateStateIncome(state.code, val)}
                      style={styles.input}
                      placeholder="0"
                    />
                  </View>
                </View>

                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>State Tax ({state.rate * 100}%):</Text>
                  <Text style={styles.taxValue}>
                    ${(state.income * state.rate).toLocaleString()}
                  </Text>
                </View>

                {state.hasLocal && (
                  <View style={styles.taxRow}>
                    <Text style={styles.taxLabel}>Local Tax ({state.localRate * 100}%):</Text>
                    <Text style={styles.taxValue}>
                      ${(state.income * state.localRate).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        {states.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Total Multi-State Tax</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Income:</Text>
              <Text style={styles.summaryValue}>
                ${states.reduce((sum, s) => sum + s.income, 0).toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total State Tax:</Text>
              <Text style={[styles.summaryValue, styles.taxTotal]}>
                ${calculateTotalTax().toLocaleString()}
              </Text>
            </View>

            {calculateTotalTax() === 0 && (
              <View style={styles.noTax}>
                <Text style={styles.noTaxEmoji}>🎉</Text>
                <Text style={styles.noTaxText}>
                  No state income tax! Consider these states: {NO_TAX_STATES.join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Multi-State Filing Tips</Text>
          <Text style={styles.infoText}>
            • Most states tax income earned within their borders{'\n'}
            • Some states (CA, NY) tax worldwide income{'\n'}
            • You may need to file multiple state returns{'\n'}
            • Credit for taxes paid to other states may apply{'\n'}
            • Consider moving to a no-tax state for big savings
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
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  stateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stateButton: { width: 50, height: 40, backgroundColor: '#2D3748', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stateCode: { color: '#fff', fontWeight: '600', fontSize: 12 },
  stateItem: { backgroundColor: '#16213e', borderRadius: 8, padding: 12, marginBottom: 12 },
  stateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stateName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  removeButton: { color: '#E53E3E', fontSize: 18 },
  incomeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { color: '#A0AEC0', flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 8 },
  dollarSign: { color: '#A0AEC0', marginRight: 4 },
  input: { backgroundColor: 'transparent', color: '#fff', padding: 8, width: 100, fontSize: 16 },
  taxRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  taxLabel: { color: '#A0AEC0', fontSize: 14 },
  taxValue: { color: '#fff', fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#A0AEC0' },
  summaryValue: { color: '#fff', fontWeight: '600', fontSize: 18 },
  taxTotal: { color: '#E53E3E' },
  noTax: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, backgroundColor: '#38A169', borderRadius: 8 },
  noTaxEmoji: { fontSize: 24, marginRight: 8 },
  noTaxText: { color: '#fff', flex: 1, fontSize: 14 },
  infoCard: { backgroundColor: '#2D3748', borderRadius: 12, padding: 16 },
  infoTitle: { color: '#fff', fontWeight: '600', marginBottom: 8 },
  infoText: { color: '#A0AEC0', fontSize: 14, lineHeight: 22 },
});
