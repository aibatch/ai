import { cmd } from '../command.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "delgcstatus",
    alias: ["delgstatus", "delstatus"],
    desc: "Delete group status for everyone.",
    category: "group",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator, isAdmins }) => {

    // ── Owner ya Admin verification ──
    if (!isCreator && !isAdmins) {
        return reply("❌ This command is only for *Group Admins* or the *Bot Owner*!");
    }

    try {
        const quotedMsg = m.quoted;

        if (!quotedMsg) {
            return reply("⚠️ *Please reply to the group status or message you want to delete!*");
        }

        const keyToDelete = {
            remoteJid: from,
            fromMe: quotedMsg.fromMe || false,
            id: quotedMsg.id,
            participant: quotedMsg.sender
        };

        // Message delete trigger
        await conn.sendMessage(from, { delete: keyToDelete });

        return reply("✅ *Status/Message delete request sent!*");

    } catch (error) {
        reply(`❌ *Failed to delete:* ${error.message}`);
    }
});


// ==================== DELETE COMMAND (Creator & Admin) ====================
cmd({
    pattern: "delete",
    alias: ["del"],
    desc: "Delete any message / group status (Creator & Admins only)",
    react: "🗑️",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { reply, quoted, isCreator, isGroup, isAdmin, from }) => {
    try {
        // ---------- GROUP STATUS DETECTION (like .raw) ----------
        const groupStatusNode =
            mek?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.groupStatusMessageV2 ||
            mek?.msg?.contextInfo?.quotedMessage?.groupStatusMessageV2 ||
            quoted?.message?.groupStatusMessageV2 ||
            m?.quoted?.message?.groupStatusMessageV2;

        const isGroupStatus = !!groupStatusNode;

        // ==================== 1) INBOX (DM) — Creator only (unchanged) ====================
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

        // ==================== 2) GROUP STATUS — Admin or Creator (new 3rd rule) ====================
        if (isGroupStatus) {
            if (!isCreator && !isAdmin) return reply('❌ Only the bot creator or group admins can delete group status!');
            if (!m.quoted) return reply('⚠️ Please reply to the group status you want to delete!');

            const keyToDelete = {
                remoteJid: from,
                fromMe: m.quoted.fromMe || false,
                id: m.quoted.id,
                participant: m.quoted.sender
            };

            await conn.sendMessage(from, { delete: keyToDelete });
            return reply("✅ Group status delete request sent!");
        }

        // ==================== 3) NORMAL GROUP MESSAGE — Admin or Creator (unchanged) ====================
        if (!isCreator && !isAdmin) return reply('❌ Only the bot creator or group admins can use this command!');
        if (!m.quoted) return reply('❌ Please reply to a message to delete it!');

        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.quoted.id, participant: m.quoted.sender } });
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: true, id: m.id } });
    } catch (err) {
        console.error(err);
        await reply('❌ Failed to delete message. Something went wrong.');
    }
});
