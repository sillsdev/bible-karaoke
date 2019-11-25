import React from 'react';
import { inject, observer } from 'mobx-react';
import FileSelector from '../FileSelector';
import { fileFilters } from '../../constants';

@inject('store')
@observer
class OutputCard extends React.PureComponent {
  render() {
    const {
      store: { outputFile, setOutputFile, defaultVideoName },
    } = this.props;
    return (
      <FileSelector
        save
        file={outputFile}
        label='Output file'
        options={{
          defaultPath: defaultVideoName,
          title: 'Save video file as',
          filters: fileFilters.output,
          properties: ['openFile'],
        }}
        onFileSelected={setOutputFile}
      />
    );
  }
}

export default OutputCard;
