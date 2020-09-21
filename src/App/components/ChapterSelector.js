import React from 'react';
import { useObserver } from 'mobx-react';
import _ from 'lodash';
import { Flex } from 'reflexbox';
import { Intent, Alignment } from '@blueprintjs/core';
import { H3, Checkbox, Button, Card } from '../blueprint';
import { useStores } from '../store';

export default function ChapterSelector(props) {
  const { appState } = useStores();
  return useObserver(() => {
    const book = _.get(appState.projects, ['activeProject', 'activeBook']);
    return (
      <Card {...props}>
        {!!book && (
          <React.Fragment>
            <Flex alignItems="center" justifyContent="space-between">
              <H3>{book.name}</H3>
              <Checkbox
                label={book.allSelected ? 'Un-select all' : 'Select all'}
                alignIndicator={Alignment.RIGHT}
                onChange={() => book.toggleAllChapters()}
                checked={book.allSelected}
                indeterminate={book.isSelected && !book.allSelected}
              />
            </Flex>
            <Flex flexWrap="wrap" m={-1}>
              {book.chapterList.map((chapter) => (
                <Button
                  key={chapter.name}
                  m={1}
                  intent={chapter.isSelected ? Intent.PRIMARY : null}
                  onClick={() => chapter.toggleIsSelected()}
                >
                  {chapter.name}
                </Button>
              ))}
            </Flex>
          </React.Fragment>
        )}
      </Card>
    );
  });
}
