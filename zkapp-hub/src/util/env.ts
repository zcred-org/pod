import dotenv, { DotenvConfigOptions, DotenvConfigOutput } from "dotenv";

export function configENV(options?: DotenvConfigOptions): DotenvConfigOutput {
  return dotenv.config(options);
}