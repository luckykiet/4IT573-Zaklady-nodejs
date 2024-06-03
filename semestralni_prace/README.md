# table-reservation-system

- NodeJs v21.6.1
- MongoDB, Vite React, ExpressJs

## Local development setup and run

- bind `127.0.0.1` to `vcap.me` in system vhost file

### Windows

```bash
# C:\Windows\System32\drivers\etc\hosts
127.0.0.1 vcap.me
```

### MacOS or Linux

```bash
# /private/etc/hosts
127.0.0.1 vcap.me
```

## Installation

```bash
$ node -v                # v21.6.1
$ npm install -g yarn    # install yarn tool
$ cd ./semestralni_prace # navigate to project root
$ yarn install-all       # install project dependencies
```

- run project

```bash
$ yarn dev        # run vite, nodemon
```

- now it will run at http://vcap.me:5173/

## HTTPS setup

- in directory _./server/security_ import certificate **vcap.me.cer** to storage

- run project

```bash
$ yarn devhttps        # run vite, nodemon
```

- now it will run at https://vcap.me:5173/

## Production

- Server will serve react all

### Windows

```bash
$ yarn build        # build client
$ yarn deploy-win   # moving to server public folder
$ yarn start        # run production
```

### MacOs or Linux

```bash
$ yarn build        # build client
$ yarn deploy       # run vite, nodemon
$ yarn start        # run production
```

- now it will run at https://vcap.me:3000/
