import * as BP from '@blueprintjs/core';
import styled from 'styled-components';
import { space, position, flexbox, typography, layout } from 'styled-system';

export const Text = styled(BP.Text)`
  ${space} ${typography} ${layout}
`;
export const H1 = styled(BP.H1)`
  ${space} ${typography} ${layout}
`;
export const H2 = styled(BP.H2)`
  ${space} ${typography} ${layout}
`;
export const H3 = styled(BP.H3)`
  ${space} ${typography} ${layout}
`;
export const H4 = styled(BP.H4)`
  ${space} ${typography} ${layout}
`;
export const H5 = styled(BP.H5)`
  ${space} ${typography} ${layout}
`;
export const H6 = styled(BP.H6)`
  ${space} ${typography} ${layout}
`;
export const Button = styled(BP.Button)`
  ${space} ${layout} ${position}
`;
export const ButtonGroup = styled(BP.ButtonGroup)`
  ${space} ${layout} ${position}
`;
export const Icon = styled(BP.Icon)`
  ${space} ${layout} ${position}
`;
export const Card = styled(BP.Card)`
  ${space} ${layout} ${flexbox}
`;
export const Checkbox = styled(BP.Checkbox)`
  ${space} ${layout} ${flexbox}
`;
export const Radio = styled(BP.Radio)`
  ${space} ${layout} ${flexbox}
`;
export const HTMLSelect = styled(BP.HTMLSelect)`
  ${space} ${layout} ${flexbox}
`;
export const Tag = styled(BP.Tag)`
  ${space} ${layout} ${flexbox} ${position}
`;

export const Colors = {
  logo: '#006666',
  background1: '#30404d',
  background2: '#293742',
  background3: '#28323a',
};
