const electron = require('electron');
const reduce = require('lodash/reduce');
const fontList = require('font-list');
const karaoke = require('./karaoke');
const sources = require('./sources')
const { getSampleVerses } = require('./sources/util')

const { app, ipcMain, shell, Menu } = electron;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 880,
    height: 970,
    webPreferences: { nodeIntegration: true, webSecurity: false },
  });
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  );
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  } else {
    Menu.setApplicationMenu(null);
  }

  mainWindow.on('closed', () => (mainWindow = null));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

function handleGetFonts() {
  ipcMain.on('did-start-getfonts', async event => {
    console.log('Getting system fonts');
    fontList
      .getFonts()
      .then(fonts => {
        event.sender.send(
          'did-finish-getfonts',
          // Font names with spaces are wrapped in quotation marks
          fonts.map(font => font.replace(/^"|"$/g, '')).sort(),
        );
      })
      .catch(err => {
        event.sender.send('did-finish-getfonts', err);
      });
  });
}

function handleGetSampleVerses() {
  ipcMain.on('did-start-getverses', async (event, args) => {
    const { sourceDirectory } = args;
    const verses = getSampleVerses(sourceDirectory);
    event.sender.send('did-finish-getverses', verses);
  });
}

function handleGetProjects() {
  ipcMain.on('did-start-getprojectstructure', async event => {
    console.log('Getting project structure');
    const projects = reduce(sources, (acc, source) => {
      acc.push(...source.getProjectStructure())
      return acc
    }, [])
    event.sender.send('did-finish-getprojectstructure', projects);
  });
}

function handleOpenOutputFolder() {
  ipcMain.on('open-output-folder', async (event, outputFile) => {
    shell.showItemInFolder(outputFile);
  });
}

function handleSubmission() {
  ipcMain.on('did-start-conversion', async (event, args) => {
    const onProgress = args => {
      event.sender.send('on-progress', args);
    };
    console.log('Starting command line', args);
    let result;
    try {
      result = await karaoke.execute({ ...args, onProgress });
    } catch (err) {
      result = err;
    }

    let retArgs = { error: { message: "[unknown response]" } };
    if (result) {
      retArgs =
        typeof result === 'string'
          ? { outputFile: result }
          : { error: { message: result.message, stack: result.stack } };
    }
    console.log('Command line process finished', retArgs);
    event.sender.send('did-finish-conversion', retArgs);
  });
}

app.on('ready', () => {
  createWindow();
  handleSubmission();
  handleGetProjects();
  handleGetSampleVerses();
  handleGetFonts();
  handleOpenOutputFolder();
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
