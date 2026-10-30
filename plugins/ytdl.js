import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Web, Pubg } from '../lib/jawi.js';

const __filename = fileURLToPath(import.meta.url);

const API_BASES = [Web, "https://jawadtechhub.onrender.com"];
const API_KEY = Pubg;
const getRandomBase = () => API_BASES[Math.floor(Math.random() * API_BASES.length)];

// ============================================
// HELPERS
// ============================================
function getBotName(userConfig) {
    return userConfig?.BOT_NAME || global?.config?.BOT_NAME || "JawadTechX";
}

function formatMime(format) {
    const f = String(format || '').toLowerCase();
    if (f.includes('mp4') || f.includes('m4a')) return 'audio/mp4';
    if (f.includes('ogg')) return 'audio/ogg';
    if (f.includes('wav')) return 'audio/wav';
    if (f.includes('aac')) return 'audio/aac';
    return 'audio/mpeg';
}

function videoMime(format) {
    const f = String(format || '').toLowerCase();
    if (f.includes('webm')) return 'video/webm';
    if (f.includes('mkv')) return 'video/x-matroska';
    if (f.includes('mov')) return 'video/quicktime';
    return 'video/mp4';
}

function toSmallCaps(text) {
    const map = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ',
        'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ',
        'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.split('').map(c => map[c.toLowerCase()] || c).join('');
}

function getVideoId(url) {
    if (!url || typeof url !== 'string') return null;
    const patterns = [
        /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}

// ============================================
// KHAN-MD STYLE CAPTIONS
// ============================================
function buildAudioInfoCaption(vid, BOT_NAME) {
    return `- *AUDIO DOWNLOADER 🎧*\n╭━━❐━⪼\n┇๏ *Title* - ${vid.title}\n┇๏ *Duration* - ${vid.timestamp}\n┇๏ *Views* - ${vid.viewsText || vid.views?.toLocaleString() || 'N/A'}\n┇๏ *Author* - ${vid.author?.name || 'Unknown'}\n┇๏ *Status* - Downloading...\n╰━━❑━⪼\n> Powered by ${BOT_NAME}`;
}

function buildVideoInfoCaption(vid, BOT_NAME) {
    return `*🎬 VIDEO DOWNLOADER*\n\n🎞️ *Title:* ${vid.title}\n📺 *Channel:* ${vid.author?.name || 'Unknown'}\n🕒 *Duration:* ${vid.timestamp}\n\n*Status:* Downloading Video...\n\n> Powered by ${BOT_NAME}`;
}

function buildCartoonInfoCaption(vid, BOT_NAME) {
    return `*🧸 CARTOON DOWNLOADER*\n\n🎞️ *Title:* ${vid.title}\n📺 *Channel:* ${vid.author?.name || 'Unknown'}\n🕒 *Duration:* ${vid.timestamp}\n\n*Status:* Downloading Cartoon...\n\n> Powered by ${BOT_NAME}`;
}

function buildBoxInfoCaption(headerTitle, emoji, vid, BOT_NAME, status) {
    return `*╭┈───〔 ${toSmallCaps(headerTitle)} 〕┈───⊷*
*├▢ ${emoji} Title:* ${vid.title}
*├▢ 📺 Channel:* ${vid.author?.name || 'Unknown'}
*├▢ ⏰ Duration:* ${vid.timestamp}
*├▢ 👀 Views:* ${vid.viewsText || vid.views?.toLocaleString() || 'N/A'}
*╰───────────────────⊷*
_⚡ ${status}_

> Powered by ${BOT_NAME}`;
}

function buildQualityCaption(vid, headerTitle, headerEmoji, BOT_NAME) {
    const viewsText = vid.viewsText || vid.views?.toLocaleString() || 'N/A';
    return `*╭┈───〔 ${toSmallCaps(headerTitle)} 〕┈───⊷*
*├▢ ${headerEmoji} Title:* ${vid.title}
*├▢ 📺 Channel:* ${vid.author?.name || 'Unknown'}
*├▢ ⏰ Duration:* ${vid.timestamp}
*├▢ 👀 Views:* ${viewsText}
*╰───────────────────⊷*

*╭───⬡ ${toSmallCaps('Select Quality')} ⬡───*
*┋ ⬡ 1* 360p
*┋ ⬡ 2* 480p
*┋ ⬡ 3* 720p
*┋ ⬡ 4* 1080p
*╰───────────────────⊷*

> Powered by ${BOT_NAME}`;
}

// ============================================
// DOWNLOAD / SEND HELPERS
// ============================================
async function downloadToDisk(url, ext) {
    const tempPath = path.join(os.tmpdir(), `dl_${Date.now()}.${ext}`);
    const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: 180000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    });
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
        response.data.on('error', reject);
    });
    return tempPath;
}

async function sendBySize(conn, from, mek, videoUrl, title, format, BOT_NAME) {
    const ext = format || 'mp4';
    const mimetype = videoMime(format);
    let tempPath = null;
    try {
        tempPath = await downloadToDisk(videoUrl, ext);
        const stats = fs.statSync(tempPath);
        const fileSizeMB = stats.size / (1024 * 1024);

        if (fileSizeMB <= 200) {
            await conn.sendMessage(from, {
                video: { url: tempPath },
                mimetype: mimetype,
                fileName: `${title}.${ext}`,
                caption: `🎬 *${title}*\n\n> Powered by ${BOT_NAME}`
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                document: { url: tempPath },
                mimetype: mimetype,
                fileName: `${title}.${ext}`,
                caption: `🎬 *${title}*\n📄 Video Document (>200MB)\n\n> Powered by ${BOT_NAME}`
            }, { quoted: mek });
        }
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return true;
    } catch (error) {
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return false;
    }
}

async function sendAsDoc(conn, from, mek, videoUrl, title, format, BOT_NAME) {
    const ext = format || 'mp4';
    const mimetype = videoMime(format);
    let tempPath = null;
    try {
        tempPath = await downloadToDisk(videoUrl, ext);
        await conn.sendMessage(from, {
            document: { url: tempPath },
            mimetype: mimetype,
            fileName: `${title}.${ext}`,
            caption: `🎬 *${title}*\n\n> Powered by ${BOT_NAME}`
        }, { quoted: mek });
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return true;
    } catch (error) {
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return false;
    }
}

async function sendAudioWithFallback(conn, from, mek, audioUrl, title, format, BOT_NAME) {
    const ext = format || 'mp3';
    const mimetype = formatMime(format);

    try {
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: mimetype,
            fileName: `${title}.mp3`,
            ptt: false
        }, { quoted: mek });
        return true;
    } catch (directErr) {
        console.error('⚠️ Direct audio send failed, trying disk fallback:', directErr.message);
    }

    let tempPath = null;
    try {
        tempPath = await downloadToDisk(audioUrl, ext);
        const stats = fs.statSync(tempPath);
        const sizeMB = stats.size / (1024 * 1024);

        if (sizeMB <= 30) {
            await conn.sendMessage(from, {
                audio: { url: tempPath },
                mimetype: mimetype,
                fileName: `${title}.mp3`,
                ptt: false
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                document: { url: tempPath },
                mimetype: mimetype,
                fileName: `${title}.mp3`,
                caption: `🎧 *${title}*\n📄 Audio Document (>30MB)\n\n> Powered by ${BOT_NAME}`
            }, { quoted: mek });
        }
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return true;
    } catch (e) {
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.error('Audio disk fallback failed:', e.message);
        return false;
    }
}

// ============================================
// API HELPERS
// ============================================
async function getYtsApiSearch(query) {
    try {
        const apiUrl = `${getRandomBase()}/yts?q=${encodeURIComponent(query)}&key=${API_KEY}`;
        const { data } = await axios.get(apiUrl, { timeout: 20000 });
        if (!data?.status || !data?.results?.length) return null;
        return data.results;
    } catch (e) {
        console.error('⚠️ /yts API failed:', e.message);
        return null;
    }
}

function mapApiResultToVid(r) {
    return {
        title: r.title,
        url: r.url,
        thumbnail: r.thumbnail,
        timestamp: r.timestamp || '-',
        seconds: r.seconds || 0,
        views: r.views || 0,
        viewsText: r.viewsText || (r.views ? r.views.toLocaleString() : 'N/A'),
        author: { name: r.author?.name || 'Unknown', url: r.author?.url || '' },
        description: r.description || '',
        ago: r.ago || ''
    };
}

async function getVideoInfo(text) {
    const isUrl = text.startsWith('http://') || text.startsWith('https://');

    // ---------- 1) Try npm yt-search ----------
    try {
        const { default: yts } = await import('yt-search');
        if (isUrl) {
            const videoId = getVideoId(text);
            if (!videoId) return { error: "❌ Invalid YouTube URL!" };
            const vid = await yts({ videoId });
            if (vid) return { vid, url: vid.url };
        } else {
            const search = await yts(text);
            if (search?.videos?.length) {
                const vid = search.videos[0];
                return { vid, url: vid.url };
            }
        }
    } catch (e) {
        console.error('⚠️ yt-search (npm) failed, trying backup API:', e.message);
    }

    // ---------- 2) Fallback to /yts API ----------
    try {
        if (isUrl) {
            const videoId = getVideoId(text);
            if (!videoId) return { error: "❌ Invalid YouTube URL!" };
            const results = await getYtsApiSearch(videoId);
            if (results?.length) {
                const vid = mapApiResultToVid(results[0]);
                return { vid, url: vid.url };
            }
        } else {
            const results = await getYtsApiSearch(text);
            if (results?.length) {
                const vid = mapApiResultToVid(results[0]);
                return { vid, url: vid.url };
            }
        }
    } catch (e) {
        console.error('⚠️ Backup /yts API also failed:', e.message);
    }

    return { error: "❌ No results found! (both sources failed)" };
}

async function getAudioLink(vidUrl) {
    try {
        const apiUrl = `${getRandomBase()}/ytmp3?url=${encodeURIComponent(vidUrl)}&key=${API_KEY}`;
        const response = await axios.get(apiUrl, { timeout: 20000 });
        if (response.data?.downloadUrl) return response.data;
    } catch (e) {
        console.error('⚠️ /ytmp3 failed, trying /ytdl:', e.message);
    }

    try {
        const apiUrl = `${getRandomBase()}/ytdl?url=${encodeURIComponent(vidUrl)}&key=${API_KEY}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data?.success && response.data?.downloadUrl) return response.data;
    } catch (e) {
        console.error('⚠️ /ytdl fallback also failed:', e.message);
    }

    return null;
}

async function getVideoLink(vidUrl, quality) {
    try {
        const res = await axios.get(`${getRandomBase()}/ytvideo?url=${encodeURIComponent(vidUrl)}&quality=${quality}&key=${API_KEY}`, { timeout: 30000 });
        if (res.data?.success && res.data?.downloadUrl) return res.data;
    } catch (e) {}
    try {
        const res = await axios.get(`${getRandomBase()}/ytdl?url=${encodeURIComponent(vidUrl)}&key=${API_KEY}`, { timeout: 30000 });
        if (res.data?.success && res.data?.downloadUrl) return res.data;
    } catch (e) {}
    return null;
}

// ============================================
// QUALITY SELECT HANDLER
// ============================================
async function handleQualitySelect(conn, from, mek, vid, url, mode, BOT_NAME) {
    const caption = buildQualityCaption(vid, mode.title, mode.emoji, BOT_NAME);
    const sent = await conn.sendMessage(from, { image: { url: vid.thumbnail }, caption }, { quoted: mek });
    const msgId = sent.key.id;

    const listener = async (msgData) => {
        const received = msgData.messages[0];
        if (!received.message) return;
        const selected = received.message.conversation || received.message.extendedTextMessage?.text;
        const replyToBot = received.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;
        if (!replyToBot) return;

        const cleanSelect = selected?.trim();

        if (!['1', '2', '3', '4'].includes(cleanSelect)) {
            await conn.sendMessage(from, {
                text: "❌ *Invalid selection!*\n\nPlease reply with a number:\n*1* 360p\n*2* 480p\n*3* 720p\n*4* 1080p",
                quoted: received
            });
            return;
        }

        conn.ev.off("messages.upsert", listener);
        await conn.sendMessage(from, { react: { text: '⬇️', key: received.key } });

        const qMap = { '1': '360', '2': '480', '3': '720', '4': '1080' };
        const quality = qMap[cleanSelect];
        let success = false;

        const data = await getVideoLink(url, quality);
        if (data) {
            success = await sendAsDoc(conn, from, received, data.downloadUrl, vid.title, data.format, BOT_NAME);
        }

        if (success) await conn.sendMessage(from, { react: { text: '✅', key: received.key } });
        else await conn.sendMessage(from, { text: "❌ Download Failed!", quoted: received });
    };
    conn.ev.on("messages.upsert", listener);
    setTimeout(() => conn.ev.off("messages.upsert", listener), 60000);
}

// ============================================
// COMMAND: play
// ============================================
cmd({
    pattern: "play",
    alias: ["music", "audio"],
    desc: "Download YouTube audio",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("❌ Please provide song name\nExample: .play Shape of You");

        const info = await getVideoInfo(text);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: buildAudioInfoCaption(vid, BOT_NAME)
        }, { quoted: mek });

        const data = await getAudioLink(url);
        if (!data?.downloadUrl) return reply("❌ Download Failed!");

        await conn.sendMessage(from, {
            audio: { url: data.downloadUrl },
            mimetype: formatMime(data.format),
            fileName: `${vid.title}.mp3`,
            ptt: false
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (err) {
        reply(`❌ *Download Failed!*`);
    }
});

// ============================================
// COMMAND: song
// ============================================
cmd({
    pattern: "song",
    alias: ["music2"],
    desc: "Download YouTube audio directly",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎶 Please provide a song name or link.\n\nExample: `.song Alone - Alan Walker`");

        const info = await getVideoInfo(text);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: buildAudioInfoCaption(vid, BOT_NAME)
        }, { quoted: mek });

        const data = await getAudioLink(url);
        if (!data?.downloadUrl) return reply("❌ Failed to get audio link.");

        const ok = await sendAudioWithFallback(conn, from, mek, data.downloadUrl, vid.title, data.format, BOT_NAME);
        if (!ok) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Download Failed!");
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (err) {
        reply(`❌ *Download Failed!*`);
    }
});

// ============================================
// COMMAND: ytmp3
// ============================================
cmd({
    pattern: "ytmp3",
    desc: "Download audio from direct link",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("❌ Please provide a YouTube link!");

        const info = await getVideoInfo(text);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: buildAudioInfoCaption(vid, BOT_NAME)
        }, { quoted: mek });

        const data = await getAudioLink(url);
        if (!data?.downloadUrl) return reply("❌ Failed to get audio link.");

        const ok = await sendAudioWithFallback(conn, from, mek, data.downloadUrl, vid.title, data.format, BOT_NAME);
        if (!ok) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Download Failed!");
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (e) {
        reply("❌ Download Failed!");
    }
});

// ============================================
// COMMAND: ytmp4
// ============================================
cmd({
    pattern: "ytmp4",
    desc: "Download video from direct link",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("❌ Please provide a YouTube link!");

        const info = await getVideoInfo(text);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: buildVideoInfoCaption(vid, BOT_NAME)
        }, { quoted: mek });

        const data = await getVideoLink(url, '360');
        if (!data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Download Failed!");
        }

        const success = await sendBySize(conn, from, mek, data.downloadUrl, vid.title, data.format, BOT_NAME);
        if (success) await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        else {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            reply("❌ Download Failed!");
        }
    } catch (e) {
        reply("❌ Download Failed!");
    }
});

// ============================================
// COMMAND: ytdl
// ============================================
cmd({
    pattern: "ytdl",
    desc: "Download YouTube audio/video with options",
    category: "download",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎶 Please provide a YouTube link or name.\n\nExample: `.ytdl https://youtu.be/...`");

        const info = await getVideoInfo(text);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        const caption = `*╭┈───〔 ${toSmallCaps('YT Downloader')} 〕┈───⊷*
*├▢ 🎬 Title:* ${vid.title}
*├▢ 📺 Channel:* ${vid.author?.name || 'Unknown'}
*├▢ ⏰ Duration:* ${vid.timestamp}
*├▢ 👀 Views:* ${vid.viewsText || vid.views?.toLocaleString() || 'N/A'}
*╰───────────────────⊷*

*╭───⬡ ${toSmallCaps('Select Format')} ⬡───*
*┋ ⬡ 1* 🎧 ${toSmallCaps('Audio (MP3)')}
*┋ ⬡ 2* 📹 ${toSmallCaps('Video (MP4)')}
*╰───────────────────⊷*

> Powered by ${BOT_NAME}`;

        const sent = await conn.sendMessage(from, { image: { url: vid.thumbnail }, caption }, { quoted: mek });
        const msgId = sent.key.id;

        const listener = async (msgData) => {
            const received = msgData.messages[0];
            if (!received.message) return;
            const selected = received.message.conversation || received.message.extendedTextMessage?.text;
            const replyToBot = received.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;
            if (!replyToBot) return;

            const cleanSelect = selected?.trim();

            if (!['1', '2'].includes(cleanSelect)) {
                await conn.sendMessage(from, {
                    text: "❌ *Invalid selection!*\n\nPlease reply with *1* for Audio or *2* for Video.",
                    quoted: received
                });
                return;
            }

            conn.ev.off("messages.upsert", listener);
            await conn.sendMessage(from, { react: { text: '⬇️', key: received.key } });
            let success = false;

            if (cleanSelect === "1") {
                try {
                    const data = await getAudioLink(url);
                    if (data?.downloadUrl) {
                        success = await sendAudioWithFallback(conn, from, received, data.downloadUrl, vid.title, data.format, BOT_NAME);
                    }
                } catch (e) {}
            } else {
                const data = await getVideoLink(url, '360');
                if (data) {
                    success = await sendBySize(conn, from, received, data.downloadUrl, vid.title, data.format, BOT_NAME);
                }
            }

            if (success) await conn.sendMessage(from, { react: { text: '✅', key: received.key } });
            else await conn.sendMessage(from, { text: "❌ Download Failed!", quoted: received });
        };
        conn.ev.on("messages.upsert", listener);
        setTimeout(() => conn.ev.off("messages.upsert", listener), 60000);
    } catch (e) { reply("❌ Error"); }
});

// ============================================
// COMMAND: yts (with API fallback)
// ============================================
cmd({
    pattern: "yts",
    desc: "Search YouTube videos",
    category: "download",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🔍 Please provide a search query.\n\nExample: `.yts Alone Marshmello`");

        let results = null;

        try {
            const { default: yts } = await import('yt-search');
            const s = await yts(text);
            if (s?.videos?.length) results = s.videos.slice(0, 10);
        } catch (e) {
            console.error('⚠️ yt-search (npm) failed in yts:', e.message);
        }

        if (!results) {
            const apiRes = await getYtsApiSearch(text);
            if (apiRes?.length) {
                results = apiRes.slice(0, 10).map(mapApiResultToVid);
            }
        }

        if (!results?.length) return reply("❌ No results found! (both sources failed)");

        let list = `*╭┈───〔 ${toSmallCaps('YouTube Search')} 〕┈───⊷*\n*┋ 🔍 Query:* ${text}\n*╰───────────────────⊷*\n\n`;

        results.forEach((v, i) => {
            list += `*${i + 1}.* ${v.title}\n`;
            list += `   ⏰ ${v.timestamp} | 👀 ${v.viewsText || v.views?.toLocaleString() || 'N/A'}\n`;
            list += `   🔗 ${v.url}\n\n`;
        });

        list += `> Powered by ${BOT_NAME}`;

        await conn.sendMessage(from, {
            image: { url: results[0].thumbnail },
            caption: list
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (e) {
        reply("❌ Search Failed!");
    }
});

// ============================================
// COMMAND: video
// ============================================
cmd({
    pattern: "video",
    alias: ["vd"],
    desc: "Download YouTube video",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎥 Please provide a video name or link!\n\nExample: `.video Alone Marshmello`");

        const info = await getVideoInfo(text);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: buildVideoInfoCaption(vid, BOT_NAME)
        }, { quoted: mek });

        const data = await getVideoLink(url, '360');
        if (!data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Download Failed!");
        }

        const success = await sendBySize(conn, from, mek, data.downloadUrl, vid.title, data.format, BOT_NAME);
        if (success) await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        else {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            reply("❌ Download Failed!");
        }
    } catch (e) { reply("❌ Download Failed!"); }
});

// ============================================
// COMMAND: video2
// ============================================
cmd({
    pattern: "video2",
    desc: "Download YouTube video with quality options",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎥 Please provide video name or link!\nExample: `.video2 Alone`");

        const info = await getVideoInfo(text);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await handleQualitySelect(conn, from, mek, vid, url, { title: 'Video2 Quality', emoji: '🎬' }, BOT_NAME);
    } catch (e) { reply("❌ Error"); }
});

// ============================================
// COMMAND: movie
// ============================================
cmd({
    pattern: "movie",
    alias: ["film", "mv"],
    desc: "Download full movie",
    category: "download",
    react: "🍿",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎬 Please provide a movie name or link!\n\nExample: `.movie Interstellar`");

        const info = await getVideoInfo(`${text} full movie`);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: buildBoxInfoCaption('Movie Downloader', '🍿', vid, BOT_NAME, 'Downloading as document...')
        }, { quoted: mek });

        const data = await getVideoLink(url, '360');
        if (!data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Download Failed!");
        }

        const success = await sendBySize(conn, from, mek, data.downloadUrl, vid.title, data.format, BOT_NAME);
        if (success) await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        else {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            reply("❌ Download Failed!");
        }
    } catch (e) { reply("❌ Download Failed!"); }
});

// ============================================
// COMMAND: movie2
// ============================================
cmd({
    pattern: "movie2",
    desc: "Download full movie with quality",
    category: "download",
    react: "🍿",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎬 Please provide a movie name or link!\nExample: `.movie2 Interstellar`");

        const info = await getVideoInfo(`${text} full movie`);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await handleQualitySelect(conn, from, mek, vid, url, { title: 'Movie2 Quality', emoji: '🎬' }, BOT_NAME);
    } catch (e) { reply("❌ Error"); }
});

// ============================================
// COMMAND: cartoon
// ============================================
cmd({
    pattern: "cartoon",
    desc: "Download cartoon video",
    category: "download",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎨 Please provide cartoon name!\n\nExample: `.cartoon Tom and Jerry`");

        const info = await getVideoInfo(`${text} cartoon`);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: buildCartoonInfoCaption(vid, BOT_NAME)
        }, { quoted: mek });

        const data = await getVideoLink(url, '360');
        if (!data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Download Failed!");
        }

        const success = await sendBySize(conn, from, mek, data.downloadUrl, vid.title, data.format, BOT_NAME);
        if (success) await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        else {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            reply("❌ Download Failed!");
        }
    } catch (e) { reply("❌ Download Failed!"); }
});

// ============================================
// COMMAND: cartoon2
// ============================================
cmd({
    pattern: "cartoon2",
    desc: "Download cartoon with quality",
    category: "download",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎨 Please provide cartoon name!\nExample: `.cartoon2 Tom and Jerry`");

        const info = await getVideoInfo(`${text} cartoon`);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await handleQualitySelect(conn, from, mek, vid, url, { title: 'Cartoon2 Quality', emoji: '🎨' }, BOT_NAME);
    } catch (e) { reply("❌ Error"); }
});

// ============================================
// COMMAND: drama (Video / Video-as-Document menu)
// ============================================
cmd({
    pattern: "drama",
    desc: "Download drama episode",
    category: "download",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎭 Please provide drama name!\n\nExample: `.drama Breaking Bad`");

        const info = await getVideoInfo(`${text} drama`);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        const caption = `*╭┈───〔 ${toSmallCaps('Drama Downloader')} 〕┈───⊷*
*├▢ 🎭 Title:* ${vid.title}
*├▢ 📺 Channel:* ${vid.author?.name || 'Unknown'}
*├▢ ⏰ Duration:* ${vid.timestamp}
*├▢ 👀 Views:* ${vid.viewsText || vid.views?.toLocaleString() || 'N/A'}
*╰───────────────────⊷*

*╭───⬡ ${toSmallCaps('Select Format')} ⬡───*
*┋ ⬡ 1* 📹 ${toSmallCaps('Video (MP4)')}
*┋ ⬡ 2* 📄 ${toSmallCaps('Video as Document')}
*╰───────────────────⊷*

> Powered by ${BOT_NAME}`;

        const sent = await conn.sendMessage(from, { image: { url: vid.thumbnail }, caption }, { quoted: mek });
        const msgId = sent.key.id;

        const listener = async (msgData) => {
            const received = msgData.messages[0];
            if (!received.message) return;
            const selected = received.message.conversation || received.message.extendedTextMessage?.text;
            const replyToBot = received.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;
            if (!replyToBot) return;

            const cleanSelect = selected?.trim();

            if (!['1', '2'].includes(cleanSelect)) {
                await conn.sendMessage(from, {
                    text: "❌ *Invalid selection!*\n\nPlease reply with:\n*1* Video (MP4)\n*2* Video as Document",
                    quoted: received
                });
                return;
            }

            conn.ev.off("messages.upsert", listener);
            await conn.sendMessage(from, { react: { text: '⬇️', key: received.key } });

            const data = await getVideoLink(url, '360');
            if (!data) {
                await conn.sendMessage(from, { text: "❌ Download Failed!", quoted: received });
                return;
            }

            let success = false;
            if (cleanSelect === "1") {
                success = await sendBySize(conn, from, received, data.downloadUrl, vid.title, data.format, BOT_NAME);
            } else {
                success = await sendAsDoc(conn, from, received, data.downloadUrl, vid.title, data.format, BOT_NAME);
            }

            if (success) await conn.sendMessage(from, { react: { text: '✅', key: received.key } });
            else await conn.sendMessage(from, { text: "❌ Download Failed!", quoted: received });
        };
        conn.ev.on("messages.upsert", listener);
        setTimeout(() => conn.ev.off("messages.upsert", listener), 60000);
    } catch (e) { reply("❌ Error"); }
});

// ============================================
// COMMAND: drama2
// ============================================
cmd({
    pattern: "drama2",
    desc: "Download drama with quality",
    category: "download",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply, userConfig }) => {
    try {
        const BOT_NAME = getBotName(userConfig);
        if (!text) return reply("🎭 Please provide drama name!\nExample: `.drama2 Breaking Bad`");

        const info = await getVideoInfo(`${text} drama`);
        if (info.error) return reply(info.error);
        const { vid, url } = info;

        await handleQualitySelect(conn, from, mek, vid, url, { title: 'Drama2 Quality', emoji: '🎭' }, BOT_NAME);
    } catch (e) { reply("❌ Error"); }
});