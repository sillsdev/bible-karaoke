import GoogleAnalytics, { resetClientId } from 'electron-ga-uuid';
import { reaction } from 'mobx';

const DEV_TRACK_ID = 'UA-169320344-1';
const TRACK_ID = 'UA-22170471-17';
const isDev = require('electron-is-dev');

class GA {
  constructor() {
    this.ga = new GoogleAnalytics(isDev ? DEV_TRACK_ID : TRACK_ID);
  }

  resetClientId () {
    resetClientId();
  }

  async trackScreenview (screenName) {
    const params = {cd: screenName};
    await this.ga.send('screenview',params);
  }

  async trackEvent (category, action, label = '', value = 0) {
    const params = {ec: category, ea: action, el: label, ev: value};
    await this.ga.send('event', params);
  }

  async trackError (error, fatal = 1) {
    const params = {exd: error, exf:fatal};
    await this.ga.send('exception', params);
  }
}

class DebugGA {

  resetClientId () {
    console.log('Resetting Google Analytics Client ID');
  }

  async trackScreenview (screenName) {
    const params = {cd: screenName};
    console.log('Analytics Screenview: ' + JSON.stringify(params));
  }

  async trackEvent (category, action, label = '', value = 0) {
    const params = {ec: category, ea: action, el: label, ev: value};
    console.log('event', params);
  }

  async trackError (error, fatal = 1) {
    const params = {exd: error, exf:fatal};
    console.log('Analytics Error: ' + JSON.stringify(params));
  }
}

class Analytics {
  constructor(settings) {
    const updateProxy = (enableAnalytics) => {
      const isEnabled =  !isDev && enableAnalytics;
      this.proxy = isEnabled ? new GA() : new DebugGA();
    }
    updateProxy(settings.enableAnalytics);
    reaction(
      () => settings.enableAnalytics,
      (enableAnalytics) => {
        updateProxy(enableAnalytics);
      }
    )

    const methods = [ 'resetClientId', 'trackScreenview', 'trackEvent', 'trackError' ];
    methods.forEach(method => {
      this[method] = (...args) => {
        this.proxy[method](...args);
      }
    })
  }
}

export default Analytics;
