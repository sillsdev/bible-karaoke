import { observable, computed, action } from 'mobx';
import os from 'os';
import path from 'path';
import { persist } from 'mobx-persist';
import { PROJECT_TYPE, DEFAULT_OUTPUT_DIRECTORY } from '../constants';

export const getDefaultHearThisDirectory = () => {
  switch (process.platform) {
    case 'win32':
      return 'C:\\ProgramData\\SIL\\HearThis\\';
    case 'darwin':
    default:
      return `${os.homedir()}/hearThisProjects/`;
  }
};

export const getDefaultScriptureAppBuilderDirectory = () => {
  switch (process.platform) {
    case 'win32':
      return path.join(os.homedir(), 'Documents', 'App Builder', 'Scripture Apps', 'App Projects');
    case 'darwin':
    default:
      return `${os.homedir()}/Documents/AppBuilder/Scripture Apps/App Projects/`;
  }
};

class Settings {
  constructor(root) {
    this.root = root;
  }

  @persist('list')
  @observable
  hearThisRootDirectories = [getDefaultHearThisDirectory()];

  @persist('list')
  @observable
  scriptureAppBuilderRootDirectories = [getDefaultScriptureAppBuilderDirectory()];

  @persist
  @observable
  outputDirectory = DEFAULT_OUTPUT_DIRECTORY;

  @persist
  @observable
  enableAnalytics = false;

  @computed({ keepAlive: true })
  get rootDirectories() {
    return {
      [PROJECT_TYPE.hearThis]: this.hearThisRootDirectories.slice(),
      [PROJECT_TYPE.scriptureAppBuilder]: this.scriptureAppBuilderRootDirectories.slice(),
    };
  }

  @action.bound
  setHearThisRootDirectories(directories) {
    this.hearThisRootDirectories = directories;
  }

  @action.bound
  setScriptureAppBuilderRootDirectories(directories) {
    this.scriptureAppBuilderRootDirectories = directories;
  }

  @action.bound
  setOutputDirectory(outputDirectory) {
    this.outputDirectory = outputDirectory;
  }

  @action.bound
  setEnableAnalytics(enableAnalytics) {
    this.enableAnalytics = enableAnalytics;
  }
}

export default Settings;
