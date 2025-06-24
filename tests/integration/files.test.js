import request from 'supertest';
import { app } from '../../server.js';
import { expect, test } from 'vitest'


// integration testing for file upload 
test('POST /files → upload a file', async () => {
  const res = await request(app)
    .post('/files')
    .attach('file', Buffer.from('hello world'), 'hello.txt');

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('publicKey');
  expect(res.body).toHaveProperty('privateKey');
});


// integration testing for getting file 
test('GET /files/:publicKey → download uploaded file', async () => {
  const upload = await request(app)
    .post('/files')
    .attach('file', Buffer.from('download me'), 'note.txt');

  const res = await request(app).get(`/files/${upload.body.publicKey}`);
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toBe('text/plain');
  expect(res.text).toBe('download me');
});

// integration testing for deleteing file
test('DELETE /files/:privateKey → deletes file', async () => {
  const upload = await request(app)
    .post('/files')
    .attach('file', Buffer.from('delete me'), 'to-delete.txt');

  const res = await request(app).delete(`/files/${upload.body.privateKey}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});

