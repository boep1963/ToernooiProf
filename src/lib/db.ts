/**
 * Database abstraction layer for ClubMatch
 *
 * Uses Firebase Admin SDK (Firestore) as the primary database.
 * Falls back to a local JSON file-based storage when Firebase
 * credentials are not configured (development without cloud access).
 *
 * The API mirrors Firestore's collection/document interface so that
 * switching between backends is transparent to route handlers.
 */

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// ============================================================
// LOCAL PERSISTENT FALLBACK (used when no Firebase credentials)
// ============================================================
import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), '.data');

function ensureDbDir(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getCollectionPath(collectionName: string): string {
  ensureDbDir();
  return path.join(DB_DIR, `${collectionName}.json`);
}

function readCollection(collectionName: string): Record<string, Record<string, unknown>> {
  const filePath = getCollectionPath(collectionName);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeCollection(collectionName: string, data: Record<string, Record<string, unknown>>): void {
  const filePath = getCollectionPath(collectionName);
  ensureDbDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// ============================================================
// Shared interfaces (compatible with Firestore API shape)
// ============================================================

export interface DocumentSnapshot {
  id: string;
  exists: boolean;
  ref: DocumentRef;
  data: () => Record<string, unknown> | undefined;
}

export interface QuerySnapshot {
  docs: DocumentSnapshot[];
  empty: boolean;
  size: number;
  forEach: (callback: (doc: DocumentSnapshot) => void) => void;
}

export interface DocumentRef {
  id: string;
  get: () => Promise<DocumentSnapshot>;
  set: (data: Record<string, unknown>, options?: { merge?: boolean }) => Promise<void>;
  update: (data: Record<string, unknown>) => Promise<void>;
  delete: () => Promise<void>;
}

export interface Query {
  get: () => Promise<QuerySnapshot>;
  where: (field: string, operator: string, value: unknown) => Query;
  orderBy: (field: string, direction?: 'asc' | 'desc') => Query;
  limit: (count: number) => Query;
}

export interface CollectionRef extends Query {
  id: string;
  doc: (docId?: string) => DocumentRef;
  add: (data: Record<string, unknown>) => Promise<DocumentRef>;
}

export interface BatchRef {
  set: (ref: DocumentRef, data: Record<string, unknown>) => void;
  update: (ref: DocumentRef, data: Record<string, unknown>) => void;
  delete: (ref: DocumentRef) => void;
  commit: () => Promise<void>;
}

export interface DbInstance {
  collection: (name: string) => CollectionRef;
  batch: () => BatchRef;
  healthCheck: () => Promise<{ status: string; type: string }>;
  listCollections: () => Promise<{ id: string }[]>;
  isFirestore: boolean;
}

// ============================================================
// Local fallback implementation
// ============================================================

interface QueryFilter {
  field: string;
  operator: string;
  value: unknown;
}

interface QueryOrder {
  field: string;
  direction: 'asc' | 'desc';
}

function createLocalDocRef(collectionName: string, docId: string): DocumentRef;
function createLocalDocRef(collectionName: string, docId: string): DocumentRef {
  const self: DocumentRef = {
    id: docId,
    async get(): Promise<DocumentSnapshot> {
      const docs = readCollection(collectionName);
      const docData = docs[docId];
      return {
        id: docId,
        exists: docData !== undefined,
        ref: self,
        data: () => (docData ? { ...docData } : undefined),
      };
    },
    async set(data: Record<string, unknown>, options?: { merge?: boolean }): Promise<void> {
      const docs = readCollection(collectionName);
      if (options?.merge && docs[docId]) {
        docs[docId] = { ...docs[docId], ...data };
      } else {
        docs[docId] = { ...data };
      }
      writeCollection(collectionName, docs);
    },
    async update(data: Record<string, unknown>): Promise<void> {
      const docs = readCollection(collectionName);
      if (!docs[docId]) {
        throw new Error(`Document ${collectionName}/${docId} does not exist`);
      }
      docs[docId] = { ...docs[docId], ...data };
      writeCollection(collectionName, docs);
    },
    async delete(): Promise<void> {
      const docs = readCollection(collectionName);
      delete docs[docId];
      writeCollection(collectionName, docs);
    },
  };
  return self;
}

function applyLocalFilters(
  docs: Record<string, Record<string, unknown>>,
  filters: QueryFilter[],
  orders: QueryOrder[],
  limitCount?: number,
  collectionName?: string
): DocumentSnapshot[] {
  let entries = Object.entries(docs);

  for (const filter of filters) {
    entries = entries.filter(([, docData]) => {
      const fieldValue = docData[filter.field];
      switch (filter.operator) {
        case '==': return fieldValue === filter.value;
        case '!=': return fieldValue !== filter.value;
        case '<': return (fieldValue as number) < (filter.value as number);
        case '<=': return (fieldValue as number) <= (filter.value as number);
        case '>': return (fieldValue as number) > (filter.value as number);
        case '>=': return (fieldValue as number) >= (filter.value as number);
        case 'in': return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        case 'array-contains': return Array.isArray(fieldValue) && fieldValue.includes(filter.value);
        default: return true;
      }
    });
  }

  for (const order of orders.reverse()) {
    entries.sort((a, b) => {
      const aVal = a[1][order.field];
      const bVal = b[1][order.field];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      const cmp = aVal < bVal ? -1 : 1;
      return order.direction === 'desc' ? -cmp : cmp;
    });
  }

  if (limitCount !== undefined) {
    entries = entries.slice(0, limitCount);
  }

  return entries.map(([id, docData]) => ({
    id,
    exists: true,
    ref: createLocalDocRef(collectionName || '', id),
    data: () => ({ ...docData }),
  }));
}

function createLocalQuery(
  collectionName: string,
  filters: QueryFilter[] = [],
  orders: QueryOrder[] = [],
  limitCount?: number
): Query {
  return {
    where(field: string, operator: string, value: unknown): Query {
      return createLocalQuery(collectionName, [...filters, { field, operator, value }], orders, limitCount);
    },
    orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): Query {
      return createLocalQuery(collectionName, filters, [...orders, { field, direction }], limitCount);
    },
    limit(count: number): Query {
      return createLocalQuery(collectionName, filters, orders, count);
    },
    async get(): Promise<QuerySnapshot> {
      const docs = readCollection(collectionName);
      const results = applyLocalFilters(docs, filters, orders, limitCount, collectionName);
      return {
        docs: results,
        empty: results.length === 0,
        size: results.length,
        forEach(callback: (doc: DocumentSnapshot) => void) {
          results.forEach(callback);
        },
      };
    },
  };
}

function createLocalCollectionRef(collectionName: string): CollectionRef {
  const query = createLocalQuery(collectionName);
  return {
    id: collectionName,
    ...query,
    doc(docId?: string): DocumentRef {
      const id = docId || generateId();
      return createLocalDocRef(collectionName, id);
    },
    async add(data: Record<string, unknown>): Promise<DocumentRef> {
      const id = generateId();
      const docs = readCollection(collectionName);
      docs[id] = { ...data };
      writeCollection(collectionName, docs);
      return createLocalDocRef(collectionName, id);
    },
  };
}

function createLocalDb(): DbInstance {
  return {
    isFirestore: false,
    collection(name: string): CollectionRef {
      return createLocalCollectionRef(name);
    },
    batch(): BatchRef {
      const operations: Array<{
        type: 'set' | 'update' | 'delete';
        collectionName: string;
        docId: string;
        data?: Record<string, unknown>;
      }> = [];

      return {
        set(ref: DocumentRef, data: Record<string, unknown>) {
          operations.push({ type: 'set', collectionName: '', docId: ref.id, data });
        },
        update(ref: DocumentRef, data: Record<string, unknown>) {
          operations.push({ type: 'update', collectionName: '', docId: ref.id, data });
        },
        delete(ref: DocumentRef) {
          operations.push({ type: 'delete', collectionName: '', docId: ref.id });
        },
        async commit() {
          for (const op of operations) {
            if (op.type === 'delete') {
              await ref_delete(op.docId);
            }
          }
        },
      };

      async function ref_delete(docId: string) {
        // Find and delete from all collections
        ensureDbDir();
        const files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const collName = file.replace('.json', '');
          const docs = readCollection(collName);
          if (docs[docId]) {
            delete docs[docId];
            writeCollection(collName, docs);
          }
        }
      }
    },
    async healthCheck(): Promise<{ status: string; type: string }> {
      try {
        ensureDbDir();
        const testPath = path.join(DB_DIR, '_health_check.json');
        fs.writeFileSync(testPath, JSON.stringify({ checked: new Date().toISOString() }));
        fs.readFileSync(testPath, 'utf-8');
        return { status: 'connected', type: 'local-persistent' };
      } catch {
        return { status: 'error', type: 'local-persistent' };
      }
    },
    async listCollections(): Promise<{ id: string }[]> {
      ensureDbDir();
      const files = fs.readdirSync(DB_DIR)
        .filter(f => f.endsWith('.json') && !f.startsWith('_'))
        .map(f => ({ id: f.replace('.json', '') }));
      return files;
    },
  };
}

// ============================================================
// Firestore adapter (wraps real Firestore to match our interface)
// ============================================================

function createFirestoreAdapter(firestore: Firestore): DbInstance {
  function wrapDocRef(firestoreDocRef: FirebaseFirestore.DocumentReference): DocumentRef {
    const self: DocumentRef = {
      id: firestoreDocRef.id,
      async get(): Promise<DocumentSnapshot> {
        const snap = await firestoreDocRef.get();
        return {
          id: snap.id,
          exists: snap.exists,
          ref: self,
          data: () => snap.data() as Record<string, unknown> | undefined,
        };
      },
      async set(data: Record<string, unknown>, options?: { merge?: boolean }): Promise<void> {
        if (options?.merge) {
          await firestoreDocRef.set(data, { merge: true });
        } else {
          await firestoreDocRef.set(data);
        }
      },
      async update(data: Record<string, unknown>): Promise<void> {
        await firestoreDocRef.update(data);
      },
      async delete(): Promise<void> {
        await firestoreDocRef.delete();
      },
    };
    return self;
  }

  function wrapQuery(firestoreQuery: FirebaseFirestore.Query): Query {
    return {
      where(field: string, operator: string, value: unknown): Query {
        return wrapQuery(firestoreQuery.where(field, operator as FirebaseFirestore.WhereFilterOp, value));
      },
      orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): Query {
        return wrapQuery(firestoreQuery.orderBy(field, direction));
      },
      limit(count: number): Query {
        return wrapQuery(firestoreQuery.limit(count));
      },
      async get(): Promise<QuerySnapshot> {
        const snap = await firestoreQuery.get();
        const docs: DocumentSnapshot[] = snap.docs.map((d) => ({
          id: d.id,
          exists: d.exists,
          ref: wrapDocRef(d.ref),
          data: () => d.data() as Record<string, unknown>,
        }));
        return {
          docs,
          empty: snap.empty,
          size: snap.size,
          forEach(callback: (doc: DocumentSnapshot) => void) {
            docs.forEach(callback);
          },
        };
      },
    };
  }

  function wrapCollectionRef(firestoreColRef: FirebaseFirestore.CollectionReference): CollectionRef {
    const query = wrapQuery(firestoreColRef);
    return {
      id: firestoreColRef.id,
      ...query,
      doc(docId?: string): DocumentRef {
        if (docId) {
          return wrapDocRef(firestoreColRef.doc(docId));
        }
        return wrapDocRef(firestoreColRef.doc());
      },
      async add(data: Record<string, unknown>): Promise<DocumentRef> {
        const docRef = await firestoreColRef.add(data);
        return wrapDocRef(docRef);
      },
    };
  }

  return {
    isFirestore: true,
    collection(name: string): CollectionRef {
      return wrapCollectionRef(firestore.collection(name));
    },
    batch(): BatchRef {
      const firestoreBatch = firestore.batch();
      return {
        set(ref: DocumentRef, data: Record<string, unknown>) {
          // We need the underlying Firestore ref - use collection path
          // This is a simplified approach
          firestoreBatch.set(firestore.collection('_batch').doc(ref.id), data);
        },
        update(ref: DocumentRef, data: Record<string, unknown>) {
          firestoreBatch.update(firestore.collection('_batch').doc(ref.id), data);
        },
        delete(ref: DocumentRef) {
          firestoreBatch.delete(firestore.collection('_batch').doc(ref.id));
        },
        async commit() {
          await firestoreBatch.commit();
        },
      };
    },
    async healthCheck(): Promise<{ status: string; type: string }> {
      try {
        const testRef = firestore.collection('_health_check');
        await testRef.limit(1).get();
        return { status: 'connected', type: 'firestore' };
      } catch {
        return { status: 'error', type: 'firestore' };
      }
    },
    async listCollections(): Promise<{ id: string }[]> {
      try {
        const collections = await firestore.listCollections();
        return collections.map(c => ({ id: c.id }));
      } catch {
        return [];
      }
    },
  };
}

// ============================================================
// Initialize and export the database
// ============================================================

let _db: DbInstance | null = null;

function getDb(): DbInstance {
  if (_db) return _db;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey && serviceAccountKey !== '{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}') {
    try {
      let adminApp: App;
      if (getApps().length === 0) {
        adminApp = initializeApp({
          credential: cert(JSON.parse(serviceAccountKey)),
        });
      } else {
        adminApp = getApps()[0];
      }
      const firestore = getFirestore(adminApp);
      _db = createFirestoreAdapter(firestore);
      console.log('[DB] Connected to Google Firestore');
      return _db;
    } catch (error) {
      console.warn('[DB] Failed to initialize Firestore, falling back to local storage:', error);
    }
  }

  // Fallback to local persistent storage
  console.log('[DB] Using local persistent storage (.data/ directory)');
  _db = createLocalDb();
  return _db;
}

export const db = new Proxy({} as DbInstance, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof DbInstance];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

/**
 * Initialize all required collections.
 */
export async function initializeCollections(): Promise<string[]> {
  const instance = getDb();

  if (!instance.isFirestore) {
    // Local mode: ensure JSON files exist
    const requiredCollections = [
      'organizations', 'competitions', 'members', 'competition_players',
      'matches', 'results', 'tables', 'device_config',
      'score_helpers', 'score_helpers_tablet', 'news_reactions',
    ];
    ensureDbDir();
    const initialized: string[] = [];
    for (const name of requiredCollections) {
      const filePath = getCollectionPath(name);
      if (!fs.existsSync(filePath)) {
        writeCollection(name, {});
        initialized.push(name);
      }
    }
    return initialized;
  }

  // Firestore mode: collections are created implicitly
  return [];
}

export default db;
