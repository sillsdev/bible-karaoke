import React from 'react';
import { inject, observer } from 'mobx-react';
import { Intent, H1, H6, Classes, Callout, ProgressBar } from '@blueprintjs/core';
import { version } from '../../package.json';
import Accordion from './components/Accordion';
import { cards } from './components/cards';
import ActionButton from './components/ActionButton';
import './index.scss';
const { ipcRenderer } = window.require('electron');

const AppStatus = {
  configuring: 'configuring',
  processing: 'processing',
  done: 'done',
  error: 'error',
};

@inject('store')
@observer
class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: AppStatus.configuring,
      progress: undefined,
      error: undefined,
    };
    ipcRenderer.on('did-finish-conversion', (event, args) => {
      console.log('Received result', args);
      if (args.outputFile) {
        this.setState({ status: AppStatus.done });
      } else {
        this.setState({
          status: AppStatus.error,
          error: args.error,
        });
      }
    });
    ipcRenderer.on('on-progress', (event, args) => {
      this.setState({ progress: args });
    });
  }

  reset = () => {
    this.setState({
      status: AppStatus.configuring,
      progress: undefined,
      error: undefined,
    });
  };

  openOutputFolder = () => {
    const { outputFile } = this.props.store;
    ipcRenderer.send('open-output-folder', outputFile);
    this.reset();
  };

  onStart = () => {
    this.setState({ status: AppStatus.processing }, () => {
      const { hearThisFolder, textLocation, background, text, speechBubble, outputFile } = this.props.store;
      const args = {
        hearThisFolder,
        textLocation,
        background,
        text,
        speechBubble,
        output: outputFile,
      };
      console.log('Requesting processing', args);
      ipcRenderer.send('did-start-conversion', args);
    });
  };

  renderProgress() {
    const { progress } = this.state;
    return (
      <div  className="app__footer-progress">
        <p>{progress ? progress.status : 'Getting things started...'}</p>
        <ProgressBar intent={Intent.PRIMARY} value={progress ? progress.percent/100 : 0} />
      </div>
    );
  }

  renderFooter() {
    const {
      store: { allValidInputs },
    } = this.props;
    const { error, status } = this.state;
    switch(status) {
      case AppStatus.done:
        return (
          <div className="app__footer-success">
            <p className={Classes.TEXT_LARGE}>Your Bible Karaoke video has been created!</p>
            <ActionButton
              large
              intent={Intent.PRIMARY}
              text='Open output folder'
              onClick={this.openOutputFolder}
            />
            <ActionButton large onClick={this.reset} text='Make another video...' />
          </div>
        );
      case AppStatus.error:
        return (
          <div className="app__footer-wrapper">
            {this.renderProgress()}
            <Callout title='Uh-oh!' intent={Intent.DANGER}>
              <p>Looks like something went wrong.</p>
              <H6>Details</H6>
              <p className={Classes.TEXT_MUTED}>{error.message}</p>
              <p className={Classes.TEXT_MUTED}>{error.stack}</p>
              <ActionButton onClick={this.reset} text='OK' />
            </Callout>
          </div>
        );
      case AppStatus.processing:
        return this.renderProgress();
      case AppStatus.configuring:
      default:
        return (
          <ActionButton
            large
            intent={Intent.PRIMARY}
            disabled={!allValidInputs}
            text='Make my video!'
            onClick={this.onStart}
          />
        );
    }
  }

  render() {
    return (
      <div className='app bp3-dark'>
        <div className='app__container'>
          <H1>Bible Karaoke</H1>
          <div className="app__info">Version {version}</div>
          <Accordion cards={cards} />
          <div className='app__footer'>{this.renderFooter()}</div>
        </div>
      </div>
    );
  }
}

export default App;
