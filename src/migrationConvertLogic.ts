// src/generateMigration.ts
import { getCurrentDateString } from "./utils/getCurrentDateString";
import { snakeToUpperCamel } from "./utils/snakeToUpperCamel";

interface ColumnDefinition {
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
  const seedData: Record<string, any>[] = [];
  if (seedDataStartIndex !== -1) {
    for (let i = seedDataStartIndex + 2; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row[1]) continue; // 空行はスキップ

      const seedRow: Record<string, any> = {};
      seedDataColumns.forEach((column, index) => {
        // undefined, 空文字、空白文字の場合は null を設定
        if (row[index] === undefined || row[index].trim() === "") {
          seedRow[column] = null;
        } else {
          seedRow[column] = row[index];
        }
      });
      if (Object.keys(seedRow).length > 0) {
        seedData.push(seedRow);
      }
    }
  }

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

  // シードデータをPHP配列形式に変換
  const seedDataStr =
    seedData.length > 0
      ? `
    private function getSeedData()
    {
        return [
            ${seedData
              .map(
                (row) =>
                  `[${Object.entries(row)
                    .map(([key, value]) => {
                      // nullの場合は null を出力
                      if (value === null) {
                        return `'${key}' => null`;
                      }
                      // 数値として解析可能な場合は数値として扱う
                      const parsedValue = !isNaN(Number(value))
                        ? value
                        : `'${value}'`;
                      return `'${key}' => ${parsedValue}`;
                    })
                    .join(", ")}]`
              )
              .join(",\n            ")},
        ];
    }`
      : "";

  const migrationTemplate = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Lvgs\\Project\\MigrationHireBase\\Database\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

class Create${upperCamelTableName} extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection('center')->create('${tableName}', function (Blueprint $table) {
            ${generateColumns(columns)}${
    tableComment
      ? `
            $table->commentOnTable('${tableComment}');`
      : ""
  }${
    arrayedCompositeUniques
      ? `
            $table->unique(${arrayedCompositeUniques});`
      : ""
  }
        });${
          seedData.length > 0
            ? `

        DB::connection('center')->table('${tableName}')->insert($this->getSeedData());`
            : ""
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection('center')->dropIfExists('${tableName}');
    }

    /**
     * @return array
     */${seedDataStr}
};`;

  return migrationTemplate;
};

/**
 * カラム定義を記述する部分を生成
 * @param columns
 * @returns
 */
function generateColumns(columns: ColumnDefinition[]): string {
  return columns
    .map((column) => {
      let def = `$table->addColumnDef(`;

      // idカラムの場合はデフォルト値とforeignKeyを省略
      // TODO: defaultを指定しないのは、idの場合ではなく、default値がカラムで設定されている場合、に修正
      if (column.name.toLowerCase() === "id") {
        def += `'${column.name}', '${column.comment}', '${columnTypeMapper(
          column.type
        )}', ${column.isPrimary ? "true" : "false"}, ${
          column.isNotNull ? "true" : "false"
        }, ${column.isUnique ? "true" : "false"})`;
      } else {
        def += `'${column.name}', '${column.comment}', '${columnTypeMapper(
          column.type
        )}', ${column.isPrimary ? "true" : "false"}, ${
          column.isNotNull ? "true" : "false"
        }, ${column.isUnique ? "true" : "false"}, ${
          column.default ? `'${column.default}'` : "''"
        }, ${column.foreignKey ? `'${column.foreignKey}'` : "null"})`;
      }

      return `${def};`;
    })
    .join("\n            ");
}

/**
 * TBL定義書で定義された型を、マイグレーションファイル用にマッピング
 * @param type
 * @returns
 */
function columnTypeMapper(type: string): string {
  const typeMap: { [key: string]: string } = {
    int: "integer",
    text: "text",
    "timestamp(0) without time zone": "timestamp",
    // 他の型も必要に応じて追加
  };

  return typeMap[type] || type;
}
