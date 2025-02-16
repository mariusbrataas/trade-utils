import { generateId } from '@/lib/generateId';
import { Ordered } from '@/types';
import StateLake from 'statelake';

export abstract class OrderedMap {
  static fromArray = <T extends any>(items: T[]) => {
    return items.reduce<Ordered<T>>((acc, item, idx) => {
      acc[generateId()] = { orderValue: idx, state: item };
      return acc;
    }, {});
  };

  static fromObject = <T extends any>(object: Record<string, T>) => {
    return Object.keys(object).reduce<Ordered<T>>((acc, key, idx) => {
      acc[key] = { orderValue: idx, state: object[key] };
      return acc;
    }, {});
  };

  static entries = <T extends any>(
    records: Ordered<T>
  ): [key: string, value: T][] => {
    return OrderedMap.keys(records).map(key => [key, records[key].state]);
  };

  static keys = <T extends any>(records: Ordered<T>) => {
    return Object.keys(records).sort(
      (a, b) => records[a].orderValue - records[b].orderValue
    );
  };

  static toArray = <T extends any>(records: Ordered<T>) => {
    return Object.values(records)
      .sort((a, b) => a.orderValue - b.orderValue)
      .map(record => record.state);
  };

  static map = <T extends any, R>(
    records: Ordered<T>,
    func: (value: T, key: string, index: number) => R
  ) => this.keys(records).map((key, idx) => func(records[key].state, key, idx));

  static toUnsortedArray = <T extends any>(records: Ordered<T>) => {
    return Object.values(records).map(record => record.state);
  };

  static firstId = <T extends any>(records: Ordered<T>): string | null => {
    const ids = Object.keys(records);
    if (ids.length === 0) return null;

    let first = { id: ids[0], item: records[ids[0]] };
    ids.forEach(id => {
      const item = records[id];
      if (item.orderValue < first.item.orderValue) {
        first.id = id;
        first.item = item;
      }
    });
    return first.id;
  };

  static lastId = <T extends any>(records: Ordered<T>): string | null => {
    const ids = Object.keys(records);
    if (ids.length === 0) return null;

    let last = { id: ids[0], item: records[ids[0]] };
    ids.forEach(id => {
      const item = records[id];
      if (item.orderValue > last.item.orderValue) {
        last.id = id;
        last.item = item;
      }
    });
    return last.id;
  };

  static nextId = <T extends any>(
    records: Ordered<T>,
    referenceId: string
  ): string | null => {
    const referenceItem = records[referenceId];
    if (!referenceItem) return null;

    let nextId: string | null = null;
    let nextOrderValue = Infinity;

    Object.keys(records).forEach(id => {
      const item = records[id];
      if (
        item.orderValue > referenceItem.orderValue &&
        item.orderValue < nextOrderValue
      ) {
        nextId = id;
        nextOrderValue = item.orderValue;
      }
    });

    return nextId;
  };

  static prevId = <T extends any>(
    records: Ordered<T>,
    referenceId: string
  ): string | null => {
    const referenceItem = records[referenceId];
    if (!referenceItem) return null;

    let prevId: string | null = null;
    let prevOrderValue = -Infinity;

    Object.keys(records).forEach(id => {
      const item = records[id];
      if (
        item.orderValue < referenceItem.orderValue &&
        item.orderValue > prevOrderValue
      ) {
        prevId = id;
        prevOrderValue = item.orderValue;
      }
    });

    return prevId;
  };

  static firstBranch = <T extends any>(
    records: StateLake<Ordered<T> | undefined>
  ): StateLake<T> | null => {
    const firstId = this.firstId(records.state ?? {});
    if (firstId) return records.getBranch(firstId, 'state');
    return null;
  };

  static lastBranch = <T extends any>(
    records: StateLake<Ordered<T> | undefined>
  ): StateLake<T> | null => {
    const lastId = this.lastId(records.state ?? {});
    if (lastId) return records.getBranch(lastId, 'state');
    return null;
  };

  static calculateNewOrderValue = <T extends any>(
    records: Ordered<T>,
    referenceId: string,
    moveDirection: 'before' | 'after'
  ): number => {
    const referenceOrderValue = ensureNumber(records[referenceId].orderValue);
    if (moveDirection === 'before') {
      const neighborId = this.prevId(records, referenceId);
      if (neighborId)
        return (referenceOrderValue + records[neighborId].orderValue) / 2;
      return referenceOrderValue - 1;
    } else {
      const neighborId = this.nextId(records, referenceId);
      if (neighborId)
        return (referenceOrderValue + records[neighborId].orderValue) / 2;
      return referenceOrderValue + 1;
    }
  };

  static setOrder = <T extends any>(
    records: Ordered<T>,
    newOrder: string[],
    statefull?: boolean
  ) => {
    const oldOrder = this.keys(records);

    const newOrderTable: Record<string, true> = {};

    newOrder.forEach((item, idx) => {
      newOrderTable[item] = true;
      records[item].orderValue = idx;
    });

    oldOrder
      .filter(item => !newOrderTable[item])
      .forEach(
        (item, idx) => (records[item].orderValue = newOrder.length + idx)
      );

    return statefull ? { ...records } : records;
  };

  static append = <T, K extends T>(
    records: Ordered<T>,
    state: K,
    statefull = false,
    id = generateId()
  ) => {
    if (Object.keys(records).length === 0) {
      records[id] = { state, orderValue: 1 };
      return statefull ? { ...records } : records;
    }
    return this.insert(
      records,
      state,
      this.lastId(records)!,
      'after',
      statefull,
      id
    );
  };

  static appendToBranch = <T extends any>(
    branch: StateLake<Ordered<T>>,
    state: T,
    id = generateId()
  ) => {
    branch.setState()(prevState =>
      OrderedMap.append(prevState ?? {}, state, true, id)
    );
    return id;
  };

  static insert = <T extends any>(
    records: Ordered<T>,
    state: T,
    referenceId: string,
    direction: 'before' | 'after' = 'after',
    statefull = false,
    id = generateId()
  ) => {
    records[id] = {
      state,
      orderValue: this.calculateNewOrderValue(records, referenceId, direction)
    };
    return statefull ? { ...records } : records;
  };

  static insertBefore = <T extends any>(
    records: Ordered<T>,
    state: T,
    referenceId: string,
    statefull = false,
    id = generateId()
  ) => {
    return this.insert(records, state, referenceId, 'before', statefull, id);
  };

  static insertAfter = <T extends any>(
    records: Ordered<T>,
    state: T,
    referenceId: string,
    statefull = false,
    id = generateId()
  ) => {
    return this.insert(records, state, referenceId, 'after', statefull, id);
  };

  /**
   * Insert a new element before the given branch, and return the branch
   * of the new element.
   */
  static insertBeforeBranch = <T extends any>(
    branch: StateLake<T>,
    value: T,
    id = generateId()
  ) => {
    if (!OrderedMap.isChildOfOrderedMap(branch))
      throw new Error('Branch must be child of StateLake<OrderedMap<T>>');
    const parent = branch.parent! as StateLake<Ordered<T>[string]>;
    const grandParent = parent.parent! as StateLake<Ordered<T>>;
    grandParent.setState()(prevState =>
      OrderedMap.insertBefore(
        prevState ?? {},
        value,
        branch.parent!.key,
        true,
        id
      )
    );
    return grandParent.getBranch(id, 'state');
  };

  /**
   * Insert a new element after the given branch, and return the branch
   * of the new element.
   */
  static insertAfterBranch = <T extends any>(
    branch: StateLake<T>,
    value: T,
    id = generateId()
  ) => {
    if (!OrderedMap.isChildOfOrderedMap(branch))
      throw new Error('Branch must be child of StateLake<OrderedMap<T>>');
    const parent = branch.parent! as StateLake<Ordered<T>[string]>;
    const grandParent = parent.parent! as StateLake<Ordered<T>>;
    grandParent.setState()(prevState =>
      OrderedMap.insertAfter(
        prevState ?? {},
        value,
        branch.parent!.key,
        true,
        id
      )
    );
    return grandParent.getBranch(id, 'state');
  };

  static isChildOfOrderedMap = <T extends any>(branch: StateLake<T>) => {
    const parent = branch.parent as StateLake<Ordered<T>[string]> | undefined;
    if (!parent) return false;
    const state = parent.state;
    if ('state' in state && 'orderValue' in state) return true;
    return false;
  };

  static moveBefore = <T extends any>(
    records: Ordered<T>,
    targetId: string,
    beforeId: string
  ) => {
    if (!records[targetId] || !records[beforeId] || targetId === beforeId)
      return records;

    records[targetId].orderValue = this.calculateNewOrderValue(
      records,
      beforeId,
      'before'
    );
    return records;
  };

  static moveAfter = <T extends any>(
    records: Ordered<T>,
    targetId: string,
    afterId: string
  ) => {
    if (!records[targetId] || !records[afterId] || targetId === afterId)
      return records;

    records[targetId].orderValue = this.calculateNewOrderValue(
      records,
      afterId,
      'after'
    );
    return records;
  };

  static moveBackward = <T extends any>(records: Ordered<T>, id: string) => {
    const prevId = this.prevId(records, id);
    if (prevId) return this.moveBefore(records, id, prevId);
    return records;
  };

  static moveForward = <T extends any>(records: Ordered<T>, id: string) => {
    const nextId = this.nextId(records, id);
    if (nextId) return this.moveAfter(records, id, nextId);
    return records;
  };

  static moveToBeginning = <T extends any>(
    records: Ordered<T>,
    targetId: string
  ) => {
    if (!records[targetId]) return records;
    const firstId = this.firstId(records);
    if (firstId) this.moveBefore(records, targetId, firstId);
    return records;
  };

  static moveToEnd = <T extends any>(records: Ordered<T>, targetId: string) => {
    if (!records[targetId]) return records;
    const lastId = this.lastId(records);
    if (lastId) this.moveAfter(records, targetId, lastId);
    return records;
  };
}

function ensureNumber(v: string | number): number {
  if (typeof v === 'string') return parseFloat(v);
  return v;
}
