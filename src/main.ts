import initSqlJs, { Database } from 'sql.js';

export class CSVProcessor {
    private readonly tableName = 'sql4csv_data';
    private readonly csvWorker = new Worker(new URL('./worker.ts', import.meta.url));
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
                    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columns})`;
                    this.db.run(createTableQuery);
                    //console.log("テーブルが作成されました:", createTableQuery);
                    return;
                }

                // データ行をインサート
                if (values) {
                    const placeholders = values.map(() => '?').join(', ');
                    const insertQuery = `INSERT INTO ${this.tableName} VALUES (${placeholders})`;
                    const stmt = this.db.prepare(insertQuery);
                    stmt.run(values);
                    stmt.free();
                }

                // 処理が完了したときの通知
                if (done) {
                    //console.log("Done!");
                }
            };
        });
    }

    public importCSV(csvData: string) {
        // Drop table if exists
        if (!this.db) throw new Error("Database is not initialized");
        this.db.run('DROP TABLE IF EXISTS ${this.tableName}');

        this.csvWorker.postMessage(csvData);
    }

    public execQuery(query: string) {
        if (!this.db) throw new Error("Database is not initialized");

        const stmt = this.db.prepare(query);
        while (stmt.step()) {
            const row = stmt.getAsObject();
            console.log(row);
        }
        stmt.free();
    }

    public execQueryAndGetResult(query: string): unknown[] {
        if (!this.db) throw new Error("Database is not initialized");

        const stmt = this.db.prepare(query);
        const result = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            result.push(row);
        }
        stmt.free();
        return result;
    }
}
