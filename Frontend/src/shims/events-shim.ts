/**
 * Events shim for browser compatibility
 * Provides EventEmitter functionality for modules that expect Node.js events
 */

export class EventEmitter {
  private events: Map<string, Set<(...args: any[]) => void>> = new Map();
  private maxListeners: number = 10;

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
    return this;
  }

  addListener(event: string, listener: (...args: any[]) => void): this {
    return this.on(event, listener);
  }

  once(event: string, listener: (...args: any[]) => void): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    return this.on(event, onceWrapper);
  }

  off(event: string, listener: (...args: any[]) => void): this {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
    return this;
  }

  removeListener(event: string, listener: (...args: any[]) => void): this {
    return this.off(event, listener);
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) {
      return false;
    }
    listeners.forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (err) {
        console.error(`Error in event listener for "${event}":`, err);
      }
    });
    return true;
  }

  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.size : 0;
  }

  listeners(event: string): ((...args: any[]) => void)[] {
    const listeners = this.events.get(event);
    return listeners ? Array.from(listeners) : [];
  }

  rawListeners(event: string): ((...args: any[]) => void)[] {
    return this.listeners(event);
  }

  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  getMaxListeners(): number {
    return this.maxListeners;
  }

  prependListener(event: string, listener: (...args: any[]) => void): this {
    return this.on(event, listener);
  }

  prependOnceListener(event: string, listener: (...args: any[]) => void): this {
    return this.once(event, listener);
  }
}

// Default export for CommonJS compatibility
export default { EventEmitter };
