import React, {createContext, useCallback, useContext, useId, useMemo, useState} from 'react';
import type {Key, ReactNode} from 'react';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

type ExpandedKeys = Set<Key>;

interface AccordionContextValue {
  allowsMultipleExpanded: boolean;
  disabledKeys: Set<Key>;
  expandedKeys: ExpandedKeys;
  toggleKey(key: Key): void;
}

interface DisclosureContextValue {
  id: Key;
  isDisabled: boolean;
  isExpanded: boolean;
  toggle(): void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const DisclosureContext = createContext<DisclosureContextValue | null>(null);

export interface AccordionProps {
  allowsMultipleExpanded?: boolean;
  children?: ReactNode;
  className?: string;
  defaultExpandedKeys?: Iterable<Key>;
  disabledKeys?: Iterable<Key>;
  expandedKeys?: Iterable<Key>;
  onExpandedChange?: (keys: Set<Key>) => void;
  testID?: string;
}

export interface DisclosureProps {
  children?: ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  id?: Key;
  isDisabled?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  testID?: string;
}

export interface DisclosureTitleProps {
  children?: ReactNode;
  className?: string;
  testID?: string;
}

export interface DisclosurePanelProps {
  children?: ReactNode;
  className?: string;
  testID?: string;
}

function keysToSet(keys: Iterable<Key> | undefined): Set<Key> {
  return new Set(keys ?? []);
}

export function Accordion({
  allowsMultipleExpanded = false,
  children,
  className,
  defaultExpandedKeys,
  disabledKeys,
  expandedKeys,
  onExpandedChange,
  testID
}: AccordionProps) {
  let [uncontrolledKeys, setUncontrolledKeys] = useState(() => keysToSet(defaultExpandedKeys));
  let isControlled = expandedKeys !== undefined;
  let currentExpandedKeys = isControlled ? keysToSet(expandedKeys) : uncontrolledKeys;
  let disabledKeySet = useMemo(() => keysToSet(disabledKeys), [disabledKeys]);

  let toggleKey = useCallback(
    (key: Key) => {
      let nextKeys = new Set(currentExpandedKeys);
      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        if (!allowsMultipleExpanded) {
          nextKeys.clear();
        }
        nextKeys.add(key);
      }

      if (!isControlled) {
        setUncontrolledKeys(nextKeys);
      }
      onExpandedChange?.(nextKeys);
    },
    [allowsMultipleExpanded, currentExpandedKeys, isControlled, onExpandedChange]
  );

  let context = useMemo<AccordionContextValue>(
    () => ({
      allowsMultipleExpanded,
      disabledKeys: disabledKeySet,
      expandedKeys: currentExpandedKeys,
      toggleKey
    }),
    [allowsMultipleExpanded, currentExpandedKeys, disabledKeySet, toggleKey]
  );

  return (
    <AccordionContext.Provider value={context}>
      <View
        accessibilityRole="list"
        className={cn('overflow-hidden rounded-md border border-border bg-surface', className)}
        testID={testID}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
}

export function Disclosure({
  children,
  className,
  defaultExpanded,
  id,
  isDisabled,
  isExpanded,
  onExpandedChange,
  testID
}: DisclosureProps) {
  let generatedId = useId();
  let disclosureId = id ?? generatedId;
  let accordion = useContext(AccordionContext);
  let [uncontrolledExpanded, setUncontrolledExpanded] = useState(!!defaultExpanded);
  let isControlled = isExpanded !== undefined;
  let resolvedDisabled = !!(isDisabled || accordion?.disabledKeys.has(disclosureId));
  let resolvedExpanded = accordion
    ? accordion.expandedKeys.has(disclosureId)
    : isControlled
      ? !!isExpanded
      : uncontrolledExpanded;

  let toggle = useCallback(() => {
    if (resolvedDisabled) {
      return;
    }

    if (accordion) {
      accordion.toggleKey(disclosureId);
      onExpandedChange?.(!resolvedExpanded);
      return;
    }

    let nextExpanded = !resolvedExpanded;
    if (!isControlled) {
      setUncontrolledExpanded(nextExpanded);
    }
    onExpandedChange?.(nextExpanded);
  }, [
    accordion,
    disclosureId,
    isControlled,
    onExpandedChange,
    resolvedDisabled,
    resolvedExpanded
  ]);

  let context = useMemo<DisclosureContextValue>(
    () => ({
      id: disclosureId,
      isDisabled: resolvedDisabled,
      isExpanded: resolvedExpanded,
      toggle
    }),
    [disclosureId, resolvedDisabled, resolvedExpanded, toggle]
  );

  return (
    <DisclosureContext.Provider value={context}>
      <View
        accessibilityRole={'listitem' as never}
        className={cn('border-b border-border last:border-b-0', className)}
        testID={testID}>
        {children}
      </View>
    </DisclosureContext.Provider>
  );
}

export function DisclosureTitle({children, className, testID}: DisclosureTitleProps) {
  let disclosure = useContext(DisclosureContext);
  if (!disclosure) {
    throw new Error('DisclosureTitle must be used within a Disclosure.');
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: disclosure.isDisabled || undefined,
        expanded: disclosure.isExpanded || undefined
      }}
      className={cn(
        'min-h-[44px] flex-row items-center justify-between gap-300 px-300 py-250',
        disclosure.isDisabled && 'opacity-disabled',
        className
      )}
      isDisabled={disclosure.isDisabled}
      onPress={disclosure.toggle}
      testID={testID}>
      {typeof children === 'string' ? (
        <Text className="min-w-0 flex-1 text-200 font-medium text-text">{children}</Text>
      ) : (
        <View className="min-w-0 flex-1">{children}</View>
      )}
      <Text className="text-200 text-textMuted">{disclosure.isExpanded ? '-' : '+'}</Text>
    </Pressable>
  );
}

export function DisclosurePanel({children, className, testID}: DisclosurePanelProps) {
  let disclosure = useContext(DisclosureContext);
  if (!disclosure) {
    throw new Error('DisclosurePanel must be used within a Disclosure.');
  }

  if (!disclosure.isExpanded) {
    return null;
  }

  return (
    <View className={cn('px-300 pb-300', className)} testID={testID}>
      {typeof children === 'string' ? (
        <Text className="text-200 text-textMuted">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
