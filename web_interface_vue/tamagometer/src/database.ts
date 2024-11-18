import { openDB } from 'idb';
import { StoredConversation } from './conversation';
import { reactive } from 'vue';

class DatabaseConnection implements DatabaseConnection {
    dbPromise

    constructor() {
        this.dbPromise = openDB('tamaDB', 3, {
            upgrade(db, oldversion, newVersion, t, e) {
                switch (oldversion) {
                    case 0:
                        db.createObjectStore('conversations', { keyPath: "id", autoIncrement: true });
                }
            },
        });
    }

    async get(key: IDBValidKey): Promise<StoredConversation> {
        return (await this.dbPromise).get('conversations', key);

    }
    async set(val: StoredConversation) {
        console.log("saving " + val.name)
        return (await this.dbPromise).put('conversations', val);
    }
    async del(key: number) {
        return (await this.dbPromise).delete('conversations', key);
    }
    async clear() {
        return (await this.dbPromise).clear('conversations');
    }
    async getAllKeys() {
        const result = (await this.dbPromise).getAllKeys('conversations');
        return result
    }
    async getAll() {
        const result = (await this.dbPromise).getAll('conversations');
        return result
    }
}

export const dbConnection = reactive(new DatabaseConnection)