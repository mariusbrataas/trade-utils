export function cn(
  ...styles: (string | boolean | undefined | null | number)[]
) {
  return styles.filter(test => test && (test as string).length).join(' ');
}
