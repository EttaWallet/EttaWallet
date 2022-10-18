export const getFirstCapitalCharacter = (value: string): string =>
  value.charAt(0).toUpperCase().concat(value.slice(1));

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getLabel = (children, capitalFirst: boolean) =>
  typeof children === 'string' && capitalFirst
    ? getFirstCapitalCharacter(children)
    : children;
