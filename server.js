import express from 'express'
import multer from 'multer'
import { LocalStorageProvider } from './providers/LocalStorageProvider.js';
import { traficLimit } from './middlewares/traficLimit.js';
import fs from 'fs'
import cron from 'node-cron';
import redis from './config/redis.js';

// geting env port and fallback 
const PORT = process.env.PORT || 3000;
const FOLDER = process.env.FOLDER || "./static/"; // FOLDER value must contain an trailing slash /
const DAYS_TO_KEEP = parseInt(process.env.DAYS_TO_KEEP || "7");
const DOWNLOAD_LIMIT = parseInt(process.env.DOWNLOAD_LIMIT || 1) * 1024 * 1024;

export const app = express(); // web server  // exporting this for integration testing
const upload = multer(); // for uploading files


// creating file if does not exists
if (!fs.existsSync(FOLDER)) {
    fs.mkdirSync(FOLDER, { recursive: true })
}

const storage = new LocalStorageProvider(FOLDER);

// middlewares
app.use("/files", traficLimit);

app.post("/files", upload.single("file"), async (req, res) => {

    const contentType = req.get("Content-Type");
    if (contentType && contentType.includes("multipart/form-data")) {
        try {
            const { buffer, originalname } = req.file;
            const out = await storage.upload(buffer,originalname);
            res.json(out)

        } catch (e) {
            res.status(500).json({
                error: e.toString()
            })
        }
    }else{
        res.status(400).json({
            error: "Content-Type multipart/form-data missing"
        })
    }

})

app.get("/files/:publicKey", async(req,res) =>{
    const {buff, mimeType} = await storage.download(req.params.publicKey);
    if(buff === null && mimeType === null){
        return res.status(404).json({
            error: "File not found"
        })
    }
    const data = req.__traficData;
    console.log(data.download, buff.length);
    data.download += buff.length;
    console.log(data.download, buff.length);
    if(data.download >= DOWNLOAD_LIMIT){
        return res.status(429).json({error:"Daily Download limit reached its max."});
    }
    console.log(data.download, buff.length);
    await redis.set(req.__traficKey, JSON.stringify(data));
    res.setHeader("Content-Type", mimeType);
    res.send(buff);
})

app.delete("/files/:privateKey", async(req,res) => {
    try{
        const out = await storage.delete(req.params.privateKey);
        if(out){
            res.json({success:true, message:"successfully deleted."})
        }else{
            res.json({success:false, message:"Delete failed. File not found."})
        }
    }catch(e){
        res.send({
            error: e.toString()
        })
    }
})

cron.schedule("* * * * *",()=>{
    storage.cleanUpInactive(DAYS_TO_KEEP);
})

// starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
