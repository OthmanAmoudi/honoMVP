import { Table } from "console-table-printer";
import { RouteInfo } from "./";

export function printBootInfo(routes: RouteInfo[]) {
  console.log("\n=== Application Boot Information ===\n");

  const table = new Table({
    columns: [
      { name: "method", alignment: "left", color: "blue" },
      { name: "path", alignment: "left", color: "cyan" },
      { name: "handler", alignment: "left", color: "lime" },
      { name: "controller", alignment: "left", color: "green" },
      { name: "services", alignment: "left", color: "yellow" },
      { name: "middlewares", alignment: "left", color: "magenta" },
    ],
  });

  routes.forEach((route) => {
    table.addRow({
      method: route.methods,
      path: route.path,
      handler: route.handler,
      controller: route.controller,
      services: route.services.join(", ") || "N/A",
      middlewares: route.middlewares.join(", ") || "N/A",
      // methods: route.methods.join(", "),
    });
  });

  table.printTable();

  console.log(`\nTotal Routes: ${routes.length}`);
  console.log(`Controllers: ${new Set(routes.map((r) => r.controller)).size}`);
  console.log(`Services: ${new Set(routes.flatMap((r) => r.services)).size}`);
  console.log("\n=====================================\n");
}
