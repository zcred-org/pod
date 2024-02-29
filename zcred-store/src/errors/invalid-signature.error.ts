export class InvalidSignatureError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = InvalidSignatureError.name;
  }
}
