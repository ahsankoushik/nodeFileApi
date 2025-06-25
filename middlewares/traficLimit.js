import redis from "../config/redis.js";
import { DOWNLOAD_LIMIT,UPLOAD_LIMIT } from "../config/env.js";


export async function traficLimit(req, res, next) {
    const ip = req.ip;
    const key = "trafic." + ip;
    let data = await redis.get(key);
    const date = new Date().toISOString().slice(0, 10); // taking the date portion yyyy-mm-dd
    if (data) {
        data = JSON.parse(data);
        if (data.date !== date) {
            data = { download: 0, upload: 0, date }
        } else {
            if (data.download >= DOWNLOAD_LIMIT && data.upload >= UPLOAD_LIMIT) {
                return res.status(429).json({ error: "Daily upload and download limit reached its max." });
            }
        }
    } else {
        data = { download: 0, upload: 0, date }
    }
    if (req.method === "POST") {
        data.upload += parseInt(req.get('content-length') || 0);
        if (data.upload >= UPLOAD_LIMIT) {
            return res.status(429).json({ error: "Daily upload limit reached its max." });
        }
    }
    await redis.set(key, JSON.stringify(data), 'EX', 86400);
    req.__traficKey = key;
    req.__traficData = data;
    next();
};
