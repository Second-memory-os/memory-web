# Mac download artifacts

Put the built installer here so the site can serve it at:

`/downloads/MemoryOS.dmg`

## Publish from memory-macos

```bash
cd ../memory-macos
# set Config/web-base-url.txt to your Vercel URL first
./scripts/build-app.sh
./scripts/package-dmg.sh
./scripts/publish-dmg-to-web.sh
# or: PUBLISH_TO_WEB=1 ./scripts/package-dmg.sh
```

Then deploy `memory-web` (Vercel). Landing + dashboard links already point at `/downloads/MemoryOS.dmg`.

`MemoryOS.dmg` is gitignored (large binary). Commit this README so the folder exists; publish the DMG before each release deploy.
