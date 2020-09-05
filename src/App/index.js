import React from 'react';
import { useObserver } from 'mobx-react';
import styled from 'styled-components';
import { Classes } from '@blueprintjs/core';
import { Flex } from 'reflexbox';
import { Colors } from './blueprint';
import AppHeader from './components/AppHeader';
import BookSelector from './components/BookSelector';
import ChapterSelector from './components/ChapterSelector';
import Preview from './components/Preview';
import Actions from './components/Actions';
import { useStores } from './store';
import { useAnalytics } from './components/Analytics';
import './index.scss';
const { ipcRenderer } = window.require('electron');

const AppWrapper = styled(Flex) `
  position: relative;
`

export default function App() {
  const { settings } = useStores()
  const { analytics } = useAnalytics()

  React.useEffect(() => {
    ipcRenderer.send('did-start-getprojectstructure', settings.rootDirectories);
  }, [settings.rootDirectories])

  React.useEffect(() => {
    analytics.trackScreenview('Home');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return useObserver(() => (
    <AppWrapper
      backgroundColor={Colors.background3}
      height="100%"
      className={Classes.DARK}
      flexDirection="column"
    >
      <AppHeader />
      <Flex flex={1} flexDirection="column">
        <Flex flex={1}>
          <Flex p={3} flex={1} maxWidth="50%">
            <BookSelector flex={1} />
          </Flex>
          <Flex p={3} flex={1} maxWidth="50%">
            <ChapterSelector flex={1} />
          </Flex>
        </Flex>
        <Flex flex={1}>
          <Flex p={3} flex="0 auto">
            <Preview />
          </Flex>
          <Flex p={3} flex={1} alignItems="center" justifyContent="center">
            <Actions />
          </Flex>
        </Flex>
      </Flex>
    </AppWrapper>
  ))
}
