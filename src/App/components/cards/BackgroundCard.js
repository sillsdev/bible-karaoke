import React from 'react';
import { inject, observer } from 'mobx-react';
import FileSelector from '../FileSelector';
import { fileFilters } from '../../constants';

@inject('store')
@observer
class BackgroundCard extends React.PureComponent {
  render() {
    const {
      store: { backgroundFile, setBackgroundFile },
    } = this.props;
    return (
      <FileSelector
        file={backgroundFile}
        label='Background file'
        options={{
          title: 'Select Background File',
          filters: fileFilters.background,
          properties: ['openFile'],
        }}
        onFileSelected={setBackgroundFile}
      />
    );
  }
}

export default BackgroundCard;
