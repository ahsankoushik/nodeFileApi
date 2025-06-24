
import { LocalStorageProvider } from "../../providers/LocalStorageProvider.js";
import path from "path";
import fs from "fs/promises";
import { assert, afterAll, beforeAll, expect, test } from "vitest"

// dummy dir for test
const testDir = path.resolve("./test-storage");

beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
});

afterAll(async () => {
    // await fs.rm(testDir, { recursive: true, force: true });
});

const storage = new LocalStorageProvider(testDir);

test("upload stores file and returns keys", async () => {
    const buffer = Buffer.from("unit test file");
    const result = await storage.upload(buffer, "test.txt");

    expect(result).toHaveProperty("publicKey");
    expect(result).toHaveProperty("privateKey");
});

test("download returns file buffer and mimetype", async () => {
    const { publicKey } = await storage.upload(Buffer.from("abc"), "note.txt");
    const { buff, mimeType } = await storage.download(publicKey);

    expect(buff.toString()).toBe("abc");
    expect(mimeType).toBe("text/plain");
});

test("delete removes file by privateKey", async () => {
    const { privateKey } = await storage.upload(Buffer.from("delete"), "del.txt");
    const result = await storage.delete(privateKey);
    expect(result).toBe(true);
});


test("clean up inactive file and returns count", async () => {
    const buffer = Buffer.from("unit test file");
    await storage.upload(buffer, "test.txt");
    // using 0 so that delete all the files
    const result = await storage.cleanUpInactive(0);

    expect(result).toHaveProperty("count");
    // file uploaded 4 deleted 1 so 3 should be deleted
    assert(result.count >= 3, "file delete cound should be 3");
});


