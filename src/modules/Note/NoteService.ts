// src/services/NoteService.ts
import { NotFoundError, BaseService } from "../../utils";
import { eq, gt, asc } from "drizzle-orm";
import {
  InsertNoteSchema,
  UpdateNoteSchema,
  NewNote,
  notesTable,
  UpdateNote,
  Note,
} from "./NoteModel";
export default class NoteService extends BaseService {
  async getAll(cursor?: string, limit: number = 3): Promise<Note[]> {
    return await this.db
      .select()
      .from(notesTable)
      .where(cursor ? gt(notesTable.id, cursor) : undefined)
      .limit(limit)
      .orderBy(asc(notesTable.id));
  }

  async getById(id: string) {
    const result = await this.db
      .select()
      .from(notesTable)
      .where(eq(notesTable.id, id));
    if (!result[0]) {
      throw new NotFoundError(`Resource with id ${id} not found`);
    }
    return result[0];
  }

  async create(data: NewNote) {
    const cleanedData = this.validate(InsertNoteSchema, data);
    const result = await this.db
      .insert(notesTable)
      .values(cleanedData)
      .returning();
    return result[0];
  }

  async update(id: string, data: UpdateNote) {
    const cleanedData = this.validate(UpdateNoteSchema, data);
    console.log(cleanedData);
    const result = await this.db
      .update(notesTable)
      .set(cleanedData)
      .where(eq(notesTable.id, id)) // convert to number if your id is a number e.g Number(id)
      .returning();
    if (!result[0]) {
      throw new NotFoundError(`Resource with id ${id} not found`);
    }
    return result[0];
  }

  async delete(id: string) {
    const result = await this.db
      .delete(notesTable)
      .where(eq(notesTable.id, id)) // convert to number if your id is a number e.g Number(id)
      .returning();
    if (!result[0]) {
      throw new NotFoundError(`Resource with id ${id} not found`);
    }
  }
}
