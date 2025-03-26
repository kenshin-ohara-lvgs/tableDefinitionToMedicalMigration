import { getPrimaryKey } from "./getColumnData/getPrimaryKey";
import { getVisibleColumns } from "./getColumnData/getVisibleColumns";
import { snakeToUpperCamel } from "./utils/snakeToUpperCamel";
import { getTableNameFromSheet } from "./getColumnData/getTableNameFromSheet";
import { getAllColumns } from "./getColumnData/getAllColumns";
import { getCompositeUniqueColumns } from "./getColumnData/getCompositeUniqueColumns";

/**
 * 他のTBLを参照しない、単一のTBL定義書で完結するEloquentリソースを生成するメソッド
 * @param dataObject
 */
export const generateEloquentResource = (
  sheetData: string[][],
  relations?: { belongsTo: string[]; hasMany: string[] }
) => {
  const tableName = getTableNameFromSheet(sheetData);
  const tableDescription = sheetData[1][2];
  const className = snakeToUpperCamel(tableName);
  const primaryKey = getPrimaryKey(sheetData);
  const allColumns = getAllColumns(sheetData);
  const visibleColumns = getVisibleColumns(sheetData);
  const compositeKeys = getCompositeUniqueColumns(sheetData);
  const hasSoftDelete = sheetData.some((row) => row[1] === "deleted_at");
  const hasTimestamps = sheetData.some((row) => row[1] === "deleted_at");

  // withに指定するリレーションメソッド名を格納するSet
  const withRelations = new Set<string>();

  // リレーション名がこのテーブル名を接頭辞に持つもののみをwithに指定する
  if (relations) {
    // belongsToのメソッド名のみを抽出
    relations.belongsTo.forEach((method) => {
      const methodName = method.match(/public function (\w+)\(\)/)?.[1];
      if (
        methodName &&
        methodName.startsWith(tableName) &&
        methodName !== tableName
      ) {
        withRelations.add(`'${methodName}'`);
      }
    });
    relations.hasMany.forEach((method) => {
      const methodName = method.match(/public function (\w+)\(\)/)?.[1];
      if (
        methodName &&
        methodName.startsWith(tableName) &&
        methodName !== tableName
      ) {
        withRelations.add(`'${methodName}'`);
      }
    });
  }

  // belongsToのリレーションメソッド名のみを取得（重複を除去）
  // if (relations) {
  //   // belongsToのメソッド名のみを抽出
  //   relations.belongsTo.forEach((method) => {
  //     const methodName = method.match(/public function (\w+)\(\)/)?.[1];
  //     if (methodName) {
  //       withRelations.add(`'${methodName}'`);
  //     }
  //   });
  // }

  //

  const eloquentResourceCode = `<?php

namespace Lvgs\\Laravel\\Lvm\\Models\\Resources\\Eloquent;${
    hasSoftDelete ? "\n\nuse Illuminate\\Database\\Eloquent\\SoftDeletes;" : ""
  }

/**
 * Lvgs\\Laravel\\Lvm\\Models\\Resources\\Eloquent\\${className}
 * ${tableDescription}
 */
class ${className} extends BaseEloquent
{${hasSoftDelete ? "\n    use SoftDeletes;\n" : ""}${
    hasTimestamps
      ? `
    protected $dates = [
        'deleted_at'
    ];
`
      : ""
  }
    protected $table = '${tableName}';

    protected $primaryKey = '${primaryKey}';

    protected $with = [
        ${Array.from(withRelations).join(",\n        ")}
    ];

    protected $fillable = [
        ${allColumns.map((col) => `'${col}'`).join(",\n        ")}
    ];

    protected $visible_column = [
        ${visibleColumns.map((col) => `'${col}'`).join(",\n        ")}
    ];
    ${
      compositeKeys && compositeKeys.length > 0
        ? `

    protected $compositeKey = [
        ${compositeKeys.map((col) => `'${col}'`).join(",\n        ")}
    ];`
        : ""
    }
}
`;
  return eloquentResourceCode;
};
