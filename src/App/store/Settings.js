import { observable, computed, action } from 'mobx';
import os from 'os';
import path from 'path';
import { persist } from 'mobx-persist';
import { PROJECT_TYPE } from '../constants';

export const getDefaultHearThisDirectory = () => {
  switch (process.platform) {
    case 'win32':
      return 'C:\\ProgramData\\SIL\\HearThis\\';
    case 'darwin':
    default:
      return `${os.homedir()}/hearThisProjects/`;
  }
}

export const getDefaultScriptureAppBuilderDirectory = () => {
  switch (process.platform) {
    case 'win32':
      return path.join(os.homedir(), 'Documents', 'App Builder', 'Scripture Apps', 'App Projects');
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

  @persist
  @observable
  enableAnalytics = false;

  @computed({ keepAlive: true })
  get rootDirectories() {
    return {
      [PROJECT_TYPE.hearThis]: this.hearThisRootDirectories.slice(),
      [PROJECT_TYPE.scriptureAppBuilder]: this.scriptureAppBuilderRootDirectories.slice()
    }
  }

  @action.bound
  setHearThisRootDirectories(directories) {
    this.hearThisRootDirectories = directories
  }
  
  @action.bound
  setScriptureAppBuilderRootDirectories(directories) {
    this.scriptureAppBuilderRootDirectories = directories
  }

  @action.bound
  setEnableAnalytics(enableAnalytics) {
    this.enableAnalytics = enableAnalytics;
  }
}

export default Settings;