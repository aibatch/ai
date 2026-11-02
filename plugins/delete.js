import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { lidToPhone } from '../lib/functions.js'; 

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "delgcstatus",
    alias: ["delgstatus", "delstatus"],
    desc: "Delete group status for everyone.",
    category: "group",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator, isAdmins }) => {

    // ── Owner & Admin verification ──
    if (!isCreator && !isAdmins) {
        return reply("❌ This command is only for *Group Admins* or the *Bot Owner*!");
    }

    try {
        const quotedMsg = m.quoted;
        if (!quotedMsg) return reply("⚠️ *Please reply to the group status you want to delete!*");

        const context = mek?.message?.extendedTextMessage?.contextInfo || mek?.msg?.contextInfo;
        
        // 1. Get the raw LID or sender
        let participant = quotedMsg.sender || context?.participant;

        // 2. Convert LID to Phone Number using your custom function
        if (participant && participant.includes('@lid')) {
            const pnNumber = await lidToPhone(conn, participant);
            if (pnNumber) {
                participant = `${pnNumber}@s.whatsapp.net`;
            }
        }

        const keyToDelete = {
            remoteJid: from,
            fromMe: quotedMsg.fromMe || false,
            id: quotedMsg.id,
            participant: participant
        };

        // 3. Send the exact payload to bypass Official Baileys' limitations
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
                    edit: quotedMsg.fromMe ? '7' : '8', // Tells WA it's a delete (prevents dummy upload)
                    addressing_mode: 'lid'              // Forces correct LID routing
                },
                additionalNodes: [
                    { tag: 'meta', attrs: { is_group_status: 'true' } } // Forces status deletion
                ]
            }
        );

        return reply("✅ *Status delete request sent!*");

    } catch (error) {
        console.error("delgcstatus error:", error);
        reply(`❌ *Failed to delete:* ${error.message}`);
    }
});
