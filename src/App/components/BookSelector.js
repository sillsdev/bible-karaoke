import React from 'react';
import { useObserver } from 'mobx-react';
import _ from 'lodash';
import { Flex } from 'reflexbox';
import { Intent } from '@blueprintjs/core';
import { Tag, H3, Card, Button } from '../blueprint';
import { useStores } from '../store';

export default function BookSelector(props) {
  const { appState } = useStores()
  return useObserver(() => {
    const project = appState.projects.activeProject
    if (!project) {
      return null
    }
    return (
      <Card {...props}>
        <H3>{project.name}</H3>
        <Flex flexWrap="wrap" m={-1}>
          {project.bookList.map(book => {
            let selectionCount = null
            if (book.isSelected) {
              selectionCount = _.indexOf(project.bookSelection, book.name) + 1
            }
            return (
              <Button
                position="relative"
                key={book.name}
                m={1}
                intent={book.isSelected ? Intent.PRIMARY : null}
                onClick={() => project.setActiveBook(book.name)}
                active={project.activeBookName === book.name}
              >
                {book.name}
                {book.isSelected && (
                  <Tag position="absolute" zIndex={2} right="-10px" top="-10px" round intent={Intent.SUCCESS}>
                    {selectionCount}
                  </Tag>
                )}
              </Button>
            )
          })}
        </Flex>
      </Card>
    )
  })
}