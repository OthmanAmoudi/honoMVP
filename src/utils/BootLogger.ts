import { Table } from "console-table-printer";
import { RouteInfo } from "./Types";

export function printBootInfo(routes: RouteInfo[]) {
  console.log("\n=== Application Boot Information ===\n");

  const table = new Table({
    columns: [
      { name: "path", alignment: "left", color: "cyan" },
      { name: "controller", alignment: "left", color: "green" },
      { name: "service", alignment: "left", color: "yellow" },
      { name: "middlewares", alignment: "left", color: "magenta" },
      { name: "methods", alignment: "left", color: "blue" },
    ],
  });

  routes.forEach((route) => {
    table.addRow({
      path: route.path,
      controller: route.controller,
      service: route.service || "N/A",
      middlewares: route.middlewares.join(", ") || "None",
      methods: route.methods.join(", "),
    });
  });

  const serverTable = new Table({
    columns: [
      {
        name: "Server",
        alignment: "center",
        color: "yellow",
      },
    ],
  }).addRow({ Server: "http://localhost:3000 CTRL+click" });
  table.printTable();
  serverTable.printTable();
  console.log(`\nTotal Routes: ${routes.length}`);
  console.log(`Controllers: ${new Set(routes.map((r) => r.controller)).size}`);
  console.log(
    `Services: ${new Set(routes.map((r) => r.service).filter(Boolean)).size}`
  );
  console.log("\n=====================================\n");
}
