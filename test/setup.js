import { vi } from 'vitest';

class MockWorker {
    constructor() {
        this.onmessage = null;
    }

    postMessage(data) {
        if (this.onmessage) {
            this.onmessage({ data });
        }
    }

    terminate() {
        console.log('Worker terminated!');
    }
}

// グローバルスコープにMockWorkerを設定
vi.stubGlobal('Worker', MockWorker);
