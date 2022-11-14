# Strapi Math


### Env File
```
1. Copy the .env.example file to .env file
2. Fill in the empty variables in .env
```
####Example:
> These are all the **environment variables** required to run the **application**.

```
HOST=0.0.0.0
PORT=1337
APP_KEYS=2bWdbgK5uMGqG/E0mpKpFw==,7igRZT9VQaSQb92Itg6qCA==,2rqxqWjU5t9pBxly1xuyvw==,f7t+ADQvEu6XA+IkyWE1Ew==
API_TOKEN_SALT=feRetTUdN6lFDO1udrYApQ==
ADMIN_JWT_SECRET=xGsqN7WOx1VmlY0whl0rAg==
JWT_SECRET=8Z5m8Lcgd/qsnyqqiBg4nA==
```

### Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:1337
$ npm run start

# build for production and launch server
$ npm run build
$ npm start
```

### Version Dependencies

If your machine has problem running the application, please double check the versions of `node` and `npm` to fix those or other possible solution that may or may not work would be to delete `package-lock.json` file and removing `node_modules` and then doing `npm install` or the third option would be to go with the docker setup which is mentioned in the readme.

**OTHERWISE** the versions that you should use are the ones mentioned below.

> node v16 (16.15.0)

> npm v8 (8.5.5)

or if you dont prefer doing the above you could also make use of NVM (Node Version Manager - POSIX-compliant bash script to manage multiple active node.js versions) as per your convenience.

[NVM for windows](https://content.breatheco.de/en/how-to/nvm-install-windows#:~:text=Steps%20to%20install%20with%20nvm%3A&text=Install%20nvm%20Go%20to%20your,that%20you%20will%20hit%20too.)

[NVM for mac](https://tecadmin.net/install-nvm-macos-with-homebrew/)
