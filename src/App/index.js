import React from 'react';
import { inject, observer } from 'mobx-react';
import { Intent, Tooltip, Position, Drawer, Button, H1, H6, Classes, Callout, ProgressBar } from '@blueprintjs/core';
import { version } from '../../package.json';
import Accordion from './components/Accordion';
import { cards } from './components/cards';
import ActionButton from './components/ActionButton';
import Settings from './components/Settings';
import './index.scss';
import { trackScreenview, trackEvent, trackError } from './analytics';
const { ipcRenderer } = window.require('electron');

const AppStatus = {
  configuring: 'configuring',
  processing: 'processing',
  done: 'done',
  error: 'error',
};

@inject('appState')
@observer
class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false,
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
        trackError(args.error);
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

  showSettings = () => {
    this.setState({ drawerOpen: true })
  }
  
  hideSettings = () => {
    this.setState({ drawerOpen: false })
  }

  openOutputFolder = () => {
    const { outputFile } = this.props.appState;
    ipcRenderer.send('open-output-folder', outputFile);
    this.reset();
  };

  onStart = () => {
    this.setState({ status: AppStatus.processing }, () => {
      const { sourceDirectory, textLocation, background, text, speechBubble, outputFile } = this.props.appState;
      const args = {
        sourceDirectory,
        textLocation,
        background,
        text,
        speechBubble,
        output: outputFile,
      };
      // IPC arguments cannot be objects, but Store returns value objects
      const structuredArgs = JSON.parse(JSON.stringify(args));
      console.log('Requesting processing', structuredArgs);
      ipcRenderer.send('did-start-conversion', structuredArgs);
      trackEvent('Button Click', 'Create Video');
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
      appState: { allValidInputs },
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
    const {
      status,
      drawerOpen
    } = this.state;
    return (
      <div className='app bp3-dark'>
        <div className='app__container'>
          <div className='app__header'>
            <H1>Bible Karaoke</H1>
            <Tooltip className="app__settings-btn" content="Settings" position={Position.TOP}>
              <Button
                disabled={status === AppStatus.processing}
                minimal
                onClick={this.showSettings}
                icon='cog'
              />
            </Tooltip>
          </div>
          <div className="app__info">Version {version}</div>
          <Accordion cards={cards} />
          <div className='app__footer'>{this.renderFooter()}</div>
        </div>
        <Drawer
          className={Classes.DARK}
          isOpen={drawerOpen}
          onClose={this.hideSettings}
          icon='cog'
          title="Settings"
          position={Position.RIGHT}
        >
          <Settings />
        </Drawer>
      </div>
    );
  }

  componentDidMount() {
    trackScreenview('Home');
  }
}

export default App;
