import { observable, computed, action } from 'mobx';

class Store {
  @observable
  hearThisFolder = '';

  @observable
  timingFile = '';

  @observable
  background = { file: '', color: '' };

  @observable
  font = '';

  @observable
  fontColor = '#fff';

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
    let chapter = dirs[dirs.length - 1];
    if (chapter === '0') {
      chapter = 'Intro';
    }
    return `${dirs[dirs.length - 2]} ${chapter}.mp4`;
  }

  @computed
  get stepStatus() {
    return [
      !!this.hearThisFolder,
      // !!this.timingFile,
      (!!this.background.file || !!this.background.color),
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
  setBackground(background) {
    this.background = background;
  }

  @action.bound
  setFont(font) {
    this.font = font;
  }

  @action.bound
  setFontColor(fontColor) {
    this.fontColor = fontColor;
  }

  @action.bound
  setOutputFile(file) {
    this.outputFile = file;
  }

  @computed
  get allValidInputs() {
    return (
      this.hearThisFolder &&
      /* this.timingFile && */ 
      (this.background.file || this.background.color) &&
      this.font &&
      this.outputFile
    );
  }
}

export default Store;
