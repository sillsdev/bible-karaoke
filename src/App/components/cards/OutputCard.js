import React from 'react';
import { inject, observer } from 'mobx-react';
import FileSelector from '../FileSelector';
import { fileFilters } from '../../constants';

@inject('appState')
@observer
class OutputCard extends React.PureComponent {
  render() {
    const {
      appState: { outputFile, setOutputFile, defaultVideoName },
    } = this.props;
    return (
      <div className='card__option'>
        <div className='card__option-label'>Output file</div>
        <FileSelector
          save
          file={outputFile}
          options={{
            defaultPath: defaultVideoName,
            title: 'Save video file as',
            filters: fileFilters.output,
            properties: ['openFile'],
          }}
          onFileSelected={setOutputFile}
        />
      </div>
    );
  }
}

export default OutputCard;
