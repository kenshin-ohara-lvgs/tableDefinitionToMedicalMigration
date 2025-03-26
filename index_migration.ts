import * as fs from "fs";
import { TableDependency, topologicalSort } from "./src/utils/topologicalSort";
import { aggregateDependencies } from "./src/getColumnData/aggregateDependencies";
import { generateMigrationFile } from "./src/generateMigrationFile";

export const CSV_DIR = "./resources";
export const OUT_DIR = "./out/migrations";

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function processCSVFiles() {
  const files = fs.readdirSync(CSV_DIR).filter((file) => file.endsWith(".csv"));
  const dependencies: TableDependency[] = [];

  // 依存関係の収集
  files.forEach((file) => aggregateDependencies(file, dependencies, CSV_DIR));

  // トポロジカルソートで依存関係を解決
  const sortedTables = topologicalSort(dependencies);

  console.log(sortedTables);

  // ソートされた順序でマイグレーションファイルを生成
  sortedTables.forEach((table, index) =>
    generateMigrationFile(table, index, OUT_DIR)
  );
}

processCSVFiles();
