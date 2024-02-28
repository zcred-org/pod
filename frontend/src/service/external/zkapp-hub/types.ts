import { JalProgram } from "../verifier/types.ts";

export type CreateProgramReq = {
  program: JalProgram;
}

export type CreateProgramResp = {
  id: string;
  url: string;
}

export type ProgramEntity = {
  id: string;
  target: string;
  data: string;
}