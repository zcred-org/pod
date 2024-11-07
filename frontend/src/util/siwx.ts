import { config } from '@/config';


type SiwxMessageArgs = {
  domain: string,
  blockchain: string,
  accountAddress: string,
  uri: string,
  version: string,
  statement: string,
}

/**
 * @source https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-122.md
 * @source https://eips.ethereum.org/EIPS/eip-4361
 */
export class SiwxMessage {
  readonly #args: SiwxMessageArgs;
  readonly #warning: string;

  constructor(args: Pick<SiwxMessageArgs, 'blockchain' | 'accountAddress'>) {
    const domain = config.domain; // TODO: location.hostname ???;
    this.#warning = [
      `Warning: Ensure you sign this message only on the ${domain} domain,`,
      'as signing it elsewhere may result in the loss of control over your digital credentials.',
    ].join(' ');
    const statement = [
      'Please sign this message to log in to zCred.',
      this.#warning,
    ].join(' ');

    this.#args = {
      ...args,
      domain,
      statement: statement,
      uri: `https://${domain}`, // TODO: location.href ???,
      version: '1',
    };
  }

  public splitByWarning() {
    let result = this.toString().split(this.#warning);
    result = [result[0], this.#warning, result[1]];
    return result as [string, string, string];
  }

  public toString() {
    return `
${(this.#args.domain)} wants you to sign in with your ${this.#args.blockchain} account:
${this.#args.accountAddress}

${this.#args.statement}

URI: ${(this.#args.uri)}
Version: ${(this.#args.version)}
Chain ID: 0
Nonce: 00000000
Issued At: 1970-01-01T00:00:00Z
    `.trim();
  }
}
