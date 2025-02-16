'use client';

import { useEffect, useRef, useState } from 'react';

export class Observable<T> {
  static create = <T>(setupRoutine?: (observable: Observable<T>) => void) => {
    const observable = new Observable<T>();
    setupRoutine?.(observable);
    return observable;
  };

  static use = <T>(setupRoutine?: (observable: Observable<T>) => void) => {
    const observableRef = useRef<Observable<T>>(undefined as any);
    if (!observableRef.current) {
      const observable = (observableRef.current = new Observable());
      setupRoutine?.(observable);
    }
    return observableRef.current;
  };

  private listeners: ((state: T, prevState: T) => void)[] = [];

  private _state?: T;

  get state() {
    return this._state!;
  }

  set state(state: T) {
    if (state !== this._state) {
      const prevState = this.state;
      this._state = state;
      this.listeners.forEach(listener => listener(state, prevState));
    }
  }

  clear = () => {
    this._state = undefined;
  };

  setState = (state: T | ((prevState?: T) => T)) =>
    (this.state =
      typeof state === 'function'
        ? (state as (prevState?: T) => T)(this.state)
        : state);

  onChange = (callback: (state: T, prevState: T) => void) => {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(test => test !== callback);
    };
  };

  once = (callback: (state: T, prevState: T) => void) => {
    const unsubscribe = this.onChange((state, prevState) => {
      unsubscribe();
      callback(state, prevState);
    });
    return unsubscribe;
  };

  waitForValue = (timeout = 5e3): Promise<T> => {
    if (this.state !== undefined) return Promise.resolve(this.state);

    if (timeout)
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          unsubscribe();
          reject('Timeout');
        }, timeout);
        const unsubscribe = this.once(state => {
          clearTimeout(timer);
          resolve(state);
        });
      });

    return new Promise(resolve => this.once(state => resolve(state)));
  };

  useState = () => {
    const [state, setState] = useState(this.state);
    useEffect(() => {
      const unsubscribe = this.onChange(setState);
      return unsubscribe;
    }, [setState]);
    return [state, this.setState] as const;
  };

  use = () => this.useState()[0];
}
