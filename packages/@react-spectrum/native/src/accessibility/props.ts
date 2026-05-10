import {AccessibilityInfo} from 'react-native';

export interface SpectrumAccessibilityProps {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isSelected?: boolean;
}

export function mapAccessibilityProps(props: SpectrumAccessibilityProps) {
  return {
    'aria-invalid': (props['aria-invalid'] ?? props.isInvalid) || undefined,
    accessibilityHint: props.accessibilityHint,
    accessibilityLabel: props.accessibilityLabel ?? props['aria-label'],
    accessibilityState: mapAccessibilityState(props)
  };
}

export function mapAccessibilityState(props: SpectrumAccessibilityProps) {
  return {
    disabled: props.isDisabled || undefined,
    selected: props.isSelected || undefined
  };
}

export function announceForAccessibility(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}
