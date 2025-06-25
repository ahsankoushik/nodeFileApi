# Node File API

File and media management app using nodejs

## How to run this is for dev

### prerequisite
1. Nodejs ( best if v22.16.0)
2. Redis ( redis on docker will work fine)
3. SQL database ( any supported by prisma)

### After cloning the repo

First thing we need is redis
```bash
# for docker run inside the project
docker compose up -d
```
Now we need the npm packages
```bash
npm install
```

You can use any database supported by prisma so you need to configure that. And change it in [schema.prisma](./prisma/schema.prisma).
I am using sqlite3 for simplicity.

After selecting the database we need to migrate the database
```bash
npx prisma generate && npx prisma migrate dev   
```

Now we can run this project 
```bash 
# for running the project
npm start 


# for development 
npm run dev 

```

To run test
```bash 
# Integration test
npm test

# Unit test
npm run test:unit

# for all the tests
npx vitest
```

## There are some enviroment variable to configure this app

| Name | Fallback(default) | Allowed Values | Purpose |
|------|-------------------|---------------|---------|
| PORT | 3000 | Any Port Number | Sets the port number for the app |
| UPLOAD_LIMIT | 1 | Positive Integers | Sets the daily upload limit of an ip in MB |
| DOWNLOAD_LIMIT | 1 | Positive Integers | Sets the daily download limit of an ip in MB |
| DAYS_TO_KEEP | 7 | Positive Integers | Sets after how many days of inactivity the files will be deleted  | 
| PROVIDER  | local | for now `local` and `google` | Sets which storage provider to use |
| FOLDER | ./static/ | Absolute or Relative dir | Sets the dir to save assets when using local storage provider |
| CONFIG | "./api_keys/service_account.json" | Absolute or Relative dir | Sets the service acount key json file for Google Cloud Storage |
| BUCEKT | node_file_api | Bucket name | Sets the bucket name for google storage provider |
| REDIS_URL | redis://localhost:6379 | - | Sets the redis database url |
| NODE_ENV | dev | `dev` or `production` | Sets the app mode |


## For Google Cloud Storage 
To use GCS you will need a service accout key. You can create one at [Google Cloud Console](https://console.cloud.google.com/) in the IAM & Admin section.
Service accout is an account for your app to use a service of google.
You will also need to configure permissions for this service account. e.g.: The role Storage Object User will do fine for this project as it grants CRUD operation on GCS.

The service account file is json file and contains:
```json
{
  "type": "",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": "",
  "universe_domain": ""
}
```

