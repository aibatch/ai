// plugins/paymsg.js
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import { generateWAMessageFromContent, generateMessageIDV2 } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

// Helper to resolve group invite links
async function getGroupJid(client, link) {
    const match = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const inviteCode = match[1];
    try {
        const groupInfo = await client.groupGetInviteInfo(inviteCode);
        return groupInfo.id;
    } catch (e) {
        return null;
    }
}

cmd({
    pattern: "paymsg",
    alias: ["pay", "payment"],
    desc: "Send a custom payment message with random amount",
    category: "owner",
    filename: __filename
}, async (client, message, match, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return await reply("*📛 Owner Only Command*");

        // Parse arguments: link, then the rest of the text
        const args = (match || "").trim().split(/\s+/);
        if (args.length < 2) {
            return await reply("*🍁 Usage:* `.paymsg <grouplink> <message>`\n*Example:* `.paymsg https://chat.whatsapp.com/XXXXX Aslam o Alykum`");
        }

        const groupLink = args[0];
        const noteText = args.slice(1).join(" ");

        // Resolve the group link
        const targetJid = await getGroupJid(client, groupLink);
        if (!targetJid) {
            return await reply("❌ Invalid group link or bot is not in the group.");
        }

        // ==========================================
        // GENERATE RANDOM AMOUNT
        // ==========================================
        // Generates a random number between 1 and 500
        const randomAmount = Math.floor(Math.random() * 500) + 1; 
        const scaledAmount = (randomAmount * 1000).toString();

        // ==========================================
        // BUILD THE PAYMENT MESSAGE MANUALLY
        // ==========================================
        const paymentMessage = {
            requestPaymentMessage: {
                currencyCodeIso4217: 'USD',
                amount1000: scaledAmount, 
                requestFrom: '0@s.whatsapp.net', // Shows "Requested from WhatsApp Business"
                noteMessage: {
                    extendedTextMessage: {
                        text: noteText // Your custom text at the bottom
                    }
                },
                expiryTimestamp: '0',
                amount: {
                    value: scaledAmount,
                    offset: 1000,
                    currencyCode: 'USD'
                }
            }
        };

        // Generate the full message object
        const fullMessage = generateWAMessageFromContent(targetJid, paymentMessage, {
            userJid: client.user.id,
            messageId: generateMessageIDV2(client.user.id)
        });

        // Relay the message to the group
        await client.relayMessage(targetJid, fullMessage.message, {
            messageId: fullMessage.key.id
        });

        await reply(`✅ Payment message sent to the group successfully!\n💵 Random Amount: US$${randomAmount}`);

    } catch (error) {
        console.error("paymsg Error:", error);
        await reply(`💢 Error: ${error.message}`);
    }
});
