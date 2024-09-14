const fs = require("fs");
const path = require("path");

function generateModule(moduleName) {
  const configPath = path.join(process.cwd(), "drizzle.config.ts");
  const routesPath = path.join(process.cwd(), "src", "routes.ts");
  const modulePath = path.join(process.cwd(), "src", "modules", moduleName);

  // Read drizzle.config.ts to determine database type
  let dbType = "sqlite"; // Default to sqlite
  try {
    const configContent = fs.readFileSync(configPath, "utf8");
    const dialectMatch = configContent.match(/dialect:\s*["'](\w+)["']/);
    if (dialectMatch) {
      dbType = dialectMatch[1];
    }
  } catch (error) {
    console.warn("Could not read drizzle.config.ts. Defaulting to sqlite.");
  }

  // Create module directory
  fs.mkdirSync(modulePath, { recursive: true });

  // Generate Controller
  const controllerContent = `
import { BaseController } from "../../utils/BaseController";
import ${moduleName}Service from "./${moduleName}Service";

export default class ${moduleName}Controller extends BaseController {
  static services = [${moduleName}Service];
  constructor(public ${moduleName.toLowerCase()}Service: ${moduleName}Service) {
    super();
  }
}
`;
  fs.writeFileSync(
    path.join(modulePath, `${moduleName}Controller.ts`),
    controllerContent
  );

  // Generate Service
  const serviceContent = `
import { NotFoundError, BaseService } from "../../utils";
import { eq, gt, asc } from "drizzle-orm";
import {
  Insert${moduleName}Schema,
  Update${moduleName}Schema,
  New${moduleName},
  ${moduleName.toLowerCase()}Table,
  Update${moduleName},
  ${moduleName},
} from "./${moduleName}Model";

export default class ${moduleName}Service extends BaseService {
  ${
    dbType === "mysql"
      ? `
  async getAll(cursor?: string, limit: number = 3): Promise<${moduleName}[]> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(${moduleName.toLowerCase()}Table)
        .where(cursor ? gt(${moduleName.toLowerCase()}Table.id, cursor) : undefined)
        .limit(limit)
        .orderBy(asc(${moduleName.toLowerCase()}Table.id));
      return result;
    });
  }

  async getById(id: string): Promise<${moduleName}> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(${moduleName.toLowerCase()}Table)
        .where(eq(${moduleName.toLowerCase()}Table.id, id));

      if (!result.length)
        throw new NotFoundError(\`Resource ${moduleName} with id \${id} not found\`);
      return result[0];
    });
  }

  async create(data: New${moduleName}): Promise<${moduleName}> {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(Insert${moduleName}Schema, data);
      const createdId = await this.db
        .insert(${moduleName.toLowerCase()}Table)
        .values(cleanedData)
        .$returningId();
      const result = await this.getById(createdId[0].id);
      return result;
    });
  }

  async update(id: string, data: Partial<New${moduleName}>): Promise<${moduleName}> {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(Update${moduleName}Schema, data);
      const updatedId = await this.db
        .update(${moduleName.toLowerCase()}Table)
        .set(cleanedData)
        .where(eq(${moduleName.toLowerCase()}Table.id, id));
      if (!updatedId[0].affectedRows) {
        throw new NotFoundError(\`Resource ${moduleName} with id \${id} not found\`);
      }
      const result = await this.getById(id);
      return result;
    });
  }

  async delete(id: string): Promise<void> {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(${moduleName.toLowerCase()}Table)
        .where(eq(${moduleName.toLowerCase()}Table.id, id));
      if (!result[0].affectedRows) {
        throw new NotFoundError(\`Resource ${moduleName} with id \${id} not found\`);
      }
    });
  }
  `
      : `
  async getAll(cursor?: string, limit: number = 8): Promise<${moduleName}[]> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(${moduleName.toLowerCase()}Table)
        .where(cursor ? gt(${moduleName.toLowerCase()}Table.id, cursor) : undefined)
        .limit(limit)
        .orderBy(asc(${moduleName.toLowerCase()}Table.id));
      return result;
    });
  }

  async getById(id: string) {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(${moduleName.toLowerCase()}Table)
        .where(eq(${moduleName.toLowerCase()}Table.id, id));
      if (!result[0]) {
        throw new NotFoundError("Resource ${moduleName} with id "+id+" not found");
      }
      return result[0];
    });
  }

  async create(data: New${moduleName}) {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(Insert${moduleName}Schema, data);
      const result = await this.db
        .insert(${moduleName.toLowerCase()}Table)
        .values(cleanedData)
        .returning();
      return result[0];
    });
  }

  async update(id: string, data: Update${moduleName}) {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(Update${moduleName}Schema, data);
      const result = await this.db
        .update(${moduleName.toLowerCase()}Table)
        .set(cleanedData)
        .where(eq(${moduleName.toLowerCase()}Table.id, id))
        .returning();
      if (!result[0]) {
        throw new NotFoundError("Resource ${moduleName} with id "+id+" not found");
      }
      return result[0];
    });
  }

  async delete(id: string) {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(${moduleName.toLowerCase()}Table)
        .where(eq(${moduleName.toLowerCase()}Table.id, id))
        .returning();
      if (!result[0]) {
        throw new NotFoundError("Resource ${moduleName} with id "+id+" not found");
      }
    });
  }
  `
  }
}
`;
  fs.writeFileSync(
    path.join(modulePath, `${moduleName}Service.ts`),
    serviceContent
  );

  // Generate Model
  let modelContent;
  switch (dbType) {
    case "postgresql":
      modelContent = `
import { text, pgTable } from "drizzle-orm/pg-core";
`;
      break;
    case "mysql":
      modelContent = `
import { text, mysqlTable } from "drizzle-orm/mysql-core";
`;
      break;
    default:
      modelContent = `
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
`;
  }

  modelContent += `
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-${dbType}";
import { createSelectSchema } from "drizzle-typebox";
import { Static, Type } from "@sinclair/typebox";

export const ${moduleName.toLowerCase()}Table = ${
    dbType === "postgresql"
      ? "pgTable"
      : dbType === "mysql"
      ? "mysqlTable"
      : "sqliteTable"
  }("${moduleName.toLowerCase()}", {
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  // Add other fields as needed
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const ${moduleName}Schema = createSelectSchema(${moduleName.toLowerCase()}Table);
export const Insert${moduleName}Schema = Type.Object({
  description: Type.String({ minLength: 2, maxLength: 50 }),
  // Define insert schema
});
export const Update${moduleName}Schema = Insert${moduleName}Schema;

export type ${moduleName} = Static<typeof ${moduleName}Schema>;
export type New${moduleName} = Static<typeof Insert${moduleName}Schema>;
export type Update${moduleName} = Static<typeof Update${moduleName}Schema>;
`;
  fs.writeFileSync(
    path.join(modulePath, `${moduleName}Model.ts`),
    modelContent
  );

  // Update routes.ts
  let routesContent = fs.readFileSync(routesPath, "utf8");
  const importStatement = `import ${moduleName}Controller from "./modules/${moduleName}/${moduleName}Controller";`;
  const newRoute = `
   {
     path: "${moduleName.toLowerCase()}s",
     controller: ${moduleName}Controller,
   },`;

  routesContent = routesContent.replace(
    "const routeConfig: RouteConfig[] = [",
    `import ${moduleName}Controller from "./modules/${moduleName}/${moduleName}Controller";\n\nconst routeConfig: RouteConfig[] = [`
  );
  routesContent = routesContent.replace("];", `${newRoute}\n];`);

  fs.writeFileSync(routesPath, routesContent);

  console.log(`Module ${moduleName} generated successfully.`);
}

// Usage
const moduleName = process.argv[2];
if (!moduleName || moduleName.length < 2) {
  console.error("Please provide a module name with at least 2 characters.");
  process.exit(1);
}

generateModule(
  moduleName.slice(0, 1).toUpperCase() + moduleName.slice(1).toLowerCase()
);
