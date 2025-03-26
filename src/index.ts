import * as fs from "fs";
import { TableDependency, topologicalSort } from "./utils/topologicalSort";
import { generateMigrationFile } from "./generateMigrationFile";
import { aggregateDependencies } from "./getCsvColumnData/aggregateDependencies";

export const CSV_DIR = "./resources";

function processCSVFiles() {
  const files = fs.readdirSync(CSV_DIR).filter((file) => file.endsWith(".csv"));

  const dependencies: TableDependency[] = [];

  // 依存関係の収集
  files.forEach((file) => aggregateDependencies(file, dependencies, CSV_DIR));

  // 依存関係を解決
  const orderedTables = topologicalSort(dependencies);

  // ソートされた順序でマイグレーションファイルを生成
  orderedTables.forEach((table, index) => generateMigrationFile(table, index));
}

processCSVFiles();
