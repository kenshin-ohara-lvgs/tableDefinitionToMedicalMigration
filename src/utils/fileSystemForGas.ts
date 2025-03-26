// 定数をここに集約っしょ！💕
export const OUTPUT_FOLDER_NAME = "医療マイグレーション"; // 出力先フォルダ名

/**
 * 現在開いてるスプレッドシートのシート一覧を取得するよ〜
 * @returns シート名の配列
 */
export const listCsvFiles = (): string[] => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();

  // 全シート名をゲット！
  return sheets.map((sheet) => sheet.getName());
};

/**
 * シートの内容をCSV形式の文字列として読み込むよ
 * @param sheetName シート名
 * @returns CSV形式の文字列
 */
export const readCsvFile = (sheetName: string): string => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`シート「${sheetName}」が見つからないんだけど〜？🙄`);
  }

  // データの範囲を取得
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  // CSVっぽく変換しちゃう
  return values
    .map((row) =>
      row
        .map((cell) => {
          // 文字列に変換＆カンマやダブルクォートをエスケープ
          const cellStr = String(cell);
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    )
    .join("\n");
};

/**
 * Googleドライブにファイルを書き込むよ〜
 * @param fileName ファイル名
 * @param content 書き込む内容
 * @returns 作成したファイルのURL
 */
export const writeFile = (fileName: string, content: string): string => {
  // 出力先フォルダを探すか作成する
  let folder;
  const folderIterator = DriveApp.getFoldersByName(OUTPUT_FOLDER_NAME);

  if (folderIterator.hasNext()) {
    folder = folderIterator.next();
  } else {
    // フォルダなかったら作っちゃう✨
    folder = DriveApp.createFolder(OUTPUT_FOLDER_NAME);
    console.log(`フォルダ「${OUTPUT_FOLDER_NAME}」を作ったよ〜💖`);
  }

  // ファイル作成
  const blob = Utilities.newBlob(content, MimeType.PLAIN_TEXT, fileName);
  const file = folder.createFile(blob);

  console.log(`ファイル「${fileName}」を保存したよ！💯`);
  return file.getUrl();
};

/**
 * スプレッドシート上のセルからデータを取得する（2次元配列で）
 * @param sheetName シート名
 * @returns 2次元配列のデータ
 */
export const getSheetData = (sheetName: string): any[][] => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`シート「${sheetName}」見つからなくてマジ無理〜🤦‍♀️`);
  }

  return sheet.getDataRange().getValues();
};

/**
 * 処理結果をユーザーに表示（アラート）
 * @param message メッセージ
 */
export const showResultAlert = (message: string): void => {
  SpreadsheetApp.getUi().alert(message);
};

/**
 * 現在時刻を取得（タイムスタンプ用）
 * @returns フォーマット済みの現在時刻
 */
export const getCurrentTimestamp = (): string => {
  const now = new Date();
  return Utilities.formatDate(
    now,
    Session.getScriptTimeZone(),
    "yyyyMMdd_HHmmss"
  );
};

// 不要になったjoinPathは削除しといたよ〜！不要なものは捨てるのが断捨離の基本でしょ？💅
