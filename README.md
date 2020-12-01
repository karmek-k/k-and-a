# k-and-a

K&amp;A - Kuestion and Answer!
A Q&A app, inspired by [ask.fm](https://ask.fm).

This repo contains K&A's backend API source code.

## Installation

In order to install dependencies and use this API,
you will have to have node.js and npm installed.

Clone the repo and install dependencies:

```
git clone https://github.com/karmek-k/k-and-a
cd k-and-a
npm install
```

To create configuration, rename `.env.example` to `.env` and edit this file (the following commands use `nano` as the code editor):

```
mv .env.example .env
nano .env
```

Alternatively, if you're using a PaaS like Heroku, just inspect the .env.example file and set environment variables accordingly.

Now that you have installed dependencies and set configuration, you can run the server:

```
npm run start
```

You can also watch for changes while the server is running:

```
npm run start:dev
```

Now, you should be able to navigate to `http://localhost:port`,
where `port` is either 8000 or the `PORT` environment variable.
If you haven't changed it, just go to [http://localhost:8000](http://localhost:8000).
