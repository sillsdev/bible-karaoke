import React from 'react';
import styled from 'styled-components';
import { useObserver } from 'mobx-react';
import EditPopover, { EditRow } from './EditPopover';
import { Radio } from '../../blueprint';
import { fileFilters } from '../../constants';
import { useStores } from '../../store';
import ColorPicker from '../ColorPicker';
import FileSelector from '../FileSelector';

const BG = {
  FILE: 'file',
  COLOR: 'color',
};

const DEFAULT_BG_COLOR = '#CCC'; // gray

const EditRadio = styled(Radio).attrs({
  width: 100,
  mr: 3,
  mb: 0,
})``

export default function BackgroundEditor(props) {
  const { appState } = useStores()
  
  const setBackgroundOption = React.useCallback((backgroundOption) => {
    appState.setBackground({
      color: backgroundOption === BG.COLOR ? DEFAULT_BG_COLOR : '',
      file: '',
    });
  }, [ appState ])

  const setBackgroundFile = React.useCallback((file) => {
    appState.setBackground({ file, color: '' });
  }, [ appState ])

  const setBackgroundColor = React.useCallback((color) => {
    appState.setBackground({ file: '', color: color.hex });
  }, [ appState ])

  return useObserver(() => {
    const {
      background
    } = appState;
    return (
      <EditPopover title="Edit background" {...props}>
        <EditRow>
          <EditRadio label="Image" checked={!background.color} onChange={() => { setBackgroundOption(BG.FILE); }}/>
          <FileSelector
            disabled={!!background.color}
            file={background.file}
            options={{
              title: 'Select Background File',
              filters: fileFilters.background,
              properties: ['openFile'],
            }}
            onFileSelected={setBackgroundFile}
          />
        </EditRow>
        <EditRow mt={3}>
          <EditRadio label='Solid color' checked={!!background.color} onChange={() => { setBackgroundOption(BG.COLOR); }} />
          <ColorPicker
            disabled={background.color === ''}
            value={background.color}
            onChange={setBackgroundColor}
          />
        </EditRow>
      </EditPopover>
    )
  })
}