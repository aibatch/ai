import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { lidToPhone } from '../lib/functions.js';
import { proto } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "debuggcstatus",
    alias: ["dbgstatus", "debugstatus"],
    desc: "Debug group status deletion (Shows full process)",
    category: "group",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator, isAdmins }) => {

    if (!isCreator && !isAdmins) {
        return reply("❌ Admin only!");
    }

    const quotedMsg = m.quoted;
    if (!quotedMsg) return reply("⚠️ Reply to a group status!");

    try {
        const context = mek?.message?.extendedTextMessage?.contextInfo || mek?.msg?.contextInfo;
        
        let participant = context?.participantAlt || quotedMsg.sender || context?.participant;
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

        const messageContent = {
            groupStatusMessageV2: {
                message: {
                    protocolMessage: {
                        key: keyToDelete,
                        type: 14
                    }
                }
            }
        };

        const meId = conn.user.id;
        const meLid = conn.user.lid;
        const senderIdentity = meLid || meId;
        let skdmStatus = "NOT_ATTACHED";

        try {
            if (await conn.signalRepository.hasSenderKey({ group: from, meId: senderIdentity })) {
                const skdm = await conn.signalRepository.getSenderKeyDistributionMessage({
                    group: from,
                    meId: senderIdentity
                });
                messageContent.senderKeyDistributionMessage = {
                    groupId: from,
                    axolotlSenderKeyDistributionMessage: skdm
                };
                skdmStatus = "ATTACHED";
            }
        } catch (e) {
            skdmStatus = "ERROR: " + e.message;
        }

        // === DEBUG DUMP (Before Sending) ===
        const debugDump = {
            step_1_target: {
                from,
                participant,
                fromMe: quotedMsg.fromMe,
                messageId: quotedMsg.id
            },
            step_2_identity: {
                meId,
                meLid,
                senderIdentity,
                groupAddressingMode: 'lid'
            },
            step_3_skdm: skdmStatus,
            step_4_payload: JSON.stringify(messageContent, null, 2).substring(0, 1000) + "... (truncated)"
        };

        // === SEND ===
        let sendError = null;
        try {
            await conn.relayMessage(from, messageContent, {
                additionalAttributes: {
                    edit: quotedMsg.fromMe ? '7' : '8',
                    addressing_mode: 'lid'
                },
                additionalNodes: [
                    { tag: 'meta', attrs: { is_group_status: 'true' } }
                ],
                useCachedGroupMetadata: false
            });
        } catch (e) {
            sendError = e.message;
        }

        // === SERVER RESPONSE LISTENER ===
        let serverResponse = "No response captured within 3 seconds";
        const responsePromise = new Promise((resolve) => {
            const timeout = setTimeout(() => resolve("TIMEOUT"), 3000);
            conn.ev.on('CB:ack,class:message', (node) => {
                if (node.attrs.id === quotedMsg.id || node.attrs.from === from) {
                    clearTimeout(timeout);
                    resolve({
                        id: node.attrs.id,
                        from: node.attrs.from,
                        error: node.attrs.error || "NONE",
                        class: node.attrs.class
                    });
                }
            });
        });

        serverResponse = await responsePromise;

        // === FINAL REPORT ===
        const finalReport = {
            ...debugDump,
            step_5_sendError: sendError || "No error thrown by relayMessage",
            step_6_serverResponse: serverResponse,
            verdict: sendError 
                ? "❌ FAILED: relayMessage threw error" 
                : serverResponse === "TIMEOUT" 
                    ? "⚠️ SILENT DROP: No response from server (WhatsApp silently ignored it)"
                    : "✅ Response received from server"
        };

        return reply("🔍 *DEBUG REPORT*\n\n```json\n" + JSON.stringify(finalReport, null, 2) + "\n```");

    } catch (error) {
        reply("❌ Debug Error: " + error.message);
    }
});
