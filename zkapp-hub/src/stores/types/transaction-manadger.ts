export type Transaction = { id: string }

export interface ITransactionManager {

  transaction<T>(
    fn: (txn: Transaction) => Promise<T>,
    parentTxn: Transaction
  ): Promise<T>;

  getTransaction<T = unknown>(tnxId: string): T;
}