import React from 'react';
import { useObserver } from 'mobx-react';
import EditPopover, { EditRow } from './EditPopover';
import { useStores } from '../../store';
import ColorPicker from '../ColorPicker';
import { HTMLSelect, Text, Button, ButtonGroup } from '../../blueprint';

const { ipcRenderer } = window.require('electron');

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((n) => ({
  value: n,
  label: `${n}pt`,
}));

export default function FontEditor(props) {
  const { appState } = useStores();
  const [fonts, setFonts] = React.useState();

  React.useEffect(() => {
    ipcRenderer.on('did-finish-getfonts', (event, newFonts) => {
      if (Array.isArray(newFonts)) {
        setFonts(
          newFonts.map((fontName) => ({
            value: fontName,
            lael: fontName,
          })),
        );
      } else {
        console.warn('No fonts for selection', newFonts);
      }
    });
    ipcRenderer.send('did-start-getfonts');
  }, []);

  const setFontFamily = evt => {
    appState.setTextProps({ fontFamily: evt.currentTarget.value });
  };

  const setFontSize = evt => {
    appState.setTextProps({ fontSize: evt.currentTarget.value });
  };

  const setTextColor = color => {
    appState.setTextProps({ color: color.hex });
  };

  const setHighlightColor = color => {
    appState.setTextProps({
      highlightColor: color.hex,
      highlightRGB: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`
    });
  };

  const toggleBold = () => {
    appState.setTextProps({ bold: !appState.text.bold });
  };

  const toggleItalic = () => {
    appState.setTextProps({ italic: !appState.text.italic });
  };

  return useObserver(() => {
    const { text } = appState;
    return (
      <EditPopover icon="font" title='Edit font' {...props}>
        <EditRow>
          <HTMLSelect
            mr={2}
            value={text.fontFamily}
            onChange={setFontFamily}
            options={fonts}
          />
          <HTMLSelect
            mr={2}
            value={text.fontSize}
            onChange={setFontSize}
            options={FONT_SIZES}
          />
          <ColorPicker value={text.color} onChange={setTextColor}/>
        </EditRow>
        <EditRow mt={3}>
          <ButtonGroup mr={3}>
            <Button
              active={text.bold}
              text={<Text bold>B</Text>}
              onClick={toggleBold}
            />
            <Button
              active={text.italic}
              text={<Text italic>i</Text>}
              onClick={toggleItalic}
            />
          </ButtonGroup>
          <Text mr={2}>Highlight:</Text>
          <ColorPicker value={text.highlightColor} onChange={setHighlightColor}/>
        </EditRow>  
      </EditPopover>
    );
  });
}
