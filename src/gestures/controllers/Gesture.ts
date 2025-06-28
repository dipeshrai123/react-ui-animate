type Listener<E> = (event: E) => void;

export abstract class Gesture<E> {
  public static readonly VELOCITY_LIMIT = 20;

  private changeListeners = new Set<Listener<E>>();
  private endListeners = new Set<Listener<E>>();

  onChange(listener: Listener<E>): this {
    this.changeListeners.add(listener);
    return this;
  }

  onEnd(listener: Listener<E>): this {
    this.endListeners.add(listener);
    return this;
  }

  protected emitChange(event: E): void {
    this.changeListeners.forEach((fn) => fn(event));
  }

  protected emitEnd(event: E): void {
    this.endListeners.forEach((fn) => fn(event));
  }

  abstract attach(elements: HTMLElement | HTMLElement | Window): () => void;

  abstract cancel(): void;
}
