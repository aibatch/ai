import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { lidToPhone } from '../lib/functions.js';
import { proto, generateMessageIDV2, encodeWAMessage } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "debuggcstatus2",
    alias: ["dbg2"],
    desc: "Debug group status deletion with sendNode + JSON",
    category: "group",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator, isAdmins }) => {

    if (!isCreator && !isAdmins) return reply("❌ Admin only!");
    const quotedMsg = m.quoted;
    if (!quotedMsg) return reply("⚠️ Reply to a group status!");

    const debugInfo = {
        step_1_target: {},
        step_2_identity: {},
        step_3_skdm: {},
        step_4_encrypt: {},
        step_5_sendNode: {},
        step_6_ws_responses: [],
        step_7_final_verdict: ""
    };

    try {
        const context = mek?.message?.extendedTextMessage?.contextInfo || mek?.msg?.contextInfo;
        
        let participant = context?.participantAlt || quotedMsg.sender || context?.participant;
        if (participant && participant.includes('@lid')) {
            const pnNumber = await lidToPhone(conn, participant);
            if (pnNumber) participant = `${pnNumber}@s.whatsapp.net`;
        }

        debugInfo.step_1_target = {
            from,
            originalSender: quotedMsg.sender,
            resolvedParticipant: participant,
            fromMe: quotedMsg.fromMe,
            messageId: quotedMsg.id
        };

        const meId = conn.user.id;
        const meLid = conn.user.lid;
        const senderIdentity = meLid || meId;

        debugInfo.step_2_identity = { meId, meLid, senderIdentity };

        // === SKDM Force Generate ===
        let skdm = null;
        let skdmStatus = "NOT_ATTACHED";
        try {
            const hasKey = await conn.signalRepository.hasSenderKey({ 
                group: from, 
                meId: senderIdentity 
            });
            debugInfo.step_3_skdm.hasSenderKeyBefore = hasKey;

            skdm = await conn.signalRepository.getSenderKeyDistributionMessage({
                group: from,
                meId: senderIdentity
            });

            if (skdm) {
                skdmStatus = "ATTACHED_SUCCESSFULLY";
                debugInfo.step_3_skdm.skdmLength = skdm.length || 'unknown';
            }
        } catch (e) {
            skdmStatus = "ERROR: " + e.message;
            debugInfo.step_3_skdm.error = e.stack;
        }
        debugInfo.step_3_skdm.status = skdmStatus;

        if (!skdm) {
            debugInfo.step_7_final_verdict = "❌ SKDM generation failed";
            return reply("🔍 *DEBUG REPORT*\n\n```json\n" + JSON.stringify(debugInfo, null, 2) + "\n```");
        }

        // === Build Message ===
        const messageContent = {
            groupStatusMessageV2: {
                message: {
                    protocolMessage: {
                        key: {
                            remoteJid: from,
                            fromMe: quotedMsg.fromMe || false,
                            id: quotedMsg.id,
                            participant: participant
                        },
                        type: 14
                    }
                }
            },
            senderKeyDistributionMessage: {
                groupId: from,
                axolotlSenderKeyDistributionMessage: skdm
            }
        };

        // === Encrypt ===
        let ciphertext = null;
        try {
            const bytes = encodeWAMessage(messageContent);
            const encrypted = await conn.signalRepository.encryptGroupMessage({
                group: from,
                data: bytes,
                meId: senderIdentity
            });
            ciphertext = encrypted.ciphertext;
            debugInfo.step_4_encrypt = {
                success: true,
                ciphertextLength: ciphertext.length,
                senderKeyDistributionMessage: encrypted.senderKeyDistributionMessage ? "PRESENT" : "MISSING"
            };
        } catch (e) {
            debugInfo.step_4_encrypt = { success: false, error: e.message };
            debugInfo.step_7_final_verdict = "❌ Encryption failed: " + e.message;
            return reply("🔍 *DEBUG REPORT*\n\n```json\n" + JSON.stringify(debugInfo, null, 2) + "\n```");
        }

        // === WS Interceptors ===
        const wsResponses = [];

        const ackHandler = (node) => {
            wsResponses.push({
                type: 'ACK',
                id: node.attrs.id,
                from: node.attrs.from,
                error: node.attrs.error || null,
                errorText: node.attrs.error ? `Error ${node.attrs.error}` : 'None'
            });
        };

        const iqHandler = (node) => {
            wsResponses.push({
                type: 'IQ',
                from: node.attrs.from,
                iqType: node.attrs.type,
                error: node.attrs.error || null
            });
        };

        const errorHandler = (node) => {
            wsResponses.push({
                type: 'ERROR_NODE',
                from: node.attrs.from,
                error: node.attrs.error || "Unknown error",
                fullAttrs: node.attrs
            });
        };

        conn.ws.on('CB:ack,class:message', ackHandler);
        conn.ws.on('CB:iq', iqHandler);
        conn.ws.on('CB:error', errorHandler);

        // === Build Node & Send via sendNode ===
        const msgId = generateMessageIDV2(meId);
        const stanza = {
            tag: 'message',
            attrs: {
                id: msgId,
                to: from,
                type: 'text',
                edit: quotedMsg.fromMe ? '7' : '8',
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

        debugInfo.step_5_sendNode = {
            msgId,
            stanzaAttrs: stanza.attrs,
            contentTags: stanza.content.map(c => c.tag)
        };

        let sendError = null;
        try {
            await conn.sendNode(stanza);
        } catch (e) {
            sendError = e.message;
            debugInfo.step_5_sendNode.sendError = e.message;
        }

        // Wait 5 seconds for responses
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Cleanup
        conn.ws.off('CB:ack,class:message', ackHandler);
        conn.ws.off('CB:iq', iqHandler);
        conn.ws.off('CB:error', errorHandler);

        // === Response Analysis ===
        debugInfo.step_6_ws_responses = wsResponses.length > 0 ? wsResponses : ["NO_RESPONSE_TIMEOUT"];

        // === Final Verdict ===
        if (sendError) {
            debugInfo.step_7_final_verdict = "❌ SENDNODE_ERROR: " + sendError;
        } else if (wsResponses.length === 0) {
            debugInfo.step_7_final_verdict = "⚠️ SILENT_DROP: No ACK from server (packet rejected)";
        } else if (wsResponses.some(r => r.type === 'ERROR_NODE')) {
            debugInfo.step_7_final_verdict = "❌ SERVER_ERROR_NODE: " + JSON.stringify(wsResponses.find(r => r.type === 'ERROR_NODE'));
        } else if (wsResponses.some(r => r.error)) {
            debugInfo.step_7_final_verdict = "❌ SERVER_RETURNED_ERROR";
        } else {
            debugInfo.step_7_final_verdict = "✅ SERVER_ACKED: Check if status actually deleted";
        }

        return reply("🔍 *DEBUG REPORT (sendNode)*\n\n```json\n" + JSON.stringify(debugInfo, null, 2) + "\n```");

    } catch (error) {
        debugInfo.step_7_final_verdict = "❌ SCRIPT_ERROR: " + error.message;
        return reply("🔍 *DEBUG ERROR*\n\n```json\n" + JSON.stringify(debugInfo, null, 2) + "\n```");
    }
});
