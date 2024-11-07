export type FilterModule = {
  initialize(o1js: typeof import('o1js')): { execute(input: unknown): boolean }
}
