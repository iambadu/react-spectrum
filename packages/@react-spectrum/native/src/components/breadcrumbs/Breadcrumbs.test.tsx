import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Breadcrumbs} from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders navigation with default accessibility label', () => {
    let {getByTestId} = renderWithProvider(
      <Breadcrumbs
        items={[
          {key: 'home', label: 'Home'},
          {key: 'settings', label: 'Settings'}
        ]}
        testID="breadcrumbs"
      />
    );
    expect(getByTestId('breadcrumbs').props.accessibilityRole).toBe('navigation');
    expect(getByTestId('breadcrumbs').props.accessibilityLabel).toBe('Breadcrumbs');
  });

  it('calls onAction for non-current item presses', () => {
    let onAction = jest.fn();
    let {getByTestId} = renderWithProvider(
      <Breadcrumbs
        items={[
          {key: 'home', label: 'Home'},
          {key: 'settings', label: 'Settings'}
        ]}
        onAction={onAction}
        testID="breadcrumbs"
      />
    );
    fireEvent.press(getByTestId('breadcrumbs-item-home'));
    expect(onAction).toHaveBeenCalledWith('home');
  });
});
