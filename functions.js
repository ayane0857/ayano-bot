const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addXP(serverId, userId, amount) {
    try {
        const userData = await prisma.userServer.upsert({
            where: {
                serverId_userId: {
                    serverId: serverId,
                    userId: userId
                }
            },
            update: {
                xp: {
                    increment: amount
                }
            },
            create: {
                serverId: serverId,
                userId: userId,
                xp: amount,
                coin: 1000,
                bankcoin: 0,
                ayacoin: 0
            }
        })
        return userData
    } catch (error) {
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

async function addCoin(serverId, userId, amount) {
    try {
        const userData = await prisma.userServer.upsert({
            where: {
                serverId_userId: {
                    serverId: serverId,
                    userId: userId
                }
            },
            update: {
                coin: {
                    increment: amount
                }
            },
            create: {
                serverId: serverId,
                userId: userId,
                xp: 0,
                coin: 1000 + amount,
                bankcoin: 0,
                ayacoin: 0
            }
        })
        return userData
    } catch (error) {
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

async function addBank(serverId, userId, amount) {
    try {
        const userData = await prisma.userServer.upsert({
            where: {
                serverId_userId: {
                    serverId: serverId,
                    userId: userId
                }
            },
            update: {
                bankcoin: {
                    increment: amount
                }
            },
            create: {
                serverId: serverId,
                userId: userId,
                xp: 0,
                coin: 1000 + amount,
                bankcoin: 0,
                ayacoin: 0
            }
        })
        return userData
    } catch (error) {
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

async function addAyaCoin(serverId, userId, amount) {
    try {
        const userData = await prisma.userServer.upsert({
            where: {
                serverId_userId: {
                    serverId: serverId,
                    userId: userId
                }
            },
            update: {
                ayacoin: {
                    increment: amount
                }
            },
            create: {
                serverId: serverId,
                userId: userId,
                xp: 0,
                coin: 1000,
                bankcoin: 0,
                ayacoin: 0 + amount
            }
        })
        return userData
    } catch (error) {
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

async function getUserData(serverId, userId) {
    try {
        const userData = await prisma.userServer.findUnique({
            where: {
                serverId_userId: {
                    serverId: serverId,
                    userId: userId
                }
            }
        })

        if (!userData) {
            return await prisma.userServer.create({
                data: {
                    serverId: serverId,
                    userId: userId,
                    xp: 0,
                    coin: 1000,
                    bankcoin: 0,
                    ayacoin: 0
                }
            })
        }

        return userData
    } catch (error) {
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

async function deleteUserServerData(serverId, userId) {
    try {
        await prisma.userServer.delete({
            where: {
                serverId_userId: {
                    serverId: serverId,
                    userId: userId
                }
            }
        })

        return true

    } catch (error) {
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

function levenextxp(xp) {
    try {
        let level = 0;
        let requiredXp = 250;

        while (xp >= requiredXp) {
            xp -= requiredXp;
            level++;
            requiredXp += 50;
        }

        const NextXP = requiredXp - xp;

        return {
            level: level,
            NextXP: NextXP,
        };
    } catch (error) {
        throw error
    }
}

async function getTopUsersByCoin(serverId) {
    try {
        const users = await prisma.userServer.findMany({
            where: {
                serverId: serverId
            },
            select: {
                userId: true,
                coin: true,
                bankcoin: true
            }
        });

        // 合計値でソートして上位5件を取得
        const topUsers = users
            .sort((a, b) => (b.coin + b.bankcoin) - (a.coin + a.bankcoin))
            .slice(0, 5);

        return topUsers
    } catch (error) {
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

async function getTopUsersByXP(serverId) {
    try {
        const users = await prisma.userServer.findMany({
            where: { serverId: serverId },
            select: { userId: true, xp: true },
            orderBy: { xp: 'desc' }, // XPの降順でソート
            take: 5 // 上位5人のみ取得
        });

        return users;
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

function getYaku(dice, coin) {
    try {
        if (dice[0] === 1 && dice[1] === 1 && dice[2] === 1) {
            return {
                yaku: "ピンゾロ",
                coin: Math.round(coin * 5)
            };
        }
        if (dice[0] === dice[1] && dice[1] === dice[2]) {
            return {
                yaku: "ゾロ目",
                coin: Math.round(coin * 3)
            };
        }
        if (dice.slice().sort().join('') === '456') {
            return {
                yaku: "シゴロ",
                coin: Math.round(coin * 2)
            };
        }
        if (dice[0] === 1 && dice[1] === 2 && dice[2] === 3) {
            return {
                yaku: "ヒフミ",
                coin: -coin * 2
            };
        }
        if (dice[0] === dice[1] || dice[1] === dice[2] || dice[2] === dice[0]) {
            return {
                yaku: "普通の目",
                coin: Math.round(coin * 1)
            };
        }

        return {
            yaku: "役なし",
            coin: -coin
        };
    } catch (error) {
        throw error;
    }
}

async function ayacoindata() {
    try {
        const ayacoinData = await prisma.Bot.upsert({
            where: {
                id: "singleton",
            },
            update: {},
            create: {
                id: "singleton",
                ayacoin: 150.00,
            },
        });

        return Number(ayacoinData.ayacoin);
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports = {
    addXP,
    addCoin,
    addAyaCoin,
    addBank,
    getUserData,
    deleteUserServerData,
    getTopUsersByCoin,
    getTopUsersByXP,
    levenextxp,
    getYaku,
    ayacoindata
};