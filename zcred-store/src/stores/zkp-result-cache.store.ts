import { tokens } from '../util/tokens.js';
import type { DbClient } from '../backbone/db-client.js';
import { ZkpResultCacheEntity, type ZkpResultCacheEntityNew } from '../models/entities/zkp-result-cache.entity.js';
import { eq, sql, and } from 'drizzle-orm';


export class ZkpResultCacheStore {
  readonly #searchOneQuery;
  readonly #upsertOneQuery;

  public static readonly inject = tokens('dbClient');

  constructor({ db }: DbClient) {
    this.#searchOneQuery = db.select()
      .from(ZkpResultCacheEntity)
      .where(and(
        eq(ZkpResultCacheEntity.controlledBy, sql.placeholder('controlledBy')),
        eq(ZkpResultCacheEntity.jalId, sql.placeholder('jalId')),
      ))
      .limit(1)
      .prepare('zkp_result_cache__search_one');

    const zkpResultCacheForSave: any = {
      controlledBy: sql.placeholder('controlledBy'),
      jalId: sql.placeholder('jalId'),
      data: sql.placeholder('data'),
    }

    this.#upsertOneQuery = db.insert(ZkpResultCacheEntity)
      .values(zkpResultCacheForSave)
      .onConflictDoUpdate({
        target: [ZkpResultCacheEntity.controlledBy, ZkpResultCacheEntity.jalId],
        set: {
          data: zkpResultCacheForSave.data,
          updatedAt: sql`now()`,
        }
      })
      .prepare('zkp_result_cache__upsert_one');
  }

  async findOne(args: { controlledBy: string, jalId: string }): Promise<ZkpResultCacheEntity | undefined> {
    const res = await this.#searchOneQuery.execute(args);
    return res.at(0);
  }

  async upsertOne(entity: ZkpResultCacheEntityNew): Promise<void> {
    await this.#upsertOneQuery.execute(entity);
  }
}
