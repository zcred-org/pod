import type { JalProgram } from "@jaljs/core";
import { JsProgramInputTransformer, JsProgramTranslator } from "@jaljs/o1js";
import type { ZkCredential } from "@zcredjs/core";
import * as o1js from "o1js";
import type { FilterModule } from "@/service/o1js-credential-filter/types.ts";
import { codeToURL } from "@/util/index.ts";
import { jalSetupFrom } from '@/util/jal-setup.ts';


const mjsProgramTranslator = new JsProgramTranslator(o1js, "module");
const cjsProgramTranslator = new JsProgramTranslator(o1js, "commonjs");
const inputTransformer = new JsProgramInputTransformer(o1js);

export class O1JSCredentialFilter {
  private constructor(
    readonly jalProgram: JalProgram,
    private readonly program: ReturnType<FilterModule["initialize"]>,
  ) {}

  static async create(jalProgram: JalProgram): Promise<O1JSCredentialFilter> {
    jalProgram.target = jalProgram.target.replace(/\.cjs$/, ".mjs");
    const translator = jalProgram.target.endsWith(".cjs")
      ? cjsProgramTranslator
      : mjsProgramTranslator;
    const code = translator.translate(jalProgram);
    const url = codeToURL(code);
    const module: FilterModule = await import(/* @vite-ignore */ url);
    const program = module.initialize(o1js);
    return new O1JSCredentialFilter(jalProgram, program);
  }

  isCanProve(credential: ZkCredential): boolean {
    const setup = jalSetupFrom(credential);
    const input = inputTransformer.transform(setup, this.jalProgram.inputSchema);
    return this.program.execute(input);
  }
}
