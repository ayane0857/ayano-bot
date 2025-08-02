const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateAllUserCoins() {
    // Prismaクライアントのインスタンスを作成
    const prisma = new PrismaClient()

    try {
        // 全ユーザーのコインを100増やす
        const updateResult = await prisma.userServer.updateMany({
            data: {
                coin: {
                    increment: 100
                }
            }
        })

        console.log(`${updateResult.count}人のユーザーのコインを更新しました`)
        return updateResult

    } catch (error) {
        console.error('エラーが発生しました:', error)
        throw error

    } finally {
        // データベース接続を閉じる
        await prisma.$disconnect()
    }
}

// 関数の実行例
updateAllUserCoins()
    .then(() => console.log('更新が完了しました'))
    .catch((error) => console.error('更新に失敗しました:', error))