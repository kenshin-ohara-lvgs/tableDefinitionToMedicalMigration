// src/generateMigration.ts
import {
  convertSeedDataToPhpString,
  convertTableDefinitionToPhpString,
} from "./convertSeedDataToPhpString";
import { extractSeedData } from "./extractSeedData";
import { getCurrentDateString } from "./utils/getCurrentDateString";
import { snakeToUpperCamel } from "./utils/snakeToUpperCamel";

export interface ColumnDefinition {
  name: string;
  comment: string;
  type: string;
  isPrimary: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  default?: string;
  foreignKey?: string;
}

/**
 * テーブル定義書のデータをもとにマイグレーションファイルを生成する
 * @param sheetData
 */
export const generateMigration = (sheetData: string[][]) => {
  const tableName = sheetData[0][2];

  // テーブル名をキャメルケースに変換し、日付を追加
  const upperCamelTableName =
    snakeToUpperCamel(tableName) + getCurrentDateString();

  const tableComment = sheetData[1][2];
  const compositeUniques = sheetData[2][2];
  const arrayedCompositeUniques = compositeUniques
    ? "[" +
      compositeUniques
        .split("+")
        .map((col) => `'${col.trim()}'`)
        .join(", ") +
      "]"
    : null;
  const columns: ColumnDefinition[] = [];

  // シードデータの開始行を探す
  const seedDataStartIndex = sheetData.findIndex((row) =>
    row.some((cell) => cell === "シードデータ")
  );

  // カラム定義とシードデータのヘッダー行を取得
  let seedDataColumns: string[] = [];
  if (seedDataStartIndex !== -1 && sheetData[seedDataStartIndex + 1]) {
    seedDataColumns = sheetData[seedDataStartIndex + 1].filter(Boolean);
  }

  // シードデータの収集
  const seedData = extractSeedData(
    sheetData,
    seedDataStartIndex,
    seedDataColumns
  );

  // カラム定義の収集（既存のコード）
  for (
    let i = 7;
    i < sheetData.length &&
    (!sheetData[i][1] || sheetData[i][1] !== "シードデータ");
    i++
  ) {
    const row = sheetData[i];
    if (!row[1]) break;

    columns.push({
      name: row[1],
      comment: row[2],
      type: row[3],
      isPrimary: row[4] === "true" || row[4] === "TRUE",
      isNotNull: row[5] === "true" || row[5] === "TRUE",
      isUnique: row[6] === "true" || row[6] === "TRUE",
      default: row[7] || undefined,
      foreignKey: row[8] || undefined,
    });
  }

  const seedDataStr = convertSeedDataToPhpString(seedData);

  const migrationTemplate = convertTableDefinitionToPhpString(
    upperCamelTableName,
    tableName,
    columns,
    tableComment,
    arrayedCompositeUniques,
    sheetData,
    seedDataStr
  );

  return migrationTemplate;
};
