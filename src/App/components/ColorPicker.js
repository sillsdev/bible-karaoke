import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'reflexbox';
import { Popover } from '@blueprintjs/core';
import { SketchPicker } from 'react-color';

const SWATCH_COLORS = [
  '#ff3b30',
  '#4cd964',
  '#2196f3',
  '#ff2d55',
  '#ffcc00',
  '#ff9500',
  '#9c27b0',
  '#673ab7',
  '#5ac8fa',
  '#009688',
  '#cddc39',
  '#ff6b22',
  '#00BCD4',
  '#AED581',
  '#ffff00',
  '#ffffff',
  '#DCDCDC',
  '#D3D3D3',
  '#C0C0C0',
  '#A9A9A9',
  '#808080',
  '#696969',
  '#333333',
  '#000000'
];

const Swatch = styled(Box).attrs({
  width: 30,
  height:30,
  borderRadius: 4
}) `
  border: solid grey 1px;
  ${(props) => {
    return props.disabled 
      ? 'cursor: not-allowed;'
      : ''
  }}
`

const ColorPicker = ({ value, presetColors, disableAlpha, disabled, onChange, ...props }) => {
  return (
    <Popover disabled={disabled}>
      <Swatch
        {...props}
        bg={disabled ? undefined : value}
        disabled={disabled}
      />
        <SketchPicker
          presetColors={presetColors}
          disableAlpha={disableAlpha}
          color={value}
          onChange={onChange}
        />
    </Popover>
  );
};

ColorPicker.propTypes = {
  value: PropTypes.string,
  presetColors: PropTypes.arrayOf(PropTypes.string),
  disableAlpha: PropTypes.bool,
  onChange: PropTypes.func,
};

ColorPicker.defaultProps = {
  color: undefined,
  presetColors: SWATCH_COLORS,
  disableAlpha: true,
  onChange: (color) => {
    this.setState({ color: color.rgb })
  }
};

export default ColorPicker;
