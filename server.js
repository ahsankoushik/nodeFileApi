import express from 'express'
import multer from 'multer'
import { LocalStorageProvider } from './providers/LocalStorageProvider.js';
import { GoogleStorageProvider } from './providers/GoogleStorageProvider.js';
import { traficLimit } from './middlewares/traficLimit.js';
import { cleanUpInactive } from './utils/cleanUp.js'
import { ulid } from 'ulid';
import path from 'path';
import cron from 'node-cron';
import redis from './config/redis.js';
import prisma from "./config/prisma.js";

// geting env and fallback 
import { PORT, DAYS_TO_KEEP, PROVIDER, DOWNLOAD_LIMIT } from "./config/env.js";


export const app = express(); // web server  // exporting this for integration testing
const upload = multer(); // for uploading files

let storage;
if( PROVIDER === "google" ){
    storage = new GoogleStorageProvider();
}else{
    storage = new LocalStorageProvider();
}

// middlewares
app.use("/files", traficLimit);

app.post("/files", upload.single("file"), async (req, res) => {

    const contentType = req.get("Content-Type");
    if (contentType && contentType.includes("multipart/form-data")) {
        try {
            const { buffer, originalname } = req.file;
            // ulid for lexical sort
            const privateKey = ulid();
            const publicKey = ulid();
            const extname = path.extname(originalname);
            const filenameSave = publicKey + extname; // renaming with ulid to overcome name confict 
            await storage.upload(buffer, filenameSave);
            await prisma.file.create({
                data: {
                    originalName: originalname,
                    privateKey,
                    publicKey,
                }
            })
            res.json({
                publicKey,
                privateKey
            })

        } catch (e) {
            res.status(500).json({
                error: e.toString()
            })
        }
    } else {
        res.status(400).json({
            error: "Content-Type multipart/form-data missing"
        })
    }

})

app.get("/files/:publicKey", async (req, res) => {
    const publicKey = req.params.publicKey;
    const fileData = await prisma.file.findUnique({
        where: {
            publicKey
        }
    })
    // checking if the file's entry exists or not
    if (fileData === null) {
        return res.status(404).json({
            error: "File not found"
        })
    }
    const filename = fileData.publicKey + path.extname(fileData.originalName);

    const { buff, mimeType } = await storage.download(filename);
    // update last access time
    await prisma.file.update({
        where: {
            id: fileData.id
        },
        data: {
            lastAccess: new Date()
        }
    })
    const data = req.__traficData;
    data.download += buff.length;
    if (data.download >= DOWNLOAD_LIMIT) {
        return res.status(429).json({ error: "Daily Download limit reached its max." });
    }
    await redis.set(req.__traficKey, JSON.stringify(data), 'EX', 86400);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.originalName}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(buff);
})

app.delete("/files/:privateKey", async (req, res) => {
    const privateKey = req.params.privateKey;
    let fileData;
    try {
        fileData = await prisma.file.delete({
            where: {
                privateKey
            }
        })
    } catch (e) {       // incase of non existing data
        return res.json({ success: false, message: "Delete failed. File not found." })
    }
    const filename = fileData.publicKey + path.extname(fileData.originalName);
    await storage.delete(filename);
    res.json({ success: true, message: "successfully deleted." })
})

cron.schedule("0 0 * * *", () => {
    cleanUpInactive(DAYS_TO_KEEP, storage);
})

// starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
