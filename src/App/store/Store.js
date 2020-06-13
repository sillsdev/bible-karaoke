import { observable, computed, action } from 'mobx';
import every from 'lodash/every';
const { ipcRenderer, remote } = window.require('electron');
var fs = remote.require('fs');

const SAMPLE_VERSES = [
  "In the beginning, God created the heavens and the earth.",
  "The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.",
  "And God said, \"Let there be light,\" and there was light.",
  "And God saw that the light was good. And God separated the light from the darkness.",
  "God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.",
];

class Store {
  constructor() {
    ipcRenderer.on('did-finish-getverses', (event, verses) => {
      if (Array.isArray(verses)) {
        this.setVerses(verses);
      } else {
        console.error('Failed to set verses', verses);
      }
    });
    this.getSpeechBubbleProps();
    this.getTextLocation();
    this.getBackground();
    this.getTextProps();
  }
  @observable
  hearThisFolder = '';

  @observable
  verses = SAMPLE_VERSES;

  @observable
  timingFile = '';

  @observable
  textLocation = {
    location: 'subtitle'
  };

  @observable
  background = { file: '', color: '#CCC' };

  @observable
  text = {
    fontFamily: 'Arial',
    fontSize: 20,
    color: '#555',
    bold: false,
    italic: false,
    highlightColor: 'yellow',
    highlightRGB: 'rgba(255,255,0,1)'
  };

  @observable
  speechBubble = {
    color: '#FFF',
    rgba: 'rgba(255,255,255,1)',
    opacity: 1,
  };

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
      (!!this.background.file || !!this.background.color) && this.text.fontFamily,
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
    if (folder) {
      ipcRenderer.send('did-start-getverses', { hearThisFolder: folder });
    } else {
      this.setVerses(SAMPLE_VERSES);
    }
  }

  @action.bound
  setVerses(verses) {
    this.verses = verses;
  }

  @action.bound
  setTimingFile(file) {
    this.timingFile = file;
  }

  @action.bound
  getTextLocation() {
    if (localStorage.textLocation) {
      this.setTextLocation(JSON.parse(localStorage.textLocation));
    }
  }

  @action.bound
  setTextLocation(textLocationProps) {
    this.textLocation = {...this.textLocation, ...textLocationProps};
    this.saveLocalProperties("textLocation", textLocationProps);
  }

  @action.bound
  getBackground() {
    if (localStorage.background) {
      this.setBackground(JSON.parse(localStorage.background));
    }
  }

  @action.bound
  setBackground(background) {
    this.background = background;
    if (this.background.file) {
      const ext = this.background.file.split('.').pop();
      if (['mpeg4', 'mp4', 'webm'].includes(ext)) {
        this.background.type = 'video';
      } else {
        this.background.type = 'image';
        const img = fs.readFileSync(this.background.file).toString('base64');
        this.background.imageSrc = `data:image/${ext};base64,${img}`;
      }
    } else {
      this.background.imageSrc = '';
      this.background.type = 'color';
    }
    this.saveLocalProperties("background", background);
  }
  
  @action.bound
  getTextProps() {
    if (localStorage.text) {
      this.setTextProps(JSON.parse(localStorage.text));
    }
  }

  @action.bound
  setTextProps(textProps) {
    this.text = {...this.text, ...textProps};
    this.saveLocalProperties("text", textProps);
  }
  
  @action.bound
  saveLocalProperties(object, properties) {
    var localObject = JSON.parse(localStorage[object] || "{}");
    Object.keys(properties).forEach((atr)=>{
      localObject[atr] = properties[atr];
    })
    localStorage[object] = JSON.stringify(localObject);
  }

  @action.bound
  getSpeechBubbleProps() {
    if (localStorage.speechBubble) {
      this.setSpeechBubbleProps(JSON.parse(localStorage.speechBubble));
    }
  }

  @action.bound
  setSpeechBubbleProps(speechBubbleProps) {
    this.speechBubble = {...this.speechBubble, ...speechBubbleProps};
    this.saveLocalProperties("speechBubble", speechBubbleProps);
  }
  
  @action.bound
  setOutputFile(file) {
    this.outputFile = file;
  }

  @computed
  get allValidInputs() {
    return every(this.stepStatus, s => s);
  }
}

export default Store;
