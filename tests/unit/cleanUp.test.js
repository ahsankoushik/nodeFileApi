import request from "supertest";
import { app } from "../../server.js";
import { LocalStorageProvider } from "../../providers/LocalStorageProvider.js";
import { cleanUpInactive } from "../../utils/cleanUp.js";
import { assert, expect, test } from "vitest"
import prisma from "../../config/prisma.js";



// dummy dir for test
// beforeAll(async () => {
//     await fs.mkdir(testDir, { recursive: true });
// });
//
// afterAll(async () => {
//     await fsp.rm(testDir, { recursive: true, force: true });
// });
//
const storage = new LocalStorageProvider();

test("Inactive file cleanup.", async () => {
    const publicKeys = [];
    let keys = await request(app)
        .post("/files")
        .attach("file", Buffer.from("hello world"), "hello.txt");
    publicKeys.push(keys.body.publicKey);
    keys = await request(app)
        .post("/files")
        .attach("file", Buffer.from("hello world"), "hello.txt");
    publicKeys.push(keys.body.publicKey);
    keys = await request(app)
        .post("/files")
        .attach("file", Buffer.from("hello world"), "hello.txt");
    publicKeys.push(keys.body.publicKey);
    const date = new Date();
    date.setDate(date.getDate() - 5);
    await prisma.file.updateMany({
        where: {
            publicKey: { in: publicKeys }
        },
        data: {
            lastAccess: date
        }
    })
    const { count } = await cleanUpInactive(2, storage);
    assert(count === 3, "3 the files should be deleted.");


    for (let i = 0; i < publicKeys.length; i++) {
        const res = await request(app).get(`/files/${publicKeys[i]}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error");
    }

});
