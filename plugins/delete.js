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

    if (!isCreator && !isAdmins) {
        return reply("❌ This command is only for *Group Admins* or the *Bot Owner*!");
    }

    try {
        const quotedMsg = m.quoted;
        if (!quotedMsg) return reply("⚠️ *Please reply to the group status you want to delete!*");

        const keyToDelete = {
            remoteJid: from,
            fromMe: quotedMsg.fromMe || false,
            id: quotedMsg.id,
            participant: quotedMsg.sender
        };

        await conn.relayMessage(
            from,
            {
                groupStatusMessageV2: {
                    message: {
                        protocolMessage: {
                            key: keyToDelete,
                            type: 14 // REVOKE
                        }
                    }
                }
            },
            {
                additionalAttributes: {
                    edit: quotedMsg.fromMe ? '7' : '8' // <--- THIS PREVENTS THE DUMMY UPLOAD
                }
            }
        );

        return reply("✅ *Status delete request sent!*");

    } catch (error) {
        reply(`❌ *Failed to delete:* ${error.message}`);
    }
});
