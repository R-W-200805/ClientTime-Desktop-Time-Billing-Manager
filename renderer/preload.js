// renderer/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getCustomers: () => ipcRenderer.invoke('get-customers'),
    addCustomer: (customer) => ipcRenderer.invoke('add-customer', customer),
    updateCustomer: (customer) => ipcRenderer.invoke('update-customer', customer),
    deleteCustomer: (id) => ipcRenderer.invoke('delete-customer', id),
    getPackages: (customerId) => ipcRenderer.invoke('get-packages', customerId),
    addPackage: (pkg) => ipcRenderer.invoke('add-package', pkg),
    updatePackage: (data) => ipcRenderer.invoke('update-package', data),
    deletePackage: (id) => ipcRenderer.invoke('delete-package', id),
    addWorkSession: (session) => ipcRenderer.invoke('add-work-session', session),
    getCustomerUsage: (customerId) => ipcRenderer.invoke('getCustomerUsage', customerId),
    generateReport: (data) => ipcRenderer.invoke('generate-report', data),
    onWindowFocus: (callback) => ipcRenderer.on('window-focused', callback),
    resetExpiration: (code) => ipcRenderer.invoke('reset-expiration', code), // פונקציה חדשה לאיפוס תוקף
    updateWorkSession: (data) => ipcRenderer.invoke('update-work-session', data),
    deleteWorkSession: (id) => ipcRenderer.invoke('delete-work-session', id),
    getPackageSessions: (customerId, monthYear) => ipcRenderer.invoke('get-package-sessions', {customerId, monthYear}),

});
