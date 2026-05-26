/**
 * Generate a UUID v4
 * Работает в браузерах где crypto.randomUUID доступен
 * Fallback для остальных браузеров
 */
export const generateUUID = (): string => {
  // Попытаемся использовать crypto.randomUUID если доступно
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback: генерируем UUID v4 вручную
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
