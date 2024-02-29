import { JalProgram } from "@jaljs/core";
import { JsProgramInputTransformer, JsProgramTranslator } from "@jaljs/o1js";
import * as o1js from "o1js";
import { ZkCredential } from "@zcredjs/core";
import { codeToURL, toJalSetup } from "@/util/index.ts";
import { FilterModule } from "@/service/o1js-credential-filter/types.ts";

const mjsProgramTranslator = new JsProgramTranslator(o1js, "module");
const cjsProgramTranslator = new JsProgramTranslator(o1js, "commonjs");
const inputTransformer = new JsProgramInputTransformer(o1js);

export class O1JSCredentialFilter {

  constructor(
    readonly jalProgram: JalProgram,
    private readonly program: ReturnType<FilterModule["initialize"]>
  ) {}

  static async create(jalProgram: JalProgram): Promise<O1JSCredentialFilter> {
    const translator = jalProgram.target.endsWith(".cjs")
      ? cjsProgramTranslator
      : mjsProgramTranslator;
    const code = translator.translate(jalProgram);
    const url = codeToURL(code);
    const module: FilterModule = await import(/* @vite-ignore */ url);
    const program = module.initialize(o1js);
    return new O1JSCredentialFilter(jalProgram, program);
  }

  execute(credential: ZkCredential): boolean {
    const setup = toJalSetup(credential);
    const input = inputTransformer.transform(setup, this.jalProgram.inputSchema);
    return this.program.execute(input);
  }
}