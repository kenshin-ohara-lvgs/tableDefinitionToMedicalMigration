// PKを取得するメソッド
export const getCompositeUniqueColumns = (sheetData: string[][]) => {
  // Indexはいずれもゼロオリジン
  const columnIndex = 2;
  const rowIndex = 2;
  const rawCompositeUniqueData = sheetData[columnIndex][rowIndex];

  if (rawCompositeUniqueData) {
    return rawCompositeUniqueData
      .split("+")
      .map((col) => col.replace(/\s+/g, ""));
  }
};
