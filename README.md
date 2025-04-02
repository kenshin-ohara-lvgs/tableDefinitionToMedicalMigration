スプレッドシートをもとに MedicalMigration の php ファイルを生成するプログラム

[こちら](https://docs.google.com/spreadsheets/d/1bkBvcbj78bSpwuDTxKqr-lEYjz5AvVZb_teegMgpcRo/edit?gid=1827191820#gid=1827191820)のTBL定義書の形式と同じ形式で作成されたTBL定義書について、自動生成してくれます
（※TBL定義書やシードデータのセルの位置にズレがあると正しくマイグレーションファイルが生成されません）

## 使い方

1. `npm i`
2. ルートディレクトリに `resouces` ディレクトリを作成し、その配下にスプレッドシート群（CSV形式）を配置する
3. `npm run generate`

## 特徴
- 互いに依存関係を持つスプレッドシート群について、マイグレーション実行時に依存関係エラーが起こらないよう、順番に並べてくれます
- シードデータについても自動で生成してくれます
