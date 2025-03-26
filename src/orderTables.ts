import { convertCsvToArray } from "./utils/convertCsvToArray";
import { readCsvFile, RESOURCES_DIR } from "./utils/fileSystem";
import { TableDependency, topologicalSort } from "./utils/topologicalSort";

export const orderTables = (tables: string[]): TableDependency[] => {
  const dependencies: TableDependency[] = [];

  // 依存関係の収集
  tables.forEach((tables) =>
    aggregateDependencies(tables, dependencies, RESOURCES_DIR)
  );

  // 依存関係を解決
  const orderedTables = topologicalSort(dependencies);
  console.log(orderedTables);

  return orderedTables;
};

/**
 * 渡されたファイルのデータをもとに、
 * dependenciesの配列に依存関係情報を追加する
 * @param file
 * @param dependencies
 * @param CSV_DIR
 */
const aggregateDependencies = (
  file: string,
  dependencies: TableDependency[],
  CSV_DIR: string
) => {
  // 新しいユーティリティ関数を使用
  const csvContent = readCsvFile(file, CSV_DIR);
  const csvdata = convertCsvToArray(csvContent).data as string[][];
  const tableName = csvdata[0][2];
  const foreignKeys: string[] = [];

  // 外部キーの収集（7行目以降を処理）
  for (let i = 7; i < csvdata.length; i++) {
    const foreignKey = csvdata[i][8];
    if (foreignKey) {
      const referencedTable = foreignKey.split(".")[0];
      foreignKeys.push(referencedTable);
    }
  }

  dependencies.push({
    tableName,
    csvPath: file, // ここは相対パスだけ保持する
    dependencies: foreignKeys,
  });
};
