// plugins/download.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';
import axios from 'axios';
import yts from 'yt-search';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { File } from 'megajs';
import converter from '../lib/converter.js';
import { Web, Pubg } from '../lib/jawi.js';

const __filename = fileURLToPath(import.meta.url);

// ============================================
// API CONFIG
// ============================================
const API_BASES = [
    Web,
    "https://jawadtechhub.onrender.com"
];
const API_KEY = Pubg;

const getRandomBase = () => API_BASES[Math.floor(Math.random() * API_BASES.length)];

// Helper function for Stylist Badi ABC Text
const toStylistUpper = (text) => {
    if (!text || typeof text !== 'string') return '';
    const uppercaseMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
        'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
        's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
        'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
        'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
    };
    return text.split('').map(char => uppercaseMap[char] || char).join('');
};

// ==========================================
// INSTAGRAM DOWNLOAD COMMON FUNCTION
// ==========================================
async function downloadInstagram(conn, mek, m, { from, reply, text, q, userConfig }) {
    try {
        let finalUrl = null;
        const quotedText = m.quoted?.text || m.quoted?.caption || '';
        const quotedUrlMatch = quotedText.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i);
        if (quotedUrlMatch) finalUrl = quotedUrlMatch[0];

        if (!finalUrl) {
            const fullText = text || q || '';
            const urlMatch = fullText.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i);
            if (urlMatch) finalUrl = urlMatch[0];
        }

        if (!finalUrl) {
            return reply(`❌ *Instagram link nahi mila!*\n\n📌 *Examples:*\n.ig https://instagram.com/reel/xxx\n.ig Watch this https://instagram.com/reel/xxx\n\nYa kisi message ko reply karke .ig likho.`);
        }

        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const API_SOURCES = [
            {
                url: `https://jawadtechhub.onrender.com/igdl?url=${encodeURIComponent(finalUrl)}&key=${Pubg}`,
                parse: (data) => {
                    if (data.status && data.result) {
                        const results = Array.isArray(data.result) ? data.result : [data.result];
                        return results.map(r => ({ type: 'video', url: r }));
                    }
                    return null;
                }
            },
            {
                url: `${Web}/igdl?url=${encodeURIComponent(finalUrl)}&key=${Pubg}`,
                parse: (data) => {
                    if (data.status && data.result) {
                        const results = Array.isArray(data.result) ? data.result : [data.result];
                        return results.map(r => ({ type: 'video', url: r }));
                    }
                    return null;
                }
            },
            {
                url: `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(finalUrl)}`,
                parse: (data) => {
                    if (data.status && data.data?.length) {
                        return data.data.map(item => ({
                            type: item.type === 'video' ? 'video' : 'image',
                            url: item.url
                        }));
                    }
                    return null;
                }
            },
            {
                url: `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(finalUrl)}`,
                parse: (data) => {
                    if (data.status && data.result && Array.isArray(data.result)) {
                        return [{ type: 'video', url: data.result[0] }];
                    }
                    return null;
                }
            }
        ];

        let success = false;
        let lastError = null;

        for (const api of API_SOURCES) {
            if (success) break;
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const response = await axios.get(api.url, { timeout: 10000 });
                    const mediaList = api.parse(response.data);
                    if (!mediaList || mediaList.length === 0) {
                        lastError = new Error('Invalid data');
                        break; 
                    }
                    for (const item of mediaList) {
                        const mediaKey = item.type === 'video' ? 'video' : 'image';
                        await conn.sendMessage(from, {
                            [mediaKey]: { url: item.url },
                            caption: `📶 *Instagram Downloader*\n\n- ❤‍🩹 *Quality*: HD\n\n> ${DESCRIPTION}`
                        }, { quoted: mek });
                    }
                    success = true;
                    break;
                } catch (err) {
                    lastError = err;
                    const statusCode = err.response?.status;
                    if ((statusCode === 505 || statusCode === 500 || err.code === 'ECONNABORTED') && attempt === 1) {
                        await new Promise(r => setTimeout(r, 2000));
                        continue;
                    }
                    break;
                }
            }
        }

        if (success) {
            await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        } else {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *Download Failed!*\n\nPlease check the link or try again later.`);
        }
    } catch (error) {
        console.error('Instagram Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Download failed. Try again later.");
    }
}

// ==========================================
// INSTAGRAM COMMANDS
// ==========================================
cmd({
    pattern: "ig",
    alias: ["igdl"],
    react: "⬇️",
    desc: "Download Instagram videos/reels",
    category: "download",
    use: ".ig <link or text with link>",
    filename: __filename
}, async (conn, mek, m, ctx) => {
    return downloadInstagram(conn, mek, m, ctx);
});

cmd({
    pattern: "instagram",
    alias: ["insta"],
    react: "⬇️",
    desc: "Download Instagram videos/reels",
    category: "download",
    use: ".instagram <link or text with link>",
    filename: __filename
}, async (conn, mek, m, ctx) => {
    return downloadInstagram(conn, mek, m, ctx);
});

// ==========================================
// INSTAGRAM MP3
// ==========================================
cmd({
    pattern: "igmp3",
    alias: ["instamp3", "instaaudio", "igaudio"],
    react: "🎵",
    desc: "Extract audio from Instagram video/reel",
    category: "download",
    use: ".igmp3 <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, text, userConfig }) => {
    try {
        let finalUrl = q || text || m.quoted?.text;
        const urlMatch = finalUrl?.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i);
        if (urlMatch) finalUrl = urlMatch[0];

        if (!finalUrl || !finalUrl.includes("instagram.com")) return reply("❌ Please provide/reply to an Instagram link");

        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const API_SOURCES = [
            `https://jawadtechhub.onrender.com/igdl?url=${encodeURIComponent(finalUrl)}&key=${Pubg}`,
            `${Web}/igdl?url=${encodeURIComponent(finalUrl)}&key=${Pubg}`,
            `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(finalUrl)}`,
            `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(finalUrl)}`
        ];

        let videoUrl = null;
        for (const apiUrl of API_SOURCES) {
            try {
                const res = await axios.get(apiUrl, { timeout: 10000 });
                if (apiUrl.includes('aswin')) {
                    const item = res.data?.data?.find(v => v.type === 'video');
                    if (item?.url) { videoUrl = item.url; break; }
                } else if (res.data?.result) {
                    const result = Array.isArray(res.data.result) ? res.data.result[0] : res.data.result;
                    if (typeof result === 'string') { videoUrl = result; break; }
                    if (result?.url) { videoUrl = result.url; break; }
                }
            } catch (e) { continue; }
        }

        if (!videoUrl) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Could not find video to extract audio from.");
        }

        await conn.sendMessage(from, { react: { text: '⬇️', key: m.key } });
        const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const videoBuffer = Buffer.from(videoResponse.data);
        
        await conn.sendMessage(from, { react: { text: '🔧', key: m.key } });
        const audioBuffer = await converter.toAudio(videoBuffer, 'mp4');
        
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            caption: `> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('IGMP3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Audio extraction failed. Error: " + error.message);
    }
});

// ==========================================
// TIKTOK COMMANDS
// ==========================================
cmd({
    pattern: "tiktok",
    alias: ["tt", "ttdl"],
    desc: "Download TikTok video using multiple APIs",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, text, userConfig }) => {
    try {
        let finalUrl = q || text || m.quoted?.text;
        const urlMatch = finalUrl?.match(/https?:\/\/(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com)\/[^\s]+/i);
        if (urlMatch) finalUrl = urlMatch[0];
        
        if (!finalUrl || !finalUrl.includes("tiktok.com")) return await reply("🎯 Please provide a valid TikTok link!");

        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const API_SOURCES = [
            `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(finalUrl)}`,
            `https://jawad-tech.vercel.app/download/ttdl?url=${encodeURIComponent(finalUrl)}`
        ];

        let success = false;
        for (const api of API_SOURCES) {
            try {
                const res = await axios.get(api, { timeout: 10000 });
                const data = res.data;
                if (data?.status && data?.result) {
                    await conn.sendMessage(from, {
                        video: { url: data.result },
                        mimetype: 'video/mp4',
                        caption: `🎵 ${data.metadata?.title || 'TikTok Video'}\n👤 *Author:* ${data.metadata?.author || 'Unknown'}\n\n> ${DESCRIPTION}`
                    }, { quoted: mek });
                    success = true;
                    break;
                }
            } catch (e) { continue; }
        }

        if (success) await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        else return await reply("❌ All APIs failed! Try again later.");

    } catch (e) {
        console.error("Error in .tiktok:", e);
        await reply("❌ Error occurred while downloading TikTok video!");
    }
});

cmd({
    pattern: "tiktok2",
    alias: ["tt2", "ttdl2"],
    desc: "Download TikTok video",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, text, userConfig }) => {
    try {
        let finalUrl = q || text || m.quoted?.text;
        const urlMatch = finalUrl?.match(/https?:\/\/(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com)\/[^\s]+/i);
        if (urlMatch) finalUrl = urlMatch[0];

        if (!finalUrl || !finalUrl.includes("tiktok.com")) return await reply("🎯 Please provide a valid TikTok link!");

        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const res = await axios.get(`https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(finalUrl)}`, { timeout: 10000 });
        const json = res.data;

        if (!json?.status || !json?.result) return await reply("❌ Download failed! Try again later.");

        await conn.sendMessage(from, {
            video: { url: json.result },
            mimetype: 'video/mp4',
            caption: `🎵 *${json.metadata?.title || 'TikTok'}*\n👤 *Author:* ${json.metadata?.author || 'Unknown'}\n\n> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .tiktok2:", e);
        await reply("❌ Error occurred while downloading TikTok video!");
    }
});

cmd({
    pattern: "tiktok3",
    alias: ["tt3", "ttdl3"],
    desc: "Download HD TikTok videos",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, text, userConfig }) => {
    try {
        let finalUrl = q || text || m.quoted?.text;
        const urlMatch = finalUrl?.match(/https?:\/\/(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com)\/[^\s]+/i);
        if (urlMatch) finalUrl = urlMatch[0];

        if (!finalUrl || !finalUrl.includes("tiktok.com")) return await reply("🎯 Please provide a valid TikTok link!");

        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const res = await axios.get(`https://jawad-tech.vercel.app/download/ttdl?url=${encodeURIComponent(finalUrl)}`, { timeout: 10000 });
        const json = res.data;

        if (!json?.status || !json?.result) return await reply("❌ Download failed! Try again later.");

        const meta = json.metadata;
        const caption = `🎬 *${meta.title}*\n\n👤 *Author:* ${meta.author?.nickname || 'Unknown'} (@${meta.author?.username || 'unknown'})\n📊 *Stats:* 👀 ${meta.stats?.views || 0} | ❤️ ${meta.stats?.likes || 0}\n\n> ${DESCRIPTION}`;

        await conn.sendMessage(from, {
            video: { url: json.result },
            mimetype: 'video/mp4',
            caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .tiktok3:", e);
        await reply("❌ Error occurred while downloading TikTok video!");
    }
});

// ==========================================
// TIKTOK MP3
// ==========================================
cmd({
    pattern: "ttmp3",
    alias: ["tiktokmp3", "tiktokaudio", "ttaudio"],
    react: "🎵",
    desc: "Extract audio from TikTok video",
    category: "download",
    use: ".ttmp3 <TikTok URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, text, userConfig }) => {
    try {
        let finalUrl = q || text || m.quoted?.text;
        const urlMatch = finalUrl?.match(/https?:\/\/(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com)\/[^\s]+/i);
        if (urlMatch) finalUrl = urlMatch[0];

        if (!finalUrl || !finalUrl.includes("tiktok.com")) return reply("❌ Please provide/reply to a TikTok link");

        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const API_SOURCES = [
            `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(finalUrl)}`,
            `https://jawad-tech.vercel.app/download/ttdl?url=${encodeURIComponent(finalUrl)}`,
            `https://api.deline.web.id/downloader/tiktok?url=${encodeURIComponent(finalUrl)}`
        ];

        let videoUrl = null;
        for (const apiUrl of API_SOURCES) {
            try {
                const res = await axios.get(apiUrl, { timeout: 10000 });
                if (res.data?.status && res.data?.result) {
                    if (typeof res.data.result === 'string') { videoUrl = res.data.result; break; }
                    if (res.data.result?.download) { videoUrl = res.data.result.download; break; }
                }
            } catch (e) { continue; }
        }

        if (!videoUrl) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch TikTok video.");
        }

        await conn.sendMessage(from, { react: { text: '⬇️', key: m.key } });
        const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const videoBuffer = Buffer.from(videoResponse.data);
        
        await conn.sendMessage(from, { react: { text: '🔧', key: m.key } });
        const audioBuffer = await converter.toAudio(videoBuffer, 'mp4');
        
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            caption: `> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('TTMP3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Audio extraction failed. Error: " + error.message);
    }
});

// ==================== PINTEREST DOWNLOADER ====================
cmd({
    pattern: "pinterest",
    alias: ["pin", "pindl", "pint"],
    react: "📌",
    desc: "Download Pinterest videos and images",
    category: "downloader",
    use: ".pinterest <pinterest_url>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) {
            return reply(`📌 *${toStylistUpper('Please provide a Pinterest URL!')}*\n\n📌 *${toStylistUpper('Example')}:* .pinterest https://pin.it/xxxxx`);
        }

        const url = args[0];
        if (!url.includes('pinterest.com') && !url.includes('pin.it')) {
            return reply(`❌ *${toStylistUpper('Invalid Pinterest URL!')}*\n*${toStylistUpper('Example')}:* https://pin.it/xxxxx`);
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `${getRandomBase()}/pindl?url=${encodeURIComponent(url)}&key=${API_KEY}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        const data = response.data;

        if (!data.status || !data.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *${data.error || toStylistUpper('Failed to fetch Pinterest data')}*`);
        }

        const mediaUrl = data.result;
        const type = data.type || 'video'; 
        const title = data.metadata?.title || 'Pinterest Media';
        const author = data.metadata?.author || 'Unknown';

        let caption = `❖ ── ✦ *${toStylistUpper('Pinterest Downloader')}* ✦ ── ❖\n\n`;
        caption += `╔═════ ⌈ *⚡ ${toStylistUpper('Details')}* ⌋ ═════✧\n`;
        caption += `║ 📝 *${toStylistUpper('Title')}:* ${title}\n`;
        caption += `║ 👤 *${toStylistUpper('Author')}:* ${author}\n`;
        caption += `║ 📁 *${toStylistUpper('Type')}:* ${type.toUpperCase()}\n`;
        caption += `╚══════════════════════✧\n\n`;
        caption += `> 💫 _${toStylistUpper('Powered by Jawad-Md')}_`;

        if (type === 'video') {
            await conn.sendMessage(from, {
                video: { url: mediaUrl },
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                image: { url: mediaUrl },
                caption: caption
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("Pinterest command error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return reply(`❌ *${toStylistUpper('Request Timeout!')}*\nPlease try again later.`);
        }
        if (error.response && error.response.status === 404) {
            return reply(`❌ *${toStylistUpper('Invalid Pinterest link or private post!')}*`);
        }
        return reply(`❌ *${toStylistUpper('Error fetching Pinterest data')}!*\n\n*Error:* ${error.message}`);
    }
});

// ==================== WEATHER COMMAND ====================
cmd({
    pattern: "weather",
    alias: ["mausam", "temp"],
    react: "🌤️",
    desc: "Check weather of any city",
    category: "utility",
    use: ".weather <city_name>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) {
            return reply(`🌤️ *Please provide a city name!*\n\n📌 *Example:* .weather Bhakkar`);
        }

        const city = args.join(' ');
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `${getRandomBase()}/weather?city=${encodeURIComponent(city)}&key=${API_KEY}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });
        const data = response.data;

        if (!data.status || !data.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *${data.error || 'City not found or API error'}*`);
        }

        const w = data.result;
        const sunrise = new Date(w.sunrise * 1000).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(w.sunset * 1000).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' });

        let weatherMsg = `🌤️ WEATHER UPDATE\n\n`;
        weatherMsg += `📍 City: ${w.city}, ${w.country}\n`;
        weatherMsg += `🌡️ Temperature: ${w.temperature}°C\n`;
        weatherMsg += `🤔 Feels Like: ${w.feels_like}°C\n`;
        weatherMsg += `📉 Min: ${w.min_temp}°C | 📈 Max: ${w.max_temp}°C\n`;
        weatherMsg += `💧 Humidity: ${w.humidity}%\n`;
        weatherMsg += `🌬️ Wind Speed: ${w.wind_speed} m/s\n`;
        weatherMsg += `📊 Pressure: ${w.pressure} hPa\n`;
        weatherMsg += `☁️ Condition: ${w.condition}\n`;
        weatherMsg += `🌅 Sunrise: ${sunrise}\n`;
        weatherMsg += `🌇 Sunset: ${sunset}\n\n`;
        weatherMsg += `> 💫 Powered by JAWAD MD`;

        await conn.sendMessage(from, { text: weatherMsg }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("Weather command error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        if (error.response && error.response.status === 404) {
            return reply(`❌ *City not found!*\nPlease check the spelling.`);
        }
        return reply(`❌ *Error fetching weather!*\n\n*Error:* ${error.message}`);
    }
});

// ==================== CHARACTER COMMAND ====================
cmd({
    pattern: "character",
    alias: ["char"],
    desc: "Check the character of a mentioned user.",
    react: "🔥",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("This command can only be used in groups.");
        const mentionedUser = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedUser) return reply("Please mention a user whose character you want to check.");

        const userChar = ["Sigma", "Generous", "Grumpy", "Overconfident", "Obedient", "Good", "Simp", "Kind", "Patient", "Pervert", "Cool", "Helpful", "Brilliant", "Sexy", "Hot", "Gorgeous", "Cute"];
        const userCharacterSelection = userChar[Math.floor(Math.random() * userChar.length)];
        const message = `Character of @${mentionedUser.split("@")[0]} is *${userCharacterSelection}* 🔥⚡`;

        await conn.sendMessage(from, { text: message, mentions: [mentionedUser] }, { quoted: m });
    } catch (e) {
        console.error("Error in character command:", e);
        reply("An error occurred while processing the command. Please try again.");
    }
});

// ==================== PINTEREST IMAGE SEARCH ====================
cmd({
    pattern: "img",
    alias: ["image", "searchimg"],
    react: "🦋",
    desc: "Search images from Pinterest",
    category: "fun",
    use: ".img <keywords>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ");
        if (!query) return reply("🖼️ Please provide a search query\nExample: .img Imran Khan");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
        const url = `https://api.nexray.eu.cc/search/pinterest?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        if (!response.data?.status || !response.data.result?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ No images found. Try different keywords");
        }

        const results = response.data.result.sort(() => 0.5 - Math.random()).slice(0, 5);
        for (const imageUrl of results) {
            if (imageUrl.images_url) {
                await conn.sendMessage(from, { image: { url: imageUrl.images_url }, caption: `📷 Result for: ${query}\n> © Powered by JawadTechX` }, { quoted: mek });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (error) {
        console.error('Pinterest Search Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ Error: ${error.message || "Failed to fetch images"}`);
    }
});

// ==================== TWITTER ====================
cmd({
    pattern: "twitter",
    alias: ["tw"],
    desc: "Download Twitter/X videos",
    category: "download",
    react: "🐦",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply("🐦 Please provide a Twitter/X URL!");
        if (!text.includes("twitter.com") && !text.includes("x.com")) return reply("❌ Please provide a valid Twitter/X URL!");

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        const apiUrl = `https://api.deline.web.id/downloader/twitter?url=${encodeURIComponent(text.trim())}`;
        const response = await axios.get(apiUrl, { timeout: 30000, headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } });

        if (!response.data?.status) return reply("❌ Failed to fetch video!");
        const data = response.data.data;
        if (!data.downloadLink) return reply("❌ No video found!");

        const caption = `╭┈───〔 Twitter Downloader 〕┈───⊷\n├▢ 🐦 Title: ${data.videoTitle || 'Twitter Video'}\n├▢ 📝 Description: ${data.videoDescription || 'N/A'}\n╰───────────────────⊷\n\n> Powered by JAWAD-MD`;

        await conn.sendMessage(from, { image: { url: data.imgUrl }, caption: caption }, { quoted: mek });
        await conn.sendMessage(from, { video: { url: data.downloadLink }, caption: `🐦 *${data.videoTitle || 'Twitter Video'}*\n\n> Powered by JAWAD-MD`, mimetype: "video/mp4" }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("❌ TWITTER ERROR:", error);
        if (error.code === 'ECONNABORTED') reply("⏰ Request timeout!");
        else if (error.response?.status === 404) reply("❌ Video not found!");
        else reply(`❌ Error occurred: ${error.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ==================== GDRIVE ====================
cmd({
    pattern: "gdrive",
    alias: ["googledrive", "gdl"],
    desc: "Download files from Google Drive",
    category: "download",
    react: "📁",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply(`📁 *Google Drive Downloader* 📁\n\nUsage: .gdrive <link>`);
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let fileId = null;
        const patterns = [/\/file\/d\/([^\/]+)/, /id=([^&]+)/, /\/d\/([^\/]+)/, /\/uc\?id=([^&]+)/];
        for (const pattern of patterns) {
            const match = q.match(pattern);
            if (match) { fileId = match[1]; break; }
        }
        if (!fileId) return reply("❌ Invalid Google Drive link.");

        const apiUrl = `https://api.deline.web.id/downloader/gdrive?url=https://drive.google.com/file/d/${fileId}/view`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.result) return reply("❌ Failed to fetch file.");
        const result = response.data.result;

        const fileResponse = await axios({ method: 'GET', url: result.downloadUrl, responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(fileResponse.data);

        await conn.sendMessage(from, { document: fileBuffer, fileName: result.fileName, mimetype: result.mimetype || 'application/octet-stream', caption: `📁 *${result.fileName}*\n📦 *Size:* ${result.fileSize}\n\n> ${DESCRIPTION}` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (error) {
        console.error("Google Drive Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ An error occurred while downloading.");
    }
});

// ==================== CAPCUT ====================
cmd({
    pattern: "capcut",
    desc: "Download CapCut templates",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return await reply("🎬 *Please provide a CapCut template link*");
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await reply("*⏳ Fetching CapCut template...*");

        const apiUrl = `https://api.deline.web.id/downloader/capcut?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);
        if (!data.status || data.result.error) return await reply("❌ Failed to fetch CapCut template.");

        const result = data.result;
        const media = result.medias.find(v => v.quality === "No Watermark") || result.medias[0];
        const caption = `🎬 *CapCut Template Downloaded*\n\n📌 *Title:* ${result.title}\n👤 *Author:* ${result.author}\n⏱ *Duration:* ${Math.floor(result.duration / 1000)}s\n🎞 *Quality:* ${media.quality}\n\n> ${DESCRIPTION}`;
        await conn.sendMessage(from, { video: { url: media.url }, caption }, { quoted: mek });
    } catch (err) {
        console.error("CAPCUT ERROR:", err);
        await reply("❌ Error downloading CapCut template.");
    }
});

// ==================== APK ====================
cmd({
    pattern: "apk",
    alias: ["app", "dlapk"],
    react: "🚀",
    desc: "📥 Download APK directly from Aptoide",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply("❌ *Please provide an app name!*");
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.datalist || !data.datalist.list || data.datalist.list.length === 0) return reply("❌ *App not found.*");

        const app = data.datalist.list[0];
        const sizeInMB = (app.size / (1024 * 1024)).toFixed(2);
        if (app.size > 150 * 1024 * 1024) return reply("❌ *App size too large (max 150MB)*");

        const caption = `✅ *APK Downloaded*\n\n📱 *App:* ${app.name}\n📦 *Size:* ${sizeInMB} MB\n\n> ${DESCRIPTION}`;
        await conn.sendMessage(from, { document: { url: app.file.path_alt }, mimetype: "application/vnd.android.package-archive", fileName: `${app.name}.apk`, caption }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("APK Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *Error fetching APK.*");
    }
});

// ==================== FACEBOOK ====================
cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl"],
    react: '📥',
    desc: "Download videos from Facebook",
    category: "download",
    use: ".fb <Facebook video URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, userConfig }) => {
    try {
        const fbUrl = args[0];
        if (!fbUrl || !fbUrl.includes("facebook.com")) return reply('❌ Please provide a valid Facebook video URL.');
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(fbUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.status || !data.result || !Array.isArray(data.result)) return reply('❌ Unable to fetch video.');

        const hd = data.result.find(v => v.quality === "HD");
        const sd = data.result.find(v => v.quality === "SD");
        const video = hd || sd;
        if (!video) return reply("❌ Video not found.");

        await reply(`Downloading video Please wait`);
        await conn.sendMessage(from, { video: { url: video.url }, caption: `🎥 *Facebook Video Downloader*\n\n> Quality: ${video.quality}\n\n> ${DESCRIPTION}` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error('FB Error:', error);
        reply('❌ Failed to download video.');
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ==================== MEDIAFIRE ====================
cmd({
    pattern: "mediafire",
    alias: ["mfire", "mfdownload"],
    react: '📥',
    desc: "Download any file from MediaFire",
    category: "download",
    use: ".mediafire <MediaFire URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, userConfig }) => {
    try {
        const url = args.join(" ");
        if (!url || !url.includes("mediafire.com")) return reply("❌ Please provide a valid MediaFire URL");
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://api.deline.web.id/downloader/mediafire?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result || !data.result.downloadUrl) return reply("❌ Failed to fetch file info.");

        const fileName = data.result.fileName;
        const downloadUrl = data.result.downloadUrl;

        const fileResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(fileResponse.data);

        const ext = fileName.split('.').pop().toLowerCase();
        let mimetype = 'application/octet-stream';
        if (ext === 'mp4') mimetype = 'video/mp4';
        else if (ext === 'apk') mimetype = 'application/vnd.android.package-archive';
        else if (ext === 'zip') mimetype = 'application/zip';
        else if (ext === 'js') mimetype = 'text/javascript';

        await conn.sendMessage(from, { document: fileBuffer, fileName: fileName, mimetype: mimetype, caption: `*MediaFire Download*\n\n📄 *File:* ${fileName}\n\n> ${DESCRIPTION}` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("MediaFire Error:", error);
        reply("❌ Failed to download file.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ==================== NPM DOWNLOAD ====================
cmd({
    pattern: "dlnpm",
    desc: "Download npm package as tgz",
    category: "download",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply("❌ *Please provide a package name*");
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        const pkg = q.trim();
        const encodedPkg = encodeURIComponent(pkg);
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const infoUrl = `https://registry.npmjs.org/${encodedPkg}`;
        const infoRes = await axios.get(infoUrl).catch(() => null);
        if (!infoRes || !infoRes.data) return reply("❌ Package not found.");

        const data = infoRes.data;
        const latest = data['dist-tags'].latest;
        const tarballUrl = data.versions[latest].dist.tarball;

        const safeName = pkg.replace('@', '').replace('/', '-');
        const fileName = `${safeName}-${latest}.tgz`;
        const filePath = path.join(tempDir, fileName);

        const tarballRes = await axios.get(tarballUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, tarballRes.data);

        await conn.sendMessage(from, { document: fs.readFileSync(filePath), mimetype: 'application/gzip', fileName: fileName, caption: `📦 *NPM Package Downloaded*\n\n• *Name:* ${pkg}\n• *Version:* ${latest}\n\n> ${DESCRIPTION}` }, { quoted: mek });
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error("DLNPM Error:", err);
        reply("❌ NPM package download failed");
    }
});

// ==================== MEGA DOWNLOAD ====================
cmd({
    pattern: "megadl",
    alias: ["mega", "meganz"],
    react: "📦",
    desc: "Download file from Mega.nz",
    category: "download",
    use: '.megadl <mega file link>',
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply("📦 Please provide a Mega.nz file link.");
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const file = File.fromURL(q);
        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        const savePath = path.join(os.tmpdir(), file.name || "mega_file.zip");
        fs.writeFileSync(savePath, data);

        await conn.sendMessage(from, { document: fs.readFileSync(savePath), fileName: file.name || "JawadTechX.zip", mimetype: "application/zip", caption: `📦 Downloaded from Mega NZ\n\n> ${DESCRIPTION}` }, { quoted: mek });
        fs.unlinkSync(savePath);
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("❌ MEGA Error:", error);
        reply("❌ Failed to download file from Mega.nz.");
    }
});

// ==================== YOUTUBE POST ====================
cmd({
    pattern: "ytpost",
    alias: ["ytcommunity", "ytc"],
    desc: "Download a YouTube community post",
    category: "download",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply("Please provide a YouTube community post URL.");
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        const apiUrl = `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) return reply("Failed to fetch community post.");

        const post = data.data;
        let caption = `📢 *YouTube Community Post* 📢\n\n📜 *Content:* ${post.content}\n\n> ${DESCRIPTION}`;

        if (post.images && post.images.length > 0) {
            for (const img of post.images) {
                await conn.sendMessage(from, { image: { url: img }, caption }, { quoted: mek });
                caption = "";
            }
        } else {
            await conn.sendMessage(from, { text: caption }, { quoted: mek });
        }
    } catch (e) {
        console.error("Error in ytpost:", e);
        reply("An error occurred while fetching YouTube post.");
    }
});

// ==================== UNIVERSAL DOWNLOAD ====================
const platforms = {
    youtube: { pattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-_]{11})/i, api: "https://jawad-tech.vercel.app/download/ytdl" },
    facebook: { pattern: /(?:https?:\/\/)?(?:www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i, api: "https://jawad-tech.vercel.app/downloader" },
    instagram: { pattern: /(?:https?:\/\/)?(?:www\.)?(instagram\.com|instagr\.am)\/[^\s]+/i, api: "https://api-aswin-sparky.koyeb.app/api/downloader/igdl" },
    pinterest: { pattern: /(?:https?:\/\/)?(?:www\.)?(pinterest\.com|pin\.it)\/[^\s]+/i, api: "https://jawad-tech.vercel.app/download/pinterest" }
};

cmd({
    pattern: "download",
    alias: ["down", "dl", "downurl"],
    desc: "Download from any URL",
    category: "download",
    react: "⬇️",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return await reply("❌ Please provide a URL to download!");

        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        let matchedPlatform = null;
        for (const [platform, data] of Object.entries(platforms)) {
            if (q.match(data.pattern)) { matchedPlatform = platform; break; }
        }

        if (matchedPlatform) {
            await handleSocialDownload(conn, from, q, matchedPlatform, m, DESCRIPTION);
        } else {
            await handleDirectDownload(conn, from, q, m, DESCRIPTION);
        }
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("Download error:", error);
        await reply("❌ Failed to download.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

async function handleSocialDownload(conn, from, url, platformType, message, DESCRIPTION) {
    try {
        switch (platformType) {
            case "instagram":
                await downloadInstagram(conn, { key: message.key }, message, { from, reply: () => {}, q: url, userConfig: { DESCRIPTION } });
                break;
            case "youtube":
                await downloadYouTube(conn, from, url, message, DESCRIPTION);
                break;
            case "facebook":
                await downloadFacebook(conn, from, url, message, DESCRIPTION);
                break;
            case "pinterest":
                await downloadPinterest(conn, from, url, message, DESCRIPTION);
                break;
        }
    } catch (error) { throw error; }
}

async function downloadYouTube(conn, from, url, message, DESCRIPTION) {
    const response = await axios.get(`https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`);
    if (!response.data?.status || !response.data.result?.mp4) throw new Error("Failed to fetch YouTube video");
    await conn.sendMessage(from, { video: { url: response.data.result.mp4 }, caption: `> ${DESCRIPTION}` }, { quoted: message });
}

async function downloadFacebook(conn, from, url, message, DESCRIPTION) {
    const response = await axios.get(`https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(url)}`);
    if (!response.data?.status || !response.data.result?.length) throw new Error("Failed to fetch Facebook video");
    const video = response.data.result.find(v => v.quality === "HD") || response.data.result.find(v => v.quality === "SD");
    if (!video?.url) throw new Error("No video URL found");
    await conn.sendMessage(from, { video: { url: video.url }, caption: `> ${DESCRIPTION}` }, { quoted: message });
}

async function downloadPinterest(conn, from, url, message, DESCRIPTION) {
    const response = await axios.get(`https://jawad-tech.vercel.app/download/pinterest?url=${encodeURIComponent(url)}`);
    if (!response.data?.status || !response.data.result?.url) throw new Error("Failed to fetch Pinterest media");
    const isVideo = response.data.result.type === 'video';
    await conn.sendMessage(from, { [isVideo ? 'video' : 'image']: { url: response.data.result.url }, caption: `> ${DESCRIPTION}` }, { quoted: message });
}

async function handleDirectDownload(conn, from, url, message, DESCRIPTION) {
    try {
        const headResponse = await axios.head(url, { timeout: 5000 }).catch(() => null);
        let contentType = headResponse?.headers['content-type'];
        const contentLength = headResponse?.headers['content-length'];
        const fileName = url.split('/').pop().split('?')[0] || 'download';

        if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) throw new Error("File too large (max 100MB)");

        if (!contentType) {
            const ext = path.extname(fileName).toLowerCase();
            const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf', '.zip': 'application/zip' };
            contentType = mimeTypes[ext] || 'application/octet-stream';
        }

        if (contentType.startsWith('image/')) {
            await conn.sendMessage(from, { image: { url: url }, caption: `> ${DESCRIPTION}` }, { quoted: message });
        } else if (contentType.startsWith('video/')) {
            await conn.sendMessage(from, { video: { url: url }, caption: `> ${DESCRIPTION}`, mimetype: contentType }, { quoted: message });
        } else if (contentType.startsWith('audio/')) {
            await conn.sendMessage(from, { audio: { url: url }, mimetype: contentType, caption: `> ${DESCRIPTION}` }, { quoted: message });
        } else {
            const response = await axios({ method: 'GET', url: url, responseType: 'arraybuffer', timeout: 30000 });
            const buffer = Buffer.from(response.data);
            await conn.sendMessage(from, { document: buffer, fileName: fileName, mimetype: contentType, caption: `> ${DESCRIPTION}` }, { quoted: message });
        }
    } catch (error) {
        console.error("Direct download error:", error);
        throw new Error("Failed to download file");
    }
}
