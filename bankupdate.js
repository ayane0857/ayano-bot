const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function addCoinsToAllUsers() {
    const MULTIPLIER = 1.2;
    try {
        const users = await prisma.userServer.findMany({
            select: { id: true, bankcoin: true }
        });

        const updatePromises = users.map(({ id, bankcoin }) => {
            const safeValue = Number.isFinite(bankcoin) && bankcoin >= 0 ? bankcoin : 0;
            const updatedBankcoin = Number((safeValue * MULTIPLIER).toFixed(2));

            return prisma.userServer.update({
                where: { id },
                data: { bankcoin: updatedBankcoin }
            });
        });

        const result = await prisma.$transaction(updatePromises);
        console.log(`[${new Date().toISOString()}] Updated ${result.length} users' coins!`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error updating coins:`, error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Schedule the task to run at 22:11 JST
cron.schedule('0 9 * * *', () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled coin update...`);
    addCoinsToAllUsers()
        .catch(error => {
            console.error(`[${new Date().toISOString()}] Failed:`, error);
        });
}, {
    timezone: "Asia/Tokyo"  // 日本時間を明示的に指定
});

class ExchangeSimulator {
    constructor() {
        this.volatility = 0.001; // レートの変動幅
        this.isRunning = false;
        this.priceFloor = 10; // 価格の下限値
        this.recoveryBias = 0.6; // 下限付近での上昇バイアス (0.5より大きい値)
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

        // 価格が下限に近づくほど上昇確率を上げる
        let upwardBias = 0;
        if (currentRateInDecimal < this.priceFloor * 1.1) { // 下限の110%以下になると徐々にバイアスを強める
            const distanceFromFloor = (currentRateInDecimal - this.priceFloor) / this.priceFloor;
            upwardBias = (1 - distanceFromFloor) * (this.recoveryBias - 0.5);
        }

        // ランダム値の生成（上昇バイアスを考慮）
        const randomValue = Math.random() + upwardBias;
        const randomChange = (randomValue - 0.5) * 2 * this.volatility;

        let newRate = currentRateInDecimal * (1 + randomChange);

        // 下限値を下回らないようにする
        if (newRate < this.priceFloor) {
            newRate = this.priceFloor;
        }

        console.log(`Current rate: ${currentRateInDecimal.toFixed(2)}, Change: ${(randomChange * 100).toFixed(4)}%, Upward bias: ${upwardBias.toFixed(4)}`);
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