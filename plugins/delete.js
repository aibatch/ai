import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { lidToPhone } from '../lib/functions.js';
import { proto } from '@whiskeysockets/baileys';

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

        const context = mek?.message?.extendedTextMessage?.contextInfo || mek?.msg?.contextInfo;
        
        // 1. Elaina Style: ParticipantAlt se PN lo, ya lidToPhone use karo
        let participant = context?.participantAlt || quotedMsg.sender || context?.participant;
        
        if (participant && participant.includes('@lid')) {
            // Try cache first via lidToPhone
            const pnNumber = await lidToPhone(conn, participant);
            if (pnNumber) {
                participant = `${pnNumber}@s.whatsapp.net`;
            } else {
                // Agar cache mein nahi mila, toh context ke participantAlt se lo
                participant = context?.participantAlt || participant;
            }
        }

        // 2. Elaina Style: AddressingMode ko directly mek.key se lo
        // Official Baileys mein yeh mek.key.addressingMode mein hota hai
        const addressingMode = mek?.key?.addressingMode || 'lid';

        const keyToDelete = {
            remoteJid: from,
            fromMe: quotedMsg.fromMe || false,
            id: quotedMsg.id,
            participant: participant,
            addressingMode: addressingMode // Important for LID routing
        };

        // 3. Send using relayMessage (Elaina Mod exact wrapper)
        await conn.relayMessage(
            from,
            {
                groupStatusMessageV2: {
                    message: {
                        protocolMessage: {
                            key: keyToDelete,
                            type: proto.Message.ProtocolMessage.Type.REVOKE // Type 14
                        }
                    }
                }
            },
            {
                additionalAttributes: {
                    edit: quotedMsg.fromMe ? '7' : '8',
                    addressing_mode: addressingMode
                },
                additionalNodes: [
                    { tag: 'meta', attrs: { is_group_status: 'true' } }
                ]
            }
        );

        return reply("✅ *Status delete request sent!*");

    } catch (error) {
        console.error("delgcstatus error:", error);
        reply(`❌ *Failed to delete:* ${error.message}`);
    }
});
