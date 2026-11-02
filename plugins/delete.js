import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { lidToPhone } from '../lib/functions.js'; 
import { proto, encodeWAMessage } from '@whiskeysockets/baileys';

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
        
        // 1. Convert LID to Phone Number
        let participant = quotedMsg.sender || context?.participant;
        if (participant && participant.includes('@lid')) {
            const pnNumber = await lidToPhone(conn, participant);
            if (pnNumber) participant = `${pnNumber}@s.whatsapp.net`;
        }

        const keyToDelete = {
            remoteJid: from,
            fromMe: quotedMsg.fromMe || false,
            id: quotedMsg.id,
            participant: participant
        };

        // 2. Fetch the SKDM (Sender Key Distribution Message) manually
        const meId = conn.user.id;
        const meLid = conn.user.lid;
        const senderIdentity = meLid || meId;
        let skdm = undefined;

        try {
            if (await conn.signalRepository.hasSenderKey({ group: from, meId: senderIdentity })) {
                skdm = await conn.signalRepository.getSenderKeyDistributionMessage({
                    group: from,
                    meId: senderIdentity
                });
            }
        } catch (e) {
            console.log("Failed to fetch SKDM:", e.message);
        }

        // 3. Build the exact Mod Baileys structure
        const statusRevoke = {
            groupStatusMessageV2: {
                message: {
                    protocolMessage: {
                        key: keyToDelete,
                        type: 14 // REVOKE
                    }
                }
            }
        };

        // Inject the SKDM so WhatsApp accepts the encryption
        if (skdm) {
            statusRevoke.senderKeyDistributionMessage = {
                groupId: from,
                axolotlSenderKeyDistributionMessage: skdm
            };
        }

        // 4. Send it using relayMessage (Official Baileys will encrypt it with our SKDM)
        await conn.relayMessage(
            from,
            statusRevoke,
            {
                additionalAttributes: {
                    edit: quotedMsg.fromMe ? '7' : '8',
                    addressing_mode: 'lid'
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
