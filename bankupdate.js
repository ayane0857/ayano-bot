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
            let safeValue;
            if (Number.isFinite(bankcoin) && bankcoin >= 0) {
                safeValue = bankcoin;
            } else {
                console.warn(`[${new Date().toISOString()}] Invalid bankcoin value for user id ${id}: ${bankcoin}. Defaulting to 0.`);
                safeValue = 0;
            }
            const updatedBankcoin = Math.round(safeValue * MULTIPLIER * 100) / 100;

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
        try {
            const rateData = await prisma.Bot.findUnique({
                where: { id: "singleton" },
            });

            // データが存在しない場合は初期値を作成
            if (!rateData) {
                const initialRate = 15000; // 初期値を100倍で保存 (例: 150.00 -> 15000)
                await prisma.Bot.create({
                    data: { id: "singleton", ayacoin: initialRate },
                });
                return initialRate;
            }

            return rateData.ayacoin;
        } catch (error) {
            // Prisma がテーブルを見つけられない場合(P2021)、テーブルを作成して再試行する
            if (error && error.code === 'P2021') {
                console.warn('Bot テーブルが見つかりませんでした。テーブルを作成して再試行します...');
                // テーブルを現在のスキーマに作成する（存在しない場合のみ）
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS "Bot" (
                        "id" TEXT PRIMARY KEY,
                        "ayacoin" INTEGER DEFAULT 5000,
                        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // 再度取得 -> テーブル作成後はレコードが無ければ作成するロジックにより初期値が作られる
                const rateData = await prisma.Bot.findUnique({ where: { id: 'singleton' } });
                if (!rateData) {
                    const initialRate = 15000;
                    await prisma.Bot.create({ data: { id: 'singleton', ayacoin: initialRate } });
                    return initialRate;
                }
                return rateData.ayacoin;
            }

            // それ以外のエラーは再スロー
            throw error;
        }
    }

    // データベースのレートを更新
    async updateRate(newRate) {
        // 小数点廃止 (倍率を使用して整数化: 例 10.99 -> 1099)
        const expandedRate = Math.round(newRate * 100); // 小数点以下を2桁として処理

        await prisma.Bot.update({
            where: { id: "singleton" },
            data: { ayacoin: expandedRate },
        });

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

        await this.updateRate(newRate);
    }

    // シミュレーション開始
    startSimulation() {
        if (this.isRunning) return;

        this.isRunning = true;

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