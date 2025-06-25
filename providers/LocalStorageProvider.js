import { StorageProvider } from "./StorageProviderInterface.js";
import { FOLDER } from "../config/env.js"
import fsp from 'fs/promises';
import path from 'path';
import mime from 'mime';
import fs from 'fs'

export class LocalStorageProvider extends StorageProvider {
    constructor() {
        super();
        console.log("using local storage provider");
        this.folder = FOLDER; // folder value must contain an trailing slash /

        // creating file if does not exists
        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder, { recursive: true })
        }
    }



    /** 
        * Upload to storage 
        * @param {Buffer} buff - root dir for storage 
        * @param {string} filenameSave - the name which will be saved to storage
        */
    async upload(buff, filenameSave) {
        // write to disk and save to db
        const savePath = path.join(this.folder, filenameSave);
        await fsp.writeFile(savePath, buff);
    }

    /**
        * Download a file using filenme
        * @param {string} filename - which to retrive
        * @returns {Promise<{buff?:Buffer, mimeType?:string}} File with mimeType
        */
    async download(filename) {
        const filePath = path.join(this.folder, filename);
        // read file and mimetype
        // using buffer so that other cloud provider integration gets easier 
        const buff = await fsp.readFile(filePath);
        const mimeType = mime.getType(filePath);

        return { buff, mimeType }
    }

    /**
        * Delete the file from storage and database
        * @param {string} filename - which to delete 
        */

    async delete(filename) {
        // delete file
        const filePath = path.join(this.folder, filename);
        await fsp.unlink(filePath)
    }

}
