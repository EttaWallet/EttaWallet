export class Ok {
  value;
  constructor(value) {
    this.value = value;
  }
  isOk() {
    return true;
  }
  isErr() {
    return false;
  }
}

export class Err {
  error;
  constructor(error) {
    this.error = error;
    // Don't console log for unit tests or if we're not in dev mode
    if (process.env.JEST_WORKER_ID === undefined && __DEV__) {
      // tslint:disable-next-line:no-console
      console.log(error);
    }
  }
  isOk() {
    return false;
  }
  isErr() {
    return true;
  }
}

/**
 * Construct a new Ok result value.
 */
export const ok = (value) => new Ok(value);

/**
 * Construct a new Err result value.
 */
export const err = (error) => {
  if (typeof error === 'string') {
    return new Err(new Error(error));
  }
  return new Err(error);
};

export declare type Result<T> = Ok<T> | Err<T>;
