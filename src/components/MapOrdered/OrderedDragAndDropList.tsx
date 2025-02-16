'use client';

import { OrderedMap } from '@/lib/OrderedMap';
import { Ordered } from '@/types';
import {
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import StateLake from 'statelake';

function disableSortingStrategy() {
  return null;
}

function SortableItem<T, P extends any>({
  id,
  parentBranch,
  Component,
  additionalProps,
  updateItemsOrder,
  orderValue
}: {
  id: string;
  parentBranch: StateLake<Ordered<T>>;
  Component: (props: { branch: StateLake<T> } & P) => JSX.Element;
  additionalProps: Omit<P, 'branch' | 'idx'> | undefined;
  updateItemsOrder: () => void;
  orderValue: number;
}) {
  const branch = parentBranch.useBranch(id);

  const shouldUpdateItemsOrder = branch.use('orderValue') !== orderValue;
  useEffect(() => {
    if (shouldUpdateItemsOrder) updateItemsOrder();
  }, [shouldUpdateItemsOrder]);

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style: CSSProperties = {
    opacity: isDragging ? 0.5 : undefined,
    transform: CSS.Translate.toString(transform),
    transition
  };

  return (
    <li style={style} ref={setNodeRef} {...attributes} {...listeners}>
      <Component
        branch={branch.getBranch('state')}
        {...(additionalProps as any)}
      />
    </li>
  );
}

export function OrderedDragAndDropList<T, P extends any>({
  children,
  branch,
  Component,
  props: additionalProps,
  className
}: PropsWithChildren<{
  branch: StateLake<Ordered<T>>;
  Component: (props: { branch: StateLake<T> } & P) => JSX.Element;
  props?: Omit<P, 'branch' | 'idx'>;
  className?: string;
}>) {
  const [state, setState] = branch.useState();

  const items = useMemo(() => OrderedMap.keys(state ?? {}), [state]);
  const updateItemsOrder = useCallback(() => {
    setState((prevState = {}) => {
      const prevOrder = OrderedMap.keys(prevState ?? {});
      const newOrder = OrderedMap.keys(branch.state ?? {});
      if (arraysEqual(prevOrder, newOrder)) return prevState;
      return { ...prevState };
    });
  }, [branch]);

  const [activeId, setActiveId] = useState<string>();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  return (
    <ul className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragEnd}
      >
        <SortableContext items={items} strategy={disableSortingStrategy}>
          {items.map(id => (
            <SortableItem
              key={id}
              id={id}
              Component={Component}
              parentBranch={branch}
              additionalProps={additionalProps}
              updateItemsOrder={updateItemsOrder}
              orderValue={state[id].orderValue}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <li>
              <Component
                branch={branch.getBranch(activeId, 'state')}
                {...(additionalProps as any)}
              />
            </li>
          ) : null}
        </DragOverlay>
      </DndContext>
      {children ? <li>{children}</li> : undefined}
    </ul>
  );

  function handleDragOver({ active, over }: DragOverEvent) {
    if (over && active.id !== over.id) {
      const oldOrder = OrderedMap.keys(branch.state);
      const newOrder = arrayMove(
        oldOrder,
        oldOrder.indexOf(active.id as string),
        oldOrder.indexOf(over.id as string)
      );
      if (!arraysEqual(oldOrder, newOrder))
        setState(OrderedMap.setOrder(branch.state, newOrder, true));
    }
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd() {
    setActiveId(undefined);
  }
}

function arraysEqual(a?: any[], b?: any[]) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  const [longest, shortest] = a.length > b.length ? [a, b] : [b, a];
  return longest.every((item, idx) => item === shortest[idx]);
}
