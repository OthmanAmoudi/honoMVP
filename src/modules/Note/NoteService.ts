// src/services/NoteService.ts
import { NotFoundError, BaseService } from "../../utils";
import { eq, gt, asc } from "drizzle-orm";
import {
  Note,
  NewNote,
  UpdateNote,
  notesTable,
  UpdateNoteSchema,
  InsertNoteSchema,
} from "./NoteModel";
export default class NoteService extends BaseService {
  async getAll(cursor?: string, limit: number = 3): Promise<Note[]> {
    return this.handleErrors(async () => {
      return await this.db
        .select()
        .from(notesTable)
        .where(cursor ? gt(notesTable.id, cursor) : undefined)
        .limit(limit)
        .orderBy(asc(notesTable.id));
    });
  }

  async getById(id: string) {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(notesTable)
        .where(eq(notesTable.id, id));
      if (!result[0]) {
        throw new NotFoundError(`Resource with id ${id} not found`);
      }
      return result[0];
    });
  }

  async create(data: NewNote) {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(InsertNoteSchema, data);
      const createdId = await this.db
        .insert(notesTable)
        .values(cleanedData)
        .$returningId();
      console.log(createdId);
      const result = await this.getById(createdId[0].id);
      // .returning();
      return result;
    });
  }

  async update(id: string, data: UpdateNote) {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(UpdateNoteSchema, data);
      const updatedId = await this.db
        .update(notesTable)
        .set(cleanedData)
        .where(eq(notesTable.id, id)); // convert to number if your id is a number e.g Number(id)
      // .returning();
      if (!updatedId[0].affectedRows) {
        throw new NotFoundError(`Resource with id ${id} not found`);
      }
      const result = await this.getById(id);
      return result;
    });
  }

  async delete(id: string) {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(notesTable)
        .where(eq(notesTable.id, id)); // convert to number if your id is a number e.g Number(id)
      // .returning();
      if (!result[0].affectedRows) {
        throw new NotFoundError(`Resource with id ${id} not found`);
      }
    });
  }
}
