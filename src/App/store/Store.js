import { observable, computed, action } from "mobx";

class Store {
  @observable 
  hearThisFolder = '';
  
  @observable 
  timingFile = '';
  
  @observable 
  backgroundFile = '';

  @observable
  font = '';

  @observable 
  outputFile = '';

  @observable
  hearThisProjects = [];

  @computed
  get defaultVideoName() {
    if (!this.hearThisFolder) {
      return 'bible-karaoke.mp4';
    }
    // Name the video by book and chapter (e.g. 'Mark2.mp4')
    const dirs = this.hearThisFolder.split(/[/\\]/);
    return `${dirs[dirs.length - 2]}${dirs[dirs.length - 1]}.mp4`;
  }

  @computed
  get stepStatus() {
    return [
      !!this.hearThisFolder,
      // !!this.timingFile,
      !!this.backgroundFile,
      !!this.font,
      !!this.outputFile,
    ];
  }

  @action.bound
  setHearThisProjects(projects) {
    this.hearThisProjects = projects;
    this.hearThisFolder = '';
  }

  @action.bound
  setHearThisFolder(folder) {
    this.hearThisFolder = folder;
  }

  @action.bound
  setTimingFile(file) {
    this.timingFile = file;
  }
  
  @action.bound
  setBackgroundFile(file) {
    this.backgroundFile = file;
  }
  
  @action.bound
  setFont(font) {
    this.font = font;
  }

  @action.bound
  setOutputFile(file) {
    this.outputFile = file;
  }

  @computed
  get allValidInputs() {
    return this.hearThisFolder && /* this.timingFile && */ this.backgroundFile && this.font && this.outputFile;
  }
}

export default Store;