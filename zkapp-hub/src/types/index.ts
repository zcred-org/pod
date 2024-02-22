export const JAL_PROGRAM_TARGETS = [
  "o1js:zk-program.mjs",
  "o1js:program.mjs",
  "o1js:zk-program.cjs",
  "o1js:program.cjs"
] as const;

export type JalTarget = typeof JAL_PROGRAM_TARGETS[number];

export function isJalTarget(target: string): target is JalTarget {
  return JAL_PROGRAM_TARGETS
    // @ts-expect-error
    .includes(target);
}
