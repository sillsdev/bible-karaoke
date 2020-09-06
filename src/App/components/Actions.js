import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { useObserver } from 'mobx-react';
import { Intent } from '@blueprintjs/core';
import { Flex, Box } from 'reflexbox';
import { useStores } from '../store';
import { Button, Text, Icon } from '../blueprint';
import AnimatedVisibility from './AnimatedVisibility';
import { useAnalytics } from './Analytics';

const ProgressIndicator = styled(Box)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  ${({ percent }) => {
    return `right: ${100 - percent}%;`;
  }}
  background-color: rgba(0,0,0,0.2);
`;

const ActionButton = styled(Button).attrs({
  p: 0,
  m: 3,
})`
  position: relative;
  width: 440px;
  .bp3-button-text {
    flex: 1;
  }
`;

const ButtonContent = styled(Flex).attrs({
  p: 4,
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'row',
})`
  position: relative;
`;

const ActionIcon = styled(Icon).attrs({
  iconSize: 48,
  flex: 0,
})``;

const TextWrapper = styled(Flex).attrs({
  flex: 1,
  ml: 4,
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
})``;

const ProgressText = ({ progress }) => {
  if (progress.error) {
    return <Text>{progress.error.toString()}</Text>
  }
  const progressText = progress.status.replace('% (', '%\n(').split('\n');
  return progressText.map((line, index) => (
    <Text key={index} my={1}>
      {line}
    </Text>
  ));
};

const Action = ({
  icon,
  intent,
  disabled,
  onClick,
  combined,
  mainText,
  subText,
}) => {
  const { appState } = useStores();
  return useObserver(() => {
    const progress =
      appState.progress.combined === combined ? appState.progress : null;
    const inProgress = _.get(progress, 'inProgress');
    return (
      <ActionButton
        intent={_.get(progress, 'error') ? Intent.DANGER : intent}
        disabled={disabled}
        onClick={appState.progress.inProgress ? null : onClick}
        active={inProgress}
      >
        {progress && <ProgressIndicator percent={progress.percent} />}
        <ButtonContent>
          <ActionIcon icon={icon} />
          <TextWrapper>
            {inProgress ? (
              <ProgressText progress={progress} />
            ) : (
              <React.Fragment>
                <Text fontSize='200%'>{mainText}</Text>
                <Text mt={2}>{subText}</Text>
              </React.Fragment>
            )}
          </TextWrapper>
        </ButtonContent>
      </ActionButton>
    );
  });
};

export default function Actions() {
  const { appState } = useStores();
  const { analytics } = useAnalytics();

  const onGenerateVideo = React.useCallback(
    (combined, videos = 1) => {
      appState.generateVideo(combined);
      analytics.trackEvent(
        'Video',
        'Create Video',
        combined ? 'Single' : 'Multiple',
        videos,
      );
    },
    [appState, analytics],
  );

  return useObserver(() => {
    const { projects } = appState;
    const totalChapterCount = _.get(
      projects,
      ['activeProject', 'selectedChapterCount'],
      0,
    );
    return (
      <AnimatedVisibility visible={totalChapterCount > 0}>
        <Flex
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Action
            combined={false}
            icon='applications'
            disabled={totalChapterCount === 1}
            onClick={() => onGenerateVideo(false, totalChapterCount)}
            mainText={`Generate ${totalChapterCount} video${
              totalChapterCount > 1 ? 's' : ''
            }`}
            subText='(One video per chapter)'
          />
          <Action
            combined
            icon='application'
            intent={Intent.PRIMARY}
            onClick={() => onGenerateVideo(true)}
            mainText='Generate a single video'
            subText={`(${totalChapterCount} chapter${
              totalChapterCount > 1 ? 's' : ''
            })`}
          />
        </Flex>
      </AnimatedVisibility>
    );
  });
}
