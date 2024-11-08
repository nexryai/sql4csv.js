self.onmessage = (event) => {
    const csvData: string = event.data;
    const lines = csvData.split('\n');

    if (lines.length === 0) return;

    // 1行目（ヘッダー行）を取得し、カラム名としてメインスレッドに送信
    const header = lines[0].split(',').map((col: string) => col.trim());
    self.postMessage({ header });

    // データ行を処理
    lines.slice(1).forEach((line, index) => {
        if (line.trim()) {
            const values = line.split(',').map(value => value.trim());
            self.postMessage({ index, values });
        }
    });

    // 処理終了を通知
    self.postMessage({ done: true });
};
