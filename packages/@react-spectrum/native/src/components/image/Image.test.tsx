import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Image} from './Image';

describe('Image', () => {
  it('maps alt text to native accessibility props', () => {
    let {getByTestId} = renderWithProvider(
      <Image alt="Project avatar" source={{uri: 'https://example.com/avatar.png'}} testID="image" />
    );
    expect(getByTestId('image').props.accessibilityRole).toBe('image');
    expect(getByTestId('image').props.accessibilityLabel).toBe('Project avatar');
  });

  it('hides decorative images from accessibility', () => {
    let {getByTestId} = renderWithProvider(
      <Image isHidden source={{uri: 'https://example.com/decorative.png'}} testID="image" />
    );
    expect(getByTestId('image').props.accessibilityElementsHidden).toBe(true);
    expect(getByTestId('image').props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
