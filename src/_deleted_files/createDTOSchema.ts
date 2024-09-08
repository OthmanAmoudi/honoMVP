import { z } from "zod";
import { BaseDTO, DTOSchemas } from "./dto";

export function createDTOSchemas<T extends BaseDTO>(
  baseSchema: z.ZodObject<z.ZodRawShape> & z.ZodType<BaseDTO>
): DTOSchemas<z.infer<typeof baseSchema>> {
  const createSchema = baseSchema.omit({ id: true }); // 'omit' works on ZodObject
  const updateSchema = createSchema.partial();
  const responseSchema = baseSchema;

  return {
    base: baseSchema,
    create: createSchema,
    update: updateSchema,
    response: responseSchema,
  };
}
