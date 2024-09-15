// src/modules/Book/BookService.ts
import { NotFoundError } from "../../utils/errors"; // Ensure you have an errors module
import { eq, gt, asc } from "drizzle-orm";
import {
  InsertBookSchema,
  UpdateBookSchema,
  NewBook,
  bookTable,
  UpdateBook,
  Book,
} from "./BookModel";
import { BaseService } from "../../utils/";

export default class BookService extends BaseService<
  Book,
  typeof InsertBookSchema,
  typeof UpdateBookSchema
> {
  constructor(db: any) {
    super(db);
  }

  async getAll(cursor?: string, limit: number = 8): Promise<Book[]> {
    let query = this.db.select().from(bookTable).orderBy(asc(bookTable.id));
    if (cursor) {
      query = query.where(gt(bookTable.id, cursor)) as typeof query;
    }
    const result = await query.limit(limit);
    return result;
  }

  async getById(id: string): Promise<Book> {
    const result = await this.db
      .select()
      .from(bookTable)
      .where(eq(bookTable.id, id));

    if (!result[0]) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }

    return result[0];
  }

  async create(data: unknown): Promise<Book> {
    const cleanedData = this.validate(InsertBookSchema, data);
    const result = await this.db
      .insert(bookTable)
      .values(cleanedData)
      .returning();

    return result[0];
  }

  async update(id: string, data: unknown): Promise<Book> {
    const cleanedData = this.validate(UpdateBookSchema, data);
    const result = await this.db
      .update(bookTable)
      .set(cleanedData)
      .where(eq(bookTable.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }

    return result[0];
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(bookTable)
      .where(eq(bookTable.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }
  }
}
