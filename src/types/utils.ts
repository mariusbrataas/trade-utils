export interface Mapped<T> {
  [key: string]: T;
}

type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: undefined;
};

export type Either<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type OneOrBoth<A, B> = Partial<A & B> & (A | B);

export type AllOrNone<T> = T | { [K in keyof T]?: never };

export type Dotify<
  T,
  Type extends string | number | boolean = string | number | boolean,
  Path extends string = "",
  Seg extends string[] = [],
> = T extends string | number | boolean
  ? T extends Type
    ? Path
    : never
  : Seg["length"] extends 7
    ? never
    : T extends any[]
      ? T extends Type[]
        ? Path
        : never
      : {
          [key in string & keyof T]: Dotify<
            T[key],
            Type,
            Path extends "" ? key : `${Path}.${key}`,
            [...Seg, key]
          >;
        }[string & keyof T];

export type Slashify<
  T,
  Type extends string | number | boolean = string | number | boolean,
  Path extends string = "",
  Seg extends string[] = [],
> = T extends string | number | boolean
  ? T extends Type
    ? Path
    : never
  : Seg["length"] extends 7
    ? never
    : T extends any[]
      ? T extends Type[]
        ? Path
        : never
      : {
          [key in string & keyof T]: Slashify<
            T[key],
            Type,
            Path extends "" ? key : `${Path}/${key}`,
            [...Seg, key]
          >;
        }[string & keyof T];

export type Ordered<T = any> = Record<string, { orderValue: number; state: T }>;

export type PropsWithParams<P extends string> = { params: Record<P, string> };
