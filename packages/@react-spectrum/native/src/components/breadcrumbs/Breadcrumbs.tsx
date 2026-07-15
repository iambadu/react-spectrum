import React from 'react';
import type {Key, ReactNode} from 'react';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export interface BreadcrumbItem {
  key: Key;
  label: ReactNode;
  onPress?: () => void;
}

export interface BreadcrumbsProps {
  'aria-label'?: string;
  children?: ReactNode;
  className?: string;
  items?: BreadcrumbItem[];
  onAction?: (key: Key) => void;
  testID?: string;
}

export interface BreadcrumbProps {
  children?: ReactNode;
  className?: string;
  isCurrent?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function Breadcrumb({
  children,
  className,
  isCurrent,
  onPress,
  testID
}: BreadcrumbProps) {
  if (isCurrent || !onPress) {
    return (
      <Text
        accessibilityRole={isCurrent ? 'text' : undefined}
        className={cn('text-200 font-medium text-text', className)}
        testID={testID}>
        {children}
      </Text>
    );
  }

  return (
    <Pressable
      accessibilityRole="link"
      className={cn('min-h-[44px] justify-center', className)}
      onPress={onPress}
      testID={testID}>
      {typeof children === 'string' ? (
        <Text className="text-200 text-accent">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function Breadcrumbs({
  'aria-label': ariaLabel = 'Breadcrumbs',
  children,
  className,
  items,
  onAction,
  testID
}: BreadcrumbsProps) {
  let renderedItems = items
    ? items.map((item, index) => {
        let isCurrent = index === items.length - 1;
        return (
          <React.Fragment key={item.key}>
            <Breadcrumb
              isCurrent={isCurrent}
              onPress={isCurrent ? undefined : () => (item.onPress ? item.onPress() : onAction?.(item.key))}
              testID={testID ? `${testID}-item-${String(item.key)}` : undefined}>
              {item.label}
            </Breadcrumb>
            {!isCurrent && <Text className="text-200 text-textMuted">/</Text>}
          </React.Fragment>
        );
      })
    : children;

  return (
    <View
      accessibilityLabel={ariaLabel}
      accessibilityRole={'navigation' as never}
      className={cn('flex-row flex-wrap items-center gap-150', className)}
      testID={testID}>
      {renderedItems}
    </View>
  );
}
