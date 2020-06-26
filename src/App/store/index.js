import React from 'react';
import { create } from 'mobx-persist';
import { MobXProviderContext } from 'mobx-react'
import AppState from './AppState';
import Settings from './Settings';

const hydrate = create()

export function useStores() {
  return React.useContext(MobXProviderContext)
}

class Store {
  constructor() {
    this.appState = new AppState()
    this.settings = new Settings()
  }

  async init() {
    await hydrate('bk-appState', this.appState)
    await hydrate('bk-settings', this.settings)
  }
}

export default Store