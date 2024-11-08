import { describe, it, expect, beforeEach } from 'vitest';
import { CSVProcessor } from '../src/main';

describe('CSVProcessor', () => {
    const csvProcessor = new CSVProcessor();
    const internalTableName = 'sql4csv_data';

    // wait 100ms for the worker to be created
    beforeEach(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should create a table and insert rows from CSV data', async () => {
        // CSVデータを設定
        const csvData = "id,name,email\n1,John Doe,john@example.com\n2,Jane Doe,jane@example.com";
        csvProcessor.importCSV(csvData);

        // Workerの結果としてonmessageをシミュレート
        const header = ['id', 'name', 'email'];
        csvProcessor.csvWorker.onmessage?.({ data: { header, values: null, done: false } });

        // データ行のシミュレーション
        csvProcessor.csvWorker.onmessage?.({ data: { header: null, values: ['1', 'John Doe', 'john@example.com'], done: false } });
        csvProcessor.csvWorker.onmessage?.({ data: { header: null, values: ['2', 'Jane Doe', 'jane@example.com'], done: true } });

        // データが正しく挿入されたかを確認
        const result = csvProcessor.execQueryAndGetResult(`SELECT * FROM ${internalTableName}`);
        expect(result).toEqual([
            { id: '1', name: 'John Doe', email: 'john@example.com' },
            { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
        ]);
    });
});
