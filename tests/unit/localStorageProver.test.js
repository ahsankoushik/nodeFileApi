
import { LocalStorageProvider } from "../../providers/LocalStorageProvider.js";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import { assert, afterAll, beforeAll, expect, test } from "vitest"
import { FOLDER } from "../../config/env.js"
// dummy dir for test
const testDir = FOLDER;
// beforeAll(async () => {
//     await fs.mkdir(testDir, { recursive: true });
// });
//
afterAll(async () => {
    await fsp.rm(testDir, { recursive: true, force: true });
});

const storage = new LocalStorageProvider();

test("upload stores file ", async () => {
    const filename = "test.txt";
    const buffer = Buffer.from("unit test file");
    await storage.upload(buffer, filename);

    const exists = fs.existsSync(path.join(testDir,filename));
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
    const exists = fs.existsSync(path.join(testDir,filename));
    assert(!exists, "File must not exist");

});


