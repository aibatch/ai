import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
import { proto, generateMessageIDV2, encodeWAMessage, jidNormalizedUser, areJidsSameUser } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

// ==================== DELETE GROUP STATUS COMMAND ====================
cmd({
    pattern: "delgcstatus",
    alias: ["delstatus", "delcs"],
    desc: "Deletes a quoted Group Status (Handles Self & Others)",
    react: "🗑️",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator, isAdmin }) => {
    try {
        const ctx = mek.message?.extendedTextMessage?.contextInfo || mek.msg?.contextInfo;
        const quotedMsg = ctx?.quotedMessage;
        const isGroupStatus = quotedMsg?.groupStatusMessageV2 || quotedMsg?.groupStatusMentionMessage;

        if (!isGroupStatus) {
            return reply("⚠️ Please reply to a group status message.");
        }

        const targetId = ctx?.stanzaId;
        const targetParticipant = ctx?.participant;
        if (!targetId || !targetParticipant) {
            return reply("⚠️ Could not find quoted status details.");
        }

        const senderIdentity = conn.user.lid;
        const isOwnStatus = areJidsSameUser(targetParticipant, senderIdentity);

        if (!isCreator && !isAdmin && !isOwnStatus) {
            let isBotAdmin = false;
            try {
                const botLid = await jidNormalizedUser(conn.user.lid);
                const groupMeta = await conn.groupMetadata(from);
                const admins = groupMeta.participants
                    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                    .map(p => p.id);
                isBotAdmin = admins.includes(botLid);
            } catch (e) {
                return reply("❌ Could not verify admin status.");
            }
            if (!isBotAdmin) return reply("❌ Only the bot creator, group admins, or the bot (as admin) can delete statuses.");
        }

        const keyToDelete = {
            remoteJid: from,
            fromMe: isOwnStatus,
            id: targetId,
            participant: targetParticipant
        };

        const messageContent = {
            protocolMessage: {
                key: keyToDelete,
                type: proto.Message.ProtocolMessage.Type.REVOKE
            }
        };

        const skdm = await conn.signalRepository.getSenderKeyDistributionMessage({
            group: from,
            meId: senderIdentity
        });

        const fullMessage = {
            ...messageContent,
            senderKeyDistributionMessage: {
                groupId: from,
                axolotlSenderKeyDistributionMessage: skdm
            }
        };

        const bytes = encodeWAMessage(fullMessage);
        const { ciphertext } = await conn.signalRepository.encryptGroupMessage({
            group: from,
            data: bytes,
            meId: senderIdentity
        });

        const editAttr = isOwnStatus ? '7' : '8';

        const stanza = {
            tag: 'message',
            attrs: {
                id: generateMessageIDV2(senderIdentity),
                to: from,
                type: 'text',
                edit: editAttr,
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

        const result = await conn.query(stanza);
        if (result?.attrs?.error) {
            return reply(`❌ WhatsApp Error: ${result.attrs.error}`);
        }
        return reply("*Deleted Group Status Successfully ✅*");
    } catch (err) {
        console.error(err);
        await reply('❌ Failed to delete status. Something went wrong.');
    }
});

// ==================== DELETE COMMAND ====================
cmd({
    pattern: "delete",
    alias: ["del"],
    desc: "Delete any message (Creator & Admins only)",
    react: "🗑️",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { reply, quoted, isCreator, isGroup, isAdmin, from }) => {
    try {
        // ==================== GROUP STATUS DETECTION ====================
        const ctx = mek.message?.extendedTextMessage?.contextInfo || mek.msg?.contextInfo;
        const quotedMsg = ctx?.quotedMessage;
        const isGroupStatus = quotedMsg?.groupStatusMessageV2 || quotedMsg?.groupStatusMentionMessage;

        if (isGroupStatus) {
            const targetId = ctx?.stanzaId;
            const targetParticipant = ctx?.participant;
            if (!targetId || !targetParticipant) {
                return reply("⚠️ Could not find quoted status details.");
            }

            const senderIdentity = conn.user.lid;
            const isOwnStatus = areJidsSameUser(targetParticipant, senderIdentity);

            if (!isCreator && !isAdmin && !isOwnStatus) {
                let isBotAdmin = false;
                try {
                    const botLid = await jidNormalizedUser(conn.user.lid);
                    const groupMeta = await conn.groupMetadata(from);
                    const admins = groupMeta.participants
                        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                        .map(p => p.id);
                    isBotAdmin = admins.includes(botLid);
                } catch (e) {
                    return reply("❌ Could not verify admin status.");
                }
                if (!isBotAdmin) return reply("❌ Only the bot creator, group admins, or the bot (as admin) can delete statuses.");
            }

            const keyToDelete = {
                remoteJid: from,
                fromMe: isOwnStatus,
                id: targetId,
                participant: targetParticipant
            };

            const messageContent = {
                protocolMessage: {
                    key: keyToDelete,
                    type: proto.Message.ProtocolMessage.Type.REVOKE
                }
            };

            const skdm = await conn.signalRepository.getSenderKeyDistributionMessage({
                group: from,
                meId: senderIdentity
            });

            const fullMessage = {
                ...messageContent,
                senderKeyDistributionMessage: {
                    groupId: from,
                    axolotlSenderKeyDistributionMessage: skdm
                }
            };

            const bytes = encodeWAMessage(fullMessage);
            const { ciphertext } = await conn.signalRepository.encryptGroupMessage({
                group: from,
                data: bytes,
                meId: senderIdentity
            });

            const editAttr = isOwnStatus ? '7' : '8';

            const stanza = {
                tag: 'message',
                attrs: {
                    id: generateMessageIDV2(senderIdentity),
                    to: from,
                    type: 'text',
                    edit: editAttr,
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

            const result = await conn.query(stanza);
            if (result?.attrs?.error) {
                return reply(`❌ WhatsApp Error: ${result.attrs.error}`);
            }
            return reply("*Deleted Group Status Successfully ✅*");
        }

        // ==================== 1) INBOX (DM) — Creator only ====================
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

        // ==================== 2) NORMAL GROUP MESSAGE — Admin or Creator ====================
        if (!isCreator && !isAdmin) return reply('❌ Only the bot creator or group admins can use this command!');
        if (!m.quoted) return reply('❌ Please reply to a message to delete it!');

        await conn.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.quoted.id,
                participant: m.quoted.sender
            }
        });
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: true, id: m.id } });
    } catch (err) {
        console.error(err);
        await reply('❌ Failed to delete message. Something went wrong.');
    }
});
