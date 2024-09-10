const fs = require("fs");
const path = require("path");

function generateModule(moduleName: string) {
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

export default class ${moduleName}Controller extends BaseController<${moduleName}Service> {
  constructor(${moduleName.toLowerCase()}Service: ${moduleName}Service) {
    super(${moduleName.toLowerCase()}Service);
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
  async getAll(cursor?: string, limit: number = 3): Promise<${moduleName}[]> {
    // Implementation
  }

  async getById(id: string) {
    // Implementation
  }

  async create(data: New${moduleName}) {
    // Implementation
  }

  async update(id: string, data: Update${moduleName}) {
    // Implementation
  }

  async delete(id: string) {
    // Implementation
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
} from "../../db/customefields";
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
  // Add other fields as needed
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const ${moduleName}Schema = createSelectSchema(${moduleName.toLowerCase()}Table);
export const Insert${moduleName}Schema = Type.Object({
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
    path: "/${moduleName.toLowerCase()}s",
    controller: ${moduleName}Controller,
  },`;

  routesContent = routesContent.replace(
    "const routesConfig: RoutesConfig[] = [",
    `import ${moduleName}Controller from "./modules/${moduleName}/${moduleName}Controller";\n\nconst routesConfig: RoutesConfig[] = [`
  );
  routesContent = routesContent.replace("];", `${newRoute}\n];`);

  fs.writeFileSync(routesPath, routesContent);

  console.log(`Module ${moduleName} generated successfully.`);
}

// Usage
const moduleName = process.argv[2];
if (!moduleName) {
  console.error("Please provide a module name.");
  process.exit(1);
}

generateModule(moduleName);
