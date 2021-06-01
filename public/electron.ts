import { app, ipcMain, shell, Menu, BrowserWindow, Event, IpcMainEvent } from 'electron';
import { map, flatten } from 'lodash';
import fontList from 'font-list';
import path from 'path';
import isDev from 'electron-is-dev';
import SourceIndex from './sources/index';
import { Project, getSampleVerses } from './sources/util';
import { Verses } from './models/verses.model';

let mainWindow: BrowserWindow | null;

export function createWindow(): void {
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

  mainWindow.on('closed', (): void => {
    mainWindow = null;
  });
  mainWindow.webContents.on('will-navigate', (event: Event, url: string): void => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

export function handleGetFonts(): void {
  ipcMain.on(
    'did-start-getfonts',
    async (event: IpcMainEvent): Promise<void> => {
      console.log('Getting system fonts');
      try {
        const fonts = await fontList.getFonts();
        event.sender.send(
          'did-finish-getfonts',
          // Font names with spaces are wrapped in quotation marks
          fonts.map((font: string) => font.replace(/^"|"$/g, '')).sort()
        );
      } catch (err) {
        event.sender.send('did-finish-getfonts', err);
      }
    }
  );
}

export function handleGetSampleVerses(): void {
  ipcMain.on('did-start-getverses', (event: IpcMainEvent, args: Verses): void => {
    const { sourceDirectory } = args;
    console.log('Getting sample verses', sourceDirectory);
    const verses = getSampleVerses(sourceDirectory);
    console.log('Got sample verses', verses);
    event.sender.send('did-finish-getverses', verses);
  });
}

// NOTE: RootDirectories type is the [rootDirectories] property of App/store/Settings.js
// {
//   [constants.js - PROJECT_TYPE.hearThis]: string[]
//   [constants.js - PROJECT_TYPE.scriptureAppBuilder]: string[]
// }
interface RootDirectories {
  hearThis: string[];
  scriptureAppBuilder: string[];
}

export function handleGetProjects(): void {
  ipcMain.on('did-start-getprojectstructure', (event: IpcMainEvent, rootDirectories: RootDirectories): void => {
    const projects = flatten(
      map(rootDirectories, (directories: string[], projectType: string): Project[] => {
        // .getProjectStructure is in /public/sources/hear-this.ts or scripture-app-builder.ts
        const project = SourceIndex.getProject(projectType);
        return project != null ? project.getProjectStructure(directories) : [];
      })
    );
    event.sender.send('did-finish-getprojectstructure', projects);
  });
}

export function handleSubmission(): void {
  ipcMain.on('did-start-conversion', async (event: IpcMainEvent, args: string[]) => {
    // TODO: implement conversion process here
    event.sender.send('did-finish-conversion', []);
  });
}

app.on('ready', (): void => {
  createWindow();
  handleGetProjects();
  handleGetSampleVerses();
  handleGetFonts();
});

app.on('window-all-closed', (): void => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', (): void => {
  if (mainWindow === null) {
    createWindow();
  }
});
