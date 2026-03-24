// A simple localStorage mock for base44.entities so the app works without a real backend

const getStorageKey = (entityName) => `mock_db_${entityName}`;

const readDb = (entityName) => {
    try {
        const data = localStorage.getItem(getStorageKey(entityName));
        if (data) return JSON.parse(data);
        
        // Seed initial data so the user can see charts and history!
        let seed = [];
        if (entityName === 'StressResult') {
            const now = Date.now();
            seed = Array.from({ length: 15 }).map((_, i) => ({
                id: generateId(),
                session_id: 'sample_session_1',
                timestamp: now - (15 - i) * 5000,
                created_date: now - (15 - i) * 5000,
                stress_score: 30 + (i * 4) % 40 + (Math.random() * 10),
                stress_level: i < 5 ? 'low' : i < 10 ? 'medium' : 'high'
            }));
            writeDb(entityName, seed);
        } else if (entityName === 'EmergencyContact') {
            seed = [{
                id: generateId(), name: 'Jane Doe', phone: '+1 555-0198', relationship: 'Partner', priority: 1, created_date: Date.now()
            }];
            writeDb(entityName, seed);
        }
        return seed;
    } catch {
        return [];
    }
};

const writeDb = (entityName, data) => {
    localStorage.setItem(getStorageKey(entityName), JSON.stringify(data));
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const mockEntities = {
    EmergencyContact: {
        list: async (sortBy = 'priority', limit = 20) => {
            const data = readDb('EmergencyContact');
            const isDesc = sortBy.startsWith('-');
            const sortField = sortBy.replace(/^-/, '');
            
            data.sort((a, b) => {
                if (a[sortField] < b[sortField]) return isDesc ? 1 : -1;
                if (a[sortField] > b[sortField]) return isDesc ? -1 : 1;
                return 0;
            });
            
            return data.slice(0, limit);
        },
        create: async (data) => {
            const db = readDb('EmergencyContact');
            const newRecord = { ...data, id: generateId(), created_date: Date.now() };
            db.push(newRecord);
            writeDb('EmergencyContact', db);
            return newRecord;
        },
        delete: async (id) => {
            const db = readDb('EmergencyContact');
            writeDb('EmergencyContact', db.filter(r => r.id !== id));
            return { success: true };
        }
    },
    StressResult: {
        list: async (sortBy = '-created_date', limit = 200) => {
            const data = readDb('StressResult');
            const isDesc = sortBy.startsWith('-');
            const sortField = sortBy.replace(/^-/, '');
            
            data.sort((a, b) => {
                const valA = a[sortField] || a.timestamp || 0;
                const valB = b[sortField] || b.timestamp || 0;
                if (valA < valB) return isDesc ? 1 : -1;
                if (valA > valB) return isDesc ? -1 : 1;
                return 0;
            });
            
            return data.slice(0, limit);
        },
        create: async (data) => {
            const db = readDb('StressResult');
            const newRecord = { ...data, id: generateId(), created_date: Date.now() };
            db.push(newRecord);
            writeDb('StressResult', db);
            return newRecord;
        },
        delete: async (id) => {
            const db = readDb('StressResult');
            writeDb('StressResult', db.filter(r => r.id !== id));
            return { success: true };
        }
    },
    SensorReading: {
        create: async (data) => {
            const db = readDb('SensorReading');
            const newRecord = { ...data, id: generateId(), created_date: Date.now() };
            db.push(newRecord);
            writeDb('SensorReading', db);
            return newRecord;
        }
    }
};
