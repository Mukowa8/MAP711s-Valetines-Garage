import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const TAB_VEHICLES = 'vehicles';
const TAB_EMPLOYEES = 'employees';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function VehicleReport({ vehicle, getEmployeeName }) {
  const tasks = vehicle.tasks || [];
  const done = tasks.filter(t => t.completed).length;
  const getConditionColor = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c === 'good') return COLORS.success;
    if (c === 'fair') return COLORS.warning;
    if (c === 'poor') return COLORS.danger;
    return COLORS.textSecondary;
  };

  return (
    <View style={styles.reportCard}>
      {/* Header */}
      <View style={styles.reportHeader}>
        <View style={styles.plateBadge}>
          <Text style={styles.plate}>{vehicle.plateNumber}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { borderColor: vehicle.status === 'completed' ? COLORS.success : COLORS.warning }
        ]}>
          <Text style={[
            styles.statusText,
            { color: vehicle.status === 'completed' ? COLORS.success : COLORS.warning }
          ]}>
            {vehicle.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
          </Text>
        </View>
      </View>

      <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model} {vehicle.year}</Text>
      <Text style={styles.vehicleOwner}>{vehicle.ownerName} {vehicle.ownerPhone ? `• ${vehicle.ownerPhone}` : ''}</Text>

      <View style={styles.divider} />

      {/* Details */}
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>KILOMETERS</Text>
          <Text style={styles.detailValue}>{vehicle.kilometers?.toLocaleString()} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>CONDITION</Text>
          <Text style={[styles.detailValue, { color: getConditionColor(vehicle.condition) }]}>
            {vehicle.condition?.toUpperCase()}
          </Text>
        </View>
      </View>

      {vehicle.conditionNotes ? (
        <View style={styles.noteBox}>
          <Text style={styles.detailLabel}>CONDITION NOTES</Text>
          <Text style={styles.noteText}>{vehicle.conditionNotes}</Text>
        </View>
      ) : null}

      {vehicle.repairReason ? (
        <View style={styles.noteBox}>
          <Text style={styles.detailLabel}>REPAIR REASON</Text>
          <Text style={styles.noteText}>{vehicle.repairReason}</Text>
        </View>
      ) : null}

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>CHECKED IN</Text>
          <Text style={styles.detailValue}>{formatDate(vehicle.checkedInAt)}</Text>
        </View>
        {vehicle.checkedOutAt && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>CHECKED OUT</Text>
            <Text style={styles.detailValue}>{formatDate(vehicle.checkedOutAt)}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Tasks */}
      <Text style={styles.sectionTitle}>TASKS ({done}/{tasks.length})</Text>
      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks recorded.</Text>
      ) : (
        tasks.map(task => (
          <View key={task.id} style={styles.taskRow}>
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={task.completed ? COLORS.success : COLORS.textMuted}
            />
            <View style={styles.taskContent}>
              <Text style={[styles.taskTitle, task.completed && styles.taskDone]}>{task.title}</Text>
              {task.completed && task.completedBy && (
                <Text style={styles.taskCompletedBy}>
                  by {getEmployeeName(task.completedBy)} at {formatDate(task.completedAt)}
                </Text>
              )}
              {(task.notes || []).map(note => (
                <View key={note.id} style={styles.noteRow}>
                  <Text style={styles.noteEmp}>{getEmployeeName(note.employeeId)}:</Text>
                  <Text style={styles.noteTextInline}>{note.text}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function EmployeeReport({ employee, vehicles, getEmployeeName }) {
  // Find all tasks done by this employee
  const completedTasks = [];
  vehicles.forEach(v => {
    (v.tasks || []).forEach(t => {
      if (t.completedBy === employee.id) {
        completedTasks.push({ ...t, vehiclePlate: v.plateNumber, vehicleName: `${v.make} ${v.model}` });
      }
    });
  });

  return (
    <View style={styles.reportCard}>
      <View style={styles.empHeader}>
        <View style={styles.empAvatar}>
          <Text style={styles.empInitial}>{employee.name[0]}</Text>
        </View>
        <View>
          <Text style={styles.empName}>{employee.name}</Text>
          <Text style={styles.empRole}>{employee.role}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>COMPLETED TASKS ({completedTasks.length})</Text>
      {completedTasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks completed yet.</Text>
      ) : (
        completedTasks.map(task => (
          <View key={task.id} style={styles.taskRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskCompletedBy}>{task.vehiclePlate} — {task.vehicleName}</Text>
              <Text style={styles.taskCompletedBy}>{formatDate(task.completedAt)}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

export default function ReportsScreen({ route }) {
  const { vehicles, employees, getEmployeeName } = useApp();
  const [tab, setTab] = useState(route?.params?.vehicleId ? TAB_VEHICLES : TAB_VEHICLES);

  // If navigated from a vehicle, highlight that vehicle first
  const vehicleId = route?.params?.vehicleId;
  const sortedVehicles = vehicleId
    ? [vehicles.find(v => v.id === vehicleId), ...vehicles.filter(v => v.id !== vehicleId)].filter(Boolean)
    : vehicles;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REPORTS</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === TAB_VEHICLES && styles.tabActive]}
          onPress={() => setTab(TAB_VEHICLES)}
        >
          <Ionicons name="car-sport" size={14} color={tab === TAB_VEHICLES ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, tab === TAB_VEHICLES && styles.tabTextActive]}>VEHICLES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === TAB_EMPLOYEES && styles.tabActive]}
          onPress={() => setTab(TAB_EMPLOYEES)}
        >
          <Ionicons name="people" size={14} color={tab === TAB_EMPLOYEES ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, tab === TAB_EMPLOYEES && styles.tabTextActive]}>EMPLOYEES</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}>
        {tab === TAB_VEHICLES ? (
          sortedVehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyStateText}>No vehicle records yet.</Text>
            </View>
          ) : (
            sortedVehicles.map(v => (
              <VehicleReport key={v.id} vehicle={v} getEmployeeName={getEmployeeName} />
            ))
          )
        ) : (
          employees.map(emp => (
            <EmployeeReport key={emp.id} employee={emp} vehicles={vehicles} getEmployeeName={getEmployeeName} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    padding: SPACING.lg, paddingTop: SPACING.xl,
    backgroundColor: COLORS.bg,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: 4,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.xs, paddingVertical: 12,
    borderRadius: RADIUS.sm,
  },
  tabActive: { backgroundColor: '#DBEAFE' },
  tabText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 11, letterSpacing: 2 },
  tabTextActive: { color: COLORS.primary },
  reportCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  plateBadge: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  plate: { color: COLORS.onPrimary, fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  statusBadge: { borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: RADIUS.sm },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  vehicleName: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  vehicleOwner: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  detailRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  detailItem: { flex: 1 },
  detailLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  detailValue: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  noteBox: { backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  noteText: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: SPACING.sm },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },
  taskRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm, alignItems: 'flex-start' },
  taskContent: { flex: 1 },
  taskTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  taskDone: { color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  taskCompletedBy: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  noteRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  noteEmp: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  noteTextInline: { color: COLORS.textSecondary, fontSize: 11, flex: 1 },
  empHeader: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center', marginBottom: SPACING.sm },
  empAvatar: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  empInitial: { color: COLORS.onPrimary, fontWeight: '900', fontSize: 20 },
  empName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  empRole: { color: COLORS.textSecondary, fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateText: { color: COLORS.textMuted, fontSize: 15, marginTop: SPACING.md },
});
