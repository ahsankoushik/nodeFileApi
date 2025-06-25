import { StorageProvider } from "../providers/StorageProviderInterface.js";
import path from "path";

/** 
    * Clean up inactive files after a time period
    * @param { number } days - after how many days the file will be deleted
    * @param { StorageProvider } provider - which StorageProvider to use
    * @returns { Promise<{count:number}> } count of deleted files
    */
export async function cleanUpInactive(days, provider) {
    const deltaTime = new Date();
    deltaTime.setDate(deltaTime.getDate() - days);
    // getting the entries to delete
    const inactives = await prisma.file.findMany({
        where: {
            lastAccess: {
                lt: deltaTime
            }
        }
    })
    for (let i = 0; i < inactives.length; i++) {
        const fileData = inactives[i];
        const filename = fileData.publicKey + path.extname(fileData.originalName);
        try {
            await provider.delete(filename);
        } catch (e) {
            // this will most unlikely case 
            // but if not it should not be issue as this will be deleted
            console.error(e);
        }
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

