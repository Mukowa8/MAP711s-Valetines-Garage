import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

export default function EmployeesScreen() {
  const { employees, vehicles, addEmployee } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const getTaskCount = (empId) => {
    let count = 0;
    vehicles.forEach(v => {
      (v.tasks || []).forEach(t => {
        if (t.completedBy === empId) count++;
      });
    });
    return count;
  };

  const handleAdd = () => {
    if (!name.trim() || !role.trim()) {
      Alert.alert('Missing Fields', 'Please enter a name and role.');
      return;
    }
    addEmployee({ name: name.trim(), role: role.trim() });
    setName('');
    setRole('');
    setShowAdd(false);
  };

  const COLORS_LIST = [COLORS.primary, COLORS.accent, COLORS.danger, COLORS.success, '#A78BFA', '#F472B6'];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>STAFF</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(!showAdd)}>
            <Ionicons name={showAdd ? 'close' : 'add'} size={18} color={COLORS.onPrimary} />
            <Text style={styles.addBtnText}>{showAdd ? 'CANCEL' : 'ADD STAFF'}</Text>
          </TouchableOpacity>
        </View>

        {/* Add Employee Form */}
        {showAdd && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>NEW EMPLOYEE</Text>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sarah Johnson"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.label}>Role / Position</Text>
            <TextInput
              style={styles.input}
              value={role}
              onChangeText={setRole}
              placeholder="e.g. Senior Mechanic"
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>ADD EMPLOYEE</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{employees.length}</Text>
            <Text style={styles.statLabel}>STAFF</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {vehicles.reduce((acc, v) => acc + (v.tasks?.filter(t => t.completed)?.length || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>TASKS DONE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {vehicles.filter(v => v.status === 'in-progress').length}
            </Text>
            <Text style={styles.statLabel}>ACTIVE JOBS</Text>
          </View>
        </View>

        {/* Employee Cards */}
        <View style={styles.section}>
          {employees.map((emp, idx) => {
            const tasksDone = getTaskCount(emp.id);
            const color = COLORS_LIST[idx % COLORS_LIST.length];
            return (
              <View key={emp.id} style={styles.empCard}>
                <View style={[styles.avatar, { backgroundColor: color + '22', borderColor: color }]}>
                  <Text style={[styles.avatarInitial, { color }]}>{emp.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.empInfo}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empRole}>{emp.role}</Text>
                </View>
                <View style={styles.empStats}>
                  <Text style={styles.empTaskCount}>{tasksDone}</Text>
                  <Text style={styles.empTaskLabel}>tasks</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Per-employee task breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TASK BREAKDOWN</Text>
          {employees.map((emp) => {
            const tasksDone = getTaskCount(emp.id);
            const allDone = vehicles.reduce((acc, v) => acc + (v.tasks?.filter(t => t.completed)?.length || 0), 0);
            const pct = allDone > 0 ? Math.round((tasksDone / allDone) * 100) : 0;
            return (
              <View key={emp.id} style={styles.breakdownRow}>
                <Text style={styles.breakdownName} numberOfLines={1}>{emp.name}</Text>
                <View style={styles.breakdownBarBg}>
                  <View style={[styles.breakdownBarFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.breakdownPct}>{tasksDone}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, paddingTop: SPACING.xl,
    backgroundColor: COLORS.bg,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999,
    shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  addBtnText: { color: COLORS.onPrimary, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  addForm: {
    margin: SPACING.md, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  formTitle: { color: COLORS.primary, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: SPACING.md },
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 12, paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary, fontSize: 14,
    marginBottom: SPACING.md,
  },
  submitBtn: {
    backgroundColor: COLORS.primary, padding: SPACING.md,
    borderRadius: RADIUS.sm, alignItems: 'center',
  },
  submitBtnText: { color: COLORS.onPrimary, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  statsBanner: {
    flexDirection: 'row', marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '900' },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.sm },
  section: { paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: SPACING.sm },
  empCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: 20, fontWeight: '900' },
  empInfo: { flex: 1 },
  empName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  empRole: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  empStats: { alignItems: 'center' },
  empTaskCount: { color: COLORS.primary, fontSize: 22, fontWeight: '900' },
  empTaskLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  breakdownName: { color: COLORS.textSecondary, fontSize: 12, width: 90 },
  breakdownBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  breakdownBarFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3, minWidth: 3 },
  breakdownPct: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
});
