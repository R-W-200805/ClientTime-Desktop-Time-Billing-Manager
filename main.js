// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let store; // נגדיר משתנה ל-store שיטען מאוחר יותר


(async () => {
    const { default: Store } = await import('electron-store');
    store = new Store({
        defaults: {
            customers: [],
            packages: [],
            workSessions: [],
        }
    });

  
    
    // פונקציות לניהול לקוחות
    function addCustomer(name, business, phone) {
        const customers = store.get('customers');
        const id = Date.now();
        customers.push({ id, name, business, phone });
        store.set('customers', customers);
        return id;
    }

    function updateCustomer(id, name, business, phone) {
        let customers = store.get('customers');
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index].name = name;
            customers[index].business = business;
            customers[index].phone = phone;
            store.set('customers', customers);
        }
    }

    function deleteCustomer(id) {
        let customers = store.get('customers');
        let packages = store.get('packages');
        let workSessions = store.get('workSessions');

        customers = customers.filter((c) => c.id !== id);
        packages = packages.filter((p) => p.customerId !== id);
        workSessions = workSessions.filter((w) => w.customerId !== id);

        store.set('customers', customers);
        store.set('packages', packages);
        store.set('workSessions', workSessions);
    }

    function getCustomers() {
        return store.get('customers');
    }

    // פונקציות לניהול חבילות
    function addPackage(customerId, monthYear, totalHours, amount) {
        const packages = store.get('packages');
        const id = Date.now();
        packages.push({ id, customerId, monthYear, totalHours, amount });
        store.set('packages', packages);
        return id;
    }

    function updatePackage(id, customerId, monthYear, totalHours, amount) {
        let packages = store.get('packages');
        const index = packages.findIndex(p => p.id === id);
        if (index !== -1) {
            packages[index].customerId = customerId;
            packages[index].monthYear = monthYear;
            packages[index].totalHours = totalHours;
            packages[index].amount = amount;
            store.set('packages', packages);
        }
    }

    function deletePackage(id) {
        let packages = store.get('packages');
        packages = packages.filter(p => p.id !== id);
        store.set('packages', packages);
    }

    function getPackages(customerId) {
        return store.get('packages').filter(p => p.customerId === customerId);
    }

    function updateWorkSession(id, description, startTime, endTime, duration) {
        let workSessions = store.get('workSessions');
        const index = workSessions.findIndex(w => w.id === id);
        if(index !== -1) {
          workSessions[index].description = description;
          workSessions[index].startTime = startTime;
          workSessions[index].endTime = endTime;
          workSessions[index].duration = duration;
          store.set('workSessions', workSessions);
        }
      }
      
      function deleteWorkSession(id) {
        let workSessions = store.get('workSessions');
        workSessions = workSessions.filter(w => w.id !== id);
        store.set('workSessions', workSessions);
      }

      ipcMain.handle('update-work-session', async (event, data) => {
        try {
          updateWorkSession(data.id, data.description, data.startTime, data.endTime, data.duration);
          return { success: true };
        } catch(error) {
          return { error: error.message };
        }
      });
      
      ipcMain.handle('delete-work-session', async (event, id) => {
        try {
          deleteWorkSession(id);
          return { success: true };
        } catch(error) {
          return { error: error.message };
        }
      });
      
    // פונקציות לניהול Work Sessions
    function addWorkSession(session) {
        let workSessions = store.get('workSessions');
        const id = Date.now();
        workSessions.push({
            id,
            customerId: session.customerId,
            description: session.description || '',
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration
        });
        store.set('workSessions', workSessions);
        return id;
    }

    function getWorkSessions() {
        return store.get('workSessions');
    }

    // IPC handlers
    ipcMain.handle('get-customers', async () => getCustomers());

    ipcMain.handle('add-customer', async (event, data) => {
        try {
            return addCustomer(data.name, data.business, data.phone);
        } catch (error) {
            return { error: error.message };
        }
    });

    ipcMain.handle('update-customer', async (event, data) => {
        try {
            updateCustomer(data.id, data.name, data.business, data.phone);
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    });

    ipcMain.handle('delete-customer', async (event, id) => {
        try {
            deleteCustomer(id);
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    });

    ipcMain.handle('get-packages', async (event, customerId) => getPackages(customerId));

    ipcMain.handle('delete-package', async (event, id) => {
        try {
            deletePackage(id);
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    });

    ipcMain.handle('add-work-session', async (event, session) => {
        try {
            return addWorkSession(session);
        } catch (error) {
            return { error: error.message };
        }
    });

    ipcMain.handle('getCustomerUsage', async (event, customerId) => {
        try {
            const now = new Date();
            const currentMonth = now.getMonth() + 1; // חודשים ב-JavaScript הם 0-11
            const currentYear = now.getFullYear();
            const monthYear = `${currentMonth.toString().padStart(2, '0')}-${currentYear}`;

            console.log('Current monthYear:', monthYear);

            // רשימת חבילות הלקוח
            const packages = store.get('packages');
            const customerPackages = packages.filter(p => Number(p.customerId) === Number(customerId));
            console.log('Customer packages:', customerPackages);

            // חבילה עבור החודש הנוכחי
            const customerPackage = customerPackages.find(p => p.monthYear === monthYear);
            console.log('Matched package for current monthYear:', customerPackage);

            // סינון יחידות עבודה לפי הלקוח והחודש הנוכחי
            const workSessions = store.get('workSessions').filter(session => {
                const sessionDate = new Date(session.startTime);
                const sessionMonthYear = `${(sessionDate.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}-${sessionDate.getFullYear()}`;
                return Number(session.customerId) === Number(customerId) && sessionMonthYear === monthYear;
            });

            console.log('Filtered work sessions:', workSessions);

            // חישוב שעות ניצול
            const usedHours = workSessions.reduce((sum, session) => sum + session.duration / 3600, 0); // שניות לשעות

            return {
                totalHours: customerPackage ? Number(customerPackage.totalHours) : 0,
                usedHours: usedHours.toFixed(2),
            };
        } catch (error) {
            console.error('Error fetching customer usage:', error);
            return { totalHours: 0, usedHours: 0 };
        }
    });


    ipcMain.handle('update-package', async (event, data) => {
        try {
            const { id, customerId, monthYear, totalHours, amount } = data;
            updatePackage(id, customerId, monthYear, totalHours, amount);
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    });

    ipcMain.handle('generate-report', async (event, { customerId, startDate, endDate }) => {
        try {
            console.log('Received generate-report request:', { customerId, startDate, endDate });

            const packages = store.get('packages');
            const workSessions = store.get('workSessions');
            console.log('Loaded data from store:', { packages, workSessions });

            // סינון יחידות עבודה לפי טווח תאריכים ולפי לקוח (אם נבחר)
            const filteredSessions = workSessions.filter(session => {
                const sessionDate = new Date(session.startTime).toISOString().slice(0, 10);
                const start = new Date(startDate).toISOString().slice(0, 10);
                const end = new Date(endDate).toISOString().slice(0, 10);
            
                console.log('Session Date:', sessionDate, 'Start:', start, 'End:', end);
            
                return sessionDate >= start && sessionDate <= end &&
                    (!customerId || session.customerId === Number(customerId));
            });
            console.log('Filtered work sessions:', filteredSessions);

            // סה"כ שעות עבודה
            const totalHours = filteredSessions.reduce((sum, session) => sum + session.duration / 3600, 0);
            console.log('Calculated total hours:', totalHours);

            // אם נבחר לקוח, נבדוק את נתוני החבילה שלו
            let totalPackageHours = 0;
            if (customerId) {
                const customerPackages = packages.filter(p => Number(p.customerId) === Number(customerId));
                console.log('Customer packages:', customerPackages);

                totalPackageHours = customerPackages.reduce((sum, pkg) => {
                    const pkgDate = pkg.monthYear.split('-'); // פיצול חודש ושנה
                    const pkgMonth = parseInt(pkgDate[0], 10);
                    const pkgYear = parseInt(pkgDate[1], 10);

                    const pkgStartDate = new Date(pkgYear, pkgMonth - 1, 1); // תחילת חודש
                    const pkgEndDate = new Date(pkgYear, pkgMonth, 0); // סוף חודש

                    // בדיקה אם החבילה חלה בטווח שנבחר
                    if (pkgStartDate <= new Date(endDate) && pkgEndDate >= new Date(startDate)) {
                        return sum + Number(pkg.totalHours);
                    }
                    return sum;
                }, 0);
                console.log('Total package hours:', totalPackageHours);
            }

            const result = {
                totalPackageHours,
                totalHours: totalHours.toFixed(2),
                sessions: filteredSessions.map(session => ({
                    startTime: session.startTime,
                    endTime: session.endTime,
                    description: session.description,
                })),
            };
            console.log('Generated report result:', result);

            return result;
        } catch (error) {
            console.error('Error generating report:', error);
            return { totalPackageHours: 0, totalHours: 0, sessions: [] };
        }
    });
    
    ipcMain.handle('add-package', async (event, pkg) => {
        try {
            const { customerId, monthYear, totalHours, amount } = pkg;

            // הוספת החבילה ל-`store`
            const packages = store.get('packages');
            const id = Date.now();
            packages.push({ id, customerId, monthYear, totalHours, amount });
            store.set('packages', packages);

            console.log('Package added successfully:', { id, customerId, monthYear, totalHours, amount });
            return { id };
        } catch (error) {
            console.error('Error adding package:', error);
            return { error: error.message };
        }
    });

    // הוספת ה-IPCHanlder לאיפוס תוקף

    app.whenReady().then(() => {
        mainWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            webPreferences: {
                preload: path.join(__dirname, 'renderer', 'preload.js'),
                contextIsolation: true, // שמירה על בידוד
                enableRemoteModule: false,
            },
            focusable: true, // מוודא שהחלון יכול לקבל פוקוס
        });

        mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

        // שליחת הודעה ל-renderer כשחלון חוזר לפוקוס
        mainWindow.on('focus', () => {
            mainWindow.webContents.send('window-focused');
        });

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
})();
