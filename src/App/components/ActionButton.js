import React from 'react';
import { Button } from '@blueprintjs/core';
import './ActionButton.scss';

const ActionButton = props => (
  <div className="action-button__wrapper">
    <Button {...props} />
  </div>
);

export default ActionButton;