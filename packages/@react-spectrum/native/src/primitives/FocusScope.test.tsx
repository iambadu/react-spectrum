import React from 'react';
import {AccessibilityInfo} from 'react-native';
import {act, create} from 'react-test-renderer';
import {FocusScope} from './FocusScope';
import {Text} from './Text';

describe('FocusScope', () => {
  it('renders children unchanged', () => {
    let renderer: any;
    act(() => {
      renderer = create(
        <FocusScope>
          <Text testID="child">Hello</Text>
        </FocusScope>
      );
    });
    let host = renderer.root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.testID === 'child'
    )[0];
    expect(host).toBeDefined();
  });

  it('accepts autoFocus, contain, restoreFocus props without throwing', () => {
    expect(() => {
      act(() => {
        create(
          <FocusScope autoFocus contain restoreFocus>
            <Text>Item</Text>
          </FocusScope>
        );
      });
    }).not.toThrow();
  });

  it('marks contained scopes as modal accessibility regions', () => {
    let renderer: any;
    act(() => {
      renderer = create(
        <FocusScope contain>
          <Text>Item</Text>
        </FocusScope>
      );
    });
    let scope = renderer.root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.accessibilityViewIsModal
    )[0];
    expect(scope.props.importantForAccessibility).toBe('yes');
  });

  it('moves accessibility focus when autoFocus is enabled', () => {
    let spy = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus');
    try {
      act(() => {
        create(
          <FocusScope autoFocus>
            <Text>Item</Text>
          </FocusScope>,
          {
            createNodeMock: () => ({})
          }
        );
      });
      expect(spy).toHaveBeenCalledWith(1);
    } finally {
      spy.mockRestore();
    }
  });
});
