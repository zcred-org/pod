type DetailedErrorOptions = {
  name?: string;
  cause?: Error;
}

export class DetailedError extends Error {
  cause?: Error;

  constructor(msg?: string, opts?: DetailedErrorOptions | Error) {
    super(msg);
    if (opts instanceof Error) this.cause = opts;
    else {
      if (opts?.name) this.name = opts.name;
      if (opts?.cause) this.cause = opts.cause;
    }
  }
}

export class AbortError extends DOMException {
  constructor(msg?: string) {
    super(msg || 'The operation was aborted', 'AbortError');
  }
}

export class RejectedByUserError extends Error {
  constructor(msg?: string) {
    super(msg || 'The operation was rejected by the user');
  }
}
