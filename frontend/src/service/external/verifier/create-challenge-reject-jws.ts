import { CompactSign } from 'jose';
import sortKeys from 'sort-keys';


const EXCEPTION_DIFFICULTY_DEFAULT = 5;

export async function createChallengeRejectJWS(args: {
  message: string;
  exceptionDifficulty?: number;
}): Promise<string> {
  const secret = Buffer.from(await crypto.subtle.digest('SHA-256', Buffer.from(args.message)));
  const challenge = { messageHash: secret.toString('hex'), nonce: 0 };
  for (; ; ++challenge.nonce) {
    const challengeBytes = Buffer.from(JSON.stringify(sortKeys(challenge)));
    const proof = Buffer.from(await crypto.subtle.digest('SHA-256', challengeBytes)).toString('hex');
    if (proof.startsWith('0'.repeat(args.exceptionDifficulty || EXCEPTION_DIFFICULTY_DEFAULT))) {
      return new CompactSign(challengeBytes)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
    }
  }
}
