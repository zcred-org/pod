import { ProgramEntity } from "../entities/program.entity.js";
import { tokens } from "typed-inject";
import { type DbClient } from "../backbone/db-client.js";
import { eq } from "drizzle-orm";
import { PgTxn } from "./pg-transaction-manager.js";

export class ProgramStore {

  private readonly db: DbClient["db"];

  static inject = tokens("dbClient");
  constructor(
    dbClient: DbClient
  ) {
    this.db = dbClient.db;
  }

  async save(program: ProgramEntity, tx?: PgTxn): Promise<Pick<ProgramEntity, "id">> {
    const executor = tx ? tx : this.db;
    const [result] = await executor
      .insert(ProgramEntity)
      .values(program)
      .returning({ id: ProgramEntity.id })
      .prepare("create_program")
      .execute();
    return result!;
  }

  async findOne(props: Pick<ProgramEntity, "id">, tx?: PgTxn): Promise<ProgramEntity> {
    const result = await this.findOneOrNull(props, tx);
    if (result) return result;
    throw new Error(
      `Can not find program by id: ${props.id}`
    );
  }

  async findOneOrNull(
    props: Pick<ProgramEntity, "id">,
    tx?: PgTxn
  ): Promise<ProgramEntity | null> {
    const executor = tx ? tx : this.db;
    const [result] = await executor
      .select()
      .from(ProgramEntity)
      .where(eq(ProgramEntity.id, props.id))
      .prepare("find_one_or_null_program")
      .execute();
    if (result) return result;
    return null;
  }

}