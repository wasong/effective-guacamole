### Requirements

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/lang/en/)

### Development Setup

- This app uses `dotenv-flow`. Providing `NODE_ENV` in `start:dev` specifies `.env.${NODE_ENV}` or `.env.${NODE_ENV}.local`.

Run **app** on port 8080:
```bash
λ> yarn install
λ> yarn start:dev
```

After that code changes will regenerate a bundle, you will see changes after refreshing a browser.
