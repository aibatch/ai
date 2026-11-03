import { fileURLToPath } from 'url';
import path from 'path';
import config from '../config.js';
import { cmd, commands } from '../command.js';
import { runtime, lidToPhone } from '../lib/functions.js';
import axios from 'axios';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_NEWSLETTER = '120363430297481707@newsletter';

// Resolve newsletter JID from DEV (must end with @newsletter, else fallback)
const resolveNewsletterJid = (userConfig) => {
    const rawDev = String(userConfig?.DEV ?? config?.DEV ?? '').trim();
    return rawDev.endsWith('@newsletter') ? rawDev : FALLBACK_NEWSLETTER;
};

// ==================== PING COMMAND ====================
cmd({
    pattern: "ping",
    alias: ["speed", "pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply, userConfig }) => {
    try {
        const BOT_NAME = userConfig?.BOT_NAME || config.BOT_NAME;
        const newsletterJid = resolveNewsletterJid(userConfig);
        const newsletterName = BOT_NAME;

        const start = new Date().getTime();
        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });
        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;
        const text = `> *${BOT_NAME} SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid,
                    newsletterName,
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// ==================== PING2 COMMAND ====================
cmd({
    pattern: "ping2",
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply, userConfig }) => {
    try {
        const BOT_NAME = userConfig?.BOT_NAME || config.BOT_NAME;
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 500));
        const endTime = Date.now();
        const ping = endTime - startTime;
        let status;
        if (ping < 1000) status = "⚡ *Fast & Responsive*";
        else if (ping < 1400) status = "⚙️ *Normal Speed*";
        else status = "🐢 *Slow Response*";
        const msg = `
*╭┈──〔 ⚡ ${BOT_NAME} Pɪɴɢ 〕─⊷*
*├▢ 📶 Response:* ${ping} ms
*├▢ 🧠 Status:* ${status}
*├▢ 💫 Mode:* Active & Stable
*╰───────────────⊷*
        `;
        await conn.sendMessage(from, { text: msg.trim() }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`⚠️ Error: ${e.message}`);
    }
});

// ==================== EXTRACT JID HELPER ====================
async function extractJid(client, m, q) {
    if (m.quoted) {
        let jid = m.quoted.sender;
        if (jid && jid.includes('@lid')) {
            try {
                const phoneNumber = await lidToPhone(client, jid);
                if (phoneNumber) {
                    jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                }
            } catch (e) {}
        }
        return jid;
    }
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        let jid = m.mentionedJid[0];
        if (jid && jid.includes('@lid')) {
            try {
                const phoneNumber = await lidToPhone(client, jid);
                if (phoneNumber) {
                    jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                }
            } catch (e) {}
        }
        return jid;
    }
    if (q) {
        if (q.includes('@') || q.includes('lid')) {
            let jid = q;
            if (jid && jid.includes('@lid')) {
                try {
                    const phoneNumber = await lidToPhone(client, jid);
                    if (phoneNumber) {
                        jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                    }
                } catch (e) {}
            }
            return jid;
        }
        const cleanNumber = q.replace(/[^0-9]/g, '');
        if (cleanNumber.length >= 10) {
            return cleanNumber + "@s.whatsapp.net";
        }
    }
    return null;
}

// ==================== BLOCK COMMAND ====================
cmd({
    pattern: "block",
    desc: "Blocks a person (supports LID to PN conversion)",
    category: "owner",
    react: "🚫",
    filename: __filename
}, async (client, message, m, { from, isCreator, q, react }) => {
    try {
        if (!isCreator) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }
        let jid = await extractJid(client, m, q);
        if (!jid) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "Please mention a user or reply to their message."
            }, { quoted: message });
        }
        if (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid')) {
            jid = jid + "@s.whatsapp.net";
        }
        try {
            await client.updateBlockStatus(jid, "block");
            await react("✅");
            await client.sendMessage(from, {
                text: "Successfully blocked user",
                mentions: [jid]
            }, { quoted: message });
        } catch (error) {
            console.error("Block command error:", error);
            await react("❌");
            await client.sendMessage(from, {
                text: "Failed to block the user."
            }, { quoted: message });
        }
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        await client.sendMessage(from, {
            text: "Failed to block the user."
        }, { quoted: message });
    }
});

// ==================== UNBLOCK COMMAND ====================
cmd({
    pattern: "unblock",
    desc: "Unblocks a person (supports LID to PN conversion)",
    category: "owner",
    react: "🔓",
    filename: __filename
}, async (client, message, m, { from, isCreator, q, react }) => {
    try {
        if (!isCreator) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }
        let jid = await extractJid(client, m, q);
        if (!jid) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "Please mention a user or reply to their message."
            }, { quoted: message });
        }
        if (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid')) {
            jid = jid + "@s.whatsapp.net";
        }
        try {
            await client.updateBlockStatus(jid, "unblock");
            await react("✅");
            await client.sendMessage(from, {
                text: "Successfully unblocked user",
                mentions: [jid]
            }, { quoted: message });
        } catch (error) {
            console.error("Unblock command error:", error);
            await react("❌");
            await client.sendMessage(from, {
                text: "Failed to unblock the user."
            }, { quoted: message });
        }
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        await client.sendMessage(from, {
            text: "Failed to unblock the user."
        }, { quoted: message });
    }
});

// ==================== MENU HELPERS ====================
const toSmallCaps = (text) => {
    if (!text || typeof text !== 'string') return '';
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
        'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
        's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
        'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
        'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
    };
    return text.split('').map(char => smallCapsMap[char] || char).join('');
};

const formatCategory = (category, cmds) => {
    const validCmds = cmds.filter(cmd => cmd.pattern && cmd.pattern.trim() !== '');
    if (validCmds.length === 0) return '';
    let title = `\n\`『 ${category.toUpperCase()} 』\`\n╭───────────────────⊷\n`;
    let body = validCmds.map(cmd => {
        const commandName = cmd.pattern || '';
        return `*┋ ⬡ ${toSmallCaps(commandName)}*`;
    }).join('\n');
    let footer = `\n╰───────────────────⊷`;
    return `${title}${body}${footer}`;
};

const formatMenuOptions = (categories) => {
    let menuOptions = '';
    let optionNumber = 1;
    categories.forEach(cat => {
        const displayName = toSmallCaps(cat.charAt(0).toUpperCase() + cat.slice(1));
        const menuText = toSmallCaps(' Menu');
        menuOptions += `*┋ ⬡ ${optionNumber} ${displayName}${menuText}*\n`;
        optionNumber++;
    });
    return menuOptions;
};

const getMediaType = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return null;
    const urlLower = url.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (imageExtensions.some(ext => urlLower.endsWith(ext))) return 'image';
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.gif'];
    if (videoExtensions.some(ext => urlLower.endsWith(ext))) return 'video';
    return null;
};

const getCategorizedCommands = () => {
    const commandsArray = Array.isArray(commands) ? commands : Object.values(commands);
    const totalCommands = commandsArray.length;
    const categories = [...new Set(commandsArray.map(c => c.category))].filter(cat =>
        cat && cat.trim() !== '' && cat !== 'undefined'
    );
    const sortedCategories = categories.sort((a, b) => a.localeCompare(b));

    const categorized = {};
    sortedCategories.forEach(cat => {
        const categoryCommands = commandsArray.filter(c => c.category === cat);
        const validCommands = categoryCommands.filter(cmd => cmd.pattern && cmd.pattern.trim() !== '');
        if (validCommands.length > 0) categorized[cat] = validCommands;
    });

    return { categorized, totalCommands };
};

const resolveMedia = async (botMediaUrl, localImagePath) => {
    const mediaType = getMediaType(botMediaUrl);
    if (mediaType === 'image' || mediaType === 'video') {
        try {
            await axios.head(botMediaUrl, { timeout: 3000 });
            return { [mediaType]: { url: botMediaUrl } };
        } catch {
            return { image: { url: localImagePath } };
        }
    }
    return { image: { url: localImagePath } };
};

// ==================== MENU COMMAND (Full) ====================
cmd({
    pattern: "menu",
    alias: ["m", "fullmenu"],
    use: '.menu',
    desc: "Show all bot commands",
    category: "main",
    react: "🧾",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, userConfig }) => {
    try {
        const BOT_NAME = userConfig?.BOT_NAME || config.BOT_NAME;
        const OWNER_NAME = userConfig?.OWNER_NAME || config.OWNER_NAME;
        const PREFIX = userConfig?.PREFIX || config.PREFIX;
        const VERSION = userConfig?.VERSION || config.VERSION;
        const MODE = userConfig?.MODE || config.MODE;
        const BOT_IMAGE = userConfig?.BOT_IMAGE || config.BOT_IMAGE;
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION;
        const newsletterJid = resolveNewsletterJid(userConfig);
        const newsletterName = BOT_NAME;

        await conn.sendPresenceUpdate('composing', from);

        const { categorized, totalCommands } = getCategorizedCommands();
        let menuSections = '';
        for (const [category, cmds] of Object.entries(categorized)) {
            const section = formatCategory(category, cmds);
            if (section) menuSections += section;
        }

        const dec = `*╭┈───〔 ${BOT_NAME} 〕┈───⊷*
*├✦ Owner:* ${OWNER_NAME}
*├✦ Commands:* ${totalCommands}
*├✦ Runtime:* ${runtime(process.uptime())}
*├✦ Prefix:* ${PREFIX}
*├✦ Mode:* ${MODE}
*├✦ Version:* ${VERSION}
*╰───────────────────⊷*
${menuSections}

> ${DESCRIPTION}`;

        const localImagePath = path.join(__dirname, '../lib/jawadmd.jpg');
        const mediaData = await resolveMedia(BOT_IMAGE, localImagePath);

        await conn.sendMessage(from, {
            ...mediaData,
            caption: dec,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid,
                    newsletterName,
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});

// ==================== MENU2 COMMAND (Interactive) ====================
cmd({
    pattern: "menu2",
    alias: ["m2"],
    desc: "Show all bot commands in selection menu",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply, userConfig }) => {
    try {
        const BOT_NAME = userConfig?.BOT_NAME || config.BOT_NAME;
        const OWNER_NAME = userConfig?.OWNER_NAME || config.OWNER_NAME;
        const PREFIX = userConfig?.PREFIX || config.PREFIX;
        const VERSION = userConfig?.VERSION || config.VERSION;
        const BOT_MEDIA_URL = userConfig?.BOT_MEDIA_URL || config.BOT_MEDIA_URL;
        const newsletterJid = resolveNewsletterJid(userConfig);
        const newsletterName = BOT_NAME;

        const commonContextInfo = (mentionedJid) => ({
            mentionedJid: [mentionedJid],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid,
                newsletterName,
                serverMessageId: 143
            }
        });

        await conn.sendPresenceUpdate('composing', from);

        const { categorized, totalCommands } = getCategorizedCommands();
        const availableCategories = Object.keys(categorized);
        const menuOptions = formatMenuOptions(availableCategories);

        const caption = `*╭┈───〔 ${BOT_NAME} 〕┈───⊷*
*├▢ Owner:* ${OWNER_NAME}
*├▢ Prefix:* ${PREFIX}
*├▢ Version:* ${VERSION}
*├▢ Plugins:* ${totalCommands}
*├▢ Runtime:* ${runtime(process.uptime())}
*╰───────────────────⊷*
*╭───⬡ SELECT MENU ⬡───*
${menuOptions}*╰───────────────────⊷*

> *ʀᴇᴘʟʏ ᴡɪᴛʜ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴛᴏ sᴇʟᴇᴄᴛ ᴍᴇɴᴜ (1-${availableCategories.length})*`;

        const localImagePath = path.join(__dirname, '../lib/khanmd.jpg');
        const mainMenuMedia = await resolveMedia(BOT_MEDIA_URL, localImagePath);

        const sentMsg = await conn.sendMessage(from, {
            ...mainMenuMedia,
            caption,
            contextInfo: commonContextInfo(sender)
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        const menuListener = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (!isReplyToBot) return;

            conn.ev.off("messages.upsert", menuListener);
            await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

            const selectedNumber = parseInt(receivedText);
            if (selectedNumber >= 1 && selectedNumber <= availableCategories.length) {
                const selectedCategory = availableCategories[selectedNumber - 1];
                const categoryCommands = categorized[selectedCategory];
                const displayName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
                const categorySection = formatCategory(selectedCategory, categoryCommands);

                let categoryMenu = `*╭┈───〔 ${displayName} Menu 〕┈───⊷*\n`;
                categoryMenu += `*├▢ 📜 Category:* ${selectedCategory}\n`;
                categoryMenu += `*├▢ 🔢 Total Commands:* ${categoryCommands.length}\n`;
                categoryMenu += `*╰───────────────────⊷*`;
                categoryMenu += `${categorySection}\n\n`;
                categoryMenu += `> *ᴜsᴇ ${PREFIX}ᴍᴇɴᴜ2 ᴛᴏ sᴇᴇ ᴀʟʟ ᴍᴇɴᴜs ᴀɢᴀɪɴ*`;

                const categoryMedia = await resolveMedia(BOT_MEDIA_URL, localImagePath);
                await conn.sendMessage(senderID, {
                    ...categoryMedia,
                    caption: categoryMenu,
                    contextInfo: commonContextInfo(receivedMsg.key.participant || receivedMsg.key.remoteJid)
                }, { quoted: receivedMsg });
            } else {
                await conn.sendMessage(senderID, {
                    text: `❌ *Invalid selection! Please reply with a valid number (1-${availableCategories.length}).*`,
                    contextInfo: commonContextInfo(receivedMsg.key.participant || receivedMsg.key.remoteJid)
                }, { quoted: receivedMsg });
            }
        };

        conn.ev.on("messages.upsert", menuListener);

        setTimeout(() => {
            conn.ev.off("messages.upsert", menuListener);
            console.log('🧹 Menu2 listener cleaned up (timeout)');
        }, 20000);
    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e.message}`);
    }
});
