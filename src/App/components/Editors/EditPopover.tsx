import React from 'react';
import styled from 'styled-components';
import { position } from 'styled-system';
import { useObserver } from 'mobx-react';
import { Box, Flex } from 'reflexbox';
import { Tooltip, Popover, PopoverInteractionKind, PopoverPosition, IconName, MaybeElement } from '@blueprintjs/core';
import { Button, H5 } from '../../blueprint';

const Wrapper = styled(Box)`
  ${position}
  position: absolute;
`;

const Title = styled(H5)`
  mb: 3
`

export const EditRow = styled(Flex).attrs({
  flexDirection: 'row',
  alignItems: 'center',
})``;

export default function EditPopover(prop: { icon?: IconName | MaybeElement, title?: string | JSX.Element, children: JSX.Element, props: any }): JSX.Element {
  prop.icon = prop.icon || 'annotation';

  return useObserver(() => {
    return (
      <Wrapper top="8px" right="8px" {...prop.props}>
        <Popover position={PopoverPosition.RIGHT_TOP} interactionKind={PopoverInteractionKind.CLICK}>
          <Tooltip content={prop.title}>
            <Button minimal icon={prop.icon} />
          </Tooltip>
          <Box p={3}>
            <Title>{prop.title}</Title>
            {prop.children}
          </Box>
        </Popover>
      </Wrapper>
    );
  });
}
