import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from 'react';

type ParamType = 'primitive' | 'object';

export function useSearchParamWithType<
  T extends
    | number
    | string
    | boolean
    | undefined
    | (number | string | boolean | undefined)[]
    | object
>(
  key: string,
  defaultState: T,
  type: ParamType
): [T, Dispatch<SetStateAction<T>>] {
  const encodeValue = (value: T) => {
    if (type === 'object') {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return value.map(v => (v === undefined ? '' : v.toString())).join(',');
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return value?.toString();
  };

  const decodeValue = (value: string): T => {
    if (type === 'object') {
      return JSON.parse(value) as T;
    }
    if (Array.isArray(defaultState)) {
      return value.split(',').map(v => {
        if (typeof defaultState[0] === 'boolean') {
          return v === 'true';
        }
        if (typeof defaultState[0] === 'number') {
          return v === '' ? undefined : parseFloat(v);
        }
        return v === '' ? undefined : v;
      }) as T;
    }
    if (typeof defaultState === 'boolean') {
      return (value === 'true') as T;
    }
    if (typeof defaultState === 'number') {
      return parseFloat(value) as T;
    }
    return value as T;
  };

  const getSearchParam = useCallback((): T => {
    const searchParams = new URLSearchParams(window.location.search);
    const param = searchParams.get(key);

    if (param === null) {
      return defaultState;
    }

    return decodeValue(param);
  }, [key, defaultState, type]);

  const [state, setState] = useState<T>(getSearchParam);

  useEffect(() => {
    const handlePopState = () => {
      setState(getSearchParam());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [getSearchParam]);

  const setSearchParam = (newState: T | ((prevState: T) => T)) => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextState =
      typeof newState === 'function' ? newState(state) : newState;
    if (nextState == null) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, encodeValue(nextState)!);
    }

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState(null, '', newUrl);

    setState(nextState);
  };

  return [state, setSearchParam] as const;
}

export function useSearchParam<T extends string | number | boolean | undefined>(
  key: string,
  defaultState: T
) {
  return useSearchParamWithType(key, defaultState, 'primitive');
}

export function useSearchParamObject<T extends object>(
  key: string,
  defaultState: T
) {
  return useSearchParamWithType(key, defaultState, 'object');
}
