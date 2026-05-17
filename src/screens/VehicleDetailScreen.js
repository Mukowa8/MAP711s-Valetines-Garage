import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const EmployeePicker = ({ visible, employees, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>SELECT EMPLOYEE</Text>
        {employees.map(emp => (
          <TouchableOpacity key={emp.id} style={styles.empOption} onPress={() => onSelect(emp)}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.accent} />
            <View>
              <Text style={styles.empName}>{emp.name}</Text>
              <Text style={styles.empRole}>{emp.role}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function VehicleDetailScreen({ route, navigation }) {
  const { vehicleId } = route.params;
  const { vehicles, employees, addTask, toggleTask, addTaskNote, checkOutVehicle, getEmployeeName } = useApp();

  const vehicle = vehicles.find(v => v.id === vehicleId);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeTaskNote, setActiveTaskNote] = useState(null);
  const [showEmpPicker, setShowEmpPicker] = useState(false);
  const [pendingToggleTaskId, setPendingToggleTaskId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.textPrimary }}>Vehicle not found.</Text>
      </View>
    );
  }

  const tasks = vehicle.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;

  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.completed) {
      // un-complete — no picker needed
      toggleTask(vehicleId, taskId, null);
    } else {
      setPendingToggleTaskId(taskId);
      setShowEmpPicker(true);
    }
  };

  const handleEmployeeSelect = (emp) => {
    setShowEmpPicker(false);
    if (pendingToggleTaskId) {
      toggleTask(vehicleId, pendingToggleTaskId, emp.id);
      setPendingToggleTaskId(null);
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Task Title Required');
      return;
    }
    addTask(vehicleId, { title: newTaskTitle.trim(), description: newTaskDesc.trim() });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTask(false);
  };

  const handleAddNote = (taskId) => {
    if (!noteText.trim()) return;
    if (!selectedEmployee) {
      Alert.alert('Select an employee first');
      return;
    }
    addTaskNote(vehicleId, taskId, noteText.trim(), selectedEmployee.id);
    setNoteText('');
    setActiveTaskNote(null);
  };

  const handleCheckOut = () => {
    Alert.alert(
      'Check Out Vehicle',
      `Are all repairs complete for ${vehicle.plateNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out', style: 'destructive', onPress: () => {
            checkOutVehicle(vehicleId);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
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
    <View style={styles.container}>
      <EmployeePicker
        visible={showEmpPicker}
        employees={employees}
        onSelect={handleEmployeeSelect}
        onClose={() => { setShowEmpPicker(false); setPendingToggleTaskId(null); }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.plateBadge}>
            <Text style={styles.plate}>{vehicle.plateNumber}</Text>
          </View>
          {vehicle.status === 'in-progress' && (
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => navigation.navigate('Report', { vehicleId })}
            >
              <Ionicons name="document-text-outline" size={18} color={COLORS.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Vehicle Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.vehicleTitle}>{vehicle.make} {vehicle.model}</Text>
          <Text style={styles.vehicleSub}>{vehicle.year} • {vehicle.kilometers?.toLocaleString()} km</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>OWNER</Text>
              <Text style={styles.infoValue}>{vehicle.ownerName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>PHONE</Text>
              <Text style={styles.infoValue}>{vehicle.ownerPhone || '—'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CONDITION</Text>
              <Text style={[styles.infoValue, { color: getConditionColor(vehicle.condition) }]}>
                {vehicle.condition?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CHECKED IN</Text>
              <Text style={styles.infoValue}>{formatDate(vehicle.checkedInAt)} {formatTime(vehicle.checkedInAt)}</Text>
            </View>
          </View>

          {vehicle.conditionNotes ? (
            <View style={styles.notesBox}>
              <Text style={styles.infoLabel}>CONDITION NOTES</Text>
              <Text style={styles.notesText}>{vehicle.conditionNotes}</Text>
            </View>
          ) : null}

          {vehicle.repairReason ? (
            <View style={styles.notesBox}>
              <Text style={styles.infoLabel}>REPAIR REASON</Text>
              <Text style={styles.notesText}>{vehicle.repairReason}</Text>
            </View>
          ) : null}
        </View>

        {/* Tasks */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>SERVICE TASKS</Text>
              <Text style={styles.taskProgress}>{completedCount} / {tasks.length} complete</Text>
            </View>
            {vehicle.status === 'in-progress' && (
              <TouchableOpacity style={styles.addTaskBtn} onPress={() => setShowAddTask(!showAddTask)}>
                <Ionicons name={showAddTask ? 'close' : 'add'} size={18} color={COLORS.bg} />
                <Text style={styles.addTaskBtnText}>{showAddTask ? 'CANCEL' : 'ADD TASK'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Task Form */}
          {showAddTask && (
            <View style={styles.addTaskForm}>
              <TextInput
                style={styles.input}
                placeholder="Task title..."
                placeholderTextColor={COLORS.textMuted}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              <TextInput
                style={[styles.input, { marginTop: SPACING.sm }]}
                placeholder="Description (optional)..."
                placeholderTextColor={COLORS.textMuted}
                value={newTaskDesc}
                onChangeText={setNewTaskDesc}
              />
              <TouchableOpacity style={styles.addTaskSubmit} onPress={handleAddTask}>
                <Text style={styles.addTaskSubmitText}>+ ADD TASK</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Employee selection for notes */}
          <View style={styles.empSelectRow}>
            <Text style={styles.empSelectLabel}>WORKING AS:</Text>
            <TouchableOpacity
              style={styles.empSelectBtn}
              onPress={() => {
                setPendingToggleTaskId(null);
                setShowEmpPicker(true);
              }}
            >
              <Ionicons name="person-circle-outline" size={16} color={selectedEmployee ? COLORS.accent : COLORS.textMuted} />
              <Text style={[styles.empSelectText, selectedEmployee && { color: COLORS.accent }]}>
                {selectedEmployee ? selectedEmployee.name : 'Select Employee'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Task List */}
          {tasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Ionicons name="clipboard-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyTasksText}>No tasks yet. Add service tasks above.</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <View key={task.id} style={[styles.taskCard, task.completed && styles.taskCardDone]}>
                {/* Task Header */}
                <View style={styles.taskHeader}>
                  <TouchableOpacity
                    style={[styles.checkbox, task.completed && styles.checkboxDone]}
                    onPress={() => vehicle.status === 'in-progress' && handleToggleTask(task.id)}
                  >
                    {task.completed && <Ionicons name="checkmark" size={14} color={COLORS.bg} />}
                  </TouchableOpacity>
                  <View style={styles.taskMeta}>
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                      {task.title}
                    </Text>
                    {task.description ? (
                      <Text style={styles.taskDesc}>{task.description}</Text>
                    ) : null}
                    {task.completed && task.completedBy && (
                      <Text style={styles.completedByText}>
                        ✓ Done by {getEmployeeName(task.completedBy)} at {formatTime(task.completedAt)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Notes */}
                {(task.notes || []).length > 0 && (
                  <View style={styles.notesList}>
                    {task.notes.map(note => (
                      <View key={note.id} style={styles.noteItem}>
                        <Text style={styles.noteEmployee}>{getEmployeeName(note.employeeId)}:</Text>
                        <Text style={styles.noteText}>{note.text}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Note */}
                {vehicle.status === 'in-progress' && (
                  activeTaskNote === task.id ? (
                    <View style={styles.addNoteRow}>
                      <TextInput
                        style={styles.noteInput}
                        placeholder="Write a note..."
                        placeholderTextColor={COLORS.textMuted}
                        value={noteText}
                        onChangeText={setNoteText}
                        onSubmitEditing={() => handleAddNote(task.id)}
                      />
                      <TouchableOpacity onPress={() => handleAddNote(task.id)} style={styles.noteSendBtn}>
                        <Ionicons name="send" size={16} color={COLORS.bg} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setActiveTaskNote(null)} style={styles.noteCancelBtn}>
                        <Ionicons name="close" size={16} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.addNoteBtn} onPress={() => {
                      if (!selectedEmployee) {
                        Alert.alert('Select Employee', 'Please select your employee profile first.');
                        return;
                      }
                      setActiveTaskNote(task.id);
                    }}>
                      <Ionicons name="chatbubble-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.addNoteBtnText}>Add note</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Check Out Button */}
      {vehicle.status === 'in-progress' && (
        <View style={styles.checkOutBar}>
          <TouchableOpacity style={styles.checkOutBtn} onPress={handleCheckOut}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.bg} />
            <Text style={styles.checkOutBtnText}>CHECK OUT VEHICLE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.lg, paddingTop: SPACING.xl,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  plateBadge: {
    flex: 1, backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  plate: { color: COLORS.bg, fontWeight: '900', fontSize: 18, letterSpacing: 3 },
  reportBtn: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  infoCard: {
    margin: SPACING.md, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  vehicleTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  vehicleSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2, marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  infoItem: { flex: 1 },
  infoLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  infoValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  notesBox: {
    marginTop: SPACING.sm, backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm, padding: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  notesText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  tasksSection: { paddingHorizontal: SPACING.md },
  tasksSectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  taskProgress: { color: COLORS.accent, fontWeight: '700', fontSize: 12, marginTop: 2 },
  addTaskBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.sm,
  },
  addTaskBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  addTaskForm: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.sm, color: COLORS.textPrimary, fontSize: 14,
  },
  addTaskSubmit: {
    marginTop: SPACING.sm, backgroundColor: COLORS.primary,
    padding: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center',
  },
  addTaskSubmitText: { color: COLORS.bg, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  empSelectRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.sm, padding: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  empSelectLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  empSelectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
  },
  empSelectText: { flex: 1, color: COLORS.textMuted, fontSize: 13 },
  emptyTasks: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyTasksText: { color: COLORS.textMuted, marginTop: SPACING.sm, textAlign: 'center', fontSize: 13 },
  taskCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  taskCardDone: { opacity: 0.75, borderColor: COLORS.success + '44' },
  taskHeader: { flexDirection: 'row', gap: SPACING.sm },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  checkboxDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  taskMeta: { flex: 1 },
  taskTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  taskTitleDone: { color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  taskDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  completedByText: { color: COLORS.success, fontSize: 11, marginTop: 4 },
  notesList: { marginTop: SPACING.sm, paddingLeft: 30, gap: 4 },
  noteItem: { flexDirection: 'row', gap: SPACING.xs },
  noteEmployee: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  noteText: { color: COLORS.textSecondary, fontSize: 12, flex: 1 },
  addNoteRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm, paddingLeft: 30 },
  noteInput: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 4, paddingHorizontal: 8, color: COLORS.textPrimary, fontSize: 13,
  },
  noteSendBtn: { backgroundColor: COLORS.primary, width: 30, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  noteCancelBtn: { backgroundColor: COLORS.surface, width: 30, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  addNoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm, paddingLeft: 30 },
  addNoteBtnText: { color: COLORS.textMuted, fontSize: 12 },
  checkOutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg, padding: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  checkOutBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.danger, padding: SPACING.md, borderRadius: RADIUS.md,
  },
  checkOutBtnText: { color: COLORS.bg, fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg, padding: SPACING.lg,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { color: COLORS.primary, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: SPACING.md },
  empOption: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  empName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  empRole: { color: COLORS.textSecondary, fontSize: 12 },
  cancelBtn: {
    marginTop: SPACING.md, padding: SPACING.md,
    borderRadius: RADIUS.sm, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1 },
});
