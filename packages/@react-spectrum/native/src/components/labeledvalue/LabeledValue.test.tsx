import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {LabeledValue} from './LabeledValue';

describe('LabeledValue', () => {
  it('renders label and value', () => {
    let {getByTestId} = renderWithProvider(
      <LabeledValue label="Status" testID="value" value="Ready" />
    );
    expect(getByTestId('value')).toBeDefined();
  });

  it('supports horizontal layout', () => {
    let {getByTestId} = renderWithProvider(
      <LabeledValue label="Status" orientation="horizontal" testID="value" value="Ready" />
    );
    expect(getByTestId('value').props.className).toContain('flex-row');
  });
});
