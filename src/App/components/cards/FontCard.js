import React from 'react';
import { inject, observer } from 'mobx-react';
import { HTMLSelect } from '@blueprintjs/core';
const { ipcRenderer } = window.require('electron');

const noSelection = '';
const emptyOption = { value: noSelection, label: 'Select....' };

@inject('store')
@observer
class FontCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fonts: [],
    };
    ipcRenderer.on('did-finish-getfonts', (event, fonts) => {
      if (Array.isArray(fonts)) {
        console.log('Received fonts', fonts);
        this.setState({
          fonts: fonts.map(fontName => ({
            value: fontName,
            lael: fontName,
          })),
        });
      } else {
        console.log('No fonts for selection', fonts);
      }
    });
    ipcRenderer.send('did-start-getfonts');
  }

  selectFont = evt => {
    const {
      store: { setFont },
    } = this.props;
    setFont(evt.currentTarget.value);
  };

  render() {
    const {
      store: { font },
    } = this.props;
    const { fonts } = this.state;
    return (
      <div>
        <div className='card__option'>
          <div className='card__option-label'>Font</div>
          <HTMLSelect
            value={font}
            onChange={this.selectFont}
            options={[emptyOption].concat(fonts)}
          />
        </div>
      </div>
    );
  }
}

export default FontCard;
