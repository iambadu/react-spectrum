import React, {useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import {AccessibilityInfo, findNodeHandle, View} from 'react-native';

export interface FocusScopeProps {
  autoFocus?: boolean;
  children?: ReactNode;
  contain?: boolean;
  restoreFocus?: boolean;
}

export function FocusScope({autoFocus, children, contain}: FocusScopeProps) {
  let ref = useRef<View>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    let node = findNodeHandle(ref.current);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [autoFocus]);

  return (
    <View
      accessibilityViewIsModal={contain || undefined}
      collapsable={false}
      importantForAccessibility={contain ? 'yes' : undefined}
      ref={ref}>
      {children}
    </View>
  );
}
