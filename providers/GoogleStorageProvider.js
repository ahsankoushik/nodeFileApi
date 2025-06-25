import { StorageProvider } from "./StorageProviderInterface.js";
import { Storage } from '@google-cloud/storage';

export class GoogleStorageProvider extends StorageProvider {
    constructor(){
        super();
        console.log("using google storage provider");
        this.config = process.env.CONFIG || "./api_keys/service_account.json";
        const storage = new Storage({
            keyFilename:this.config
        })
        this.bucketName = process.env.BUCKET || "node_file_api";
        this.bucket = storage.bucket(this.bucketName);
    }
    /** 
        * Upload to storage 
        * @param {Buffer} buff - root dir for storage 
        * @param {string} filenameSave - the name which will be saved to storage
        */
    async upload(buff, filenameSave) {
        // write to gcs and save to db
        const file = this.bucket.file(filenameSave);
        await file.save(buff,{
            resumable:false,
            metadata : {
                contentType: "auto"
            }
        });
    }

    /**
        * Download a file using publicKey
        * @param {string} filename - which to retrive
        * @returns {Promise<{buff?:Buffer, mimeType?:string}} File with mimeType
        */
    async download(filename) {
        // read file and mimetype
        // using buffer so that other cloud provider integration gets easier 
        const file = this.bucket.file(filename);
        const [contents] = await file.download();
        const [metadata] = await file.getMetadata();
        return {
            buff : contents,
            mimeType: metadata.contentType
        }
    }

    /**
        * Delete the file from storage and database
        * @param {string} filename - which to delete 
        */

    async delete(filename) {
       // delete file
        const file = this.bucket.file(filename);
        await file.delete();
    }

}
