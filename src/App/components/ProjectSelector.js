import React from 'react';
import _ from 'lodash';
import { useObserver } from 'mobx-react';
import { HTMLSelect } from '../blueprint';
import { useStores } from '../store';

export default function ProjectSelector() {
  const { appState } = useStores()
  const onChange = React.useCallback((event) => {
    if (!event.target.value && appState.projects.activeProjectName) {
      // Do not allow user to 'un-select' a project
      return;
    }
    appState.projects.setActiveProject(event.target.value)
  }, [ appState ])
  return useObserver(() => {
    const projectOptions = [
      { value: '', label: 'Select a project...' },
      ..._.map(appState.projects.list, p => ({ value: p.name, label: p.name }), [])
    ]
    return (
      <HTMLSelect
        fill 
        large={!appState.projects.activeProjectName}
        id="select-project"
        options={projectOptions}
        value={appState.projects.activeProjectName}
        onChange={onChange}
      />
    )
  })
}