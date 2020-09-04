import GoogleAnalytics from 'electron-ga-uuid';
import { reaction } from 'mobx';

const isDev = require('electron-is-dev');

class Analytics {
  constructor(settings) {
    this.ga =  new GoogleAnalytics(settings.analyticsTrackingId);
    this.isEnabled = !isDev && settings.enableAnalytics;
    reaction(
      () => settings.analyticsTrackingId,
      (analyticsTrackingId) => {
        this.ga =  new GoogleAnalytics(analyticsTrackingId);
      }
    )
    reaction(
      () => settings.enableAnalytics,
      (enableAnalytics) => {
        this.isEnabled = !isDev && enableAnalytics;
      }
    )
  }

  async trackScreenview (screenName) {
    const params = {cd: screenName};
    if (this.isEnabled) {
      await this.ga.send('screenview',params);
    } else {
      console.log('Analytics Screenview: ' + JSON.stringify(params));
    }
  };

  async trackEvent (category, action, label = '', value = 0) {
    const params = {ec: category, ea: action, el: label, ev: value};
    if (this.isEnabled) {
      await this.ga.send('event', params);
    } else {
      console.log('Analytics Event: ' + JSON.stringify(params));
    }
  }

  async trackError (error, fatal = 1) {
    const params = {exd: error, exf:fatal};
    if (this.isEnabled) {
      await this.ga.send('exception', params);
    } else {
      console.log('Analytics Error: ' + JSON.stringify(params));
    }
  }
}

export default Analytics;
