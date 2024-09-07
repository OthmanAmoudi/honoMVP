// src/types/dto.ts
import { z } from "zod";

export interface BaseDTO {
  id: number;
}

export type CreateDTO<T extends BaseDTO> = Omit<T, "id">;
export type UpdateDTO<T extends BaseDTO> = Partial<CreateDTO<T>>;

export interface DTOSchemas<T extends BaseDTO> {
  base: z.ZodType<T>;
  create: z.ZodType<CreateDTO<T>>;
  update: z.ZodType<UpdateDTO<T>>;
  response: z.ZodType<T>;
}
