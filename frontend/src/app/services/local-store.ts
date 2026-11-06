/** A JSON array kept in localStorage, read back as empty when missing or corrupt. */
export class LocalStore<T> {
  constructor(private readonly key: string) { }

  load(): T[] {
    try {
      const items = JSON.parse(localStorage.getItem(this.key));
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  save(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}
