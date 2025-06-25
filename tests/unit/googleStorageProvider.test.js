
import { Storage } from '@google-cloud/storage';
import { GoogleStorageProvider } from "../../providers/GoogleStorageProvider.js";
import { CONFIG, BUCKET } from "../../config/env.js";

import { assert, expect, test } from "vitest"


const storage = new GoogleStorageProvider();
const storageTest = new Storage({
    keyFilename: CONFIG
})
const bucketName = BUCKET;
const bucket = storageTest.bucket(bucketName);

test("upload stores file ", async () => {
    const filename = "test.txt";
    const buffer = Buffer.from("unit test file");
    await storage.upload(buffer, filename);

    const [exists] = await bucket.file(filename).exists(); 
    assert(exists, "File must exist");

});

test("download returns file buffer and mimetype", async () => {
    const filename = "note.txt";
    await storage.upload(Buffer.from("abc"), filename);
    const { buff, mimeType } = await storage.download(filename);

    expect(buff.toString()).toBe("abc");
    expect(mimeType).toBe("text/plain");
});

test("delete removes file by filename", async () => {
    const filename = "del.txt";
    await storage.upload(Buffer.from("delete"), filename);
    await storage.delete(filename);

    const [exists] = await bucket.file(filename).exists(); 
    assert(!exists, "File must exist");
});


