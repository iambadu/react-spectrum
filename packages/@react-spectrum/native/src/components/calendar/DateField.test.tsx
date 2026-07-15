import React from 'react';
import {CalendarDate, Time} from '@internationalized/date';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {DateField, TimeField} from './DateField';

function findInput(root: any) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'text'
  )[0];
}

describe('DateField', () => {
  it('renders a date value as an ISO date string', () => {
    let {root} = renderWithProvider(
      <DateField label="Birthday" value={new CalendarDate(2026, 5, 10)} />
    );
    expect(findInput(root).props.value).toBe('2026-05-10');
  });

  it('calls onChange with a parsed date for valid input', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(<DateField label="Birthday" onChange={onChange} />);
    fireEvent(findInput(root), 'onChangeText', '2026-05-10');
    expect(onChange).toHaveBeenCalledWith(new CalendarDate(2026, 5, 10));
  });

  it('does not call onChange for partial input', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(<DateField label="Birthday" onChange={onChange} />);
    fireEvent(findInput(root), 'onChangeText', '2026-05');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('TimeField', () => {
  it('renders a time value as an ISO time string', () => {
    let {root} = renderWithProvider(
      <TimeField label="Reminder" value={new Time(9, 30)} />
    );
    expect(findInput(root).props.value).toBe('09:30:00');
  });

  it('calls onChange with a parsed time for valid input', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(<TimeField label="Reminder" onChange={onChange} />);
    fireEvent(findInput(root), 'onChangeText', '09:30');
    expect(onChange).toHaveBeenCalledWith(new Time(9, 30));
  });

  it('does not call onChange for partial input', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(<TimeField label="Reminder" onChange={onChange} />);
    fireEvent(findInput(root), 'onChangeText', '09:');
    expect(onChange).not.toHaveBeenCalled();
  });
});
