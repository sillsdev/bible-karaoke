import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { useObserver } from 'mobx-react';
import { Intent } from '@blueprintjs/core';
import { Flex } from 'reflexbox';
import { useStores } from '../store';
import { Button, Text, Icon } from '../blueprint';

const ActionButton = styled(Button).attrs({
  p: 4, m: 3
}) `
  width: 440px;
  .bp3-button-text {
    flex: 1;
  }
`
const ButtonContent = styled(Flex).attrs({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'row',
}) ``

const ActionIcon = styled(Icon).attrs({
  iconSize: 48,
  flex: 0,
}) ``

const TextWrapper = styled(Flex).attrs({
  flex: 1,
  ml: 4,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}) ``

export default function Actions() {
  const { appState } = useStores();

  const onGenerateVideo = React.useCallback((combined) => {
    appState.generateVideo(combined)
  }, [ appState ]);

  return useObserver(() => {
    const totalChapterCount = _.get(appState, [ 'projects', 'activeProject', 'selectedChapterCount' ], 0)
    if (totalChapterCount === 0) {
      return null;
    }
    return (
      <Flex alignItems="center" justifyContent="center" flexDirection="column">
        <ActionButton
          disabled={totalChapterCount === 1}
          onClick={() => onGenerateVideo(false)} 
        >
          <ButtonContent>
            <ActionIcon icon="applications" />
            <TextWrapper>
              <Text fontSize="200%">
                Generate {totalChapterCount} video{totalChapterCount > 1 ? 's' : ''}
              </Text>
              <Text mt={2}>
                (One video per chapter)
              </Text>
            </TextWrapper>
          </ButtonContent>
        </ActionButton>
        <ActionButton
          intent={Intent.PRIMARY}
          onClick={() => onGenerateVideo(true)}
        >
          <ButtonContent>
            <ActionIcon icon="application" />
            <TextWrapper>
              <Text fontSize="200%">
                Generate a single video
              </Text>
              <Text mt={2}>
                ({totalChapterCount} chapter{totalChapterCount > 1 ? 's' : ''})
              </Text>
            </TextWrapper>
          </ButtonContent>
        </ActionButton>
      </Flex>
    ) 
  })
}
