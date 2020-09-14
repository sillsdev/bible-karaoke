const electron = require('electron');
const map = require('lodash/map');
const flatten = require('lodash/flatten');
const fontList = require('font-list');
const karaoke = require('./karaoke');
const sources = require('./sources');
const { getSampleVerses } = require('./sources/util');

const { app, ipcMain, shell, Menu } = electron;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 970,
    webPreferences: { nodeIntegration: true, webSecurity: false, enableRemoteModule: true },
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    // Open the DevTools.
    // session.defaultSession.loadExtension('C:/Users/graha/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.8.2_0');
    // BrowserWindow.addDevToolsExtension('C:/Users/graha/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.8.2_0');
    mainWindow.webContents.openDevTools();
  } else {
    Menu.setApplicationMenu(null);
  }

  mainWindow.maximize();

  mainWindow.on('closed', () => (mainWindow = null));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

function handleGetFonts() {
  ipcMain.on('did-start-getfonts', async (event) => {
    console.log('Getting system fonts');
    fontList
      .getFonts()
      .then((fonts) => {
        event.sender.send(
          'did-finish-getfonts',
          // Font names with spaces are wrapped in quotation marks
          fonts.map((font) => font.replace(/^"|"$/g, '')).sort()
        );
      })
      .catch((err) => {
        event.sender.send('did-finish-getfonts', err);
      });
  });
}

function handleGetSampleVerses() {
  ipcMain.on('did-start-getverses', async (event, args) => {
    const { sourceDirectory } = args;
    console.log('Getting sample verses', sourceDirectory);
    const verses = getSampleVerses(sourceDirectory);
    console.log('Got sample verses', verses);
    event.sender.send('did-finish-getverses', verses);
  });
}

function handleGetProjects() {
  ipcMain.on('did-start-getprojectstructure', async (event, rootDirectories) => {
    const projects = flatten(
      map(rootDirectories, (directories, projectType) => {
        return sources[projectType].getProjectStructure(directories);
      })
    );
    event.sender.send('did-finish-getprojectstructure', projects);
  });
}

function handleSubmission() {
  ipcMain.on('did-start-conversion', async (event, args) => {
    const onProgress = (args) => {
      event.sender.send('on-progress', args);
    };
    console.log('Starting command line', args);
    let result;
    try {
      result = await karaoke.execute({ ...args, onProgress });
    } catch (err) {
      result = err;
    }

    let retArgs = { error: { message: '[unknown response]' } };
    if (result) {
      retArgs =
        typeof result === 'string'
          ? { outputDirectory: null } // TODO!
          : { error: { message: result.message, stack: result.stack } };
    }
    console.log('Command line process finished', retArgs);
    if (retArgs.outputDirectory) {
      shell.openPath(retArgs.outputDirectory);
    }
    event.sender.send('did-finish-conversion', retArgs);
  });
}

app.on('ready', () => {
  createWindow();
  handleSubmission();
  handleGetProjects();
  handleGetSampleVerses();
  handleGetFonts();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
