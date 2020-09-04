import React from 'react';
import classnames from 'classnames';
import uniq from 'lodash/uniq';
import without from 'lodash/without';
import { Flex } from 'reflexbox';
import { Icon, Tooltip, Classes } from '@blueprintjs/core';
import { useObserver } from 'mobx-react';
import { repository } from '../../../package.json';
import { H5, Colors, Text, Card, Button, Checkbox } from '../blueprint';
import { useStores } from '../store';
import { 
  getDefaultHearThisDirectory,
  getDefaultScriptureAppBuilderDirectory
} from '../store/Settings';
import FileSelector from './FileSelector';
import './Settings.scss';

const descriptionTextClass = classnames(Classes.TEXT_SMALL, Classes.TEXT_MUTED);

const defaultHearThisDirectory = getDefaultHearThisDirectory()
const defaultAppBuilderDirectory = getDefaultScriptureAppBuilderDirectory()

const DirectoriesCard = ({name, directories, onSetDirectories, defaultDirectory}) => {
  const addDirectory = (folder) => {
    onSetDirectories(uniq([...directories, folder]))
  }
  
  const removeDirectory = (folder) => {
    onSetDirectories(without(directories, folder))
  }

  const resetDirectories = () => {
    onSetDirectories([defaultDirectory])
  }

  return (
    <Card className="settings__card" mb={3}>
      <Flex
        className="settings__card-title"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <H5 mb="0">{name} Projects Folders</H5>
        <Flex alignItems="center">
          <Tooltip content="Reset to default directory">
            <Button mr={2} minimal icon='reset' onClick={resetDirectories} />
          </Tooltip>
          <FileSelector
            buttonText="Add folder..."
            buttonIcon="folder-new"
            options={{
              title: `Select ${name} folder`,
              properties: ['openDirectory'],
            }}
            onFileSelected={addDirectory}
          />
        </Flex>
      </Flex>
      {directories.map(dir => (
        <Flex alignItems="center" className="settings__directory" key={dir}>
          <Icon icon="folder-close" />
          <Text px={2} ellipsize title={dir}>{dir}</Text>
          <Button minimal icon='cross' onClick={() => { removeDirectory(dir) }} />
        </Flex>
      ))}
    </Card>
  )
}

export default function Settings() {
  const { settings } = useStores()
  const repoUrl = repository.url.replace(/\.git$/, '')
  return useObserver(() => (
    <Flex
      backgroundColor={Colors.background2}
      p={3} flex={1} 
      flexDirection="column" 
      overflowY="auto"
      className="settings"
    >
      <DirectoriesCard 
        name="HearThis" 
        directories={settings.hearThisRootDirectories} 
        onSetDirectories={settings.setHearThisRootDirectories}
        defaultDirectory={defaultHearThisDirectory}
      />
      <DirectoriesCard 
        name="Scripture App Builder" 
        directories={settings.scriptureAppBuilderRootDirectories} 
        onSetDirectories={settings.setScriptureAppBuilderRootDirectories} 
        defaultDirectory={defaultAppBuilderDirectory}
      />
      <Card className="settings__card" mb={3}>
        <Flex
          className="settings__card-title"
          alignItems="center"
          justifyContent="space-between"
        >
          <H5 mb="0">Google Analytics</H5>
        </Flex>
        <Text my={3} className={descriptionTextClass}>Google Analytics helps us understand how Bible Karaoke is being used and when errors occur.</Text>          
        <Checkbox
          checked={settings.enableAnalytics}
          onChange={(event) => {
            settings.setEnableAnalytics(event.currentTarget.checked);
          }}
          label="Enable Google Analytics"
        />
      </Card>
      <Text mt={3} className={descriptionTextClass} textAlign="center">
        This software is released under the <a target="_blank" rel="noopener noreferrer" href={`${repoUrl}/blob/master/LICENSE.md`}>MIT License</a>
      </Text>
    </Flex>
  ))
}