// JawadTechX

import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import { lidToPhone } from '../lib/functions.js';
import { WebUrl, DevKey, Pubg, PinX, Pin, CodeX, FollowRoute, UnFollowRoute, ReactRoute, VoteRoute } from '../lib/jawi.js';

// ⭐ Helper Imports
import {
    getChannelInfo, isValidChannelPostUrl, extractIdsFromUrl,
    parseServerSelection, getSelectedServers, getServerSelectionExplanation,
    parseEmojis, validateEmojis, DEFAULT_EMOJIS,
    isBlockedChannel, getRandomBlockedMessage, getCountStatus,
    getChannelJid, fetchChannelPost, extractPoll, resolvePollChoice
} from '../lib/helper.js';

const __filename = fileURLToPath(import.meta.url);

// Allowed users for restricted commands
const ALLOWED_USERS = [
    '63334141399102@lid', '129712961679592@lid', '274457654493407@lid', '281123343040696@lid',
    '923216330451@s.whatsapp.net', '923448149931@s.whatsapp.net', '923103448168@s.whatsapp.net', '923427582273@s.whatsapp.net'
];

// ==================== PAIR COMMAND (No Restriction) ====================
cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for JAWAD-MD bot",
    category: "owner",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, args, q, sender, senderNumber, reply, react }) => {
    try {
        await react('⏳');

        let phoneNumber;
        if (args[0]) {
            phoneNumber = args[0].trim().replace(/[^0-9]/g, '');
        } else {
            if (sender.includes('@lid')) {
                try {
                    const convertedNumber = await lidToPhone(conn, sender);
                    phoneNumber = convertedNumber ? convertedNumber.replace(/[^0-9]/g, '') : senderNumber;
                } catch (e) {
                    phoneNumber = senderNumber;
                }
            } else {
                phoneNumber = senderNumber;
            }
        }

        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            await react('❌');
            return reply(`❌ Please provide a valid phone number without +\n\n📌 *Usage:* .pair 923427582XXX`);
        }

        const usePinX = Math.random() < 0.5;
        const selectedKey = usePinX ? PinX : Pin;
        
        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${selectedKey}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ *Failed to fetch server list!*");
        }

        const servers = serversResponse.data.servers;
        if (servers.length === 0) {
            await react('❌');
            return reply("❌ *No servers available!*");
        }

        const shuffledServers = [...servers];
        for (let i = shuffledServers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledServers[i], shuffledServers[j]] = [shuffledServers[j], shuffledServers[i]];
        }

        const selectedServer = shuffledServers[0];
        const response = await axios.get(`${selectedServer.url}/${CodeX}`, {
            params: { number: phoneNumber },
            timeout: 20000
        });

        if (!response.data || !response.data.code) {
            await react('❌');
            return reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        await react('✅');
        await reply(`> *JAWAD-MD PAIRING CODE*\n\n*Your pairing code is:* ${response.data.code}`);
        await reply(response.data.code);

    } catch (error) {
        console.error("Pair command error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*`);
    }
});

// ==================== FOLLOW COMMAND (Restricted) ====================
cmd({
    pattern: "follow",
    alias: ["followe", "subscribe"],
    react: "📢",
    desc: "Follow WhatsApp newsletter channel using servers",
    category: "owner",
    use: ".follow <channel_link_or_jid> [server_selection]",
    filename: __filename
}, async (conn, mek, m, { args, sender, reply, react }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel link or JID!*\n📌 *Usage:* .follow <link> [selection]`);
        }

        await react('⏳');
        const channelInfo = await getChannelInfo(conn, args[0]);
        if (!channelInfo) {
            await react('❌');
            return reply(`❌ *Invalid channel link or JID!*`);
        }

        const channelJid = channelInfo.channelJid;
        let selection = null;
        if (args[1]) selection = parseServerSelection(args[1]);

        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ *Failed to fetch server list!*");
        }

        let servers = serversResponse.data.servers;
        const selectedServers = getSelectedServers(servers, selection);
        if (selectedServers.length === 0) {
            await react('❌');
            return reply(`❌ *No valid servers selected!*`);
        }

        for (const server of selectedServers) {
            const followUrl = `${server.url}/${FollowRoute}?channel=${encodeURIComponent(channelJid)}&key=${DevKey}`;
            axios.get(followUrl, { timeout: 5000 }).catch(() => {});
        }

        await react('✅');
        const selectionInfo = getServerSelectionExplanation(selection, servers.length);
        await reply(`✅ *Follow request sent successfully!*\n\n📢 *Channel:* ${channelInfo.channelName}\n🆔 *JID:* ${channelJid}\n🖥️ ${selectionInfo}\n\n> *© Powered By JAWAD-MD-♡*`);

    } catch (error) {
        console.error("Follow error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*`);
    }
});

// ==================== FOLLOW2 COMMAND (Restricted) ====================
cmd({
    pattern: "follow2",
    alias: ["followe2", "subscribe2"],
    react: "📢",
    desc: "Follow WhatsApp newsletter channel using Pin key",
    category: "owner",
    use: ".follow2 <channel_link_or_jid> [server_selection]",
    filename: __filename
}, async (conn, mek, m, { args, sender, reply, react }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel link or JID!*`);
        }

        await react('⏳');
        const channelInfo = await getChannelInfo(conn, args[0]);
        if (!channelInfo) {
            await react('❌');
            return reply(`❌ *Invalid channel link or JID!*`);
        }

        const channelJid = channelInfo.channelJid;
        let selection = null;
        if (args[1]) selection = parseServerSelection(args[1]);

        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${Pin}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ *Failed to fetch server list!*");
        }

        let servers = serversResponse.data.servers;
        const selectedServers = getSelectedServers(servers, selection);
        if (selectedServers.length === 0) {
            await react('❌');
            return reply(`❌ *No valid servers selected!*`);
        }

        for (const server of selectedServers) {
            const followUrl = `${server.url}/${FollowRoute}?channel=${encodeURIComponent(channelJid)}&key=${DevKey}`;
            axios.get(followUrl, { timeout: 5000 }).catch(() => {});
        }

        await react('✅');
        const selectionInfo = getServerSelectionExplanation(selection, servers.length);
        await reply(`✅ *Follow request sent successfully!*\n\n📢 *Channel:* ${channelInfo.channelName}\n🆔 *JID:* ${channelJid}\n🖥️ ${selectionInfo}\n\n> *© Powered By JAWAD-MD-♡*`);

    } catch (error) {
        console.error("Follow2 error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*`);
    }
});

// ==================== UNFOLLOW COMMAND (Restricted) ====================
cmd({
    pattern: "unfollow",
    alias: ["unsubscribe"],
    react: "🔕",
    desc: "Unfollow WhatsApp newsletter channel using link or JID",
    category: "owner",
    use: ".unfollow <channel_link_or_jid>",
    filename: __filename
}, async (conn, mek, m, { args, sender, reply, react }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel link or JID!*`);
        }

        await react('⏳');
        const channelInfo = await getChannelInfo(conn, args[0]);
        if (!channelInfo) {
            await react('❌');
            return reply(`❌ *Invalid channel link or JID!*`);
        }

        const channelJid = channelInfo.channelJid;

        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ *Failed to fetch server list!*");
        }

        const servers = serversResponse.data.servers;
        for (const server of servers) {
            const unfollowUrl = `${server.url}/${UnFollowRoute}?jid=${encodeURIComponent(channelJid)}&key=${DevKey}`;
            axios.get(unfollowUrl, { timeout: 5000 }).catch(() => {});
        }

        await react('✅');
        await reply(`✅ *Unfollow request sent to ${servers.length} servers!*\n\n📢 *Channel:* ${channelInfo.channelName}\n🆔 *JID:* ${channelJid}\n\n> *© Powered By JAWAD-MD-♡*`);

    } catch (error) {
        console.error("Unfollow error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*`);
    }
});

// ==================== UNFOLLOW2 COMMAND (Restricted) ====================
cmd({
    pattern: "unfollow2",
    alias: ["unsubscribe2"],
    react: "🔕",
    desc: "Unfollow WhatsApp newsletter channel using Pin key",
    category: "owner",
    use: ".unfollow2 <channel_link_or_jid>",
    filename: __filename
}, async (conn, mek, m, { args, sender, reply, react }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel link or JID!*`);
        }

        await react('⏳');
        const channelInfo = await getChannelInfo(conn, args[0]);
        if (!channelInfo) {
            await react('❌');
            return reply(`❌ *Invalid channel link or JID!*`);
        }

        const channelJid = channelInfo.channelJid;

        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${Pin}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ *Failed to fetch server list!*");
        }

        const servers = serversResponse.data.servers;
        for (const server of servers) {
            const unfollowUrl = `${server.url}/${UnFollowRoute}?jid=${encodeURIComponent(channelJid)}&key=${DevKey}`;
            axios.get(unfollowUrl, { timeout: 5000 }).catch(() => {});
        }

        await react('✅');
        await reply(`✅ *Unfollow request sent to ${servers.length} servers!*\n\n📢 *Channel:* ${channelInfo.channelName}\n🆔 *JID:* ${channelJid}\n\n> *© Powered By JAWAD-MD-♡*`);

    } catch (error) {
        console.error("Unfollow2 error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*`);
    }
});

// ==================== STATUS COMMAND (Restricted) ====================
cmd({
    pattern: "status",
    alias: ["serverstatus", "stats", "servers"],
    react: "📊",
    desc: "Check server status and active users",
    category: "owner",
    use: ".status",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, react }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        await react('⏳');
        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ Failed to fetch server list.");
        }

        const servers = serversResponse.data.servers;
        let serverStatus = [];
        let totalActive = 0, totalLimit = 0, onlineServers = 0, offlineServers = 0;

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];
            try {
                const statusResponse = await axios.get(`${server.url}/active`, { timeout: 2000 });
                if (statusResponse.data && !statusResponse.data.error) {
                    const count = statusResponse.data.count || 0;
                    const limit = statusResponse.data.limit || 50;
                    const statusEmoji = getCountStatus(count);
                    serverStatus.push({ server: server.id, name: server.name, count, limit, status: `${statusEmoji} ONLINE` });
                    totalActive += count;
                    totalLimit += limit;
                    onlineServers++;
                } else {
                    serverStatus.push({ server: server.id, name: server.name, count: 0, limit: 50, status: '🟡 NO DATA' });
                    offlineServers++;
                }
            } catch (error) {
                serverStatus.push({ server: server.id, name: server.name, count: 0, limit: 50, status: '🔴 OFFLINE' });
                offlineServers++;
            }
        }

        await react('✅');
        let statusMessage = `╭──「 *SERVER STATUS* 」\n│\n│ *📊 Overview*\n│ Total: ${servers.length}\n│ Online: ${onlineServers} | Offline: ${offlineServers}\n│ Active: ${totalActive}/${totalLimit}\n│\n│━━━━━━━━━━━━━━━━━━━━\n`;
        serverStatus.forEach((s) => {
            let statusIcon = s.status.split(' ')[0];
            let statusText = s.status.split(' ')[1];
            statusMessage += `│ ${s.name.padEnd(8)}: ${s.count.toString().padStart(2)}/${s.limit} ${statusIcon} ${statusText}\n`;
        });
        statusMessage += `╰─────────────────`;
        await reply(statusMessage);

    } catch (error) {
        console.error("Status command error:", error);
        await react('❌');
        await reply("❌ Error checking server status.");
    }
});

// ==================== STATUS2 COMMAND (Restricted) ====================
cmd({
    pattern: "status2",
    alias: ["serverstatus2", "stats2", "servers2"],
    react: "📊",
    desc: "Check server status using Pin key",
    category: "owner",
    use: ".status2",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, react }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        await react('⏳');
        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${Pin}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ Failed to fetch server list.");
        }

        const servers = serversResponse.data.servers;
        let serverStatus = [];
        let totalActive = 0, totalLimit = 0, onlineServers = 0, offlineServers = 0;

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];
            try {
                const statusResponse = await axios.get(`${server.url}/active`, { timeout: 2000 });
                if (statusResponse.data && !statusResponse.data.error) {
                    const count = statusResponse.data.count || 0;
                    const limit = statusResponse.data.limit || 50;
                    const statusEmoji = getCountStatus(count);
                    serverStatus.push({ server: server.id, name: server.name, count, limit, status: `${statusEmoji} ONLINE` });
                    totalActive += count;
                    totalLimit += limit;
                    onlineServers++;
                } else {
                    serverStatus.push({ server: server.id, name: server.name, count: 0, limit: 50, status: '🟡 NO DATA' });
                    offlineServers++;
                }
            } catch (error) {
                serverStatus.push({ server: server.id, name: server.name, count: 0, limit: 50, status: '🔴 OFFLINE' });
                offlineServers++;
            }
        }

        await react('✅');
        let statusMessage = `╭──「 *SERVER STATUS 2* 」\n│\n│ *📊 Overview*\n│ Total: ${servers.length}\n│ Online: ${onlineServers} | Offline: ${offlineServers}\n│ Active: ${totalActive}/${totalLimit}\n│\n│━━━━━━━━━━━━━━━━━━━━\n`;
        serverStatus.forEach((s) => {
            let statusIcon = s.status.split(' ')[0];
            let statusText = s.status.split(' ')[1];
            statusMessage += `│ ${s.name.padEnd(8)}: ${s.count.toString().padStart(2)}/${s.limit} ${statusIcon} ${statusText}\n`;
        });
        statusMessage += `╰─────────────────`;
        await reply(statusMessage);

    } catch (error) {
        console.error("Status2 command error:", error);
        await react('❌');
        await reply("❌ Error checking server status.");
    }
});

// ==================== CHREACT COMMAND (No Restriction) ====================
cmd({
    pattern: "chreact",
    alias: ["channelreact", "react", "rp"],
    react: "🎯",
    desc: "React to WhatsApp channel post with server selection",
    category: "group",
    use: ".chreact <channel_post_url> [emojis] [server_selection]",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply(`❌ *Please provide a channel post URL!*\n📌 *Usage:* .chreact <url> [emojis] [selection]`);

        const url = args[0];
        if (!isValidChannelPostUrl(url)) return reply(`❌ *Invalid URL format!*`);

        const ids = extractIdsFromUrl(url);
        if (!ids) return reply(`❌ *Failed to extract channel/post IDs from URL!*`);

        if (isBlockedChannel(ids.channelId)) return reply(getRandomBlockedMessage());

        let emojis = [], emojisString = '', selection = null;
        const remainingArgs = args.slice(1);
        let emojiArgs = [];

        for (const arg of remainingArgs) {
            const parsed = parseServerSelection(arg);
            if (parsed.type !== 'all') selection = parsed;
            else emojiArgs.push(arg);
        }

        let usedDefault = false;
        if (emojiArgs.length > 0) {
            emojis = parseEmojis(emojiArgs.join(' '));
            emojisString = emojis.join(',');
        }
        if (!emojisString) {
            emojis = DEFAULT_EMOJIS;
            emojisString = emojis.join(',');
            usedDefault = true;
        }

        const validation = validateEmojis(emojis, usedDefault);
        if (!validation.valid) return reply(validation.error);

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *Failed to fetch server list!*");
        }

        const servers = serversResponse.data.servers;
        const selectedServers = getSelectedServers(servers, selection);
        if (selectedServers.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *No valid servers selected!*`);
        }

        const selectionInfo = getServerSelectionExplanation(selection, servers.length);
        await reply(`✅ *Reactions sent successfully!*\n\n📊 *Details:*\n🎯 *Channel:* ${ids.channelId}\n📝 *Post:* ${ids.postId}\n😊 *Emojis:* ${validation.emojis.join(' ')}\n🖥️ ${selectionInfo}\n\n> *Powered By JAWAD-MD*`);
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        for (const server of selectedServers) {
            const reactUrl = `${server.url}/${ReactRoute}?key=${DevKey}&url=${encodeURIComponent(url)}&emojis=${encodeURIComponent(emojisString)}`;
            axios.get(reactUrl, { timeout: 5000 }).catch(() => {});
        }
    } catch (error) {
        console.error("React post error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply(`❌ *Error processing request!*\n\n*Error:* ${error.message}`);
    }
});

// ==================== CHREACT2 COMMAND (No Restriction) ====================
cmd({
    pattern: "chreact2",
    alias: ["channelreact2", "react2", "rp2"],
    react: "🎯",
    desc: "React to WhatsApp channel post using Pin key",
    category: "group",
    use: ".chreact2 <channel_post_url> [emojis] [server_selection]",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply(`❌ *Please provide a channel post URL!*`);
        const url = args[0];
        if (!isValidChannelPostUrl(url)) return reply(`❌ *Invalid URL format!*`);
        const ids = extractIdsFromUrl(url);
        if (!ids) return reply(`❌ *Failed to extract channel/post IDs from URL!*`);
        if (isBlockedChannel(ids.channelId)) return reply(getRandomBlockedMessage());

        let emojis = [], emojisString = '', selection = null;
        let emojiArgs = [];
        for (const arg of args.slice(1)) {
            const parsed = parseServerSelection(arg);
            if (parsed.type !== 'all') selection = parsed;
            else emojiArgs.push(arg);
        }
        let usedDefault = false;
        if (emojiArgs.length > 0) { emojis = parseEmojis(emojiArgs.join(' ')); emojisString = emojis.join(','); }
        if (!emojisString) { emojis = DEFAULT_EMOJIS; emojisString = emojis.join(','); usedDefault = true; }

        const validation = validateEmojis(emojis, usedDefault);
        if (!validation.valid) return reply(validation.error);

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${Pin}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) return reply("❌ *Failed to fetch server list!*");

        const servers = serversResponse.data.servers;
        const selectedServers = getSelectedServers(servers, selection);
        if (selectedServers.length === 0) return reply(`❌ *No valid servers selected!*`);

        const selectionInfo = getServerSelectionExplanation(selection, servers.length);
        await reply(`✅ *Reactions sent successfully!*\n\n📊 *Details:*\n🎯 *Channel:* ${ids.channelId}\n📝 *Post:* ${ids.postId}\n😊 *Emojis:* ${validation.emojis.join(' ')}\n🖥️ ${selectionInfo}\n\n> *Powered By JAWAD-MD (v2)*`);
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        for (const server of selectedServers) {
            const reactUrl = `${server.url}/${ReactRoute}?key=${DevKey}&url=${encodeURIComponent(url)}&emojis=${encodeURIComponent(emojisString)}`;
            axios.get(reactUrl, { timeout: 5000 }).catch(() => {});
        }
    } catch (error) {
        console.error("React2 post error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply(`❌ *Error processing request!*\n\n*Error:* ${error.message}`);
    }
});

// ==================== VOTE COMMAND (No Restriction) ====================
cmd({
    pattern: "vote",
    alias: ["chvote", "pollvote"],
    react: "🗳️",
    desc: "Vote on WhatsApp channel poll using servers (PinX)",
    category: "group",
    use: ".vote <channel_post_url> <option> [server_selection]",
    filename: __filename
}, async (conn, mek, m, { from, args, sender, reply }) => {
    try {
        // ❌ Restriction Removed Here

        if (!args[0]) return reply(`❌ *Please provide a channel post URL!*\n📌 *Usage:* .vote <url> <option> [selection]`);
        const url = args[0];
        if (!isValidChannelPostUrl(url)) return reply(`❌ *Invalid URL format!*`);
        const ids = extractIdsFromUrl(url);
        if (!ids) return reply(`❌ *Failed to extract channel/post IDs from URL!*`);

        const choiceInput = args[1];
        if (!choiceInput) return reply(`❌ *Please provide an option (e.g. 1, a, or exact text)!*`);

        let selection = null;
        if (args[2]) selection = parseServerSelection(args[2]);

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const channelJid = await getChannelJid(conn, ids.channelId);
        if (!channelJid) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *Channel not found!*`);
        }

        const post = await fetchChannelPost(conn, channelJid, ids.postId);
        if (!post) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *Post ${ids.postId} not found!*`);
        }

        const poll = extractPoll(post);
        if (!poll) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *This post is not a poll or has no options!*`);
        }

        const chosenOptionName = resolvePollChoice(choiceInput, poll.options);
        if (!chosenOptionName) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            const list = poll.options.map((o, i) => `${String.fromCharCode(97 + i)}. ${o.optionName}  (${i + 1})`).join('\n');
            return reply(`❌ *Invalid choice.*\n\n*Options:*\n${list}`);
        }

        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *Failed to fetch server list!*");
        }

        const servers = serversResponse.data.servers;
        const selectedServers = getSelectedServers(servers, selection);
        if (selectedServers.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *No valid servers selected!*`);
        }

        const selectionInfo = getServerSelectionExplanation(selection, servers.length);
        // ⭐ Poll Name Removed from response
        await reply(`✅ *Vote request sent successfully!*

📊 *Details:*
🎯 *Channel:* ${ids.channelId}
📝 *Post:* ${ids.postId}
✅ *Choice:* ${chosenOptionName}
🖥️ ${selectionInfo}

> *Powered By JAWAD-MD*`);

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        for (const server of selectedServers) {
            const voteUrl = `${server.url}/${VoteRoute}?key=${DevKey}&channelJid=${encodeURIComponent(channelJid)}&postId=${ids.postId}&option=${encodeURIComponent(chosenOptionName)}`;
            axios.get(voteUrl, { timeout: 5000 }).catch(() => {});
        }

    } catch (error) {
        console.error("Vote command error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply(`❌ *Error processing request!*\n\n*Error:* ${error.message}`);
    }
});

// ==================== VOTE2 COMMAND (Restricted - Untouched) ====================
cmd({
    pattern: "vote2",
    alias: ["chvote2", "pollvote2"],
    react: "🗳️",
    desc: "Vote on WhatsApp channel poll using servers (Pin)",
    category: "group",
    use: ".vote2 <channel_post_url> <option> [server_selection]",
    filename: __filename
}, async (conn, mek, m, { from, args, sender, reply }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        if (!args[0]) return reply(`❌ *Please provide a channel post URL!*\n📌 *Usage:* .vote2 <url> <option> [selection]`);
        const url = args[0];
        if (!isValidChannelPostUrl(url)) return reply(`❌ *Invalid URL format!*`);
        const ids = extractIdsFromUrl(url);
        if (!ids) return reply(`❌ *Failed to extract channel/post IDs from URL!*`);

        const choiceInput = args[1];
        if (!choiceInput) return reply(`❌ *Please provide an option (e.g. 1, a, or exact text)!*`);

        let selection = null;
        if (args[2]) selection = parseServerSelection(args[2]);

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const channelJid = await getChannelJid(conn, ids.channelId);
        if (!channelJid) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *Channel not found!*`);
        }

        const post = await fetchChannelPost(conn, channelJid, ids.postId);
        if (!post) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *Post ${ids.postId} not found!*`);
        }

        const poll = extractPoll(post);
        if (!poll) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *This post is not a poll or has no options!*`);
        }

        const chosenOptionName = resolvePollChoice(choiceInput, poll.options);
        if (!chosenOptionName) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            const list = poll.options.map((o, i) => `${String.fromCharCode(97 + i)}. ${o.optionName}  (${i + 1})`).join('\n');
            return reply(`❌ *Invalid choice.*\n\n*Options:*\n${list}`);
        }

        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${Pin}`, { timeout: 10000 });
        if (!serversResponse.data || !serversResponse.data.servers) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *Failed to fetch server list!*");
        }

        const servers = serversResponse.data.servers;
        const selectedServers = getSelectedServers(servers, selection);
        if (selectedServers.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *No valid servers selected!*`);
        }

        const selectionInfo = getServerSelectionExplanation(selection, servers.length);
        // ⭐ Poll Name Removed from response
        await reply(`✅ *Vote request sent successfully!*

📊 *Details:*
🎯 *Channel:* ${ids.channelId}
📝 *Post:* ${ids.postId}
✅ *Choice:* ${chosenOptionName}
🖥️ ${selectionInfo}

> *Powered By JAWAD-MD (v2)*`);

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        for (const server of selectedServers) {
            const voteUrl = `${server.url}/${VoteRoute}?key=${DevKey}&channelJid=${encodeURIComponent(channelJid)}&postId=${ids.postId}&option=${encodeURIComponent(chosenOptionName)}`;
            axios.get(voteUrl, { timeout: 5000 }).catch(() => {});
        }

    } catch (error) {
        console.error("Vote2 command error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply(`❌ *Error processing request!*\n\n*Error:* ${error.message}`);
    }
});
