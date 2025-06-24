import express from 'express'
import multer from 'multer'
import { LocalStorageProvider } from './provides/LocalStorageProvider.js';
import fs from 'fs'
import cron from 'node-cron';

// geting env port and fallback 
const PORT = process.env.PORT || 3000;
const FOLDER = process.env.FOLDER || "./static/"; // FOLDER value must contain an trailing slash /
const DAYS_TO_KEEP = parseInt(process.env.DAYS_TO_KEEP || "7");

const app = express(); // web server 
const upload = multer(); // for uploading files


// creating file if does not exists
if (!fs.existsSync(FOLDER)) {
    fs.mkdirSync(FOLDER, { recursive: true })
}

const storage = new LocalStorageProvider(FOLDER);

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
        res.status(404).json({
            error: "File not found"
        })
        return
    }
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
