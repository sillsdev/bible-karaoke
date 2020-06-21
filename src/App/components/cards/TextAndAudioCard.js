import React from 'react';
import { HTMLSelect, Callout, Intent, Button } from '@blueprintjs/core';
import { inject, observer } from 'mobx-react';
const { ipcRenderer } = window.require('electron');

const noSelection = -1;
const emptyOption = { value: noSelection, label: 'Select....' };

@inject('store')
@observer
class TextAndAudioCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedProject: noSelection,
      selectedBook: noSelection,
      selectedChapter: noSelection,
    };
    ipcRenderer.on('did-finish-getprojectstructure', (event, projects) => {
      console.log('Received project structure', projects);
      this.props.store.setProjects(projects);
      this.setState(
        {
          selectedProject: noSelection,
          selectedBook: noSelection,
          selectedChapter: noSelection,
        },
        () => {
          this.checkSingleProject();
        },
      );
    });
    ipcRenderer.send('did-start-getprojectstructure');
  }

  refreshProject = () => {
    ipcRenderer.send('did-start-getprojectstructure');
  };

  selectProject = evt => {
    this.setState(
      {
        selectedProject: parseInt(evt.currentTarget.value, 10),
        selectedBook: noSelection,
        selectedChapter: noSelection,
      },
      () => {
        this.checkSingleBook();
      },
      () => {
        this.checkFolder();
      },
    );
  };

  selectBook = evt => {
    this.setState(
      {
        selectedBook: parseInt(evt.currentTarget.value, 10),
        selectedChapter: noSelection,
      },
      () => {
        this.checkSingleChapter();
      },
      () => {
        this.checkFolder();
      },
    );
  };

  selectChapter = evt => {
    this.setState(
      {
        selectedChapter: parseInt(evt.currentTarget.value, 10),
      },
      () => {
        this.checkFolder();
      },
    );
  };

  checkSingleProject = () => {
    const projects = this.props.store.projects;
    if (projects.length === 1) {
      this.setState(
        {
          selectedProject: 0,
        },
        () => {
          this.checkSingleBook();
        },
      );
    }
  };

  checkSingleBook = () => {
    const selectedProject = this.state.selectedProject;
    const projects = this.props.store.projects;
    if (selectedProject !== noSelection
        && projects[selectedProject].books.length === 1) {
      this.setState(
        {
          selectedBook: 0,
        },
        () => {
          this.checkSingleChapter();
        },
      );
    }
  };

  checkSingleChapter = () => {
    const { selectedProject, selectedBook } = this.state;
    const projects = this.props.store.projects;
    if (selectedBook !== noSelection &&
      projects[selectedProject].books[selectedBook].chapters.length === 1) {
      this.setState(
        {
          selectedChapter: 0,
        },
        () => {
          this.checkFolder();
        },
      );
    }
  };

  checkFolder = () => {
    const { selectedProject, selectedBook, selectedChapter } = this.state;
    const {
      store: { projects, setSourceDirectory },
    } = this.props;
    if (selectedChapter !== noSelection) {
      const hearThisChapterFolder =
      projects[selectedProject].books[selectedBook].chapters[
          selectedChapter
        ].fullPath;
        setSourceDirectory(hearThisChapterFolder);
    } else {
      setSourceDirectory(undefined);
    }
  };

  render() {
    const { selectedProject, selectedBook, selectedChapter } = this.state;
    const {
      store: { projects },
    } = this.props;
    const projectOptions = projects.map((p, index) => ({
      value: index,
      label: p.name,
    }));
    const bookOptions =
      selectedProject !== noSelection
        ? projects[selectedProject].books.map((p, index) => ({
            value: index,
            label: p.name,
          }))
        : [];
    const chapterOptions =
      selectedBook !== noSelection
        ? projects[selectedProject].books[selectedBook].chapters.map(
            (p, index) => ({
              value: index,
              label: p.name,
            }),
          )
        : [];
    if (!projects.length) {
      return (
        <Callout title='No HearThis projects found' intent={Intent.WARNING}>
          Bible Karaoke was unable to locate any HearThis projects. Make sure{' '}
          <a href='https://software.sil.org/hearthis/'>HearThis</a> is installed
          and you have at least one project with audio for at least one chapter
          of one book.
        </Callout>
      );
    }
    return (
      <div>
        <div className='card__option'>
          <div className='card__option-label'>Project</div>
          <div className='card--inline'>
            <HTMLSelect
              value={selectedProject}
              onChange={this.selectProject}
              options={[emptyOption].concat(projectOptions)}
            />
            <Button icon='refresh' onClick={this.refreshProject} />
          </div>
        </div>
        <div className='card__option'>
          <div className='card__option-label'>Book</div>
          <HTMLSelect
            disabled={selectedProject === -1}
            value={selectedBook}
            onChange={this.selectBook}
            options={[emptyOption].concat(bookOptions)}
          />
        </div>
        <div className='card__option'>
          <div className='card__option-label'>Chapter</div>
          <HTMLSelect
            disabled={selectedBook === -1}
            value={selectedChapter}
            onChange={this.selectChapter}
            options={[emptyOption].concat(chapterOptions)}
          />
        </div>
      </div>
    );
  }
}

export default TextAndAudioCard;
