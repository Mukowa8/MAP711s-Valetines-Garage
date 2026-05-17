import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const STORAGE_KEY = '@valentine_garage_data';

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export function AppProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([
    { id: 'emp1', name: 'John Smith', role: 'Senior Mechanic' },
    { id: 'emp2', name: 'Maria Garcia', role: 'Mechanic' },
    { id: 'emp3', name: 'David Lee', role: 'Junior Mechanic' },
    { id: 'emp4', name: 'Valentine', role: 'Owner / Manager' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.employees) setEmployees(data.employees);
      }
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newVehicles, newEmployees) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        vehicles: newVehicles,
        employees: newEmployees,
      }));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  // --- VEHICLE ACTIONS ---
  const checkInVehicle = (vehicleData) => {
    const newVehicle = {
      id: generateId(),
      ...vehicleData,
      checkedInAt: new Date().toISOString(),
      status: 'in-progress',
      tasks: [],
    };
    const updated = [...vehicles, newVehicle];
    setVehicles(updated);
    saveData(updated, employees);
    return newVehicle.id;
  };

  const updateVehicle = (vehicleId, updates) => {
    const updated = vehicles.map(v => v.id === vehicleId ? { ...v, ...updates } : v);
    setVehicles(updated);
    saveData(updated, employees);
  };

  const checkOutVehicle = (vehicleId) => {
    const updated = vehicles.map(v =>
      v.id === vehicleId ? { ...v, status: 'completed', checkedOutAt: new Date().toISOString() } : v
    );
    setVehicles(updated);
    saveData(updated, employees);
  };

  // --- TASK ACTIONS ---
  const addTask = (vehicleId, taskData) => {
    const newTask = {
      id: generateId(),
      ...taskData,
      createdAt: new Date().toISOString(),
      completed: false,
      completedBy: null,
      completedAt: null,
      notes: [],
    };
    const updated = vehicles.map(v =>
      v.id === vehicleId ? { ...v, tasks: [...(v.tasks || []), newTask] } : v
    );
    setVehicles(updated);
    saveData(updated, employees);
  };

  const toggleTask = (vehicleId, taskId, employeeId) => {
    const updated = vehicles.map(v => {
      if (v.id !== vehicleId) return v;
      const tasks = (v.tasks || []).map(t => {
        if (t.id !== taskId) return t;
        const nowCompleted = !t.completed;
        return {
          ...t,
          completed: nowCompleted,
          completedBy: nowCompleted ? employeeId : null,
          completedAt: nowCompleted ? new Date().toISOString() : null,
        };
      });
      return { ...v, tasks };
    });
    setVehicles(updated);
    saveData(updated, employees);
  };

  const addTaskNote = (vehicleId, taskId, note, employeeId) => {
    const updated = vehicles.map(v => {
      if (v.id !== vehicleId) return v;
      const tasks = (v.tasks || []).map(t => {
        if (t.id !== taskId) return t;
        const newNote = {
          id: generateId(),
          text: note,
          employeeId,
          createdAt: new Date().toISOString(),
        };
        return { ...t, notes: [...(t.notes || []), newNote] };
      });
      return { ...v, tasks };
    });
    setVehicles(updated);
    saveData(updated, employees);
  };

  // --- EMPLOYEE ACTIONS ---
  const addEmployee = (empData) => {
    const newEmp = { id: generateId(), ...empData };
    const updated = [...employees, newEmp];
    setEmployees(updated);
    saveData(vehicles, updated);
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? emp.name : 'Unknown';
  };

  // --- REPORTS ---
  const getVehicleReport = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return null;
    const taskSummary = (vehicle.tasks || []).map(t => ({
      ...t,
      completedByName: t.completedBy ? getEmployeeName(t.completedBy) : null,
    }));
    return { ...vehicle, tasks: taskSummary };
  };

  const getEmployeeReport = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return null;
    const completedTasks = [];
    vehicles.forEach(v => {
      (v.tasks || []).forEach(t => {
        if (t.completedBy === employeeId) {
          completedTasks.push({ ...t, vehiclePlate: v.plateNumber, vehicleName: `${v.make} ${v.model}` });
        }
      });
    });
    return { ...emp, completedTasks };
  };

  return (
    <AppContext.Provider value={{
      vehicles, employees, loading,
      checkInVehicle, updateVehicle, checkOutVehicle,
      addTask, toggleTask, addTaskNote,
      addEmployee, getEmployeeName,
      getVehicleReport, getEmployeeReport,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
