const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ExchangeSimulator {
    constructor() {
        this.volatility = 0.002; // レートの変動幅
        this.isRunning = false;
    }

    // データベースからレートを取得
    async getCurrentRate() {
        const rateData = await prisma.Bot.findUnique({
            where: { id: "singleton" },
        });

        // データが存在しない場合は初期値を作成
        if (!rateData) {
            const initialRate = 15000; // 初期値を10倍で保存 (例: 150.00 -> 15000)
            await prisma.Bot.create({
                data: { id: "singleton", ayacoin: initialRate },
            });
            return initialRate; // 初期値を返す
        }

        return rateData.ayacoin;
    }

    // データベースのレートを更新
    async updateRate(newRate) {
        // 小数点廃止 (倍率を使用して整数化: 例 10.99 -> 1099)
        const expandedRate = Math.round(newRate * 100); // 小数点以下を2桁として処理

        await prisma.Bot.update({
            where: { id: "singleton" },
            data: { ayacoin: expandedRate },
        });

        console.log(`Updated rate to: ${expandedRate} (stored as integer)`);
    }

    // レート計算と更新処理
    async nextTick() {
        const currentRate = await this.getCurrentRate();
        const currentRateInDecimal = currentRate / 100; // データベース値を元の小数表記に戻す
        const randomChange = (Math.random() - 0.5) * 2 * this.volatility;
        const newRate = currentRateInDecimal * (1 + randomChange);

        console.log(`Current rate: ${currentRateInDecimal.toFixed(2)}, Change: ${(randomChange * 100).toFixed(4)}%`);
        await this.updateRate(newRate);
    }

    // シミュレーション開始
    startSimulation() {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log("Starting simulation...");

        const simulate = async () => {
            if (!this.isRunning) {
                console.log("Simulation stopped");
                return;
            }
            await this.nextTick();
            setTimeout(simulate, 5000);
        };

        simulate();
    }

    // シミュレーション停止
    stopSimulation() {
        this.isRunning = false;
    }
}

// 使用例
(async () => {
    const simulator = new ExchangeSimulator();
    await simulator.startSimulation();
})();
