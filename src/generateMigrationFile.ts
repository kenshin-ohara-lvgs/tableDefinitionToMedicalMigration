import { convertCsvToArray } from "./utils/convertCsvToArray";
import { TableDependency } from "./utils/topologicalSort";
import { generateMigration } from "./migrationConvertLogic";
import { getCurrentDateString } from "./utils/getCurrentDateString";
import { readCsvFile, OUTPUT_DIR, writeFile } from "./utils/fileSystem";

// タイムスタンプの基準値
const baseTimestamp = new Date()
  .toISOString()
  .replace(/[^0-9]/g, "")
  .slice(0, 14);

/**
 * 依存関係が整理されたテーブル情報をもとにマイグレーションファイルを生成する
 * @param table テーブル情報
 * @param index インデックス
 */
export const generateMigrationFile = (
  table: TableDependency,
  index: number
) => {
  // 新しいユーティリティ関数を使用
  const csvContent = readCsvFile(table.csvPath);
  const csvdata = convertCsvToArray(csvContent).data as string[][];

  // インデックスを使用して時間差を付ける
  const timestamp = parseInt(baseTimestamp) + index;
  const formattedTimestamp = String(timestamp).replace(
    /^(\d{4})(\d{2})(\d{2})(\d{6})$/,
    "$1_$2_$3_$4"
  );

  const outputFileName = `${formattedTimestamp}_create_${
    table.tableName
  }_${getCurrentDateString()}.php`;

  const migrationContent = generateMigration(csvdata);
  writeFile(outputFileName, migrationContent, OUTPUT_DIR);

  console.log(`Generated migration: ${outputFileName}`);
};
