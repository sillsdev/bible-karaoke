import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Intent, Classes } from '@blueprintjs/core';
import Analytics from '../analytics';
import { Text } from '../blueprint';

const analyticsContext = React.createContext(null);

export const AnalyticsProvider = ({ settings, children }) => {
  const [analyticsNoticeDisplayed, setAnalyticsNoticeDisplayed] = React.useState(localStorage.analyticsNoticeDisplayed);
  const [analytics] = React.useState(new Analytics(settings));

  const onClose = React.useCallback(
    (confirmed) => {
      setAnalyticsNoticeDisplayed(true);
      localStorage.setItem('analyticsNoticeDisplayed', true);
      settings.setEnableAnalytics(confirmed);
      confirmed && analytics.trackEvent('Analytics', 'Opted In');
    },
    [settings, analytics]
  );

  return (
    <analyticsContext.Provider value={{ analytics }}>
      <Alert
        className={Classes.DARK}
        isOpen={!analyticsNoticeDisplayed}
        cancelButtonText="No - I do not accept"
        confirmButtonText="Yes - I accept"
        icon="chart"
        intent={Intent.SUCCESS}
        onClose={onClose}
      >
        <Text mb={2}>We&apos;d like to use Google Analytics to help improve Bible Karaoke.</Text>
        <Text mb={2}>Is this okay?</Text>
      </Alert>
      {children}
    </analyticsContext.Provider>
  );
};

AnalyticsProvider.propTypes = {
  settings: PropTypes.object,
  children: PropTypes.node,
};

export const useAnalytics = () => {
  return React.useContext(analyticsContext);
};
