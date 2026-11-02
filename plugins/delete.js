import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { lidToPhone } from '../lib/functions.js'; 
import { proto, generateMessageIDV2, encodeWAMessage } from '@whiskeysockets/baileys';

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
        if (!quotedMsg) {
            return reply("⚠️ *Please reply to the group status you want to delete!*");
        }

        const context = mek?.message?.extendedTextMessage?.contextInfo || mek?.msg?.contextInfo;
        
        // 1. LID to Phone Number Conversion
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

        // 2. Build Message (Elaina Mod Logic)
        const messageContent = {
            groupStatusMessageV2: {
                message: {
                    protocolMessage: {
                        key: keyToDelete,
                        type: 14 // REVOKE
                    }
                }
            }
        };

        // 3. SKDM Fetch (Sender Key)
        const meId = conn.user.id;
        const meLid = conn.user.lid;
        const groupSenderIdentity = meLid || meId;
        
        try {
            if (await conn.signalRepository.hasSenderKey({ group: from, meId: groupSenderIdentity })) {
                const skdm = await conn.signalRepository.getSenderKeyDistributionMessage({
                    group: from,
                    meId: groupSenderIdentity
                });
                messageContent.senderKeyDistributionMessage = {
                    groupId: from,
                    axolotlSenderKeyDistributionMessage: skdm
                };
            }
        } catch (e) {
            // Ignore SKDM failure, try to send anyway
        }

        // 4. Encrypt
        const bytes = encodeWAMessage(messageContent);
        const { ciphertext } = await conn.signalRepository.encryptGroupMessage({
            group: from,
            data: bytes,
            meId: groupSenderIdentity
        });

        // 5. Build Raw XML Node (Bypass Official relayMessage bugs)
        const msgId = generateMessageIDV2(meId);
        const stanza = {
            tag: 'message',
            attrs: {
                id: msgId,
                to: from,
                type: 'text',
                edit: quotedMsg.fromMe ? '7' : '8', // Prevents dummy upload
                addressing_mode: 'lid'
            },
            content: [
                {
                    tag: 'enc',
                    attrs: { v: '2', type: 'skmsg' },
                    content: ciphertext
                },
                {
                    tag: 'meta',
                    attrs: { is_group_status: 'true' } // Forces status deletion
                }
            ]
        };

        // 6. Send Directly to WhatsApp Server
        await conn.sendNode(stanza);

        return reply("✅ *Status delete request sent!*");

    } catch (error) {
        console.error("delgcstatus error:", error);
        reply(`❌ *Failed to delete:* ${error.message}`);
    }
});
