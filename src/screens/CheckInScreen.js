import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const CONDITION_OPTIONS = ['Good', 'Fair', 'Poor'];

const Field = ({ label, value, onChangeText, placeholder, keyboardType, multiline }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || ''}
      placeholderTextColor={COLORS.textMuted}
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

export default function CheckInScreen({ navigation }) {
  const { checkInVehicle } = useApp();

  const [plateNumber, setPlateNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [condition, setCondition] = useState('Good');
  const [conditionNotes, setConditionNotes] = useState('');
  const [repairReason, setRepairReason] = useState('');

  const handleCheckIn = () => {
    if (!plateNumber.trim() || !make.trim() || !model.trim() || !ownerName.trim()) {
      Alert.alert('Missing Info', 'Please fill in Plate Number, Make, Model, and Owner Name.');
      return;
    }
    const kmNum = parseInt(kilometers.replace(/,/g, ''), 10);
    if (isNaN(kmNum)) {
      Alert.alert('Invalid Kilometers', 'Please enter a valid number for kilometers.');
      return;
    }

    checkInVehicle({
      plateNumber: plateNumber.trim().toUpperCase(),
      make: make.trim(),
      model: model.trim(),
      year: year.trim(),
      kilometers: kmNum,
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      condition,
      conditionNotes: conditionNotes.trim(),
      repairReason: repairReason.trim(),
    });

    Alert.alert('✅ Checked In', `${plateNumber.toUpperCase()} has been checked in.`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const getConditionColor = (cond) => {
    if (cond === 'Good') return COLORS.success;
    if (cond === 'Fair') return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VEHICLE CHECK-IN</Text>
        </View>

        {/* Plate highlight */}
        <View style={styles.plateSection}>
          <Text style={styles.plateLabel}>PLATE NUMBER</Text>
          <TextInput
            style={styles.plateInput}
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="e.g. N 123-456"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
          />
        </View>

        {/* Vehicle Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="car-sport" size={14} color={COLORS.primary} /> VEHICLE INFO
          </Text>
          <Field label="Make" value={make} onChangeText={setMake} placeholder="e.g. Toyota" />
          <Field label="Model" value={model} onChangeText={setModel} placeholder="e.g. Hilux" />
          <Field label="Year" value={year} onChangeText={setYear} placeholder="e.g. 2019" keyboardType="numeric" />
          <Field label="Kilometers Driven" value={kilometers} onChangeText={setKilometers} placeholder="e.g. 85000" keyboardType="numeric" />
        </View>

        {/* Owner Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="person" size={14} color={COLORS.primary} /> OWNER INFO
          </Text>
          <Field label="Owner Name" value={ownerName} onChangeText={setOwnerName} placeholder="Full Name" />
          <Field label="Phone Number" value={ownerPhone} onChangeText={setOwnerPhone} placeholder="+264 81 000 0000" keyboardType="phone-pad" />
        </View>

        {/* Condition */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} /> VEHICLE CONDITION
          </Text>
          <Text style={styles.label}>Condition at Check-In</Text>
          <View style={styles.conditionRow}>
            {CONDITION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.conditionBtn,
                  condition === opt && { backgroundColor: getConditionColor(opt), borderColor: getConditionColor(opt) }
                ]}
                onPress={() => setCondition(opt)}
              >
                <Text style={[
                  styles.conditionBtnText,
                  condition === opt && { color: COLORS.onPrimary }
                ]}>
                  {opt.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Field
            label="Condition Notes (damage, issues)"
            value={conditionNotes}
            onChangeText={setConditionNotes}
            placeholder="Describe visible damage, dents, scratches..."
            multiline
          />
        </View>

        {/* Repair Reason */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="construct" size={14} color={COLORS.primary} /> REPAIR REASON
          </Text>
          <Field
            label="Reason for Visit"
            value={repairReason}
            onChangeText={setRepairReason}
            placeholder="What needs to be repaired or serviced..."
            multiline
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleCheckIn}>
          <Ionicons name="log-in-outline" size={20} color={COLORS.onPrimary} />
          <Text style={styles.submitBtnText}>COMPLETE CHECK-IN</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.lg, paddingTop: SPACING.xl,
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '900', letterSpacing: -0.2 },
  plateSection: {
    margin: SPACING.md, padding: SPACING.lg,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    borderWidth: 0, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.24, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  plateLabel: { color: '#BFDBFE', fontSize: 10, fontWeight: '800', letterSpacing: 3, marginBottom: SPACING.sm },
  plateInput: {
    color: COLORS.onPrimary, fontSize: 28, fontWeight: '900',
    letterSpacing: 4, textAlign: 'center', width: '100%',
  },
  card: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  cardTitle: { color: COLORS.primary, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: SPACING.md },
  fieldWrap: { marginBottom: SPACING.md },
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 12, paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary, fontSize: 15,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  conditionRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  conditionBtn: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  conditionBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    margin: SPACING.md, backgroundColor: COLORS.primary,
    padding: SPACING.md, borderRadius: RADIUS.md,
    shadowColor: COLORS.primary, shadowOpacity: 0.24, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  submitBtnText: { color: COLORS.onPrimary, fontWeight: '900', fontSize: 14, letterSpacing: 2 },
});
