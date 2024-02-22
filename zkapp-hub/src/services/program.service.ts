import { tokens } from "typed-inject";
import { ProgramStore } from "../stores/program.store.js";
import { JalProgram } from "@jaljs/core";
import { isJalTarget, JAL_PROGRAM_TARGETS, JalTarget, } from "../types/index.js";
import * as o1js from "o1js";
import { JsProgramTranslator, ZkProgramTranslator } from "@jaljs/o1js";
import { toProgramId } from "../util/program.js";
import { DbClient } from "../backbone/db-client.js";
import { ProgramEntity } from "../entities/program.entity.js";


export class ProgramService {

  private readonly translators: Record<JalTarget, (jal: JalProgram) => string>;
  private readonly db: DbClient["db"];

  static inject = tokens("programStore", "dbClient");
  constructor(
    private readonly programStore: ProgramStore,
    dbClient: DbClient
  ) {
    this.db = dbClient.db;
    this.translators = {
      "o1js:zk-program.mjs": new ZkProgramTranslator(o1js, "module").translate,
      "o1js:program.mjs": new JsProgramTranslator(o1js, "module").translate,
      "o1js:zk-program.cjs": new ZkProgramTranslator(o1js, "commonjs").translate,
      "o1js:program.cjs": new JsProgramTranslator(o1js, "commonjs").translate
    };
  }

  async findOneOrNull(props: Pick<ProgramEntity, "id">) {
    return await this.programStore.findOneOrNull(props);
  }

  async findOrCreateFrom(jalProgram: JalProgram) {
    const programId = toProgramId(jalProgram);
    const target = jalProgram.target;
    if (!isJalTarget(target)) throw new Error(
      `JAL program target ${target} is not valid. Valid targets: ${JAL_PROGRAM_TARGETS.join(", ")}`
    );
    return await this.db.transaction<{ id: string }>(async (tx) => {
      const found = await this.programStore.findOneOrNull({ id: programId }, tx);
      if (found) return found;
      const translatedProgram = this.translators[target](jalProgram);
      return await this.programStore.save({
        id: programId,
        target: target,
        data: translatedProgram
      }, tx);
    });
  }
}