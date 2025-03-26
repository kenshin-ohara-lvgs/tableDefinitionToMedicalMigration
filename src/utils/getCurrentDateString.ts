/**
 * 現在の日付をYYYYMMDD形式で取得
 * @returns {string} 現在の日付
 */
export const getCurrentDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};
