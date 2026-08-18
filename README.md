# Friendships

A new Decentraland game for the **Friendships.dcl.eth** world.

Right now the scene is just a ground plane and one idle zombie standing in the center. That is the starting point for the next gameplay work.

## Preview locally

```bash
npm install
npm start
```

Then open the preview URL printed in the terminal.

## Deploy to Friendships.dcl.eth

Pushes to `main` run `.github/workflows/deploy.yml`: install, `npm run build:ci`, then `npm run deploy:prod` to the Worlds content server.

Add a repository secret named `DCL_PRIVATE_KEY` for a wallet that owns `Friendships.dcl.eth` or has ACL permission. Use a disposable operator wallet, not the account that holds valuable assets.

After it publishes, visit:

- [play.decentraland.org/?realm=Friendships.dcl.eth](https://play.decentraland.org/?realm=Friendships.dcl.eth)

## Scene

- SDK 7
- 2x2 world scene (32m x 32m)
- Spawn looks at the zombie in the center
- Model: `models/zombie.glb` with the `idle` animation
