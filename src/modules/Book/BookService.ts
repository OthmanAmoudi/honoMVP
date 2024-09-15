import { NotFoundError, BaseService } from "../../utils";
import { eq, gt, asc } from "drizzle-orm";
import {
  InsertBookSchema,
  UpdateBookSchema,
  NewBook,
  bookTable,
  UpdateBook,
  Book,
} from "./BookModel";

export default class BookService extends BaseService {
  async getAll(cursor?: string, limit: number = 8): Promise<Book[]> {
    const result = await this.db
      .select()
      .from(bookTable)
      .where(cursor ? gt(bookTable.id, cursor) : undefined)
      .limit(limit)
      .orderBy(asc(bookTable.id));
    return result;
  }

  async getById(id: string) {
    const result = await this.db
      .select()
      .from(bookTable)
      .where(eq(bookTable.id, id));
    if (!result[0]) {
      throw new NotFoundError("Resource Book with id " + id + " not found");
    }
    return result[0];
  }

  async create(data: NewBook) {
    const cleanedData = this.validate(InsertBookSchema, data);
    const result = await this.db
      .insert(bookTable)
      .values(cleanedData)
      .returning();
    return result[0];
  }

  async update(id: string, data: UpdateBook) {
    const cleanedData = this.validate(UpdateBookSchema, data);
    const result = await this.db
      .update(bookTable)
      .set(cleanedData)
      .where(eq(bookTable.id, id))
      .returning();
    if (!result[0]) {
      throw new NotFoundError("Resource Book with id " + id + " not found");
    }
    return result[0];
  }

  async delete(id: string) {
    const result = await this.db
      .delete(bookTable)
      .where(eq(bookTable.id, id))
      .returning();
    if (!result[0]) {
      throw new NotFoundError("Resource Book with id " + id + " not found");
    }
  }
  async khr(id: string) {
    return "khr";
  }
}
