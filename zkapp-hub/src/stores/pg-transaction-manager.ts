import { ITransactionManager } from "./types/transaction-manadger.js";
import { DbClient } from "../backbone/db-client.js";
import { getUniqueId } from "../util/ids.js";

export type PgTxn = Parameters<Parameters<DbClient["db"]["transaction"]>[0]>[0]

export class PgTransactionManager implements ITransactionManager {

  private readonly state: Record<string, PgTxn> = {};
  private readonly db: DbClient["db"];

  constructor(dbClient: DbClient) {
    this.db = dbClient.db;
  }

  async transaction<T>(
    fn: (txn: { id: string }) => Promise<T>, prTxn?: { id: string }): Promise<T> {
    const txnId = getUniqueId();
    let connection = this.db;
    if (prTxn) {
      const parentTxn = this.state[prTxn.id];
      if (!parentTxn) throw new Error(`Can not find parent transaction`);
      connection = parentTxn;
    }
    return await connection
      .transaction(async (transaction) => {
        try {
          this.state[txnId] = transaction;
          return await fn({ id: txnId });
        } catch (e) {
          await transaction.rollback();
          throw e;
        } finally {
          delete this.state[txnId];
        }
      });
  }

  // @ts-expect-error
  getTransaction(txnId: string) {
    const txn = this.state[txnId];
    if (txn) return txn;
    throw new Error(`Can not find transaction`);
  }
}