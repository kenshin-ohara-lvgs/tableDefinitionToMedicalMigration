import { ColumnDefinition } from "./migrationConvertLogic";
import { columnTypeMapper } from "./utils/columnTypeMapper";

/**
 * TBL定義をマイグレーションファイル用文字列に変換
 * @param upperCamelTableName
 * @param tableName
 * @param columns
 * @param tableComment
 * @param arrayedCompositeUniques
 * @param seedData
 * @param seedDataStr
 */
export const convertTableDefinitionToPhpString = (
  upperCamelTableName: any,
  tableName: any,
  columns: any,
  tableComment: any,
  arrayedCompositeUniques: any,
  seedData: any,
  seedDataStr: any
) => {
  const migrationFileString = `<?php

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

  return migrationFileString;
};

/**
 * シードデータをマイグレーションファイル用文字列に変換
 * @param seedData
 * @returns
 */
export const convertSeedDataToPhpString = (seedData: any) => {
  const seedDataStr =
    seedData.length > 0
      ? `
    private function getSeedData()
    {
        return [
            ${seedData
              .map(
                (row: any) =>
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

  return seedDataStr;
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
