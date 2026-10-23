import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { Web, Pubg } from '../lib/jawi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// API CONFIG
// ============================================
const API_BASES = [
    Web,
    "https://jawadtechhub.onrender.com"
];
const API_KEY = Pubg;

const getRandomBase = () => API_BASES[Math.floor(Math.random() * API_BASES.length)];

// ImgBB API Keys list (fallback)
const IMGBB_API_KEYS = [
  'ebb2d6cad946fa45d7d9c4cc7dfa87e3',
  'b9b79efc2a2cf5380b57974bba4ce6d4',
  '9f47b49c2c1ea0bdb3f4acc4ebde2119',
  'a7c9712190de7a0d3c27e12ac5e4c3da',
  '55ec55ce1c92a23b47d958a1db63c486'
];

function getRandomApiKey() {
  const randomIndex = Math.floor(Math.random() * IMGBB_API_KEYS.length);
  return IMGBB_API_KEYS[randomIndex];
}

// ============================================
// Helper: Get extension from mimetype
// ============================================
function extFromMime(mimeType) {
  if (mimeType.includes('image/jpeg')) return '.jpg';
  if (mimeType.includes('image/png')) return '.png';
  if (mimeType.includes('image/webp')) return '.webp';
  if (mimeType.includes('video')) return '.mp4';
  if (mimeType.includes('audio/mpeg')) return '.mp3';
  if (mimeType.includes('audio/mp4')) return '.m4a';
  if (mimeType.includes('audio/ogg')) return '.opus';
  if (mimeType.includes('audio/opus')) return '.opus';
  if (mimeType.includes('audio')) return '.audio';
  if (mimeType.includes('application/zip')) return '.zip';
  if (mimeType.includes('application/pdf')) return '.pdf';
  if (mimeType.includes('text/')) return '.txt';
  return '.bin';
}

// ============================================
// Helper: Upload to Catbox via your API
// ============================================
async function uploadToCatbox(buffer, filename) {
  const form = new FormData();
  form.append('file', buffer, filename);

  const apiUrl = `${getRandomBase()}/upload?key=${API_KEY}`;
  const { data } = await axios.post(apiUrl, form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0'
    },
    timeout: 60000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  if (data?.status !== true || !data?.result?.url) {
    throw new Error(data?.error || 'Catbox upload failed');
  }

  return data.result.url;
}

// ============================================
// Helper: Upload to ImgBB (image only)
// ============================================
async function uploadToImgbb(buffer) {
  const apiKey = getRandomApiKey();

  const form = new FormData();
  form.append('key', apiKey);
  form.append('image', buffer.toString('base64'));
  form.append('name', 'jawadmd');

  const response = await axios.post("https://api.imgbb.com/1/upload", form, {
    headers: form.getHeaders(),
    timeout: 60000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  const imageUrl = response.data?.data?.url;
  if (!imageUrl) throw new Error('ImgBB upload failed');

  return imageUrl;
}

// ============================================
// COMMAND: .tourl
// ============================================
cmd({
  pattern: "url",
  alias: ["imgtourl", "imgurl", "tourl", "geturl", "upload"],
  react: '🖇',
  desc: "Upload media to Catbox (ImgBB fallback for images)",
  category: "utility",
  use: ".tourl [reply to media]",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quotedMsg = m.quoted || m;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

    if (!mimeType) {
      return reply("❌ Please reply to an image, video, audio, or other file");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    const mediaBuffer = await quotedMsg.download();
    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error("Failed to download media");
    }

    const fileName = `file${extFromMime(mimeType)}`;
    const isImage = mimeType.includes('image');

    let finalUrl = null;
    let source = null;

    // ---- 1. Try Catbox first ----
    try {
      finalUrl = await uploadToCatbox(mediaBuffer, fileName);
      source = 'Catbox';
    } catch (catboxErr) {
      console.error('⚠️ Catbox failed:', catboxErr.message);

      // ---- 2. Fallback to ImgBB (images only) ----
      if (isImage) {
        try {
          finalUrl = await uploadToImgbb(mediaBuffer);
          source = 'ImgBB';
        } catch (imgbbErr) {
          console.error('⚠️ ImgBB fallback failed:', imgbbErr.message);
        }
      }
    }

    if (!finalUrl) {
      throw new Error("All upload providers failed");
    }

    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    await reply(`✅ *Uploaded Successfully (${source})*\n\n- ${finalUrl}`);

  } catch (error) {
    console.error("Tourl error:", error);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    await reply(`❌ Error: ${error.message || error}`);
  }
});
