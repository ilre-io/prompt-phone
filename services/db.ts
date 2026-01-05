
import { openDB } from 'idb';
import { PromptItem } from '../types';
import { APP_CONFIG } from '../constants';

const DB_NAME = 'Ilre_Local_DB';
const STORE_NAME = 'prompts';
const DELETE_QUEUE_STORE = 'deleted_queue';

// LocalDB class implementation
export class LocalDB {
  async getDB() {
    return openDB(DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DELETE_QUEUE_STORE)) {
          db.createObjectStore(DELETE_QUEUE_STORE, { keyPath: 'id' });
        }
      },
    });
  }

  async getAll(): Promise<PromptItem[]> {
    const db = await this.getDB();
    return db.getAll(STORE_NAME);
  }

  async getDeletedQueue() {
    const db = await this.getDB();
    return db.getAll(DELETE_QUEUE_STORE);
  }

  async save(item: PromptItem) {
    const db = await this.getDB();
    const itemToSave = { ...item, _dirty: true };
    await db.delete(DELETE_QUEUE_STORE, item.id);
    return db.put(STORE_NAME, itemToSave);
  }

  async markSynced(items: PromptItem[]) {
    const db = await this.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const item of items) {
      const cleanItem = { ...item, _dirty: false };
      await tx.store.put(cleanItem);
    }
    await tx.done;
  }

  async clearDeletedQueue(ids: string[]) {
    const db = await this.getDB();
    const tx = db.transaction(DELETE_QUEUE_STORE, 'readwrite');
    for (const id of ids) {
      await tx.store.delete(id);
    }
    await tx.done;
  }

  async delete(id: string) {
    const db = await this.getDB();
    await db.put(DELETE_QUEUE_STORE, { id: id, deletedAt: new Date().toISOString() });
    return db.delete(STORE_NAME, id);
  }

  async clear() {
    const db = await this.getDB();
    await db.clear(DELETE_QUEUE_STORE);
    return db.clear(STORE_NAME);
  }
}

export const localDB = new LocalDB();

// CloudDB class implementation
export class CloudDB {
  private client: any;

  constructor() {
    this.client = null;
    if (APP_CONFIG.url && APP_CONFIG.key) {
      try {
        // @ts-ignore
        this.client = window.supabase.createClient(APP_CONFIG.url, APP_CONFIG.key);
      } catch (e) { console.error("Config Error:", e); }
    }
  }

  get isConnected() { return !!this.client; }

  async testConnection() {
    if (!this.isConnected) throw new Error("代码配置无效");
    const { error } = await this.client.from('prompts').select('id').limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    return true;
  }

  async restoreFromCloud() {
    if (!this.isConnected) throw new Error("未配置云端连接");
    const { data, error } = await this.client.from('prompts').select('*');
    if (error) throw error;

    await localDB.clear();

    const mappedData: PromptItem[] = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      prompt: row.prompt,
      category: row.category,
      tags: row.tags,
      negativePrompt: row.negative_prompt,
      outputMediaUrl: row.output_media_url,
      inputMediaUrl: row.input_media_url,
      isVideo: row.is_video,
      createdAt: row.created_at,
      userId: row.user_id,
      _dirty: false
    }));

    const db = await localDB.getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const item of mappedData) {
      await tx.store.put(item);
    }
    await tx.done;

    return mappedData.length;
  }

  async syncToCloud() {
    if (!this.isConnected) throw new Error("未配置云端连接");

    const allLocalItems = await localDB.getAll();
    const deletedQueueItems = await localDB.getDeletedQueue();

    const itemsToUpload = allLocalItems.filter(item => item._dirty);
    const idsToDelete = deletedQueueItems.map((q: any) => q.id);

    let uploadCount = 0;
    let deleteCount = 0;

    if (itemsToUpload.length === 0 && idsToDelete.length === 0) {
      return { uploaded: 0, deleted: 0, message: "本地无变更，无需同步" };
    }

    if (idsToDelete.length > 0) {
      const { error: delError } = await this.client.from('prompts').delete().in('id', idsToDelete);
      if (delError) throw delError;
      await localDB.clearDeletedQueue(idsToDelete);
      deleteCount = idsToDelete.length;
    }

    if (itemsToUpload.length > 0) {
      const dbItems = itemsToUpload.map(item => {
        const dbItem: any = {
          id: item.id,
          title: item.title,
          prompt: item.prompt,
          category: item.category,
          tags: Array.isArray(item.tags) ? item.tags : [],
          negative_prompt: item.negativePrompt,
          output_media_url: item.outputMediaUrl,
          input_media_url: item.inputMediaUrl,
          is_video: item.isVideo,
        };
        Object.keys(dbItem).forEach(key => dbItem[key] === undefined && delete dbItem[key]);
        return dbItem;
      });

      const { error: upsertError } = await this.client.from('prompts').upsert(dbItems);
      if (upsertError) throw upsertError;

      await localDB.markSynced(itemsToUpload);
      uploadCount = itemsToUpload.length;
    }

    return { uploaded: uploadCount, deleted: deleteCount, message: null };
  }
}

export const cloudDB = new CloudDB();
