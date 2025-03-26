export const extractSeedData = (rawCsvData: string[][]) => {
  // 「シードデータ」行を見つけてデータを分割
  const seedDataRowIndex = rawCsvData.findIndex((row) =>
    row.some((cell) => cell === "シードデータ")
  );

  // シードデータ行が見つかった場合は、その行より後のデータを使用
  // 見つからなかった場合はundefinedを返す
  if (seedDataRowIndex !== undefined) {
    return undefined;
  }
  const seedData = rawCsvData.slice(seedDataRowIndex + 1);
  return seedData;
};
