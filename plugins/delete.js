import { cmd } from '../command.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// ==================== DELETE COMMAND ====================
cmd({
    pattern: "delete",
    alias: ["del"],
    desc: "Delete any message (Creator & Admins only)",
    react: "🗑️",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { reply, quoted, isCreator, isGroup, isAdmin, from }) => {
    try {
        // ==================== 1) INBOX (DM) — Creator only ====================
        if (!isGroup) {
            if (!isCreator) return reply('❌ Only the bot creator can use this command in inbox!');

            if (quoted && quoted.key) {
                try { await conn.sendMessage(mek.chat, { delete: quoted.key }); return; } catch (e) {}
            }
            const context = mek.message?.extendedTextMessage?.contextInfo;
            if (context && context.stanzaId) {
                try {
                    await conn.sendMessage(mek.chat, {
                        delete: { remoteJid: mek.chat, id: context.stanzaId, participant: context.participant, fromMe: false }
                    });
                    return;
                } catch (e) {}
            }
            if (m.quoted && m.quoted.key) {
                try { await conn.sendMessage(mek.chat, { delete: m.quoted.key }); return; } catch (e) {}
            }
            return reply("❌ Reply to a message!");
        }

        // ==================== 2) NORMAL GROUP MESSAGE — Admin or Creator ====================
        if (!isCreator && !isAdmin) return reply('❌ Only the bot creator or group admins can use this command!');
        if (!m.quoted) return reply('❌ Please reply to a message to delete it!');

        await conn.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.quoted.id,
                participant: m.quoted.sender
            }
        });
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: true, id: m.id } });
    } catch (err) {
        console.error(err);
        await reply('❌ Failed to delete message. Something went wrong.');
    }
});
