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
1. Update the *version* in your project's `package.json` file (e.g. *0.3.4*).
2. Run `npm i` to update `package-lock.json`.
3. Update `CHANGELOG.md` with changes in this release.
4. Commit these changes to your release branch as defined in the section above.
5. Create a new GitHub **Release**, include:
    * a *Tag version*, e.g. `v0.3.4`.
    * the installer artifact from GitHub **Actions** tab as Assets (attached binary)
    * a snapshot of the change log
