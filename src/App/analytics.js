import Analytics from 'electron-ga';
const analytics =  new Analytics('UA-22170471-17');
//Analytics Disabled awaiting UI Chnages to comply with GA Policy
const isDev = true;
// const isDev = require('electron-is-dev');

export async function trackScreenview (screenName) {
  const params = {cd: screenName};
  if (isDev) {
    console.log('Analytics Screenview: ' + JSON.stringify(params));
  } else {
    await analytics.send('screenview',params);
  }
};

export async function trackEvent (category, action, label = '', value = 0) {
  const params = {ec: category, ea: action, el: label, ev: value};
  if (isDev) {
    console.log('Analytics Event: ' + JSON.stringify(params));
  } else {
    await analytics.send('event', params);
  }
}

export async function trackError (error, fatal = 1) {
  const params = {exd: error, exf:fatal};
  if (isDev) {
    console.log('Analytics Error: ' + JSON.stringify(params));
  } else {
    await analytics.send('exception', params);
  }
}
