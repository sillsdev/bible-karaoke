import React from 'react';
import styled from 'styled-components';
import { position } from 'styled-system';
import { useObserver } from 'mobx-react';
import { Box, Flex } from 'reflexbox';
import { Tooltip, Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core';
import { Button, H5 } from '../../blueprint';

const Wrapper = styled(Box)`
  ${position}
  position: absolute;
`;
export const EditRow = styled(Flex).attrs({
  flexDirection: 'row',
  alignItems: 'center',
})``;

export default function EditPopover({ icon = 'annotation', title, children, ...props }) {
  return useObserver(() => {
    return (
      <Wrapper top="8px" right="8px" {...props}>
        <Popover position={PopoverPosition.RIGHT_TOP} interactionKind={PopoverInteractionKind.CLICK}>
          <Tooltip content={title}>
            <Button minimal icon={icon} />
          </Tooltip>
          <Box p={3}>
            <H5 mb={3}>{title}</H5>
            {children}
          </Box>
        </Popover>
      </Wrapper>
    );
  });
}
