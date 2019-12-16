import React from 'react';
import { inject, observer } from 'mobx-react';
import { Radio } from '@blueprintjs/core';
import FileSelector from '../FileSelector';
import ColorPicker from '../ColorPicker';
import { fileFilters } from '../../constants';

const BG = {
  FILE: 'file',
  COLOR: 'color',
};

const DEFAULT_BG_COLOR = '#fff'; // white

@inject('store')
@observer
class BackgroundCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      backgroundOption: BG.FILE,
    };
  }

  setBackgroundOption = backgroundOption => {
    this.setState({ backgroundOption }, () => {
      const { background, setBackground } = this.props.store;
      if (backgroundOption === BG.COLOR && !background.color) {
        setBackground({ color: DEFAULT_BG_COLOR, file: '' });
      }
    });
  };

  onColorPickerChange = color => {
    const {
      store: { setBackground },
    } = this.props;
    setBackground({ file: '', color: color.hex });
  };

  onFileSelected = file => {
    const {
      store: { setBackground },
    } = this.props;
    setBackground({ file, color: '' });
  };

  render() {
    const {
      store: { background },
    } = this.props;
    const { backgroundOption } = this.state;
    return (
      <div>
        <FileSelector
          disabled={backgroundOption !== BG.FILE}
          file={background.file}
          label={
            <Radio
              label='Background file'
              checked={backgroundOption === BG.FILE}
              onChange={() => {
                this.setBackgroundOption(BG.FILE);
              }}
            />
          }
          options={{
            title: 'Select Background File',
            filters: fileFilters.background,
            properties: ['openFile'],
          }}
          onFileSelected={this.onFileSelected}
        />
        <div className='card__option'>
          <div className='card__option-label'>
            <Radio
              label='Background color'
              checked={backgroundOption === BG.COLOR}
              onChange={() => {
                this.setBackgroundOption(BG.COLOR);
              }}
            />
          </div>
          <ColorPicker
            disabled={backgroundOption !== BG.COLOR}
            value={background.color}
            onChange={this.onColorPickerChange}
          />
        </div>
      </div>
    );
  }
}

export default BackgroundCard;
