import { tokens } from '../util/tokens.js';
import type { DbClient } from '../backbone/db-client.js';
import { ZkpResultCacheEntity, type ZkpResultCacheEntityNew } from '../models/entities/zkp-result-cache.entity.js';
import { eq, sql, desc } from 'drizzle-orm';


export class ZkpResultCacheStore {
  readonly #searchOneQuery;
  readonly #createOneQuery;

  public static readonly inject = tokens('dbClient');

  constructor({ db }: DbClient) {
    this.#searchOneQuery = db.select().from(ZkpResultCacheEntity)
      .where(eq(ZkpResultCacheEntity.jalId, sql.placeholder('jalId')))
      .orderBy(desc(ZkpResultCacheEntity.createdAt))
      .limit(1)
      .prepare('zkp_result_cache__search_one');

    this.#createOneQuery = db.insert(ZkpResultCacheEntity).values({
      jalId: sql.placeholder('jalId'),
      data: sql.placeholder('data'),
    }).prepare('zkp_result_cache__create_one');
  }

  async searchOne(jalId: string): Promise<ZkpResultCacheEntity | undefined> {
    const res = await this.#searchOneQuery.execute({ jalId });
    return res.at(0);
  }

  async createOne(entity: ZkpResultCacheEntityNew): Promise<void> {
    await this.#createOneQuery.execute(entity);
  }
}
