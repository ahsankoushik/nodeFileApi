



export class StorageProvider {
    /** 
        * StorageProvider Interface for Storage management
        * @param {string} folder - root dir for storage 
        */
    constructor(folder){
        this.folder = folder;
    }


    async upload(buff, filenameSave ) {
        throw Error("upload not implemented");
    }

    async download(filename) {
        throw Error("download not implemented");
    }

    async delete(filename) {
        throw Error("delete not implemented");
    }

}
