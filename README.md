# Node File API

File and media management app using nodejs

## How to run this is for dev

# prerequisite
1. Nodejs ( best if v22.16.0)
2. Redis ( redis on docker will work fine)
3. SQL database ( any supported by prisma)

### After cloning the repo

Fist thing we need is redis
```bash
# for docker run inside the project
docker compose up -d
```
Now we need the npm packages
```bash
npm install
```

You can use any database supported by prisma so you need to configure that.
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

```

## There are some enviroment variable to configure this app

| Name | Fallback(default) | Allowed Values | Purpose |
|------|-------------------|---------------|---------|
| PORT | 3000 | Any Port Number | Sets the port number for the app |
| UPLOAD_LIMIT | 1 | Postive Integers | Sets the daily upload limit of an ip in MB |
| DOWNLOAD_LIMIT | 1 | Postive Integers | Sets the daily download limit of an ip in MB |

