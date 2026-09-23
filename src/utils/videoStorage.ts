// IndexedDB persistent storage for user-attached MP4 video
const DB_NAME = 'RomanticAppVideoDB';
const STORE_NAME = 'videos';
const DB_VERSION = 1;
const VIDEO_KEY = 'attached_mp4_video';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoBlob(blob: Blob, name = 'user_video.mp4'): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ blob, name, date: Date.now() }, VIDEO_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to store video in IndexedDB', err);
  }
}

export async function getVideoBlob(): Promise<{ blob: Blob; name: string } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(VIDEO_KEY);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get video from IndexedDB', err);
    return null;
  }
}

export async function clearVideoBlob(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(VIDEO_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to clear video from IndexedDB', err);
  }
}
