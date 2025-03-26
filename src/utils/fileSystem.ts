import * as fs from "fs";
import * as path from "path";

// 定数をここに集約
export const RESOURCES_DIR = "./resources";
export const OUTPUT_DIR = "./out/migrations";

/**
 * 指定ディレクトリ内のCSVファイル一覧を取得
 * @param directory 検索するディレクトリ
 * @returns CSVファイルの配列
 */
export const listCsvFiles = (directory: string = RESOURCES_DIR): string[] => {
  return fs.readdirSync(directory).filter((file) => file.endsWith(".csv"));
};

/**
 * CSVファイルの内容を読み込む
 * @param filePath ファイルパスまたはファイル名（デフォルトディレクトリ使用）
 * @param directory デフォルトディレクトリ
 * @returns ファイルの内容
 */
export const readCsvFile = (
  filePath: string,
  directory: string = RESOURCES_DIR
): string => {
  // 絶対パスか相対パスかを判定
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(directory, filePath);
  return fs.readFileSync(fullPath, "utf8");
};

/**
 * ファイルを書き込む
 * @param fileName ファイル名
 * @param content 書き込む内容
 * @param directory 出力先ディレクトリ
 * @returns 書き込んだファイルの完全パス
 */
export const writeFile = (
  fileName: string,
  content: string,
  directory: string = OUTPUT_DIR
): string => {
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const filePath = path.join(directory, fileName);
  fs.writeFileSync(filePath, content);
  return filePath;
};

/**
 * パスを結合する
 * @param parts 結合するパスの部分
 * @returns 結合されたパス
 */
export const joinPath = (...parts: string[]): string => {
  return path.join(...parts);
};
