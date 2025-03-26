import path from "path";
import { convertCsvToArray } from "./utils/convertCsvToArray";
import { TableDependency } from "./utils/topologicalSort";
import { generateMigration } from "./migrationConvertLogic";
import { convertTextToPhpFile } from "./utils/convertTextToPhpFile";
import { getCurrentDateString } from "./utils/getCurrentDateString";

// タイムスタンプの基準値
const baseTimestamp = new Date()
  .toISOString()
  .replace(/[^0-9]/g, "")
  .slice(0, 14);

/**
 * 依存関係が整理されたテーブル情報をもとにマイグレーションファイルを生成する
 * @param table
 * @param index
 * @param OUT_DIR
 */
export const generateMigrationFile = (
  table: TableDependency,
  index: number,
  OUT_DIR: string
) => {
  const csvdata = convertCsvToArray(table.csvPath).data as string[][];

  // インデックスを使用して時間差を付ける
  const timestamp = parseInt(baseTimestamp) + index;
  const formattedTimestamp = String(timestamp).replace(
    /^(\d{4})(\d{2})(\d{2})(\d{6})$/,
    "$1_$2_$3_$4"
  );

  const outputFileName = `${formattedTimestamp}_create_${
    table.tableName
  }_${getCurrentDateString()}.php`;
  const outputPath = path.join(OUT_DIR, outputFileName);

  const migrationContent = generateMigration(csvdata);
  convertTextToPhpFile(outputPath, migrationContent);

  console.log(`Generated migration: ${outputFileName}`);
};
