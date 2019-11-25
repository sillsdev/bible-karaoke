import React from 'react';
import { Button } from '@blueprintjs/core';
import './FileSelector.scss';
const { remote } = window.require('electron');
const { dialog } = remote;

const FileSelector = ({
  save = false,
  file,
  label,
  options,
  onFileSelected,
}) => {
  const selectFile = async () => {
    const show = save ? dialog.showSaveDialog : dialog.showOpenDialog;
    const result = await show(options);
    const file = result.filePath || (result.filePaths && result.filePaths.length === 1 ? result.filePaths[0] : '');
    if (file) {
      onFileSelected(file);
    }
  };
  return (
    <div className='file-selector'>
      <div className='file-selector__label'>{label}</div>
      <div className='file-selector__button'>
        <Button text='Select' onClick={selectFile} />
      </div>
      <div className='file-selector__filename'>{file}</div>
    </div>
  );
};

FileSelector.propTypes = {};

FileSelector.defaultProps = {};

export default FileSelector;
