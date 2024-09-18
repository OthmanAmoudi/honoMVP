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
    const result = await this.db
      .select()
      .from(notesTable)
      .where(cursor ? gt(notesTable.id, cursor) : undefined)
      .limit(limit)
      .orderBy(asc(notesTable.id));
    return result;
  }

  async getById(id: string): Promise<Note> {
    const result = await this.db
      .select()
      .from(notesTable)
      .where(eq(notesTable.id, id));

    if (!result.length) {
      throw new NotFoundError(`Resource Note with id ${id} not found`);
    }
    return result[0];
  }

  async create(data: NewNote): Promise<Note> {
    const cleanedData = this.validate(InsertNoteSchema, data);
    const createdId = await this.db
      .insert(notesTable)
      .values(cleanedData)
      .$returningId();
    const result = await this.getById(createdId[0].id);
    return result;
  }

  async update(id: string, data: Partial<NewNote>): Promise<Note> {
    const cleanedData = this.validate(UpdateNoteSchema, data);
    const updatedId = await this.db
      .update(notesTable)
      .set(cleanedData)
      .where(eq(notesTable.id, id));
    if (!updatedId[0].affectedRows) {
      throw new NotFoundError(`Resource Note with id ${id} not found`);
    }
    const result = await this.getById(id);
    return result;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(notesTable)
      .where(eq(notesTable.id, id));
    if (!result[0].affectedRows) {
      throw new NotFoundError(`Resource Note with id ${id} not found`);
    }
  }
}
