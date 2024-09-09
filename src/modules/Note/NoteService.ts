// src/services/NoteService.ts
import { NewNote, notesTable, UpdateNote } from "./NoteModel";
import { NotFoundError } from "../../utils/Errors";
import { eq } from "drizzle-orm";
import BaseService from "../../utils/BaseService";
import { InsertNoteSchema, UpdateNoteSchema, NoteSchema } from "./NoteModel";
export default class NoteService extends BaseService {
  async getAll() {
    return this.handleErrors(async () => {
      return await this.db.select().from(notesTable);
    });
  }

  async getById(id: string) {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(notesTable)
        .where(eq(notesTable.id, id));
      if (!result[0]) {
        throw new NotFoundError(`Todo with id ${id} not found`);
      }
      return result[0];
    });
  }

  async create(data: NewNote) {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(InsertNoteSchema, data);
      const result = await this.db
        .insert(notesTable)
        .values(cleanedData)
        .returning();
      return result[0];
    });
  }

  async update(id: string, data: UpdateNote) {
    return this.handleErrors(async () => {
      this.validate(UpdateNoteSchema, data);
      const result = await this.db
        .update(notesTable)
        .set(data)
        .where(eq(notesTable.id, id))
        .returning();
      if (!result[0]) {
        throw new NotFoundError(`Note with id ${id} not found`);
      }
      return result[0];
    });
  }

  async delete(id: string) {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(notesTable)
        .where(eq(notesTable.id, id))
        .returning();
      if (!result[0]) {
        throw new NotFoundError(`Note with id ${id} not found`);
      }
    });
  }
}
