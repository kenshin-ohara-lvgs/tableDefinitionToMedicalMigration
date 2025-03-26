import * as fs from "fs";
export const OUT_DIR = "./out/migrations";
export const convertTextToPhpFile = (fileName: string, text: string) => {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  fs.writeFileSync(fileName, text);
};
