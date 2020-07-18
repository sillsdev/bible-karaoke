import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  Card,
  H3,
  Button,
  Elevation,
  Icon,
  Intent,
  Collapse,
} from '@blueprintjs/core';
import ActionButton from './ActionButton';
import './Accordion.scss';
import { trackEvent } from '../analytics';

@inject('store')
@observer
class Accordion extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentCardIndex: 0,
    };
  }

  trackCardview(index) {
    const { cards } = this.props;
    if (index !== null) {
      trackEvent('Card View', cards[index].title);
    }
  }

  selectCard = cardIndex => {
    this.setState({ currentCardIndex: cardIndex });
    this.trackCardview(cardIndex);
  };

  onNext = index => {
    const { cards } = this.props;
    const nextIndex = index < cards.length - 1 ? index + 1 : null;
    this.setState({ currentCardIndex: nextIndex });
    this.trackCardview(nextIndex);
  };

  render() {
    const {
      cards,
      store: { stepStatus },
    } = this.props;
    const { currentCardIndex } = this.state;
    return (
      <div className='accordion'>
        {cards.map((card, index) => (
          <Card
            key={index}
            className='accordion__card'
            elevation={Elevation.TWO}
          >
            <div className='accordion__card-title'>
              <H3>
                <Button
                  className='accordion__card-title-button'
                  large
                  minimal
                  active={index === currentCardIndex}
                  onClick={() => {
                    this.selectCard(index);
                  }}
                >
                  <span>{`${index + 1}. ${card.title}`}</span>
                  {stepStatus[index] ? <Icon icon='tick-circle' intent='success' className='custom-bp3-intent-success' /> : <Icon icon='tick-circle' />}
                </Button>
              </H3>
            </div>
            <Collapse isOpen={index === currentCardIndex} keepChildrenMounted>
              <p className="accordion__card-description">{card.description}</p>
              {card.content}
              <ActionButton
                disabled={!stepStatus[index]}
                intent={Intent.PRIMARY}
                onClick={() => {
                  this.onNext(index);
                }}
              >
                {index === cards.length - 1 ? 'Done' : 'Next'}
              </ActionButton>
            </Collapse>
          </Card>
        ))}
      </div>
    );
  }
  componentDidMount() {
    this.trackCardview(0);
  }
}

Accordion.propTypes = {};

Accordion.defaultProps = {};

export default Accordion;
