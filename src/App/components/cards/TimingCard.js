import React from 'react';
import { inject, observer } from 'mobx-react';
import FileSelector from '../FileSelector';
import { fileFilters } from '../../constants';

@inject('appState')
@observer
class TimingCard extends React.PureComponent {
  render() {
    const {
      appState: { timingFile, setTimingFile },
    } = this.props;
    return (
      <FileSelector
        file={timingFile}
        label='Timing file'
        options={{
          title: 'Select Timing File',
          filters: fileFilters.timing,
          properties: ['openFile'],
        }}
        onFileSelected={setTimingFile}
      />
    );
  }
}

export default TimingCard;
