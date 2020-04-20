import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import './ColorPicker.scss';

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

const ColorPicker = ({ value, presetColors, disableAlpha, disabled, onChange }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const toggleFontColorPicker = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const closeFontColorPicker = () => {
    setDisplayColorPicker(false);
  };

  return (
    <div className='bk-color-picker'>
      <div
        className={`bk-color-picker__swatch${
          disabled ? ' bk-color-picker--disabled' : ''
        }`}
        onClick={disabled ? undefined : toggleFontColorPicker}
        style={{ backgroundColor: disabled ? undefined : value }}
      />
      {!disabled && displayColorPicker ? (
        <div className='bk-color-picker__popover'>
          <div
            className='bk-color-picker__cover'
            onClick={closeFontColorPicker}
          />
          <SketchPicker
            presetColors={presetColors}
            disableAlpha={disableAlpha}
            color={value}
            onChange={onChange}
          />
        </div>
      ) : null}
    </div>
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
