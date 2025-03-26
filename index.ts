import { generateEloquentResource } from "./src/generateEloquentResource";
import { convertCsvToArray } from "./src/utils/convertCsvToArray";
import { convertTextToPhpFile } from "./src/utils/convertTextToPhpFile";
import { generateRelations } from "./src/generateRelation";
import { snakeToUpperCamel } from "./src/utils/snakeToUpperCamel";
import * as fs from "fs";
import * as path from "path";

const CSV_DIR = "./resources";

function processCSVFiles() {
  const csvFiles = fs
    .readdirSync(CSV_DIR)
    .filter((file) => file.endsWith(".csv"));

  const allRelations = new Map<
    string,
    {
      cascadeDeletes: Set<string>; // CASCADE_DELETE対象のカラムを格納
      belongsTo: string[];
      hasMany: string[];
    }
  >();

  // リレーション情報を収集する処理を修正
  csvFiles.forEach((file) => {
    const csvPath = path.join(CSV_DIR, file);
    const rawCsvData = convertCsvToArray(csvPath).data as string[][];

    // 「シードデータ」行を見つけてデータを分割
    const seedDataRowIndex = rawCsvData.findIndex((row) =>
      row.some((cell) => cell === "シードデータ")
    );

    // シードデータ行が見つかった場合は、その行より前のデータのみを使用
    // 見つからなかった場合は全データを使用
    const csvdata =
      seedDataRowIndex !== -1
        ? rawCsvData.slice(0, seedDataRowIndex)
        : rawCsvData;

    const seedData = rawCsvData.slice(seedDataRowIndex + 1);

    const tableName = csvdata[0][2]; // テーブル名を取得
    const relations = generateRelations(csvdata);

    // リレーション情報を整理
    relations.forEach(([targetTable, foreignKey, primaryKey]) => {
      // belongsTo側の設定
      if (!allRelations.has(tableName)) {
        allRelations.set(tableName, {
          cascadeDeletes: new Set(),
          belongsTo: [],
          hasMany: [],
        });
      }
      allRelations.get(tableName)?.belongsTo.push(
        `/**
     * @return \Illuminate\\Database\\Eloquent\\Relations\\belongsTo
     */
    public function ${targetTable}()
    {
        return $this->belongsTo(${snakeToUpperCamel(
          targetTable
        )}::class, '${foreignKey}', '${primaryKey}');
    }`
      );

      // hasMany側の設定
      if (!allRelations.has(targetTable)) {
        allRelations.set(targetTable, {
          cascadeDeletes: new Set(),
          belongsTo: [],
          hasMany: [],
        });
      }
      allRelations.get(targetTable)?.hasMany.push(
        `/**
     * @return \Illuminate\\Database\\Eloquent\\Relations\\belongsTo
     */
    public function ${tableName}()
    {
        return $this->hasMany(${snakeToUpperCamel(
          tableName
        )}::class, '${foreignKey}', '${primaryKey}');
    }`
      );
    });

    // CASCADE_DELETE情報の収集
    for (let i = 7; i < csvdata.length; i++) {
      const row = csvdata[i];
      const foreignKey = row[8];
      const cascadeDelete = row[11]; // CASCADE_DELETE列

      if (
        foreignKey &&
        (cascadeDelete === "TRUE" || cascadeDelete === "true")
      ) {
        const targetTable = foreignKey.split(".")[0];
        if (!allRelations.has(targetTable)) {
          allRelations.set(targetTable, {
            cascadeDeletes: new Set(),
            belongsTo: [],
            hasMany: [],
          });
        }
        // CASCADE_DELETE対象のカラムを記録
        allRelations.get(targetTable)?.cascadeDeletes.add(tableName);
      }
    }
  });

  // 収集したリレーション情報をもとにファイルを生成
  csvFiles.forEach((file) => {
    const csvPath = path.join(CSV_DIR, file);
    const rawCsvData = convertCsvToArray(csvPath).data as string[][];

    // 「シードデータ」行を見つけてデータを分割
    const seedDataRowIndex = rawCsvData.findIndex((row) =>
      row.some((cell) => cell === "シードデータ")
    );

    // シードデータ行が見つかった場合は、その行より前のデータのみを使用
    // 見つからなかった場合は全データを使用
    const csvdata =
      seedDataRowIndex !== -1
        ? rawCsvData.slice(0, seedDataRowIndex)
        : rawCsvData;

    const tableName = csvdata[0][2];

    // 基本的なEloquentリソースコードを生成
    // CASCADE_DELETEのデータを持つ場合、それも追加
    //TODO: 方向性が一致しないのでリファクタ。命令的にしたいのか、関数チックにしたいのか。。
    let output = generateEloquentResource(csvdata, allRelations.get(tableName));

    // リレーションメソッドを追加
    const relations = allRelations.get(tableName);
    if (relations) {
      // 出力を行ごとに分割
      const lines = output.split("\n");
      // 末尾から2行目の位置を計算
      const insertPosition = lines.length - 2;

      // リレーションメソッドを作成
      const relationMethods = [
        ...relations.belongsTo,
        ...relations.hasMany,
      ].join("\n\n    ");

      // まずリレーションメソッドを挿入
      lines.splice(insertPosition, 0, `    ${relationMethods}`);

      // その後、cascade_deletesプロパティを追加（リレーションメソッドの前に）
      if (relations.cascadeDeletes.size > 0) {
        const cascadeDeletesStr = Array.from(relations.cascadeDeletes)
          .map((table) => `'${table}'`)
          .join(",\n        ");

        lines.splice(
          insertPosition,
          0,
          `\n    protected $cascade_deletes = [\n        ${cascadeDeletesStr}\n    ];\n`
        );
      }

      // 行を結合して文字列に戻す
      output = lines.join("\n");
    }

    // ファイルに出力する部分を修正
    const outputFileName = `${snakeToUpperCamel(tableName)}.php`;
    const outputPath = path.join("out", outputFileName);
    convertTextToPhpFile(outputPath, output);
    console.log(`Processed: ${file} -> ${outputFileName}`);
  });
}

processCSVFiles();
