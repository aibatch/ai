// JAWAD MD 
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import { Web, Pubg } from '../lib/jawi.js';

const __filename = fileURLToPath(import.meta.url);


const API_BASES = [
    Web,
    "https://jawadtechhub.onrender.com"
];

const API_KEY = Pubg;

const getRandomBase = () => API_BASES[Math.floor(Math.random() * API_BASES.length)];

const toSmallCaps = (text) => {
    const map = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ',
        'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ',
        'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.split('').map(c => map[c.toLowerCase()] || c).join('');
};

function getVideoId(url) {
    if (!url || typeof url !== 'string') return null;
    const patterns = [
        /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /(?:m\.youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/watch\/)([a-zA-Z0-9_-]{11})/,
        /(?:music\.youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}

// ============================================
// FALLBACK SEARCH — Jawad /yts API
// ============================================
async function jawadSearchAPI(query) {
    try {
        const apiUrl = `${getRandomBase()}/yts?q=${encodeURIComponent(query)}&key=${API_KEY}`;
        const { data } = await axios.get(apiUrl, { timeout: 20000 });
        if (!data?.status || !data?.results?.length) return [];
        return data.results;
    } catch (err) {
        console.error('⚠️ /yts API failed:', err.message);
        return [];
    }
}

// ============================================
// API HELPERS
// ============================================
const getAudioAPIs = (url) => [
    { url: `${getRandomBase()}/ytmp3?url=${encodeURIComponent(url)}&key=${API_KEY}`, timeout: 30000 }
];

const getNormalVideoAPIs = (url) => [
    `${getRandomBase()}/ytv?url=${encodeURIComponent(url)}&key=${API_KEY}`,
    `${getRandomBase()}/ytmp4?url=${encodeURIComponent(url)}&key=${API_KEY}`
];

function extractAudioUrl(data) {
    if (!data) return null;
    if (data.success && data.downloadUrl) return data.downloadUrl;
    if (data.status && data.download?.url) return data.download.url;
    return null;
}

function extractVideoUrl(data) {
    if (!data) return null;
    if (data.status && data.download?.url) return data.download.url;
    return null;
}

// ============================================
// COMMAND: play (Auto Audio)
// ============================================
cmd({
    pattern: "play",
    alias: ["music", "audio"],
    desc: "Download YouTube audio",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply("❌ Please provide song name\nExample: .play Shape of You");

        const { default: yts } = await import('yt-search');
        let url = text;
        let vid = null;

        try {
            if (text.startsWith('http://') || text.startsWith('https://')) {
                if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
                    return reply("❌ Please provide a valid YouTube URL!");
                }
                const videoId = getVideoId(text);
                if (!videoId) return reply("❌ Invalid YouTube URL!");
                vid = await yts({ videoId: videoId });
            } else {
                const search = await yts(text);
                if (!search || !search.videos || !search.videos.length) {
                    return reply("❌ No video results found!");
                }
                vid = search.videos[0];
                url = vid.url;
            }

            if (!vid) return reply("❌ No results found!");
        } catch (err) {
            console.error('⚠️ yt-search failed, using /yts API:', err.message);
            const results = await jawadSearchAPI(text);
            if (!results.length) return reply("❌ No song found!");
            vid = results[0];
            url = vid.url;
        }

        const viewsText = vid.viewsText || vid.views?.toLocaleString() || 'N/A';

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `- *AUDIO DOWNLOADER 🎧*\n╭━━❐━⪼\n┇๏ *Title* - ${vid.title}\n┇๏ *Duration* - ${vid.timestamp}\n┇๏ *Views* - ${viewsText}\n┇๏ *Author* - ${vid.author?.name || 'Unknown'}\n┇๏ *Status* - Downloading...\n╰━━❑━⪼\n> Powered by JAWAD-MD`
        }, { quoted: mek });

        let success = false;
        const audioAPIs = getAudioAPIs(url);

        for (const api of audioAPIs) {
            if (success) break;
            try {
                const response = await axios.get(api.url, { timeout: api.timeout });
                const audioUrl = extractAudioUrl(response.data);
                if (audioUrl) {
                    try {
                        await conn.sendMessage(from, {
                            audio: { url: audioUrl },
                            mimetype: "audio/mpeg",
                            fileName: `${vid.title}.mp3`,
                            ptt: false
                        }, { quoted: mek });
                        success = true;
                        break;
                    } catch (sendErr) {
                        console.error(`⚠️ Audio send failed (${api.url}):`, sendErr.message);
                        continue;
                    }
                }
            } catch (e) {
                console.error(`⚠️ API failed (${api.url}):`, e.message);
                continue;
            }
        }

        if (!success) return reply("❌ Download failed! Try again later.");
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error("❌ PLAY ERROR:", err);
        reply("❌ Error occurred! Please try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ============================================
// COMMAND: video
// ============================================
cmd({
    pattern: "video",
    alias: ["ytv", "ytmp4", "vd"],
    desc: "Download YouTube video",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply("🎥 Please provide a video name or link!\n\nExample: `.video Alone Marshmello`");

        const { default: yts } = await import('yt-search');
        let url = text;
        let vid = null;

        try {
            if (text.startsWith('http://') || text.startsWith('https://')) {
                if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
                    return reply("❌ Please provide a valid YouTube URL!");
                }
                const videoId = getVideoId(text);
                if (!videoId) return reply("❌ Invalid YouTube URL!");
                vid = await yts({ videoId: videoId });
            } else {
                const search = await yts(text);
                if (!search || !search.videos || !search.videos.length) {
                    return reply("❌ No video results found!");
                }
                vid = search.videos[0];
                url = vid.url;
            }

            if (!vid) return reply("❌ No results found!");
        } catch (err) {
            console.error('⚠️ yt-search failed, using /yts API:', err.message);
            const results = await jawadSearchAPI(text);
            if (!results.length) return reply("❌ No video results found!");
            vid = results[0];
            url = vid.url;
        }

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `*🎬 VIDEO DOWNLOADER*\n\n🎞️ *Title:* ${vid.title}\n📺 *Channel:* ${vid.author?.name || 'Unknown'}\n🕒 *Duration:* ${vid.timestamp}\n\n*Status:* Downloading Video...\n\n> Powered by JAWAD-MD`
        }, { quoted: mek });

        let success = false;
        const normalVideoAPIs = getNormalVideoAPIs(url);

        for (const apiUrl of normalVideoAPIs) {
            if (success) break;
            try {
                const response = await axios.get(apiUrl, { timeout: 25000 });
                const videoUrl = extractVideoUrl(response.data);
                if (videoUrl) {
                    try {
                        await conn.sendMessage(from, {
                            video: { url: videoUrl },
                            caption: `🎬 *${vid.title}*\n\n> Powered by JAWAD-MD`
                        }, { quoted: mek });
                        success = true;
                        break;
                    } catch (sendErr) {
                        console.error(`⚠️ Send failed (${apiUrl}):`, sendErr.message);
                        continue;
                    }
                }
            } catch (e) {
                console.error(`⚠️ API failed (${apiUrl}):`, e.message);
                continue;
            }
        }

        if (!success) return reply("❌ All video sources failed! Try again later.");
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .video command:", e);
        reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ============================================
// COMMAND: song (Interactive)
// ============================================
cmd({
    pattern: "song",
    alias: ["yt", "ytdl"],
    desc: "Download YouTube song or video (interactive)",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply("🎶 Please provide a YouTube video name or link.\n\nExample: `.song Alone - Alan Walker`");

        const { default: yts } = await import('yt-search');
        let vid = null;

        try {
            if (text.startsWith('http://') || text.startsWith('https://')) {
                if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
                    return reply("❌ Please provide a valid YouTube URL!");
                }
                const videoId = getVideoId(text);
                if (!videoId) return reply("❌ Invalid YouTube URL!");
                vid = await yts({ videoId: videoId });
            } else {
                const search = await yts(text);
                if (!search || !search.videos || !search.videos.length) {
                    return reply("❌ No video results found!");
                }
                vid = search.videos[0];
            }

            if (!vid) return reply("❌ No results found!");
        } catch (err) {
            console.error('⚠️ yt-search failed, using /yts API:', err.message);
            const results = await jawadSearchAPI(text);
            if (!results.length) return reply("❌ No results found!");
            vid = results[0];
        }

        const viewsText = vid.viewsText || vid.views?.toLocaleString() || 'N/A';

        const caption = `*╭┈───〔 ${toSmallCaps('YT Downloader')} 〕┈───⊷*
*├▢ 🎬 Title:* ${vid.title}
*├▢ 📺 Channel:* ${vid.author?.name || 'Unknown'}
*├▢ ⏰ Duration:* ${vid.timestamp}
*├▢ 👀 Views:* ${viewsText}
*╰───────────────────⊷*
*╭───⬡ ${toSmallCaps('Select Format')} ⬡───*
*┋ ⬡ 1* 🎧 ${toSmallCaps('Audio (MP3)')}
*┋ ⬡ 2* 📹 ${toSmallCaps('Video (MP4)')}
*┋ ⬡ 3* 📄 ${toSmallCaps('Audio as Document')}
*┋ ⬡ 4* 📄 ${toSmallCaps('Video as Document')}
*╰───────────────────⊷*

> Powered by JAWAD-MD`;

        const sent = await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption
        }, { quoted: mek });

        const msgId = sent.key.id;
        
        const songListener = async (msgData) => {
            const received = msgData.messages[0];
            if (!received.message) return;

            const selected = received.message.conversation || received.message.extendedTextMessage?.text;
            const replyToBot = received.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;

            if (replyToBot) {
                conn.ev.off("messages.upsert", songListener);
                await conn.sendMessage(from, { react: { text: '⬇️', key: received.key } });

                const cleanSelect = selected?.trim();

                if (cleanSelect === "1" || cleanSelect === "2" || cleanSelect === "3" || cleanSelect === "4") {
                    const type = cleanSelect === "1" || cleanSelect === "3" ? "mp3" : "mp4";
                    const asDocument = cleanSelect === "3" || cleanSelect === "4";

                    if (type === "mp3") {
                        let success = false;
                        const audioAPIs = getAudioAPIs(vid.url);

                        for (const api of audioAPIs) {
                            if (success) break;
                            try {
                                const response = await axios.get(api.url, { timeout: api.timeout });
                                const audioUrl = extractAudioUrl(response.data);
                                if (audioUrl) {
                                    try {
                                        if (asDocument) {
                                            await conn.sendMessage(from, {
                                                document: { url: audioUrl },
                                                mimetype: "audio/mpeg",
                                                fileName: `${vid.title}.mp3`,
                                                caption: `📄 *${vid.title}*\n🎧 Audio Document\n\n> Powered by JAWAD-MD`
                                            }, { quoted: received });
                                        } else {
                                            await conn.sendMessage(from, {
                                                audio: { url: audioUrl },
                                                mimetype: "audio/mpeg",
                                                fileName: `${vid.title}.mp3`,
                                                ptt: false
                                            }, { quoted: received });
                                        }
                                        success = true;
                                        break;
                                    } catch (sendErr) {
                                        console.error(`⚠️ Audio send failed (${api.url}):`, sendErr.message);
                                        continue;
                                    }
                                }
                            } catch (e) {
                                console.error(`⚠️ API failed (${api.url}):`, e.message);
                                continue;
                            }
                        }

                        if (!success) {
                            return await conn.sendMessage(from, { 
                                text: "❌ All audio sources failed! Try again later." 
                            }, { quoted: received });
                        }

                    } else {
                        let success = false;
                        const normalVideoAPIs = getNormalVideoAPIs(vid.url);

                        for (const apiUrl of normalVideoAPIs) {
                            if (success) break;
                            try {
                                const response = await axios.get(apiUrl, { timeout: 25000 });
                                const videoUrl = extractVideoUrl(response.data);
                                if (videoUrl) {
                                    try {
                                        if (asDocument) {
                                            await conn.sendMessage(from, {
                                                document: { url: videoUrl },
                                                mimetype: "video/mp4",
                                                fileName: `${vid.title}.mp4`,
                                                caption: `📄 *${vid.title}*\n📹 Video Document\n\n> Powered by JAWAD-MD`
                                            }, { quoted: received });
                                        } else {
                                            await conn.sendMessage(from, {
                                                video: { url: videoUrl },
                                                caption: `🎬 *${vid.title}*\n\n> Powered by JAWAD-MD`
                                            }, { quoted: received });
                                        }
                                        success = true;
                                        break;
                                    } catch (sendErr) {
                                        console.error(`⚠️ Video send failed (${apiUrl}):`, sendErr.message);
                                        continue;
                                    }
                                }
                            } catch (e) {
                                console.error(`⚠️ API failed (${apiUrl}):`, e.message);
                                continue;
                            }
                        }

                        if (!success) {
                            return await conn.sendMessage(from, { 
                                text: "❌ All video sources failed! Try again later." 
                            }, { quoted: received });
                        }
                    }

                    await conn.sendMessage(from, { react: { text: '✅', key: received.key } });
                } else {
                    await conn.sendMessage(from, {
                        text: `❌ *Invalid selection!*\nPlease reply with:\n1️⃣ for Audio (MP3)\n2️⃣ for Video (MP4)\n3️⃣ for Audio as Document\n4️⃣ for Video as Document`
                    }, { quoted: received });
                }
            }
        };
        
        conn.ev.on("messages.upsert", songListener);
        setTimeout(() => { conn.ev.off("messages.upsert", songListener); }, 30000);

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ============================================
// COMMAND: drama (Video Only - Interactive)
// ============================================
cmd({
    pattern: "drama",
    alias: ["film", "series"],
    desc: "Download YouTube drama/movie video (interactive)",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply("🎬 Please provide a drama/movie name or link.\n\nExample: `.drama Muskan 5`");

        const { default: yts } = await import('yt-search');
        let vid = null;

        try {
            if (text.startsWith('http://') || text.startsWith('https://')) {
                if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
                    return reply("❌ Please provide a valid YouTube URL!");
                }
                const videoId = getVideoId(text);
                if (!videoId) return reply("❌ Invalid YouTube URL!");
                vid = await yts({ videoId: videoId });
            } else {
                const search = await yts(text);
                if (!search || !search.videos || !search.videos.length) {
                    return reply("❌ No video results found!");
                }
                vid = search.videos[0];
            }

            if (!vid) return reply("❌ No results found!");
        } catch (err) {
            console.error('⚠️ yt-search failed, using /yts API:', err.message);
            const results = await jawadSearchAPI(text);
            if (!results.length) return reply("❌ No results found!");
            vid = results[0];
        }

        const viewsText = vid.viewsText || vid.views?.toLocaleString() || 'N/A';

        const caption = `*╭┈───〔 ${toSmallCaps('Drama Downloader')} 〕┈───⊷*
*├▢ 🎬 Title:* ${vid.title}
*├▢ 📺 Channel:* ${vid.author?.name || 'Unknown'}
*├▢ ⏰ Duration:* ${vid.timestamp}
*├▢ 👀 Views:* ${viewsText}
*╰───────────────────⊷*
*╭───⬡ ${toSmallCaps('Select Format')} ⬡───*
*┋ ⬡ 1* 📹 ${toSmallCaps('Video (MP4)')}
*┋ ⬡ 2* 📄 ${toSmallCaps('Video as Document')}
*╰───────────────────⊷*

> Powered by JAWAD-MD`;

        const sent = await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption
        }, { quoted: mek });

        const msgId = sent.key.id;
        
        const dramaListener = async (msgData) => {
            const received = msgData.messages[0];
            if (!received.message) return;

            const selected = received.message.conversation || received.message.extendedTextMessage?.text;
            const replyToBot = received.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;

            if (replyToBot) {
                conn.ev.off("messages.upsert", dramaListener);
                await conn.sendMessage(from, { react: { text: '⬇️', key: received.key } });

                const cleanSelect = selected?.trim();

                if (cleanSelect === "1" || cleanSelect === "2") {
                    const asDocument = cleanSelect === "2";

                    let success = false;
                    const normalVideoAPIs = getNormalVideoAPIs(vid.url);

                    for (const apiUrl of normalVideoAPIs) {
                        if (success) break;
                        try {
                            const response = await axios.get(apiUrl, { timeout: 25000 });
                            const videoUrl = extractVideoUrl(response.data);
                            if (videoUrl) {
                                try {
                                    if (asDocument) {
                                        await conn.sendMessage(from, {
                                            document: { url: videoUrl },
                                            mimetype: "video/mp4",
                                            fileName: `${vid.title}.mp4`,
                                            caption: `📄 *${vid.title}*\n📹 Video Document\n\n> Powered by JAWAD-MD`
                                        }, { quoted: received });
                                    } else {
                                        await conn.sendMessage(from, {
                                            video: { url: videoUrl },
                                            caption: `🎬 *${vid.title}*\n\n> Powered by JAWAD-MD`
                                        }, { quoted: received });
                                    }
                                    success = true;
                                    break;
                                } catch (sendErr) {
                                    console.error(`⚠️ Video send failed (${apiUrl}):`, sendErr.message);
                                    continue;
                                }
                            }
                        } catch (e) {
                            console.error(`⚠️ API failed (${apiUrl}):`, e.message);
                            continue;
                        }
                    }

                    if (!success) {
                        return await conn.sendMessage(from, { 
                            text: "❌ All video sources failed! Try again later." 
                        }, { quoted: received });
                    }

                    await conn.sendMessage(from, { react: { text: '✅', key: received.key } });
                } else {
                    await conn.sendMessage(from, {
                        text: `❌ *Invalid selection!*\nPlease reply with:\n1️⃣ for Video (MP4)\n2️⃣ for Video as Document`
                    }, { quoted: received });
                }
            }
        };
        
        conn.ev.on("messages.upsert", dramaListener);
        setTimeout(() => { conn.ev.off("messages.upsert", dramaListener); }, 30000);

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ============================================
// COMMAND: cartoon
// ============================================
cmd({
    pattern: "cartoon",
    alias: ["toon", "kids"],
    desc: "Download YouTube cartoon video",
    category: "download",
    react: "🧸",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply("🧸 Please provide a cartoon name!\n\nExample: `.cartoon Tom and Jerry`");

        const { default: yts } = await import('yt-search');
        let url = text;
        let vid = null;

        try {
            if (text.startsWith('http://') || text.startsWith('https://')) {
                if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
                    return reply("❌ Please provide a valid YouTube URL!");
                }
                const videoId = getVideoId(text);
                if (!videoId) return reply("❌ Invalid YouTube URL!");
                vid = await yts({ videoId: videoId });
            } else {
                const search = await yts(`${text} cartoon`);
                if (!search || !search.videos || !search.videos.length) {
                    return reply("❌ No cartoon results found!");
                }
                vid = search.videos[0];
                url = vid.url;
            }

            if (!vid) return reply("❌ No results found!");
        } catch (err) {
            console.error('⚠️ yt-search failed, using /yts API:', err.message);
            const results = await jawadSearchAPI(`${text} cartoon`);
            if (!results.length) return reply("❌ No cartoon results found!");
            vid = results[0];
            url = vid.url;
        }

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `*🧸 CARTOON DOWNLOADER*\n\n🎞️ *Title:* ${vid.title}\n📺 *Channel:* ${vid.author?.name || 'Unknown'}\n🕒 *Duration:* ${vid.timestamp}\n\n*Status:* Downloading Cartoon...\n\n> Powered by JAWAD-MD`
        }, { quoted: mek });

        let success = false;
        const normalVideoAPIs = getNormalVideoAPIs(url);

        for (const apiUrl of normalVideoAPIs) {
            if (success) break;
            try {
                const response = await axios.get(apiUrl, { timeout: 25000 });
                const videoUrl = extractVideoUrl(response.data);
                if (videoUrl) {
                    try {
                        await conn.sendMessage(from, {
                            video: { url: videoUrl },
                            caption: `🧸 *${vid.title}*\n\n> Powered by JAWAD-MD`
                        }, { quoted: mek });
                        success = true;
                        break;
                    } catch (sendErr) {
                        console.error(`⚠️ Send failed (${apiUrl}):`, sendErr.message);
                        continue;
                    }
                }
            } catch (e) {
                console.error(`⚠️ API failed (${apiUrl}):`, e.message);
                continue;
            }
        }

        if (!success) return reply("❌ All video sources failed! Try again later.");
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .cartoon command:", e);
        reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ============================================
// COMMAND: yts (Search)
// ============================================
cmd({
    pattern: "yts",
    alias: ["ytsearch", "searchyt"],
    use: '.yts jawad',
    react: "🔎",
    desc: "Search YouTube and get video details",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply('*Please provide search words!*\n\nExample: .yts Alan Walker Faded');

        const { default: yts } = await import('yt-search');
        let videos = [];
        let source = 'yt-search';

        try {
            const search = await yts(text);
            if (search?.videos?.length) {
                videos = search.videos;
            } else {
                throw new Error('No results');
            }
        } catch (err) {
            console.error('⚠️ yt-search failed, using /yts API:', err.message);
            videos = await jawadSearchAPI(text);
            source = 'jawad-api';
        }

        if (!videos.length) {
            return reply('*No results found!*');
        }

        const results = videos.slice(0, 10);

        let mesaj = `*╭┈───〔 ${toSmallCaps('YouTube Search')} 〕┈───⊷*\n`;
        mesaj += `*├▢ 🔎 Query:* ${text}\n`;
        mesaj += `*├▢ 📊 Results:* ${videos.length}\n`;
        if (source === 'jawad-api') {
            mesaj += `*├▢ ⚡ Source:* Backup API\n`;
        }
        mesaj += `*╰───────────────────⊷*\n\n`;

        results.forEach((video, i) => {
            const viewsText = video.viewsText || video.views?.toLocaleString() || 'N/A';
            mesaj += `*${i + 1}. ${video.title}*\n`;
            mesaj += `*├▢ 🔗 URL:* ${video.url}\n`;
            mesaj += `*├▢ ⏱️ Duration:* ${video.timestamp}\n`;
            mesaj += `*├▢ 👀 Views:* ${viewsText}\n`;
            mesaj += `*├▢ 👤 Channel:* ${video.author?.name || 'Unknown'}\n`;
            mesaj += `*╰───────────────────⊷*\n\n`;
        });

        mesaj += `*╭───⬡ ${toSmallCaps('Powered By')} ⬡ ───*\n`;
        mesaj += `*┋ ⬡ ${toSmallCaps('JAWAD-MD')}*\n`;
        mesaj += `*╰───────────────────⊷*`;
        
        await conn.sendMessage(from, { text: mesaj.trim() }, { quoted: mek });

    } catch (e) {
        console.error('Error in yts command:', e);
        reply(`*Error occurred while searching!*\n\`\`\`${e.message}\`\`\``);
    }
});
