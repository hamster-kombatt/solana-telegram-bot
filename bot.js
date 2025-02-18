require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const TelegramBot = require('node-telegram-bot-api');

const RPC_URL = process.env.RPC_URL;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const connection = new Connection(RPC_URL, 'confirmed');
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log(`📡 Monitoring wallet: ${WALLET_ADDRESS}`);

async function checkTransactions() {
    let lastSignature = null;

    setInterval(async () => {
        try {
            const transactions = await connection.getSignaturesForAddress(new PublicKey(WALLET_ADDRESS), { limit: 1 });
            if (transactions.length > 0 && transactions[0].signature !== lastSignature) {
                lastSignature = transactions[0].signature;
                const txDetails = await connection.getTransaction(lastSignature, { commitment: 'confirmed' });

                if (txDetails) {
                    const message = `📢 Նոր գործարք քո դրամապանակում!\n\n🔗 Tx Hash: ${lastSignature}\n🔍 Դիտել Solscan-ում: https://solscan.io/tx/${lastSignature}`;
                    bot.sendMessage(TELEGRAM_CHAT_ID, message);
                    console.log(`✅ Նոր գործարք հայտնաբերվեց: ${lastSignature}`);
                }
            }
        } catch (error) {
            console.error('❌ Սխալ Solana API-ի հետ կապի ժամանակ:', error);
        }
    }, 5000);
}

checkTransactions();
