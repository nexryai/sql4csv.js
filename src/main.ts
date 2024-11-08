import initSqlJs, { Database } from 'sql.js';

export class CSVProcessor {
    private csvWorker = new Worker(new URL('./worker.ts', import.meta.url));
    private db: Database | undefined;

    constructor() {
        initSqlJs().then((SQL) => {
            this.db = new SQL.Database();

            this.csvWorker.onmessage = (event) => {
                if (!this.db) throw new Error("Database is not initialized");

                const { header, values, done }: {
                    header: string[];
                    values: string[];
                    done: boolean;
                } = event.data;

                // ヘッダー情報を受け取って、テーブルを動的に作成
                if (header) {
                    const columns = header.map(col => `${col} TEXT`).join(', ');
                    const createTableQuery = `CREATE TABLE IF NOT EXISTS csv_table (${columns})`;
                    this.db.run(createTableQuery);
                    console.log("テーブルが作成されました:", createTableQuery);
                    return;
                }

                // データ行をインサート
                if (values) {
                    const placeholders = values.map(() => '?').join(', ');
                    const insertQuery = `INSERT INTO csv_table VALUES (${placeholders})`;
                    const stmt = this.db.prepare(insertQuery);
                    stmt.run(values);
                    stmt.free();
                }

                // 処理が完了したときの通知
                if (done) {
                    console.log("CSVの全行が処理されました");
                }
            };
        });
    }

    public processString(csvData: string) {
        this.csvWorker.postMessage(csvData);
    }
}




// CSVデータをWorkerに送信
// const csvData = "id,name,email\n1,John Doe,john@example.com\n2,Jane Doe,jane@example.com";

