import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { lidToPhone } from '../lib/functions.js';
import { proto } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "debuggcstatus",
    alias: ["dbgstatus"],
    desc: "Debug group status deletion with SKDM force + full JSON",
    category: "group",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator, isAdmins }) => {

    if (!isCreator && !isAdmins) return reply("❌ Admin only!");
    const quotedMsg = m.quoted;
    if (!quotedMsg) return reply("⚠️ Reply to a group status!");

    // Debug JSON Object
    const debugInfo = {
        step_1_target: {},
        step_2_identity: {},
        step_3_skdm: {},
        step_4_send: {},
        step_5_ws_responses: [],
        step_6_final_verdict: ""
    };

    try {
        const context = mek?.message?.extendedTextMessage?.contextInfo || mek?.msg?.contextInfo;
        
        // --- Step 1: Target Info ---
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

        debugInfo.step_1_target = {
            from,
            originalSender: quotedMsg.sender,
            resolvedParticipant: participant,
            fromMe: quotedMsg.fromMe,
            messageId: quotedMsg.id
        };

        // --- Step 2: Identity ---
        const meId = conn.user.id;
        const meLid = conn.user.lid;
        const senderIdentity = meLid || meId;

        debugInfo.step_2_identity = {
            meId,
            meLid,
            senderIdentity,
            addressingMode: 'lid'
        };

        // --- Step 3: SKDM Force Generation ---
        let skdmStatus = "NOT_ATTACHED";
        let skdmBuffer = null;

        try {
            const hasKey = await conn.signalRepository.hasSenderKey({ 
                group: from, 
                meId: senderIdentity 
            });
            
            debugInfo.step_3_skdm.hasSenderKeyBefore = hasKey;

            // Force generate / fetch SKDM
            skdmBuffer = await conn.signalRepository.getSenderKeyDistributionMessage({
                group: from,
                meId: senderIdentity
            });

            if (skdmBuffer) {
                skdmStatus = "ATTACHED_SUCCESSFULLY";
                debugInfo.step_3_skdm.skdmLength = skdmBuffer.length || 'unknown';
            } else {
                skdmStatus = "FETCH_RETURNED_NULL";
            }
        } catch (e) {
            skdmStatus = "ERROR: " + e.message;
            debugInfo.step_3_skdm.error = e.stack || e.message;
        }

        debugInfo.step_3_skdm.status = skdmStatus;

        // Build Message
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

        if (skdmBuffer) {
            messageContent.senderKeyDistributionMessage = {
                groupId: from,
                axolotlSenderKeyDistributionMessage: skdmBuffer
            };
        }

        // --- Step 4: WS Interceptors Setup ---
        const wsResponses = [];
        
        const ackHandler = (node) => {
            if (node.attrs.id === quotedMsg.id || node.attrs.from === from) {
                wsResponses.push({
                    type: 'ACK',
                    id: node.attrs.id,
                    from: node.attrs.from,
                    error: node.attrs.error || null,
                    errorText: node.attrs.error ? `Error Code ${node.attrs.error}` : 'None'
                });
            }
        };

        const iqHandler = (node) => {
            if (node.attrs.from === from || node.attrs.type === 'error') {
                wsResponses.push({
                    type: 'IQ',
                    from: node.attrs.from,
                    iqType: node.attrs.type,
                    error: node.attrs.error || null
                });
            }
        };

        conn.ws.on('CB:ack,class:message', ackHandler);
        conn.ws.on('CB:iq', iqHandler);

        // --- Step 5: Send ---
        let sendError = null;
        let sendSuccess = false;

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
            sendSuccess = true;
        } catch (e) {
            sendError = e.message;
            debugInfo.step_4_send.stack = e.stack;
        }

        debugInfo.step_4_send = {
            sendSuccess,
            sendError: sendError || "No throw",
            skdmAttached: !!skdmBuffer
        };

        // Wait 5 seconds for server responses
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Cleanup
        conn.ws.off('CB:ack,class:message', ackHandler);
        conn.ws.off('CB:iq', iqHandler);

        // --- Step 6: WS Response Analysis ---
        debugInfo.step_5_ws_responses = wsResponses.length > 0 ? wsResponses : ["NO_RESPONSE_TIMEOUT"];

        // --- Final Verdict ---
        if (sendError) {
            debugInfo.step_6_final_verdict = "❌ RELAY_THREW_ERROR: " + sendError;
        } else if (!skdmBuffer) {
            debugInfo.step_6_final_verdict = "❌ SKDM_MISSING: Sender key not attached";
        } else if (wsResponses.length === 0) {
            debugInfo.step_6_final_verdict = "⚠️ SILENT_DROP: WhatsApp ignored (no ACK received)";
        } else if (wsResponses.some(r => r.error)) {
            debugInfo.step_6_final_verdict = "❌ SERVER_ERROR: WhatsApp returned error code";
        } else {
            debugInfo.step_6_final_verdict = "✅ SERVER_ACKED: Check if status deleted from group";
        }

        // Send Report
        const reportStr = JSON.stringify(debugInfo, null, 2);
        return reply("🔍 *DEBUG REPORT*\n\n```json\n" + reportStr + "\n```");

    } catch (error) {
        debugInfo.step_6_final_verdict = "❌ SCRIPT_ERROR: " + error.message;
        return reply("🔍 *DEBUG ERROR*\n\n```json\n" + JSON.stringify(debugInfo, null, 2) + "\n```");
    }
});
