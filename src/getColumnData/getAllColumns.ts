/**
 * 全てのテーブルカラムを取得するメソッド
 * startRowIndexから開始して、1列目のデータが入っているカラムを対象に取得
 * @param sheetData
 * @returns
 */
export const getAllColumns = (sheetData: string[][]): string[] => {
  const columns = [];
  // Indexはいずれもゼロオリジン
  const startRowIndex = 7;
  const numberColumnIndex = 0; //No.の列
  const columnNameIndex = 1;

  let rowIndex = startRowIndex;

  while (rowIndex < sheetData.length) {
    if (sheetData[rowIndex][numberColumnIndex]) {
      columns.push(sheetData[rowIndex][columnNameIndex]);
    }
    rowIndex++;
  }

  return columns;
};
