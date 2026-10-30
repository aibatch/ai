
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';
import { cmd, commands } from '../command.js';
import config from '../config.js';
import axios from 'axios';
import fs from 'fs';
import { lidToPhone, cleanPN, runtime } from '../lib/functions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==================== CHANNEL INFO COMMAND ====================
cmd({
    pattern: "channel",
    alias: ["chinfo", "channelinfo", "newsletter", "ch"],
    desc: "Get WhatsApp channel information",
    react: "📢",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, reply, text, quoted }) => {
    let queryType = null;
    let key = null;

    if (text && text.includes('whatsapp.com/channel/')) {
        const match = text.match(/whatsapp\.com\/channel\/([\w-]+)/);
        if (!match) return reply("⚠️ Invalid channel link.");
        queryType = 'invite';
        key = match[1];
    } else if (text && text.includes('@newsletter')) {
        queryType = 'jid';
        key = text.trim();
    } else if (text && /^\d+$/.test(text.trim())) {
        queryType = 'jid';
        key = text.trim() + '@newsletter';
    } else if (quoted && quoted.newsletterJid) {
        queryType = 'jid';
        key = quoted.newsletterJid;
    } else if (from && from.includes('@newsletter')) {
        queryType = 'jid';
        key = from;
    } else {
        return reply(
            "📢 *Channel Info Usage:*\n\n" +
            "• `.channel https://whatsapp.com/channel/xxxxx`\n" +
            "• `.channel 120363xxxxxxxx@newsletter`\n" +
            "• `.channel 120363xxxxxxxx`"
        );
    }

    const raw = await conn.newsletterMetadata(queryType, key);
    if (!raw) return reply("❌ Channel not found or inaccessible.");

    const t = raw.thread_metadata || {};

    const name    = t.name?.text || 'N/A';
    const id      = raw.id || 'N/A';
    const desc    = t.description?.text || 'No description';
    const created = t.creation_time
                     ? new Date(parseInt(t.creation_time, 10) * 1000).toLocaleString('en-GB')
                     : 'Unknown';
    const subs    = parseInt(t.subscribers_count || '0', 10);

    // PP URL from picture or preview direct_path
    const ppPath = t.picture?.direct_path || t.preview?.direct_path || null;
    const ppUrl  = ppPath ? `https://pps.whatsapp.net${ppPath}` : null;

    const body =
        `📢 *CHANNEL INFORMATION*\n\n` +
        `📝 *Name:* ${name}\n` +
        `🆔 *ID:* ${id}\n` +
        `📄 *Description:*\n${desc}\n\n` +
        `📅 *Created:* ${created}\n` +
        `👥 *Subscribers:* ${subs.toLocaleString()}\n\n` +
        `> ${config.BOT_NAME || 'Bot'}`;

    if (!ppUrl) return reply(body);

    try {
        return await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: body,
        }, { quoted: mek });
    } catch (e) {
        console.error("PP send failed:", e.message);
        return reply(body);
    }
});

// ==================== ID COMMAND ====================
cmd({
    pattern: "id",
    alias: ["chatid", "jid", "gjid", "channelid", "newsletter", "cid"],
    desc: "Get various IDs (chat, user, group, or channel)",
    react: "⚡",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, reply, sender, fromMe, botNumber2, text }) => {
    try {
        if (text && text.includes('whatsapp.com/channel/')) {
            const match = text.match(/whatsapp\.com\/channel\/([\w-]+)/);
            if (!match) return reply("⚠️ *Invalid channel link format.*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx");
            const inviteId = match[1];
            let metadata;
            try {
                metadata = await conn.newsletterMetadata("invite", inviteId);
            } catch (e) {
                return reply("❌ Failed to fetch channel metadata. Make sure the link is correct.");
            }
            if (!metadata || !metadata.id) return reply("❌ Channel not found or inaccessible.");
            return reply(`${metadata.id}`);
        }
        if (isGroup) {
            const groupJID = from.includes('@g.us') ? from : `${from}@g.us`;
            return reply(`${groupJID}`);
        } else {
            if (fromMe) {
                const botPN = botNumber2.split('@')[0];
                return reply(`${botPN}@s.whatsapp.net`);
            } else {
                let senderPN = sender.split('@')[0];
                if (sender.includes('@lid')) {
                    senderPN = await lidToPhone(conn, sender);
                }
                return reply(`${senderPN}@s.whatsapp.net`);
            }
        }
    } catch (e) {
        console.error("ID Command Error:", e);
        return reply(`⚠️ Error: ${e.message}`);
    }
});

// ==================== GETLID COMMAND ====================
cmd({
    pattern: "getlid",
    alias: ["lidonly", "rawlid", "mylid"],
    desc: "Get your LID (@lid) directly without conversion",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, reply, sender, fromMe, botNumber2, mentionUser }) => {
    try {
        const mentionedUser = mentionUser ? mentionUser[0] : null;
        if (mentionedUser) {
            if (mentionedUser.includes('@lid')) return reply(`${mentionedUser}`);
            return reply(`⚠️ Mentioned user is not in LID format.`);
        }
        if (isGroup) {
            if (sender.includes('@lid')) return reply(`${sender}`);
            return reply(`⚠️ You don't have a LID format in this chat.`);
        } else {
            if (fromMe) return reply(`${botNumber2}`);
            if (sender.includes('@lid')) return reply(`${sender}`);
            return reply(`${sender}`);
        }
    } catch (e) {
        console.error("GetLID Command Error:", e);
        return reply(`⚠️ Error: ${e.message}`);
    }
});

// ==================== NPM COMMAND ====================
cmd({
    pattern: "npm",
    desc: "Search for a package on npm.",
    react: '📦',
    category: "tools",
    filename: __filename,
    use: ".npm <package-name>"
}, async (conn, mek, msg, { from, args, reply }) => {
    try {
        if (!args.length) return reply("❌ Please provide a package name!\n\nExample: .npm axios");
        const packageName = args.join(" ");
        let encodedPkg = encodeURIComponent(packageName);
        if (packageName.startsWith('@')) encodedPkg = `@${encodeURIComponent(packageName.slice(1))}`;
        const apiUrl = `https://registry.npmjs.org/${encodedPkg}`;
        const response = await axios.get(apiUrl, { timeout: 10000 });
        const data = response.data;
        const latestVersion = data["dist-tags"].latest;
        const description = data.description || "No description available.";
        const npmUrl = `https://www.npmjs.com/package/${packageName}`;
        const license = data.license || "Unknown";
        const repository = data.repository?.url || "Not available";
        const author = data.author?.name || "Unknown";
        const message = `
📦 *NPM PACKAGE INFO*

🔰 *Package:* ${packageName}
📄 *Description:* ${description}
📌 *Version:* ${latestVersion}
👤 *Author:* ${author}
🪪 *License:* ${license}
🪩 *Repository:* ${repository}
🔗 *URL:* ${npmUrl}

💡 *Download:* .dlnpm ${packageName}

> *Powered By KHAN-MD*
`;
        await conn.sendMessage(from, { text: message }, { quoted: mek });
    } catch (error) {
        console.error("NPM Search Error:", error.message);
        reply("❌ Package not found on npm registry!");
    }
});

// ==================== DLNPM COMMAND ====================
cmd({
    pattern: "dlnpm",
    desc: "Download npm package as tgz",
    category: "download",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, react }) => {
    try {
        if (!q) return reply("❌ Please provide a package name!\n\nExamples:\n.dlnpm axios\n.dlnpm @fadeldev/baileys-mod");
        const pkg = q.trim();
        await react("⏳");
        const tempDir = join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        let encodedPkg = encodeURIComponent(pkg);
        if (pkg.startsWith('@')) encodedPkg = `@${encodeURIComponent(pkg.slice(1))}`;
        const registryUrl = `https://registry.npmjs.org/${encodedPkg}`;
        const metadata = await axios.get(registryUrl, { timeout: 15000 });
        const latestVersion = metadata.data["dist-tags"].latest;
        const tarballUrl = metadata.data.versions[latestVersion].dist.tarball;
        if (!tarballUrl) throw new Error("Tarball URL not found");
        const tarball = await axios.get(tarballUrl, {
            responseType: 'arraybuffer',
            maxRedirects: 5,
            timeout: 60000,
            headers: { 'User-Agent': 'npm-download-bot/1.0' }
        });
        if (!tarball.data || tarball.data.length === 0) throw new Error("Downloaded file is empty");
        const safeName = pkg.replace(/^@/, '').replace(/\//g, '-');
        const fileName = `${safeName}-${latestVersion}.tgz`;
        const filePath = join(tempDir, fileName);
        fs.writeFileSync(filePath, tarball.data);
        const fileSize = (tarball.data.length / 1024).toFixed(2);
        await conn.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'application/gzip',
            fileName: fileName,
            caption: `📦 *NPM Package Downloaded*

• *Name:* ${pkg}
• *Version:* ${latestVersion}
• *Size:* ${fileSize} KB
• *Format:* .tgz

> *Powered By KHAN-MD*`
        }, { quoted: mek });
        fs.unlinkSync(filePath);
        await react("✅");
    } catch (error) {
        console.error("DLNPM Error:", error.message);
        await react("❌");
        let errorMsg = "❌ Failed to download package!\n\n";
        if (error.response?.status === 404) errorMsg += "Package not found on npm registry.";
        else if (error.code === 'ECONNABORTED') errorMsg += "Download timeout. Package might be too large.";
        else if (error.code === 'ENOTFOUND') errorMsg += "Network error. Check your connection.";
        else errorMsg += error.message;
        reply(errorMsg);
    }
});

// ==================== HELP COMMAND ====================
cmd({
    pattern: "help",
    alias: ["listcmd", "list", "h", "commands"],
    desc: "Show all available commands with descriptions",
    category: "main",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const commandsArray = Array.isArray(commands) ? commands : Object.values(commands);
        const totalCommands = commandsArray.length;
        let aliasCount = 0;
        commandsArray.forEach(cmd => {
            if (cmd.alias) aliasCount += cmd.alias.length;
        });
        const categories = [...new Set(commandsArray.map(c => c.category))];
        let menuText = `╭───『 *${config.BOT_NAME} COMMAND LIST* 』───⳹
│
│ *🛠️ BOT INFORMATION*
│ • 🤖 Bot Name: ${config.BOT_NAME}
│ • 👑 Owner: ${config.OWNER_NAME}
│ • ⚙️ Prefix: [${config.PREFIX}]
│ • 🌐 Platform: Heroku
│ • 📦 Version: 4.0.0
│ • 🕒 Runtime: ${runtime(process.uptime())}
│
│ *📊 COMMAND STATS*
│ • 📜 Total Commands: ${totalCommands}
│ • 🔄 Total Aliases: ${aliasCount}
│ • 🗂️ Categories: ${categories.length}
│
╰────────────────⳹\n`;
        const categorized = {};
        categories.forEach(cat => {
            categorized[cat] = commandsArray.filter(c => c.category === cat);
        });
        for (const [category, cmds] of Object.entries(categorized)) {
            menuText += `╭───『 *${category.toUpperCase()}* 』───⳹
│ • 📂 Commands: ${cmds.length}
│ • 🔄 Aliases: ${cmds.reduce((a, c) => a + (c.alias ? c.alias.length : 0), 0)}
│
`;
            cmds.forEach(c => {
                menuText += `┃▸📄 COMMAND: .${c.pattern}\n`;
                menuText += `┃▸❕ ${c.desc || 'No description available'}\n`;
                if (c.alias && c.alias.length > 0) menuText += `┃▸🔹 Aliases: ${c.alias.map(a => `.${a}`).join(', ')}\n`;
                if (c.use) menuText += `┃▸💡 Usage: ${c.use}\n`;
                menuText += `│\n`;
            });
            menuText += `╰────────────────⳹\n`;
        }
        menuText += `\n📝 *Note*: Use ${config.PREFIX}help <command> for detailed help\n`;
        menuText += `> ${config.DESCRIPTION}`;
        const imagePath = join(__dirname, '../lib/jawadmd.jpg');
        if (fs.existsSync(imagePath)) {
            await conn.sendMessage(from, {
                image: fs.readFileSync(imagePath),
                caption: menuText,
                contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true }
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                text: `*⚠️ Local image not found*\n\n${menuText}`,
                contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true }
            }, { quoted: mek });
            console.log("Image file not found at:", imagePath);
        }
    } catch (e) {
        console.error('Command List Error:', e);
        reply(`❌ Error generating command list: ${e.message}`);
    }
});

// ==================== DEFINE COMMAND ====================
cmd({
    pattern: "define",
    desc: "📖 Get the definition of a word",
    react: "🔍",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please provide a word to define.\n\n📌 *Usage:* .define [word]");
        const word = q.trim();
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
        const response = await axios.get(url);
        const definitionData = response.data[0];
        const definition = definitionData.meanings[0].definitions[0].definition;
        const example = definitionData.meanings[0].definitions[0].example || '❌ No example available';
        const synonyms = definitionData.meanings[0].definitions[0].synonyms.join(', ') || '❌ No synonyms available';
        const phonetics = definitionData.phonetics[0]?.text || '🔇 No phonetics available';
        const audio = definitionData.phonetics[0]?.audio || null;
        const wordInfo = `
📖 *Word*: *${definitionData.word}*  
🗣️ *Pronunciation*: _${phonetics}_  
📚 *Definition*: ${definition}  
✍️ *Example*: ${example}  
📝 *Synonyms*: ${synonyms}  

🔗 *Powered By Jawad Tech X*`;
        if (audio) await conn.sendMessage(from, { audio: { url: audio }, mimetype: 'audio/mpeg' }, { quoted: mek });
        return reply(wordInfo);
    } catch (e) {
        console.error("❌ Error:", e);
        if (e.response && e.response.status === 404) return reply("🚫 *Word not found.* Please check the spelling and try again.");
        return reply("⚠️ An error occurred while fetching the definition. Please try again later.");
    }
});

// ==================== CPP COMMAND ====================
cmd({
    pattern: "cpp",
    alias: ["couplepp", "couplepic", "couple"],
    react: "💑",
    desc: "Get matching couples profile pictures.",
    category: "utility",
    use: ".cpp",
    filename: __filename
}, async (conn, m, store, { from, reply }) => {
    try {
        await reply("*💫 Fetching Couples Profile Pictures...*");
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        const apiUrl = `https://api.deline.web.id/random/ppcouple`;
        const { data } = await axios.get(apiUrl);
        if (data.status && data.result) {
            await conn.sendMessage(from, { image: { url: data.result.cowo }, caption: "👦 *Male Profile Picture*" }, { quoted: m });
            await conn.sendMessage(from, { image: { url: data.result.cewe }, caption: "👩 *Female Profile Picture*" });
            await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        } else {
            reply("❌ Failed to fetch couples pictures. Please try again.");
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        }
    } catch (error) {
        console.error("Couples PP Error:", error);
        reply("❌ An error occurred while fetching couples pictures.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ==================== DELETE COMMAND ====================
cmd({
    pattern: "delete",
    desc: "Delete any message",
    react: "🗑️",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, quoted }) => {
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
    reply("❌ Reply to a message!");
});

// ==================== DEL COMMAND ====================
cmd({
    pattern: "del",
    desc: "Delete a quoted message",
    category: "group",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, isGroup, reply }) => {
    try {
        if (!isGroup) return reply('❌ This command can only be used in groups!');
        if (!isCreator) return reply('❌ Only the bot creator can use this command!');
        if (!m.quoted) return reply('❌ Please reply to a message to delete it!');
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.quoted.id, participant: m.quoted.sender } });
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: true, id: m.id } });
    } catch (err) {
        console.error(err);
        await reply('❌ Failed to delete message. Something went wrong.');
    }
});

// ==================== ALIVE COMMAND ====================
cmd({
    pattern: "alive",
    alias: ["ping", "status"],
    desc: "Check if bot is alive",
    category: "utility",
    react: "💚",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '💚', key: m.key } });
        const uptime = runtime(process.uptime());
        await conn.sendMessage(from, {
            text: `🤖 *Bot Is Alive Since ${uptime}*`,
            contextInfo: { isForwarded: true, forwardingScore: 999, mentionedJid: [m.sender] }
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error("Error in alive command:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply(`❌ Error: ${e.message}`);
    }
});

// ==================== UPTIME COMMAND ====================
cmd({
    pattern: "uptime",
    alias: ["runtime", "up"],
    desc: "Check bot uptime",
    category: "utility",
    react: "⏱️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        const uptime = runtime(process.uptime());
        await conn.sendMessage(from, {
            text: `⏱️ *Uptime:* ${uptime}`,
            contextInfo: { isForwarded: true, forwardingScore: 999, mentionedJid: [m.sender] }
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error("Error in uptime command:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply(`❌ Error: ${e.message}`);
    }
});

// ==================== GETPP COMMAND ====================
cmd({
    pattern: "getpp",
    alias: ["profile", "getdp"],
    react: "🚀",
    desc: "Sends the profile picture of a user by phone number, mention, or reply (now available to everyone)",
    category: "other",
    use: ".getpp <phone number> OR reply to a message OR mention someone",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        let targetJid = null;
        if ((!args || args.length === 0 || !args.join(" ").trim()) &&
            (!m.mentionedJid || m.mentionedJid.length === 0) && !m.quoted) {
            return reply(`ℹ️ *Usage:*\n• .getpp <phone number> (e.g., .getpp 923427582273)\n• Reply to someone's message\n• Mention someone (@user) in a group`);
        }
        const argText = args.join(" ").trim();
        if (argText && argText.match(/[0-9]/)) {
            let phone = argText.replace(/[^0-9]/g, "");
            if (phone.length >= 8 && phone.length <= 15) targetJid = phone + "@s.whatsapp.net";
            else return reply("❌ Invalid phone number format. Please provide a valid number (8-15 digits).");
        } else if (m.mentionedJid && m.mentionedJid.length > 0) targetJid = m.mentionedJid[0];
        else if (m.quoted) targetJid = m.quoted.sender;
        if (!targetJid) return reply(`ℹ️ *Usage:*\n• .getpp <phone number>\n• Reply to someone's message\n• Mention someone (@user)`);
        if (targetJid.includes('@lid')) {
            try {
                let phoneNumber = await lidToPhone(conn, targetJid);
                if (phoneNumber && phoneNumber !== targetJid.split("@")[0]) targetJid = phoneNumber + "@s.whatsapp.net";
            } catch (lidError) { console.log("LID conversion error:", lidError); }
        }
        if (!targetJid.includes('@')) targetJid = targetJid + "@s.whatsapp.net";
        let ppUrl, userName = "User";
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, "image");
            try {
                const contact = await conn.getContact?.(targetJid) || { notify: targetJid.split("@")[0], name: targetJid.split("@")[0] };
                userName = contact.notify || contact.vname || contact.name || targetJid.split("@")[0];
            } catch (contactError) { userName = targetJid.split("@")[0]; }
            await conn.sendMessage(from, { image: { url: ppUrl }, caption: `> *Profile Pic Downloaded Successfully* ✅\n*User:* ${userName}` });
            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        } catch (fetchError) {
            if (fetchError.message?.includes("404") || fetchError.message?.includes("not found")) {
                return reply(`❌ Profile picture not found for ${targetJid.split("@")[0]}\n\nPossible reasons:\n• No profile picture set\n• Privacy settings hide it from you\n• Number not on WhatsApp`);
            } else if (fetchError.message?.includes("401") || fetchError.message?.includes("unauthorized")) {
                return reply(`🔒 Profile picture is private for ${targetJid.split("@")[0]}`);
            } else {
                console.error("getpp fetch error:", fetchError);
                return reply(`❌ Error fetching profile picture:\n${fetchError.message || "Unknown error"}`);
            }
        }
    } catch (e) {
        console.error("getpp command error:", e);
        reply("❌ An error occurred while processing the command. Please try again later.");
    }
});

// ==================== SOUND URLS ====================
const soundUrls = {
    url1: 'https://files.catbox.moe/pw4yuu.mp3',
    url2: 'https://files.catbox.moe/tuueyw.mp3',
    url3: 'https://files.catbox.moe/q56rza.mp3',
    url4: 'https://files.catbox.moe/ldrebe.mp3',
    url5: 'https://files.catbox.moe/cpjqjd.mp3',
    url6: 'https://files.catbox.moe/v5c4fd.mp3',
    url7: 'https://files.catbox.moe/naub62.mp3',
    url8: 'https://files.catbox.moe/ez7wvh.mp3',
    url9: 'https://files.catbox.moe/3ruryr.mp3',
    url10: 'https://files.catbox.moe/vxfry5.mp3',
    url11: 'https://files.catbox.moe/hk2fjw.mp3',
    url12: 'https://files.catbox.moe/pvymqf.mp3',
    url13: 'https://files.catbox.moe/md2jm5.mp3',
    url14: 'https://files.catbox.moe/ypx92a.mp3',
    url15: 'https://files.catbox.moe/7tv2do.mp3',
    url16: 'https://files.catbox.moe/sr8k3y.mp3'
};

// ==================== SOUND COMMAND ====================
cmd({ pattern: "sound", desc: "Play sound effect 1", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url1 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND2 COMMAND ====================
cmd({ pattern: "sound2", desc: "Play sound effect 2", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url2 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound2 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND3 COMMAND ====================
cmd({ pattern: "sound3", desc: "Play sound effect 3", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url3 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound3 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND4 COMMAND ====================
cmd({ pattern: "sound4", desc: "Play sound effect 4", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url4 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound4 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND5 COMMAND ====================
cmd({ pattern: "sound5", desc: "Play sound effect 5", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url5 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound5 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND6 COMMAND ====================
cmd({ pattern: "sound6", desc: "Play sound effect 6", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url6 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound6 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND7 COMMAND ====================
cmd({ pattern: "sound7", desc: "Play sound effect 7", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url7 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound7 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND8 COMMAND ====================
cmd({ pattern: "sound8", desc: "Play sound effect 8", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url8 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound8 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND9 COMMAND ====================
cmd({ pattern: "sound9", desc: "Play sound effect 9", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url9 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound9 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND10 COMMAND ====================
cmd({ pattern: "sound10", desc: "Play sound effect 10", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url10 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound10 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND11 COMMAND ====================
cmd({ pattern: "sound11", desc: "Play sound effect 11", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url11 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound11 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND12 COMMAND ====================
cmd({ pattern: "sound12", desc: "Play sound effect 12", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url12 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound12 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND13 COMMAND ====================
cmd({ pattern: "sound13", desc: "Play sound effect 13", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url13 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound13 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND14 COMMAND ====================
cmd({ pattern: "sound14", desc: "Play sound effect 14", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url14 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound14 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND15 COMMAND ====================
cmd({ pattern: "sound15", desc: "Play sound effect 15", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url15 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound15 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== SOUND16 COMMAND ====================
cmd({ pattern: "sound16", desc: "Play sound effect 16", category: "sound", react: "🎵", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try { await conn.sendMessage(from, { audio: { url: soundUrls.url16 }, mimetype: 'audio/mpeg', ptt: false }, { quoted: mek }); }
    catch (e) { console.error("Error in sound16 command:", e); await reply("Failed to play sound. Please try again."); }
});

// ==================== TIKTOKSEARCH COMMAND ====================
cmd({
    pattern: "tiktoksearch",
    alias: ["ttsearch", "tiktoks", "tiks"],
    desc: "Search and download TikTok videos",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply(`🎵 *TikTok Search* 🎵\n\nSearch and download TikTok videos!\n\n*Usage:* .tiktoksearch <query>\n*Example:* .tiktoksearch funny cat`);
        }
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
        const apiUrl = `https://api.deline.web.id/search/tiktok?query=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);
        if (!response.data.status || !response.data.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply(`❌ No results found for "${q}". Please try a different search term.`);
        }
        const result = response.data.result;
        const videoUrl = result.wm_play || result.play;
        if (videoUrl) {
            await conn.sendMessage(from, {
                video: { url: videoUrl },
                caption: `🎵 *${result.title || 'TikTok Video'}*\n\n> Powered by JawadTechX`,
                mimetype: "video/mp4"
            }, { quoted: mek });
            await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        } else {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            reply("❌ Failed to get video URL. Please try again.");
        }
    } catch (error) {
        console.error("TikTok Search Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ An error occurred while searching. Please try again.");
    }
});
