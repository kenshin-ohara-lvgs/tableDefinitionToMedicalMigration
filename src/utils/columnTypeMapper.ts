/**
 * TBL定義書で定義された型を、マイグレーションファイル用にマッピング
 * @param type
 * @returns
 */
export const columnTypeMapper = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    int: "integer",
    text: "text",
    "timestamp(0) without time zone": "timestamp",
    // 他の型も必要に応じて追加
  };

  return typeMap[type] || type;
};
