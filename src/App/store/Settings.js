import { observable, computed, action } from 'mobx';
import os from 'os';
import { persist } from 'mobx-persist';
const { ipcRenderer } = window.require('electron');

// HACK: These values must match the PROJECT_TYPE values in public/sources/*.js
const HEAR_THIS_PROJECT_TYPE = 'hearThis'
const SCRIPTURE_APP_BUILDER_PROJECT_TYPE = 'scriptureAppBuilder'

const getDefaultHearThisDirectory = () => {
  switch (process.platform) {
    case 'win32':
      return 'C:/ProgramData/SIL/HearThis/';
    case 'darwin':
    default:
      return `${os.homedir()}/hearThisProjects/`;
  }
}

const getDefaultScriptureAppBuilderDirectory = () => {
  switch (process.platform) {
    case 'win32':
      return '%UserProfile%/Documents/App Builder/Scripture Apps/App Projects/';
    case 'darwin':
    default:
      return `${os.homedir()}/App Builder/Scripture Apps/App Projects/`;
  }
}

class Settings {

  @persist('list')
  @observable
  hearThisRootDirectories = [ getDefaultHearThisDirectory() ]

  @persist('list')
  @observable
  scriptureAppBuilderRootDirectories = [ getDefaultScriptureAppBuilderDirectory() ]

  @computed
  get rootDirectories() {
    return {
      [HEAR_THIS_PROJECT_TYPE]: this.hearThisRootDirectories.slice(),
      [SCRIPTURE_APP_BUILDER_PROJECT_TYPE]: this.scriptureAppBuilderRootDirectories.slice()
    }
  }

  @action.bound
  setHearThisRootDirectories(directories) {
    this.hearThisRootDirectories = directories
    ipcRenderer.send('did-start-getprojectstructure', this.rootDirectories);
  }
  
  @action.bound
  setScriptureAppBuilderRootDirectories(directories) {
    this.scriptureAppBuilderRootDirectories = directories
    ipcRenderer.send('did-start-getprojectstructure', this.rootDirectories);
  }
}

export default Settings;