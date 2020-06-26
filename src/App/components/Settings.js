import React from 'react';
import uniq from 'lodash/uniq';
import without from 'lodash/without';
import { H5, Icon, Card, Button, Classes } from '@blueprintjs/core';
import { useObserver } from 'mobx-react';
import { useStores } from '../store';
import FileSelector from './FileSelector';
import './Settings.scss';

const DirectoriesCard = ({name, directories, onSetDirectories}) => {
  const addDirectory = (folder) => {
    onSetDirectories(uniq([...directories, folder]))
  }
  
  const removeDirectory = (folder) => {
    onSetDirectories(without(directories, folder))
  }

  return (
    <Card className="settings__card">
      <div className="settings__card-title">
        <H5>{name} Projects Folders</H5>
        <FileSelector
          buttonText="Add folder..."
          buttonIcon="folder-new"
          options={{
            title: `Select ${name} folder`,
            properties: ['openDirectory'],
          }}
          onFileSelected={addDirectory}
        />
      </div>
      <ul className={`${Classes.LIST} ${Classes.LIST_UNSTYLED}`}>
        {directories.map(dir => (
          <li className="settings__directory" key={dir}>
            <Icon icon="folder-close" />
            <span className={`settings__directory-name ${Classes.UI_TEXT} ${Classes.TEXT_OVERFLOW_ELLIPSIS}`} title={dir}>{dir}</span>
            <Button minimal icon='cross' onClick={() => { removeDirectory(dir) }} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Settings() {
  const { settings } = useStores()

  return useObserver(() => (
    <div className="settings">
      <DirectoriesCard 
        name="HearThis" 
        directories={settings.hearThisRootDirectories} 
        onSetDirectories={settings.setHearThisRootDirectories} 
      />
      <DirectoriesCard 
        name="Scripture App Builder" 
        directories={settings.scriptureAppBuilderRootDirectories} 
        onSetDirectories={settings.setScriptureAppBuilderRootDirectories} 
      />
    </div>
  ))
}