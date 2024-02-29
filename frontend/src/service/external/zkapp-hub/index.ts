import { CreateProgramReq, CreateProgramResp, ProgramEntity } from "./types.ts";
import { config } from "../../../config/index.ts";

const origin = new URL(config.zkappHubOrigin);

export class ZkappHub {

  static async createProgram(input: CreateProgramReq): Promise<CreateProgramResp> {
    const endpoint = new URL("./api/v1/program", origin);
    const method = "POST";
    const resp = await fetch(endpoint, {
      method: method,
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (resp.ok) return await resp.json();
    const message = await resp.text();
    throw new Error(
      `Http request error. URL: ${endpoint.href}; message: ${message}; method: ${method}`
    );
  }

  static async getProgram(input: { id: string }): Promise<ProgramEntity> {
    const endpoint = new URL(`./api/v1/program/${input.id}`, origin);
    const resp = await fetch(endpoint);
    if (resp.ok) return await resp.json();
    const message = await resp.text();
    throw new Error(
      `Http request error. URL: ${endpoint.href}; message: ${message}; method: GET`
    );
  }
}