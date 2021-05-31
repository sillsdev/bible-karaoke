import React from 'react';
import { useObserver } from 'mobx-react';
import { Drawer, Classes, Tooltip, Position } from '@blueprintjs/core';
import { Flex } from 'reflexbox';
import styled from 'styled-components';
import { Button, Text } from '../blueprint';
import Settings from './Settings';
import { version } from '../../../package.json';

const TextVersion = styled(Text)`
  fontSize: 70%;
  mr: 2;
`;

export default function SettingsButton(): JSX.Element {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  return useObserver(() => (
    <React.Fragment>
      <Tooltip content="Settings" position={Position.TOP}>
        <Button minimal onClick={(): void => setSettingsOpen(true)} icon="cog" />
      </Tooltip>
      <Drawer
        className={Classes.DARK}
        isOpen={settingsOpen}
        onClose={(): void => setSettingsOpen(false)}
        icon="cog"
        title={
          <Flex justifyContent="space-between" alignItems="center">
            Settings
            <TextVersion className={Classes.TEXT_MUTED}>
              v{version}
            </TextVersion>
          </Flex>
        }
        position={Position.RIGHT}
      >
        <Settings />
      </Drawer>
    </React.Fragment>
  ));
}
