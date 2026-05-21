import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const StatCard = ({ icon, label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color || COLORS.primary }]}>
    <Ionicons name={icon} size={22} color={color || COLORS.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const { vehicles, employees } = useApp();

  const active = vehicles.filter(v => v.status === 'in-progress');
  const completed = vehicles.filter(v => v.status === 'completed');
  const totalTasks = active.reduce((acc, v) => acc + (v.tasks?.length || 0), 0);
  const doneTasks = active.reduce((acc, v) => acc + (v.tasks?.filter(t => t.completed)?.length || 0), 0);

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getConditionColor = (cond) => {
    if (!cond) return COLORS.textMuted;
    const c = cond.toLowerCase();
    if (c === 'good') return COLORS.success;
    if (c === 'fair') return COLORS.warning;
    if (c === 'poor') return COLORS.danger;
    return COLORS.textSecondary;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>VG</Text>
          </View>
          <View>
            <Text style={styles.headerSub}>Service Management</Text>
            <Text style={styles.headerTitle}>Valentine's Garage</Text>
          </View>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard icon="car-sport" label="Active" value={active.length} color={COLORS.primary} />
        <StatCard icon="checkmark-circle" label="Done Today" value={completed.length} color={COLORS.success} />
        <StatCard icon="people" label="Staff" value={employees.length} color={COLORS.accent} />
      </View>

      {/* Task progress */}
      {active.length > 0 && (
        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>TASK PROGRESS</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{doneTasks} / {totalTasks} tasks completed</Text>
            <Text style={styles.progressPct}>
              {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {
              width: totalTasks > 0 ? `${(doneTasks / totalTasks) * 100}%` : '0%'
            }]} />
          </View>
        </View>
      )}

      {/* Active Vehicles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>VEHICLES IN GARAGE</Text>
          <TouchableOpacity
            style={styles.checkInBtn}
            onPress={() => navigation.navigate('CheckIn')}
          >
            <Ionicons name="add" size={16} color={COLORS.onPrimary} />
            <Text style={styles.checkInBtnText}>NEW CHECK-IN</Text>
          </TouchableOpacity>
        </View>

        {active.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No vehicles in the garage</Text>
            <Text style={styles.emptySubText}>Tap CHECK IN to add a vehicle</Text>
          </View>
        ) : (
          active.map(vehicle => (
            <TouchableOpacity
              key={vehicle.id}
              style={styles.vehicleCard}
              onPress={() => navigation.navigate('VehicleDetail', { vehicleId: vehicle.id })}
            >
              <View style={styles.vehicleCardTop}>
                <View style={styles.vehiclePlateWrap}>
                  <Text style={styles.vehiclePlate}>{vehicle.plateNumber}</Text>
                </View>
                <View style={[styles.conditionBadge, { borderColor: getConditionColor(vehicle.condition) }]}>
                  <Text style={[styles.conditionText, { color: getConditionColor(vehicle.condition) }]}>
                    {vehicle.condition?.toUpperCase() || 'N/A'}
                  </Text>
                </View>
              </View>
              <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model} ({vehicle.year})</Text>
              <Text style={styles.vehicleOwner}>{vehicle.ownerName}</Text>
              <View style={styles.vehicleFooter}>
                <Text style={styles.vehicleMeta}>
                  <Ionicons name="speedometer-outline" size={12} color={COLORS.textSecondary} /> {vehicle.kilometers?.toLocaleString()} km
                </Text>
                <Text style={styles.vehicleMeta}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} /> {formatDate(vehicle.checkedInAt)}
                </Text>
                <Text style={styles.taskCount}>
                  {vehicle.tasks?.filter(t => t.completed).length || 0}/{vehicle.tasks?.length || 0} tasks
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent completed */}
      {completed.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENTLY COMPLETED</Text>
          {completed.slice(-3).reverse().map(vehicle => (
            <TouchableOpacity
              key={vehicle.id}
              style={[styles.vehicleCard, styles.completedCard]}
              onPress={() => navigation.navigate('Report', { vehicleId: vehicle.id })}
            >
              <View style={styles.vehicleCardTop}>
                <Text style={styles.vehiclePlateSmall}>{vehicle.plateNumber}</Text>
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark" size={12} color={COLORS.success} />
                  <Text style={styles.completedBadgeText}>DONE</Text>
                </View>
              </View>
              <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
              <Text style={styles.vehicleMeta}>Checked out: {formatDate(vehicle.checkedOutAt)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, paddingTop: SPACING.xl,
    backgroundColor: COLORS.bg,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  logoMark: {
    width: 54, height: 54, borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0F172A', shadowOpacity: 0.12, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  logoText: { color: COLORS.onPrimary, fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  headerSub: { color: COLORS.accent, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 25, fontWeight: '900', letterSpacing: -0.4 },
  headerBadge: {
    width: 46, height: 46, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, gap: SPACING.sm },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, borderLeftWidth: 4, gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  statValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  progressCard: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: SPACING.sm },
  progressText: { color: COLORS.textSecondary, fontSize: 13 },
  progressPct: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  progressBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  section: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: SPACING.sm },
  checkInBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999,
    shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  checkInBtnText: { color: COLORS.onPrimary, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyText: { color: COLORS.textSecondary, marginTop: SPACING.sm, fontSize: 15 },
  emptySubText: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  vehicleCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  completedCard: { opacity: 0.7 },
  vehicleCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  vehiclePlateWrap: {
    backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999,
  },
  vehiclePlate: { color: COLORS.onPrimary, fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  vehiclePlateSmall: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 13 },
  conditionBadge: { borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: RADIUS.sm },
  conditionText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  vehicleName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  vehicleOwner: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  vehicleFooter: { flexDirection: 'row', marginTop: SPACING.sm, gap: SPACING.md, alignItems: 'center' },
  vehicleMeta: { color: COLORS.textSecondary, fontSize: 12 },
  taskCount: { marginLeft: 'auto', color: COLORS.accent, fontWeight: '700', fontSize: 12 },
  completedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.success, paddingVertical: 2, paddingHorizontal: 8, borderRadius: RADIUS.sm,
  },
  completedBadgeText: { color: COLORS.success, fontSize: 10, fontWeight: '700' },
});
