import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TwitterPicker } from 'react-color';
import './ColorPicker.scss';

const SWATCH_COLORS = [
  '#000000',
  '#FFFFFF',
  '#D9D9D9',
  '#525252',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#00BCD4',
  '#AED581',
  '#FF9800',
];

const ColorPicker = ({ value, colors, disabled, onChange }) => {
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
          <TwitterPicker
            colors={colors}
            triangle='top-left'
            value={value}
            onChange={onChange}
          />
        </div>
      ) : null}
    </div>
  );
};

ColorPicker.propTypes = {
  value: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

ColorPicker.defaultProps = {
  color: undefined,
  colors: SWATCH_COLORS,
};

export default ColorPicker;
