import { TableDependency } from "../utils/topologicalSort";
import { convertCsvToArray } from "../utils/convertCsvToArray";
import { readCsvFile } from "../utils/fileSystem";

/**
 * 渡されたファイルのデータをもとに、
 * dependenciesの配列に依存関係情報を追加する
 * @param file
 * @param dependencies
 * @param CSV_DIR
 */
export const aggregateDependencies = (
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
