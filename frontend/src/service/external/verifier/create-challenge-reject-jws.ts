import { CompactSign } from 'jose';
import sortKeys from 'sort-keys';


export async function createChallengeRejectJWS(challengeMessage: string): Promise<string> {
  const secret = Buffer.from(await crypto.subtle.digest('SHA-256', Buffer.from(challengeMessage)));
  const challenge = { messageHash: secret.toString('hex'), nonce: 0 };
  for (; ; ++challenge.nonce) {
    const challengeBytes = Buffer.from(JSON.stringify(sortKeys(challenge)));
    const proof = Buffer.from(await crypto.subtle.digest('SHA-256', challengeBytes)).toString('hex');
    if (proof.startsWith('0'.repeat(5))) {
      return new CompactSign(challengeBytes)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
    }
  }
}
