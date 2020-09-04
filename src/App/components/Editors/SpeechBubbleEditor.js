import React from 'react';
import { useObserver } from 'mobx-react';
import { Slider } from '@blueprintjs/core';
import { Box } from 'reflexbox';
import EditPopover, { EditRow } from './EditPopover';
import { useStores } from '../../store';
import ColorPicker from '../ColorPicker';
import { Text } from '../../blueprint';

export default function SpeechBubbleEditor(props) {
  const { appState } = useStores();
 
  const setSpeechBubbleColor = color => {
    appState.setSpeechBubbleProps({
      color: color.hex,
      rgba: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`,
    });
  };

  const setSpeechBubbleOpacity = opacity => {
    appState.setSpeechBubbleProps({ opacity });
  };
  
  return useObserver(() => {
    const { speechBubble } = appState;
    return (
      <EditPopover title='Edit verse background' {...props}>
        <EditRow>
          <ColorPicker
            mr={3}
            value={speechBubble.color}
            onChange={setSpeechBubbleColor}
          />
          <Text mr={4}>Opacity:</Text>
          <Box mr={3} maxWidth="200px">
            <Slider
              value={speechBubble.opacity}
              min={0}
              max={1}
              stepSize={0.05}
              onChange={setSpeechBubbleOpacity}
            />
          </Box>
        </EditRow>  
      </EditPopover>
    );
  });
}
