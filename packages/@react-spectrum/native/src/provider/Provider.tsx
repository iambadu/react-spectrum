import React, {useContext, useMemo} from 'react';
import {I18nManager} from 'react-native';
import {PortalProvider} from '../primitives/PortalProvider';
import {ProviderContext, defaultProviderContext} from './context';
import type {NativeProviderContext, NativeProviderProps, ProviderDefaultProp} from './types';

const DEFAULT_PROP_KEYS: ProviderDefaultProp[] = [
  'isDisabled',
  'isEmphasized',
  'isQuiet',
  'isReadOnly',
  'isRequired',
  'validationState'
];

export function Provider(props: NativeProviderProps) {
  let parent = useContext(ProviderContext);
  let {
    children,
    colorScheme = parent.colorScheme,
    direction = parent.direction ?? (I18nManager.isRTL ? 'rtl' : 'ltr'),
    isDisabled = parent.isDisabled,
    isEmphasized = parent.isEmphasized,
    isQuiet = parent.isQuiet,
    isReadOnly = parent.isReadOnly,
    isRequired = parent.isRequired,
    locale = parent.locale,
    scale = parent.scale,
    theme = parent.theme,
    validationState = parent.validationState
  } = props;

  let value = useMemo<NativeProviderContext>(
    () => ({
      ...parent,
      colorScheme,
      direction,
      isDisabled,
      isEmphasized,
      isQuiet,
      isReadOnly,
      isRequired,
      locale,
      scale,
      theme,
      validationState
    }),
    [
      colorScheme,
      direction,
      isDisabled,
      isEmphasized,
      isQuiet,
      isReadOnly,
      isRequired,
      locale,
      parent,
      scale,
      theme,
      validationState
    ]
  );

  return (
    <ProviderContext.Provider value={value}>
      <PortalProvider>{children}</PortalProvider>
    </ProviderContext.Provider>
  );
}

export function useProvider(): NativeProviderContext {
  return useContext(ProviderContext) ?? defaultProviderContext;
}

export function useProviderProps<T extends Record<string, any>>(props: T): T {
  let context = useProvider();
  let merged: Record<string, any> = {...props};

  for (let key of DEFAULT_PROP_KEYS) {
    if (merged[key] === undefined && context[key] !== undefined) {
      merged[key] = context[key];
    }
  }

  return merged as T;
}
