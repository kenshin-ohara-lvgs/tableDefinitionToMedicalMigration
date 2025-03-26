import { generateMigrationFile } from "./generateMigrationFile";
import { orderTables } from "./orderTables";
import { listCsvFiles } from "./utils/fileSystem";

function processCSVFiles() {
  const tables = listCsvFiles();

  const orderedTables = orderTables(tables);

  // ソートされた順序でマイグレーションファイルを生成
  orderedTables.forEach((table, index) => generateMigrationFile(table, index));
}

processCSVFiles();
