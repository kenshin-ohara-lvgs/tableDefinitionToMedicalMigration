import path from "path";
import { TableDependency } from "../utils/topologicalSort";
import { convertCsvToArray } from "../utils/convertCsvToArray";

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
  const csvPath = path.join(CSV_DIR, file);
  const csvdata = convertCsvToArray(csvPath).data as string[][];
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
    csvPath,
    dependencies: foreignKeys,
  });
};
