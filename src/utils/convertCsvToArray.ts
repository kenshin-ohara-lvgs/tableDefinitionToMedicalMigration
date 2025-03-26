import Papa from "papaparse";

/**
 * csvファイルを読み込み、２次元配列に変換する
 * @param csv
 * @returns
 */
export const convertCsvToArray = (csv: any) => {
  return Papa.parse(csv);
};
