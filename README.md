# Strapi Math

### How to install
``` bash
# clone project
$ git clone https://github.com/sahakyan-dev/strapi-math.git
# go to project folder
$ cd strapi-math/
# Copy the .env.example file to .env file
$ cp .env.example .env
# install dependencies
$ npm install # Or yarn install
# Build admin UI 
$ npm run build --clean
```

### Run project
``` bash
# serve with hot reload at localhost:1337
$ npm run start
# OR run development mode 
$ npm run develop
```
When the project is launched for the first time, a registration link opens in the browser - `http://localhost:1337/admin/auth/register-admin`
<br/>
Fill in your data for your administrator user and click **Let's start**.

### Give correct permissions
1. Click on **Settings** under **GENERAL** in the side menu
2. Click on **Roles** under **Users and Permissions Plugin**.
3. It will display a list of roles. Click on **Public**
<br/><br/>
Scroll down, under **Permissions**, click on:
4. **Users-permissions**, then:<br/>
   **Auth** - Select all <br/>
   **Permissions** - Select all <br/>
   **User** - Select all <br/>
5. Click save, then go back.

<br/><br/>
6. Click on **Roles** under **Users and Permissions Plugin**.
7. Click on **Authenticated**
8. **Category**, then:<br/>
   Choose *find* and *findOne*
9. **Question**, then:<br/>
   Choose *find* and *findOne*
10. **Answer**, then:<br/>
    Choose *find* and *findOne*
11. **User-answer**, then:<br/>
    Choose *create*, *find* and *findOne*
12. Click save, then go back.

### For production server
``` bash
# build for production and launch server
$ npm run build
$ npm start
```

### Database

Database seed files stored in the `database/seeds` folder.

### Version Dependencies

If your machine has problem running the application, please double check the versions of `node` and `npm` to fix those or other possible solution that may or may not work would be to delete `package-lock.json` file and removing `node_modules` and then doing `npm install` or the third option would be to go with the docker setup which is mentioned in the readme.

**OTHERWISE** the versions that you should use are the ones mentioned below.

> node v16 (16.15.0)

> npm v8 (8.5.5)

or if you dont prefer doing the above you could also make use of NVM (Node Version Manager - POSIX-compliant bash script to manage multiple active node.js versions) as per your convenience.

[NVM for windows](https://content.breatheco.de/en/how-to/nvm-install-windows#:~:text=Steps%20to%20install%20with%20nvm%3A&text=Install%20nvm%20Go%20to%20your,that%20you%20will%20hit%20too.)

[NVM for mac](https://tecadmin.net/install-nvm-macos-with-homebrew/)
