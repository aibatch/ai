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

async function askAI(prompt) {
    const apiUrl = `${getRandomBase()}/gpt2?q=${encodeURIComponent(prompt)}&key=${API_KEY}`;
    const res = await axios.get(apiUrl);
    if (res.data.status) return res.data.result;
    throw new Error("API Error");
}

// ==================== CORE COMMANDS ====================

cmd({
    pattern: "ai",
    desc: "Chat with AI",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .ai Your question");
    try {
        const answer = await askAI(text);
        reply(answer);
    } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "bot",
    desc: "Chat with Bot AI",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .bot Your question");
    try {
        const answer = await askAI(text);
        reply(answer);
    } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== ChatGPT MODELS ====================

cmd({
    pattern: "gpt",
    desc: "Chat with GPT",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt2",
    desc: "Chat with GPT-2 (JawadTech)",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt3",
    desc: "Chat with GPT-3",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt35turbo",
    desc: "Chat with GPT-3.5 Turbo",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt35turbo Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt4",
    desc: "Chat with GPT-4",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt4 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt4turbo",
    desc: "Chat with GPT-4 Turbo",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt4turbo Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt4o",
    desc: "Chat with GPT-4o",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt4o Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt4omini",
    desc: "Chat with GPT-4o Mini",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt4omini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt4vision",
    desc: "Chat with GPT-4 Vision",
    category: "ai",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt4vision Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt4all",
    desc: "Chat with GPT-4 All",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt4all Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt5",
    desc: "Chat with GPT-5",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt5 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gpt5mini",
    desc: "Chat with GPT-5 Mini",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gpt5mini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "chatgpt",
    desc: "Chat with ChatGPT",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .chatgpt Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "chatgpt35",
    desc: "Chat with ChatGPT 3.5",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .chatgpt35 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "chatgpt4",
    desc: "Chat with ChatGPT 4",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .chatgpt4 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "chatgpt4o",
    desc: "Chat with ChatGPT 4o",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .chatgpt4o Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "chatgpt4turbo",
    desc: "Chat with ChatGPT 4 Turbo",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .chatgpt4turbo Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "chatgptplus",
    desc: "Chat with ChatGPT Plus",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .chatgptplus Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "chatgptelite",
    desc: "Chat with ChatGPT Elite",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .chatgptelite Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== OPENAI o-SERIES ====================

cmd({
    pattern: "o1",
    desc: "Chat with OpenAI o1",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o1 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "o1mini",
    desc: "Chat with OpenAI o1-mini",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o1mini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "o1preview",
    desc: "Chat with OpenAI o1-preview",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o1preview Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "o3",
    desc: "Chat with OpenAI o3",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "o3mini",
    desc: "Chat with OpenAI o3-mini",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o3mini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "o4",
    desc: "Chat with OpenAI o4",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o4 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "o4mini",
    desc: "Chat with OpenAI o4-mini",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o4mini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "o5",
    desc: "Chat with OpenAI o5",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o5 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "o5mini",
    desc: "Chat with OpenAI o5-mini",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .o5mini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== COPILOT MODELS ====================

cmd({
    pattern: "copilot",
    desc: "Chat with Copilot AI",
    category: "ai",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .copilot Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "mscopilot",
    desc: "Chat with Microsoft Copilot",
    category: "ai",
    react: "💙",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .mscopilot Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "elitecopilot",
    desc: "Chat with Elite Copilot",
    category: "ai",
    react: "🎯",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .elitecopilot Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== DEEPSEEK MODELS ====================

cmd({
    pattern: "deepseek",
    desc: "Chat with DeepSeek",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseek Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekv2",
    desc: "Chat with DeepSeek V2",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekv2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekv3",
    desc: "Chat with DeepSeek V3",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekv3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekv4",
    desc: "Chat with DeepSeek V4",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekv4 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekr1",
    desc: "Chat with DeepSeek R1",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekr1 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekr2",
    desc: "Chat with DeepSeek R2",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekr2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekcoder",
    desc: "Chat with DeepSeek Coder",
    category: "ai",
    react: "💻",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekcoder Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekcoder2",
    desc: "Chat with DeepSeek Coder V2",
    category: "ai",
    react: "💻",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekcoder2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekmath",
    desc: "Chat with DeepSeek Math",
    category: "ai",
    react: "🧮",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekmath Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekllm",
    desc: "Chat with DeepSeek LLM",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekllm Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekvl",
    desc: "Chat with DeepSeek VL",
    category: "ai",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekvl Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "deepseekchat",
    desc: "Chat with DeepSeek Chat",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .deepseekchat Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== GEMINI MODELS ====================

cmd({
    pattern: "gemini",
    desc: "Chat with Gemini",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "geminipro",
    desc: "Chat with Gemini Pro",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .geminipro Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "geminiultra",
    desc: "Chat with Gemini Ultra",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .geminiultra Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemininano",
    desc: "Chat with Gemini Nano",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemininano Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini15",
    desc: "Chat with Gemini 1.5",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini15 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini15pro",
    desc: "Chat with Gemini 1.5 Pro",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini15pro Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini15flash",
    desc: "Chat with Gemini 1.5 Flash",
    category: "ai",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini15flash Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini20",
    desc: "Chat with Gemini 2.0",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini20 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini20flash",
    desc: "Chat with Gemini 2.0 Flash",
    category: "ai",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini20flash Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini25",
    desc: "Chat with Gemini 2.5",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini25 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini25pro",
    desc: "Chat with Gemini 2.5 Pro",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini25pro Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini25flash",
    desc: "Chat with Gemini 2.5 Flash",
    category: "ai",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini25flash Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini3",
    desc: "Chat with Gemini 3",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini3pro",
    desc: "Chat with Gemini 3 Pro",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini3pro Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini3flash",
    desc: "Chat with Gemini 3 Flash",
    category: "ai",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini3flash Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gemini3ultra",
    desc: "Chat with Gemini 3 Ultra",
    category: "ai",
    react: "💎",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gemini3ultra Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "bard",
    desc: "Chat with Google Bard",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .bard Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "palm",
    desc: "Chat with PaLM",
    category: "ai",
    react: "🌴",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .palm Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "palm2",
    desc: "Chat with PaLM 2",
    category: "ai",
    react: "🌴",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .palm2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== GROK MODELS ====================

cmd({
    pattern: "grok",
    desc: "Chat with Grok",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grok1",
    desc: "Chat with Grok 1",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok1 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grok15",
    desc: "Chat with Grok 1.5",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok15 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grok2",
    desc: "Chat with Grok 2",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grok2mini",
    desc: "Chat with Grok 2 Mini",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok2mini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grok3",
    desc: "Chat with Grok 3",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grok3mini",
    desc: "Chat with Grok 3 Mini",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok3mini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grok4",
    desc: "Chat with Grok 4",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok4 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grok4mini",
    desc: "Chat with Grok 4 Mini",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grok4mini Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grokbeta",
    desc: "Chat with Grok Beta",
    category: "ai",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grokbeta Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grokvision",
    desc: "Chat with Grok Vision",
    category: "ai",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grokvision Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== CLAUDE MODELS ====================

cmd({
    pattern: "claude",
    desc: "Chat with Claude",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude1",
    desc: "Chat with Claude 1",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude1 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude2",
    desc: "Chat with Claude 2",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claudeinstant",
    desc: "Chat with Claude Instant",
    category: "ai",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claudeinstant Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude3",
    desc: "Chat with Claude 3",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude3opus",
    desc: "Chat with Claude 3 Opus",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude3opus Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude3sonnet",
    desc: "Chat with Claude 3 Sonnet",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude3sonnet Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude3haiku",
    desc: "Chat with Claude 3 Haiku",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude3haiku Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude35",
    desc: "Chat with Claude 3.5",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude35 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude35sonnet",
    desc: "Chat with Claude 3.5 Sonnet",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude35sonnet Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude35haiku",
    desc: "Chat with Claude 3.5 Haiku",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude35haiku Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude37",
    desc: "Chat with Claude 3.7",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude37 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude37sonnet",
    desc: "Chat with Claude 3.7 Sonnet",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude37sonnet Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude4",
    desc: "Chat with Claude 4",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude4 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude4opus",
    desc: "Chat with Claude 4 Opus",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude4opus Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claude4sonnet",
    desc: "Chat with Claude 4 Sonnet",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claude4sonnet Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claudeopus",
    desc: "Chat with Claude Opus",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claudeopus Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claudesonnet",
    desc: "Chat with Claude Sonnet",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claudesonnet Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "claudehaiku",
    desc: "Chat with Claude Haiku",
    category: "ai",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .claudehaiku Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== QWEN MODELS ====================

cmd({
    pattern: "qwen",
    desc: "Chat with Qwen",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwen Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwen15",
    desc: "Chat with Qwen 1.5",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwen15 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwen2",
    desc: "Chat with Qwen 2",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwen2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwen25",
    desc: "Chat with Qwen 2.5",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwen25 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwen3",
    desc: "Chat with Qwen 3",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwen3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwencoder",
    desc: "Chat with Qwen Coder",
    category: "ai",
    react: "💻",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwencoder Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwenmath",
    desc: "Chat with Qwen Math",
    category: "ai",
    react: "🧮",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwenmath Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwenvl",
    desc: "Chat with Qwen VL",
    category: "ai",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwenvl Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwenmax",
    desc: "Chat with Qwen Max",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwenmax Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwenplus",
    desc: "Chat with Qwen Plus",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwenplus Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "qwenturbo",
    desc: "Chat with Qwen Turbo",
    category: "ai",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .qwenturbo Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== OTHER AI MODELS ====================

cmd({
    pattern: "llama2",
    desc: "Chat with Llama 2",
    category: "ai",
    react: "🦙",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .llama2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "llama3",
    desc: "Chat with Llama 3",
    category: "ai",
    react: "🦙",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .llama3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "llama4",
    desc: "Chat with Llama 4",
    category: "ai",
    react: "🦙",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .llama4 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "mistral",
    desc: "Chat with Mistral",
    category: "ai",
    react: "🌬️",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .mistral Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "mixtral",
    desc: "Chat with Mixtral",
    category: "ai",
    react: "🌬️",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .mixtral Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "falcon",
    desc: "Chat with Falcon",
    category: "ai",
    react: "🦅",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .falcon Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "bloom",
    desc: "Chat with Bloom",
    category: "ai",
    react: "🌸",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .bloom Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "bloomz",
    desc: "Chat with BLOOMZ",
    category: "ai",
    react: "🌸",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .bloomz Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "orca",
    desc: "Chat with Orca",
    category: "ai",
    react: "🐋",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .orca Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "vicuna",
    desc: "Chat with Vicuna",
    category: "ai",
    react: "🦙",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .vicuna Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "alpaca",
    desc: "Chat with Alpaca",
    category: "ai",
    react: "🦙",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .alpaca Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "phi2",
    desc: "Chat with Phi-2",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .phi2 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "phi3",
    desc: "Chat with Phi-3",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .phi3 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "phi4",
    desc: "Chat with Phi-4",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .phi4 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "wizard",
    desc: "Chat with WizardCoder",
    category: "ai",
    react: "🧙",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .wizard Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "codet5",
    desc: "Chat with CodeT5",
    category: "ai",
    react: "💻",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .codet5 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "codex",
    desc: "Chat with Codex",
    category: "ai",
    react: "💻",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .codex Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "starcoder",
    desc: "Chat with StarCoder",
    category: "ai",
    react: "💻",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .starcoder Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "codegen",
    desc: "Chat with CodeGen",
    category: "ai",
    react: "💻",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .codegen Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "kimi",
    desc: "Chat with Kimi",
    category: "ai",
    react: "🌙",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .kimi Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "perplexity",
    desc: "Chat with Perplexity",
    category: "ai",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .perplexity Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "yi",
    desc: "Chat with Yi",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .yi Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "yi34b",
    desc: "Chat with Yi-34B",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .yi34b Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "command",
    desc: "Chat with Command AI",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .command Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "commandr",
    desc: "Chat with Command R",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .commandr Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "jurassic",
    desc: "Chat with Jurassic",
    category: "ai",
    react: "🦕",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .jurassic Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "ai21",
    desc: "Chat with AI21 Labs",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .ai21 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "solar",
    desc: "Chat with Solar AI",
    category: "ai",
    react: "☀️",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .solar Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "lumin",
    desc: "Chat with Lumin AI",
    category: "ai",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .lumin Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "redpajama",
    desc: "Chat with RedPajama",
    category: "ai",
    react: "🔴",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .redpajama Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "dolly",
    desc: "Chat with Dolly",
    category: "ai",
    react: "🐑",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .dolly Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "hugging",
    desc: "Chat with HuggingChat",
    category: "ai",
    react: "🤗",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .hugging Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "openassist",
    desc: "Chat with OpenAssistant",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .openassist Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gptneo",
    desc: "Chat with GPT-Neo",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gptneo Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "gptj",
    desc: "Chat with GPT-J",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .gptj Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "flant5",
    desc: "Chat with FLAN-T5",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .flant5 Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "starlin",
    desc: "Chat with Starlin AI",
    category: "ai",
    react: "⭐",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .starlin Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

// ==================== SPECIALTY AI COMMANDS ====================

cmd({
    pattern: "talkai",
    desc: "Chat with Talk AI",
    category: "ai",
    react: "💬",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .talkai Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "brain",
    desc: "Chat with Brain AI",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .brain Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "elite",
    desc: "Chat with Elite AI Assistant",
    category: "ai",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .elite Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "elitegpt",
    desc: "Chat with Elite ChatGPT",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .elitegpt Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "assistant",
    desc: "Chat with AI Assistant",
    category: "ai",
    react: "🤵",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .assistant Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "smart",
    desc: "Chat with Smart AI",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .smart Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "genius",
    desc: "Chat with Genius AI",
    category: "ai",
    react: "🌟",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .genius Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "proai",
    desc: "Chat with Pro AI",
    category: "ai",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .proai Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "ultra",
    desc: "Chat with Ultra AI",
    category: "ai",
    react: "🔥",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .ultra Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "maxai",
    desc: "Chat with Max AI",
    category: "ai",
    react: "💪",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .maxai Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "nova",
    desc: "Chat with Nova AI",
    category: "ai",
    react: "⭐",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .nova Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "zenith",
    desc: "Chat with Zenith AI",
    category: "ai",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .zenith Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "apex",
    desc: "Chat with Apex AI",
    category: "ai",
    react: "🏆",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .apex Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "vertex",
    desc: "Chat with Vertex AI",
    category: "ai",
    react: "🔷",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .vertex Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "pulse",
    desc: "Chat with Pulse AI",
    category: "ai",
    react: "💓",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .pulse Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "quantum",
    desc: "Chat with Quantum AI",
    category: "ai",
    react: "⚛️",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .quantum Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "neo",
    desc: "Chat with Neo AI",
    category: "ai",
    react: "💚",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .neo Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "omega",
    desc: "Chat with Omega AI",
    category: "ai",
    react: "🔱",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .omega Your question");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "mathgpt",
    desc: "Solve math problems with MathGPT",
    category: "ai",
    react: "🧮",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .mathgpt Your math problem");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
});

cmd({
    pattern: "grammar",
    desc: "Check grammar and spelling",
    category: "ai",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("❌ *Usage:* .grammar Your text to check");
    try { reply(await askAI(text)); } catch (e) { reply("❌ Failed to connect to API."); }
})
