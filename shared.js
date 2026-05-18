// Data Management System
class GarageSystem {
    constructor() {
        this.vehicles = this.loadData('vehicles') || [];
        this.employees = this.loadData('employees') || [];
        this.workTasks = this.loadData('workTasks') || [];
    }

    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    addVehicle(vehicle) {
        vehicle.id = Date.now();
        vehicle.checkedInDate = new Date().toISOString();
        this.vehicles.push(vehicle);
        this.saveData('vehicles', this.vehicles);
        return vehicle;
    }

    addEmployee(employee) {
        employee.id = Date.now();
        employee.createdDate = new Date().toISOString();
        this.employees.push(employee);
        this.saveData('employees', this.employees);
        return employee;
    }

    addWorkTask(task) {
        task.id = Date.now();
        task.createdDate = new Date().toISOString();
        this.workTasks.push(task);
        this.saveData('workTasks', this.workTasks);
    }

    deleteVehicle(vehicleId) {
        this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
        this.workTasks = this.workTasks.filter(t => t.vehicleId !== vehicleId);
        this.saveData('vehicles', this.vehicles);
        this.saveData('workTasks', this.workTasks);
    }

    deleteEmployee(employeeId) {
        this.employees = this.employees.filter(e => e.id !== employeeId);
        this.saveData('employees', this.employees);
    }

    deleteWorkTask(taskId) {
        this.workTasks = this.workTasks.filter(t => t.id !== taskId);
        this.saveData('workTasks', this.workTasks);
    }

    getVehicleWorkTasks(vehicleId) {
        return this.workTasks.filter(t => t.vehicleId === vehicleId);
    }

    getEmployeeTasks(employeeName) {
        return this.workTasks.filter(t => t.employeeName === employeeName);
    }
}

const garage = new GarageSystem();

// Utility Functions
function showSuccessMessage(elementId, message) {
    const msg = document.getElementById(elementId);
    if (msg) {
        msg.textContent = message;
        msg.classList.add('show');
        setTimeout(() => msg.classList.remove('show'), 3000);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function getConditionBadge(condition) {
    return `<span class="badge condition-${condition}">${condition.toUpperCase()}</span>`;
}

function getStatusBadge(status) {
    return `<span class="status-badge ${status === 'completed' ? 'completed' : status === 'in-progress' ? 'in-progress' : 'pending'}">${status.toUpperCase()}</span>`;
}
