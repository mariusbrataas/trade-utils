import { OrderedMap } from '@/lib/OrderedMap';
import { Ordered } from '@/types';
import type { StateLake } from 'statelake';

const MappedItem = <T extends any, P extends any>({
  parentBranch,
  Component,
  id,
  props,
  idx
}: {
  parentBranch: StateLake<Ordered<T>>;
  Component: (props: { branch: StateLake<T>; idx: number } & P) => JSX.Element;
  props?: Omit<P, 'branch' | 'idx'>;
  id: string;
  idx: number;
}) => {
  const branch = parentBranch.useBranch(id);
  return (
    <Component
      branch={branch.getBranch('state')}
      idx={idx}
      {...(props as any)}
    />
  );
};

export const MapOrdered = <T extends any, P extends any>({
  branch,
  Component,
  props
}: {
  branch: StateLake<Ordered<T>> | StateLake<Ordered<T> | undefined>;
  Component: (props: { branch: StateLake<T>; idx: number } & P) => JSX.Element;
  props?: Omit<P, 'branch' | 'idx'>;
}) => {
  const state = branch.use();
  return OrderedMap.keys(state ?? {}).map((key, idx) => (
    <MappedItem
      parentBranch={branch as StateLake<Ordered<T>>}
      Component={Component}
      key={key}
      id={key}
      props={props}
      idx={idx}
    />
  ));
};

export const MapOrderedState = <T extends any>({
  state,
  Component
}: {
  state: Ordered<T>;
  Component: (props: { state: T }) => JSX.Element;
}) => {
  const keys = OrderedMap.keys(state);

  return keys.map(key => <Component key={key} state={state[key].state} />);
};
