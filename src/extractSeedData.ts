/**
 * 渡されたTBL定義書のシートデータからシードデータを抽出し、配列として返却
 * @returns
 */
export const extractSeedData = (
  sheetData: any,
  seedDataStartIndex: any,
  seedDataColumns: any
) => {
  const seedData: Record<string, any>[] = [];
  if (seedDataStartIndex !== -1) {
    for (let i = seedDataStartIndex + 2; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row[1]) continue; // 空行はスキップ

      const seedRow: Record<string, any> = {};
      seedDataColumns.forEach((column: any, index: any) => {
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

  return seedData;
};
