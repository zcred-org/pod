import type { JalProgram } from '@jaljs/core';
import sortKeys from 'sort-keys';


export async function jalIdFrom(jalProgram: JalProgram): Promise<string> {
  const jalProgramSorted = sortKeys(jalProgram, { deep: true });
  const jalProgramStringed = JSON.stringify(jalProgramSorted);
  const jalProgramBuffer = Buffer.from(jalProgramStringed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', jalProgramBuffer).then(Buffer.from);
  return hashBuffer.toString('hex');
}
