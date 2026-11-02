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
        // RAW se context nikalo (kyunki m.quoted incomplete hai)
        const context = mek?.message?.extendedTextMessage?.contextInfo || mek?.msg?.contextInfo;

        if (!context?.stanzaId) {
            return reply("⚠️ *Please reply to a group status message!*");
        }

        const targetStatusId = context.stanzaId;       // 3EB06C8A269E63CB2B207D
        const targetSenderLid = context.participant;   // 129712961679592@lid

        // LID to PN
        let participant = targetSenderLid;
        if (participant && participant.includes('@lid')) {
            // Pehle context.participantAlt check karo (agar hai toh)
            if (context.participantAlt) {
                participant = context.participantAlt;
            } else {
                const pnNumber = await lidToPhone(conn, participant);
                if (pnNumber) participant = `${pnNumber}@s.whatsapp.net`;
            }
        }

        const meId = conn.user.id;
        const meLid = conn.user.lid;
        const senderIdentity = meLid || meId;

        // Smart fromMe
        const meNumber = meId.split('@')[0].split(':')[0];
        const participantNumber = participant.split('@')[0].split(':')[0];
        const isFromMe = participantNumber === meNumber;

        // SKDM Force Generate
        let skdm = null;
        try {
            skdm = await conn.signalRepository.getSenderKeyDistributionMessage({
                group: from,
                meId: senderIdentity
            });
        } catch (e) {
            return reply("❌ SKDM generation failed: " + e.message);
        }

        if (!skdm) return reply("❌ SKDM null. Send a message in group first.");

        // Build Message with correct ID
        const messageContent = {
            groupStatusMessageV2: {
                message: {
                    protocolMessage: {
                        key: {
                            remoteJid: from,
                            fromMe: isFromMe,
                            id: targetStatusId,          // <-- RAW se
                            participant: participant
                        },
                        type: 14 // REVOKE
                    }
                }
            },
            senderKeyDistributionMessage: {
                groupId: from,
                axolotlSenderKeyDistributionMessage: skdm
            }
        };

        // Encrypt
        const bytes = encodeWAMessage(messageContent);
        const { ciphertext } = await conn.signalRepository.encryptGroupMessage({
            group: from,
            data: bytes,
            meId: senderIdentity
        });

        // Send Node
        const msgId = generateMessageIDV2(meId);
        const stanza = {
            tag: 'message',
            attrs: {
                id: msgId,
                to: from,
                type: 'text',
                edit: isFromMe ? '7' : '8',
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
                    attrs: { is_group_status: 'true' }
                }
            ]
        };

        await conn.sendNode(stanza);

        return reply(`✅ *Delete sent!*\nTargetId: ${targetStatusId}\nParticipant: ${participant}\nFromMe: ${isFromMe}`);

    } catch (error) {
        console.error("delgcstatus error:", error);
        reply(`❌ *Failed:* ${error.message}`);
    }
});
