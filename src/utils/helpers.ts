export const stringToBoolean = (inputString: string): boolean => {
  const lowercasedInput = inputString.toLowerCase().trim();
  if (lowercasedInput === 'true') {
    return true;
  } else if (lowercasedInput === 'false') {
    return false;
  }
  throw new Error(`Unable to parse '${inputString}' as boolean`);
};

export function getErrorMessage(error: Error) {
  // This replacement is because when the error reaches here, it's been wrapped
  // by Error: multiple times
  let errorMsg = error.message || error.name || 'unknown';
  errorMsg = errorMsg.replace(/Error:/g, '');
  if (error.stack) {
    errorMsg += ' in ' + error.stack.substring(0, 100);
  }
  return errorMsg;
}

/**
 * Utility type to extract external Props of a component (respecting defaultProps)
 * See https://github.com/Microsoft/TypeScript/issues/26704
 * Usage: ExtractProps<typeof SomeComponent>
 */
export type ExtractProps<T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> =
  JSX.LibraryManagedAttributes<T, React.ComponentProps<T>>;
