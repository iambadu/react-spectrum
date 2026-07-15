import React, {useCallback, useState} from 'react';
import {parseDate, parseTime, toCalendarDate, type DateValue, type Time} from '@internationalized/date';
import {TextField} from '../textfield/TextField';
import type {TextFieldBaseProps} from '../textfield/types';

type DateTimeTextFieldProps = Omit<
  TextFieldBaseProps,
  'defaultValue' | 'inputMode' | 'keyboardType' | 'onChange' | 'onChangeText' | 'value'
>;

export interface DateFieldProps extends DateTimeTextFieldProps {
  defaultValue?: DateValue | null;
  onChange?: (value: DateValue) => void;
  onChangeText?: (value: string) => void;
  value?: DateValue | null;
}

export interface TimeFieldProps extends DateTimeTextFieldProps {
  defaultValue?: Time | null;
  onChange?: (value: Time) => void;
  onChangeText?: (value: string) => void;
  value?: Time | null;
}

function formatDateValue(value: DateValue | null | undefined) {
  return value ? toCalendarDate(value).toString() : '';
}

function formatTimeValue(value: Time | null | undefined) {
  return value?.toString() ?? '';
}

export function DateField({
  defaultValue,
  onChange,
  onChangeText,
  placeholder = 'YYYY-MM-DD',
  value,
  ...props
}: DateFieldProps) {
  let isControlled = value !== undefined;
  let [textValue, setTextValue] = useState(formatDateValue(defaultValue));
  let currentValue = isControlled ? formatDateValue(value) : textValue;

  let handleChangeText = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setTextValue(nextValue);
      }

      onChangeText?.(nextValue);

      try {
        onChange?.(parseDate(nextValue));
      } catch {
        // Let users finish typing partial dates without emitting invalid values.
      }
    },
    [isControlled, onChange, onChangeText]
  );

  return (
    <TextField
      {...props}
      inputMode="numeric"
      keyboardType="numbers-and-punctuation"
      onChangeText={handleChangeText}
      placeholder={placeholder}
      value={currentValue}
    />
  );
}

export function TimeField({
  defaultValue,
  onChange,
  onChangeText,
  placeholder = 'HH:MM',
  value,
  ...props
}: TimeFieldProps) {
  let isControlled = value !== undefined;
  let [textValue, setTextValue] = useState(formatTimeValue(defaultValue));
  let currentValue = isControlled ? formatTimeValue(value) : textValue;

  let handleChangeText = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setTextValue(nextValue);
      }

      onChangeText?.(nextValue);

      try {
        onChange?.(parseTime(nextValue));
      } catch {
        // Let users finish typing partial times without emitting invalid values.
      }
    },
    [isControlled, onChange, onChangeText]
  );

  return (
    <TextField
      {...props}
      inputMode="numeric"
      keyboardType="numbers-and-punctuation"
      onChangeText={handleChangeText}
      placeholder={placeholder}
      value={currentValue}
    />
  );
}
