export interface TableDependency {
  tableName: string;
  csvPath: string;
  dependencies: string[];
}
// トポロジカルソートの実装
export function topologicalSort(tables: TableDependency[]): TableDependency[] {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const order: TableDependency[] = [];
  const tableMap = new Map(tables.map((table) => [table.tableName, table]));

  function visit(tableName: string) {
    if (temp.has(tableName)) {
      throw new Error("循環参照が検出されました");
    }
    if (visited.has(tableName)) {
      return;
    }

    const table = tableMap.get(tableName);
    if (!table) {
      return;
    }

    temp.add(tableName);
    for (const dep of table.dependencies) {
      visit(dep);
    }
    temp.delete(tableName);
    visited.add(tableName);
    // ここを変更: unshiftではなくpushを使用
    order.push(table);
  }

  for (const table of tables) {
    if (!visited.has(table.tableName)) {
      visit(table.tableName);
    }
  }

  return order;
}
