export function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
