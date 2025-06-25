import { StorageProvider } from "./StorageProviderInterface.js";
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime';
import prisma from "../config/prisma.js";

export class LocalStorageProvider extends StorageProvider {
    /** 
        * Upload to storage 
        * @param {Buffer} buff - root dir for storage 
        * @param {string} filenameSave - the name which will be saved to storage
        */
    async upload(buff, filenameSave) {
        // write to disk and save to db
        const savePath = path.join(this.folder, filenameSave);
        await fs.writeFile(savePath, buff);
    }

    /**
        * Download a file using publicKey
        * @param {string} filename - which to retrive
        * @returns {Promise<{buff?:Buffer, mimeType?:string}} File with mimeType
        */
    async download(filename) {
        const filePath = path.join(this.folder, filename);
        // read file and mimetype
        // using buffer so that other cloud provider integration gets easier 
        const buff = await fs.readFile(filePath);
        const mimeType = mime.getType(filePath);

        return { buff, mimeType }
    }

    /**
        * Delete the file from storage and database
        * @param {string} filename - which to delete 
        * @returns {Promise<boolean>} status of file deletation false - means not found
        */

    async delete(filename) {
       // delete file
        const filePath = path.join(this.folder, filename);
        await fs.unlink(filePath)
    }

}
