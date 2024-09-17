// src/utils/advancedObjectStripper.ts

type StripTemplate<T> = {
  [K in keyof T]?: T[K] extends object ? StripTemplate<T[K]> : boolean;
};

/**
 * Strips properties from an object based on a template.
 *
 * @param data The object or array of objects to process.
 * @param template The template specifying which properties to keep.
 * @param mode 'keep' to keep properties in the template, 'remove' to remove them.
 * @returns A new object or array of objects with properties processed according to the template.
 */
export function stripObject<T extends object>(
  data: T | T[],
  template: StripTemplate<T>,
  mode: "keep" | "remove" = "keep"
): Partial<T> | Partial<T>[] {
  const processObject = (obj: T): Partial<T> => {
    const result: Partial<T> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const shouldKeep =
          mode === "keep" ? key in template : !(key in template);

        if (shouldKeep) {
          if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            template[key] &&
            typeof template[key] === "object"
          ) {
            result[key] = stripObject(
              obj[key] as any,
              template[key] as StripTemplate<any>,
              mode
            ) as any;
          } else {
            result[key] = obj[key];
          }
        }
      }
    }

    return result;
  };

  if (Array.isArray(data)) {
    return data.map(processObject);
  } else {
    return processObject(data);
  }
}
// import { stripObject } from '../../utils/advancedObjectStripper';

// class UserService extends BaseService {
//   private userTemplate = {
//     id: true,
//     name: true,
//     email: true,
//     profile: {
//       age: true,
//       location: true
//     }
//   };

//   async getById(id: string) {
//     const user = await this.db
//       .select()
//       .from(userTable)
//       .where(eq(userTable.id, id));

//     if (!user[0]) {
//       throw new NotFoundError("User not found");
//     }

//     return stripObject(user[0], this.userTemplate);
//   }

//   async getAll() {
//     const users = await this.db.select().from(userTable);
//     return stripObject(users, this.userTemplate);
//   }
// }
