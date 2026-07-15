import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Text} from '../text';
import {IllustratedMessage} from './IllustratedMessage';

describe('IllustratedMessage', () => {
  it('renders as a summary region', () => {
    let {getByTestId} = renderWithProvider(
      <IllustratedMessage testID="message" title="No results">
        Try a different search.
      </IllustratedMessage>
    );
    expect(getByTestId('message').props.accessibilityRole).toBe('summary');
  });

  it('hides decorative illustration from accessibility', () => {
    let {root} = renderWithProvider(
      <IllustratedMessage illustration={<Text testID="art">Art</Text>} title="No results" />
    );
    let hidden = root.findAll(
      (n: any) =>
        typeof n.type === 'string' &&
        n.props &&
        n.props.importantForAccessibility === 'no-hide-descendants'
    )[0];
    expect(hidden).toBeDefined();
  });
});
