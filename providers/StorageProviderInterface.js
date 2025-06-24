



export class StorageProvider {
    /** 
        * StorageProvider Interface for Storage management
        * @param {string} folder - root dir for storage 
        */
    constructor(folder){
        this.folder = folder;
    }


    async upload(buff, filename ) {
        throw Error("upload not implemented");
    }

    async download(publicKey) {
        throw Error("download not implemented");
    }

    async delete(privateKey) {
        throw Error("delete not implemented");
    }

    async cleanUpInactive(days) {
        throw Error("cleanUpInactive not implemented");
    }

}
