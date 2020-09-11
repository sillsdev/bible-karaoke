# Bible Karaoke

Create 'karaoke-style' videos of Bible passages to help users become comfortable at reading the Bible in another language.

## Users

Head on over to [biblek.info](http://biblek.info) to get started.

## Developers

Clone this repo:
```sh
git clone git@github.com:sillsdev/bible-karaoke.git bible-karaoke
cd bible-karaoke
```

Install the dependencies:
```sh
npm install
```

Debug the application:
```sh
npm run electron-dev
```

Build the app manually for testing:
```sh
# Windows:
npm run electron-pack-win
# Mac:
npm run electron-pack-mac
# Linux:
npm run electron-pack-linux
```

Build the app automatically for distribution:
* Push to a branch of the form `release/*`, e.g. `release/v0.3.4`, or `release/v0.3.4-rc1`.
* Look in the GitHub **Actions** tab for the build artifacts.

Releasing

1. Update the _version_ in your project's `package.json` file (e.g. _0.3.4_).
2. Run `npm i` to update `package-lock.json`.
3. Update `CHANGELOG.md` with changes in this release.
4. Commit these changes to your release branch as defined in the section above.
5. Tag your commit. Make sure your tag name's format is `v*.*.*`.
6. Create a new draft GitHub **Release**, ensure the following are included:
   - a _Tag version_, e.g. `v0.3.4`.
   - a copy of the change log.
   - the installer artifact from GitHub **Actions** tab as Assets (attached binary) will be added in step 7.
7. Push the tag then the commit to GitHub.
