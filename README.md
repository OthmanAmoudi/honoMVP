# HonoMVP
### build your MVP in a snap! using the latest and greatest tools in the industry, hono as the backend framework, drizzle orm for database operations and valibot for data transformation
inspired by nestjs & rails, this mini-library should give you MVP in matter of hours not days with complete template or started code for Authentication & Authorization leverageing easy routes setup using minimal decorators for routing and middlwares
# Project Startup Guide and Documentation

## Table of Contents
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Controllers](#controllers)
- [Models](#models)
- [Services](#services)
- [Middlewares](#middlewares)
- [Database Support](#database-support)
- [Module Generation](#module-generation)

## Introduction
This project is a TypeScript-based backend framework that provides a structured approach to building web applications. It includes features such as routing, authentication, and database integration.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
3. Set up your environment variables including database type (postgresql on the main branch, Sqlite or MySql branch of your prefered database of choice) connection details see .env.example
4. Run the project:
   ```bash
   npm run dev
### Project Structure
The project follows a modular structure:
```bash src/
├── modules/
│   ├── Auth/
│   ├── User/
│   ├── Note/
│   ├── Todo/
│   └── ...
├── middlewares/
├── utils/
├── db/
├── routes.ts
└── index.ts
```

you must follow folder structure for service resolving mechanism, also modules components (controllers, models, services) should be postfixed after the module name like so (for example if you have todo it should be in folder modules/Todo with components like so TodoController.ts TodoModel.ts TodoService.ts) or you can quickly generate it with incldued script
 ```bash node ./genmodule.js Todo`
Each module must have a Controller but Model and Service is optional.

### Routing
Routes are defined in src/routes.ts using the RouteConfig interface:
```js
const routeConfig: RouteConfig[] = [
  {
    path: "todos",
    controller: TodoController,
  },
  {
    path: "notes",
    controller: NoteController,
    standardRoutes: true,
    nestedRoutes: [
      {
        path: "ooo",
        controller: GeneralController,
      },
    ],
  },
  {
    path: "users",
    controller: UserController,
  },
  {
    path: "auth",
    controller: AuthController,
    standardRoutes: false,
  },
];

export default routeConfig;
```
The standardRoutes option automatically generates CRUD routes for a controller its by default ```true``` so its optional but you can disable this feature by setting it to ```false```. nestedRoutes allows you to define sub-routes for a module.

### Controllers
Controllers handle the request/response cycle. They use decorators to define routes and apply middlewares:
```js
export default class UserController extends BaseController {
  static services = [UserService];
  constructor(public userService: UserService) {
    super(userService);
  }
@Post("/login")
@Use(validateBody(LoginSchema)) // multiple middlewares are also possible just supply an array like so @Use([validateBody(LoginSchema), logger()])
async login(c: Context) {
  // ...
}
}
```
To use the controller main service be sure to add the UserService to the services array, as public service in the constructor and in the super method of the constructor. you can add more services in the constructor but only subsequent services must be added in the services array and as public varialbe in the constructor (not in the super method) like the following:
```js
export default class UserController extends BaseController {
  static services = [UserService,NoteService];
  constructor(public userService: UserService, public noteService:NoteService) {
    super(userService);
  }
@Post("/login")
@Use(validateBody(LoginSchema)) // multiple middlewares are also possible just supply an array like so @Use([validateBody(LoginSchema), logger()])
async login(c: Context) {
  // ...
}
}
```
### Models
Models define the structure of your data and database schemas. They use Drizzle ORM and Valibot for schema definition and validation:
```js
export const authTable = pgTable("auth", {
  id: nanoidIdColumn(),
  userId: text("user_id").notNull().references(() => userTable.id),
  // ...
});

export const LoginSchema = v.object({
  email: v.string([v.email()]),
  password: v.string([v.minLength(8)]),
});
```

### Services
Services contain the business logic of your application:
```js
export default class AuthService extends BaseService {
  async login(email: string, password: string) {
    // ...
  }
  // ...
}

```

### Middlewares
Middlewares can be applied to routes using the @Use decorator:
```js
@Use([middleware1(), middleware2()])
async someRoute(c: Context) {
  // ...
}
```
To be registered in the route boot logger, middlewares should be named functions that return async functions with the same name:
```js
export const authMiddleware = () => {
  return async function authMiddleware(c: Context, next: Next) {
    // ...
  };
};
```
### Database Support
This project is compatible with MySQL, SQLite, and PostgreSQL. Configure your database connection in the environment variables and be sure to check the branch for each database, check drizzle.config.ts and db/singletonDatabase.ts if you decided to use Sqlite or mysql main branch shows setup for postgresql lastly if you wanna use mysql you need to check the service methods becuase it has different implementation than postgresql or sqlite but the genmodule will work if you change your database dialect in the drizzle.config.ts

### Module Generation
You can quickly generate a new module using the provided script:
`node ./genmodule.js Todo`
This will create a new folder in src/modules/Todo/ with Controller, Model, and Service files.

For more detailed information on each component, please refer to the inline documentation in the source code or raise an issue.
