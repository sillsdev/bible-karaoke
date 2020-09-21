import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styled from 'styled-components';
import { Box } from 'reflexbox';

const Wrapper = styled(Box)`
  opacity: 0;
  transition: opacity 0ms;
  &.visible {
    transition: opacity 500ms ease-in-out;
    opacity: 1;
  }
`;

export default function AnimatedVisibility({ visible, children }) {
  return (
    <Wrapper flex={1} className={classnames({ visible })}>
      {children}
    </Wrapper>
  );
}

AnimatedVisibility.propTypes = {
  visible: PropTypes.string,
  children: PropTypes.node,
};
