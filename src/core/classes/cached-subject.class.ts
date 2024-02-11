import { BehaviorSubject } from 'rxjs';

export class CachedSubject<T> extends BehaviorSubject<T> {
  public constructor(
    private storageProvider: Storage,
    public storageKey: string,
    initialValue: T = null,
  ) {
    super((JSON.parse(storageProvider.getItem(storageKey) ?? 'null') ?? initialValue) as T);
  }

  public next(value: T): void {
    this.storageProvider.setItem(this.storageKey, JSON.stringify(value));
    super.next(value);
  }
}
