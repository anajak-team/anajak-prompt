// Make TypeScript aware of the global initSqlJs object from the CDN script
declare const initSqlJs: any;

import { openDB, unwrap, wrap } from '../idb.js';
import type { Prompt, NewPrompt } from '../types';

const DB_NAME = 'PromptVaultSQLiteDB';
const DB_VERSION = 1;
const STORE_NAME = 'sqlite_db_store';
const DB_KEY = 'prompt_vault_db_file';

let db: any = null; // sql.js database instance
let idbPromise: Promise<any> | null = null; // idb promise

const getIDB = () => {
  if (idbPromise) return idbPromise;

  const promise = openDB(DB_NAME, DB_VERSION, {
    upgrade(wrappedDb: any) {
      // The version of idb.js used here wraps the IDBDatabase object for the upgrade
      // callback, but the wrapper doesn't expose `createObjectStore`. We need to
      // use the `unwrap` helper from the library to get the raw database object.
      const rawDb = unwrap(wrappedDb);
      if (!rawDb.objectStoreNames.contains(STORE_NAME)) {
        rawDb.createObjectStore(STORE_NAME);
      }
    },
    blocked: () => {},
    blocking: () => {},
    terminated: () => {},
  });

  // The openDB promise resolves to a raw IDBDatabase object. We need to wrap it
  // to get access to the convenient helper methods like .get() and .put().
  idbPromise = promise.then(rawDb => wrap(rawDb));

  return idbPromise;
};


/**
 * Initializes the SQLite database.
 * If a database file exists in IndexedDB, it loads it.
 * Otherwise, it creates a new database and the 'prompts' table.
 */
const initDB = async () => {
    if (db) return; // Already initialized

    // Load sql.js and the IndexedDB connection concurrently
    const [SQL, idb] = await Promise.all([
        initSqlJs({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        }),
        getIDB()
    ]);
    
    const dbFile = await idb.get(STORE_NAME, DB_KEY);

    if (dbFile) {
        // Load existing database from IndexedDB
        db = new SQL.Database(dbFile);
    } else {
        // Create a new database if one doesn't exist
        db = new SQL.Database();
        const createTableQuery = `
            CREATE TABLE prompts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                text TEXT NOT NULL,
                image TEXT,
                createdAt TEXT NOT NULL
            );
        `;
        db.run(createTableQuery);
        await persistDB();
    }
};

/**
 * Saves the current state of the in-memory SQLite database to IndexedDB.
 */
const persistDB = async () => {
    if (!db) return;
    const data = db.export();
    const idb = await getIDB();
    await idb.put(STORE_NAME, data, DB_KEY);
};

/**
 * A helper function to ensure the database is initialized before use.
 */
const getDb = async () => {
    if (!db) {
        await initDB();
    }
    return db;
};

export const getPrompts = async (): Promise<Prompt[]> => {
    const db = await getDb();
    const res = db.exec("SELECT * FROM prompts ORDER BY createdAt DESC");
    if (res.length === 0 || !res[0].values) {
        return [];
    }
    
    const columns = res[0].columns; // e.g., ["id", "title", "text", ...]
    const prompts: Prompt[] = res[0].values.map((row: any[]) => {
        const prompt: any = {};
        columns.forEach((col, i) => {
            // Fix: Map database column names (image, createdAt) to Prompt interface property names (image_url, created_at)
            if (col === 'image') {
                prompt['image_url'] = row[i];
            } else if (col === 'createdAt') {
                prompt['created_at'] = row[i];
            } else {
                prompt[col] = row[i];
            }
        });
        // Fix: Ensure user_id is present to satisfy Prompt type requirements
        if (!prompt['user_id']) {
            prompt['user_id'] = 'local-user';
        }
        return prompt as Prompt;
    });
    return prompts;
};

export const savePrompt = async (promptData: NewPrompt): Promise<Prompt> => {
    const db = await getDb();
    const newPrompt: Prompt = {
        ...promptData,
        id: Date.now().toString(),
        // Fix: Use created_at instead of createdAt to match Prompt type
        created_at: new Date().toISOString(),
        // Fix: Add user_id to satisfy Prompt type requirement
        user_id: 'local-user',
    };
    db.run("INSERT INTO prompts (id, title, text, image, createdAt) VALUES (:id, :title, :text, :image, :createdAt)", {
        ':id': newPrompt.id,
        ':title': newPrompt.title,
        ':text': newPrompt.text,
        // Fix: Use image_url instead of image
        ':image': newPrompt.image_url,
        // Fix: Use created_at instead of createdAt
        ':createdAt': newPrompt.created_at
    });
    await persistDB();
    return newPrompt;
};

export const updatePrompt = async (updatedPrompt: Prompt): Promise<Prompt | null> => {
    const db = await getDb();
    db.run("UPDATE prompts SET title = :title, text = :text, image = :image WHERE id = :id", {
        ':title': updatedPrompt.title,
        ':text': updatedPrompt.text,
        // Fix: Use image_url instead of image to match Prompt type
        ':image': updatedPrompt.image_url,
        ':id': updatedPrompt.id
    });
    await persistDB();
    return updatedPrompt;
};

export const deletePrompt = async (id: string): Promise<void> => {
    const db = await getDb();
    db.run("DELETE FROM prompts WHERE id = :id", { ':id': id });
    await persistDB();
};

export const importPrompts = async (newPrompts: NewPrompt[]): Promise<void> => {
    const db = await getDb();
    // Use a transaction for performance and data integrity
    db.exec("BEGIN TRANSACTION;");
    try {
        const stmt = db.prepare("INSERT INTO prompts (id, title, text, image, createdAt) VALUES (?, ?, ?, ?, ?)");
        
        newPrompts.forEach((p, index) => {
            const promptToInsert: Prompt = {
                ...p,
                id: (Date.now() + index).toString(),
                // Fix: Use created_at instead of createdAt to match Prompt type
                created_at: new Date().toISOString(),
                // Fix: Add user_id to satisfy Prompt type requirement
                user_id: 'local-user',
            };
            stmt.run([
                promptToInsert.id,
                promptToInsert.title,
                promptToInsert.text,
                // Fix: Use image_url instead of image
                promptToInsert.image_url,
                // Fix: Use created_at instead of createdAt
                promptToInsert.created_at
            ]);
        });

        stmt.free();
        db.exec("COMMIT;");
    } catch (e) {
        console.error("Import failed, rolling back transaction", e);
        db.exec("ROLLBACK;");
        throw e; // Re-throw error to be caught by the UI
    }
    await persistDB();
};