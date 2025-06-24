import { StorageProvider } from "./StorageProviderInterface.js";
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime';
import { ulid } from 'ulid';
import prisma from "../config/prisma.js";

export class LocalStorageProvider extends StorageProvider {
    /** 
        * Upload to storage 
        * @param {Buffer} buff - root dir for storage 
        * @param {string} filename - uploaded filename
        * @returns {Promise<{ publicKey: string, privateKey: string}>} Public and private key pair
        */
    async upload(buff, filename) {
        const privateKey = ulid();
        const publicKey = ulid();
        const extname = path.extname(filename);
        const filenameSave = publicKey + extname;
        const savePath = path.join(this.folder, filenameSave);
        await fs.writeFile(savePath, buff);
        await prisma.file.create({
            data: {
                extention: extname,
                privateKey,
                publicKey,
            }
        })
        return {
            publicKey,
            privateKey,
        }
    }

    /**
        * Download a file using publicKey
        * @param {string} publicKey - publicKey ulid for getting file
        * @returns {Promise<{buff?:Buffer, mimeType?:string}} File with mimeType
        */
    async download(publicKey) {
        const fileData = await prisma.file.findUnique({
            where: {
                publicKey
            }
        })
        if (fileData === null) {
            return {
                buff: null,
                mimeType: null
            }
        }
        const filePath = path.join(this.folder, fileData.publicKey + fileData.extention);
        const buff = await fs.readFile(filePath);
        const mimeType = mime.getType(filePath);
        const rest = await prisma.file.update({
            where: { 
                id: fileData.id 
            },
            data: {
                lastAccess : new Date() 
            }
        })
        console.log(rest)
        return { buff, mimeType }
    }

    async delete() {
        throw Error("delete not implemented");
    }

    async cleanUpInactive() {
        throw Error("cleanUpInactive not implemented");
    }


}
