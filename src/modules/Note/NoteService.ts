// src/services/NoteService.ts
import { z } from "zod";
import { notesTable } from "../../db/models/noteModel";
import { NotFoundError } from "../../utils/errors";
import { eq } from "drizzle-orm";
import BaseService from "../../utils/BaseService";

const noteSchema = z.object({
  description: z.string().min(1),
});

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

  async create(data: z.infer<typeof noteSchema>) {
    return this.handleErrors(async () => {
      const validatedData = noteSchema.parse(data);
      const result = await this.db
        .insert(notesTable)
        .values(validatedData)
        .returning();
      return result[0];
    });
  }

  async update(id: string, data: Partial<z.infer<typeof noteSchema>>) {
    return this.handleErrors(async () => {
      const validatedData = noteSchema.partial().parse(data);
      const result = await this.db
        .update(notesTable)
        .set(validatedData)
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
