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
        // ulid for lexical sort
        const privateKey = ulid();
        const publicKey = ulid();
        const extname = path.extname(filename);
        const filenameSave = publicKey + extname; // renaming with ulid to overcome name confict and save space on db
        const savePath = path.join(this.folder, filenameSave);
        // write to disk and save to db
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
        // checking if the file's entry exists or not
        if (fileData === null) {
            return {
                buff: null,
                mimeType: null
            }
        }
        const filePath = path.join(this.folder, fileData.publicKey + fileData.extention);
        // read file and mimetype
        // using buffer so that other cloud provider integration gets easier 
        const buff = await fs.readFile(filePath);
        const mimeType = mime.getType(filePath);

        // update last access time
        await prisma.file.update({
            where: {
                id: fileData.id
            },
            data: {
                lastAccess: new Date()
            }
        })

        return { buff, mimeType }
    }

    /**
        * Delete the file from storage and database
        * @param {string} privateKey - privateKey ulid for deleting file. So that no one can delete with publicKey
        * @returns {Promise<boolean>} status of file deletation false - means not found
        */

    async delete(privateKey) {
        let fileData;
        try {
            fileData = await prisma.file.delete({
                where: {
                    privateKey
                }
            })
        } catch (e) {       // incase of non existing data
            return false
        }
        // delete file
        const filePath = path.join(this.folder, fileData.publicKey + fileData.extention);
        await fs.unlink(filePath)
        return true
    }

    /** 
        * Clean up inactive files after a time period
        * @param { number } days - after how many days the file will be deleted
        */
    async cleanUpInactive(days) {
        const deltaTime = new Date();
        deltaTime.setDate(deltaTime.getDate()-days);
        // getting the entries to delete
        const inactives = await prisma.file.findMany({
            where: {
                lastAccess: {
                    lt: deltaTime
                }
            }
        })
        for(let i =0; i < inactives.length; i++){
            const fileData = inactives[i];
            console.log(fileData);
            const filePath = path.join( this.folder, fileData.publicKey + fileData.extention); 
            console.log(filePath)
            await fs.unlink(filePath)
        }
        try {
            const deleteCount = await prisma.file.deleteMany({
                where: {
                    lastAccess: {
                        lt: deltaTime
                    }
                }
            })
            return deleteCount
        } catch (e) {
            console.error(e); 
        }
    }


}
