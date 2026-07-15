import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Accordion, Disclosure, DisclosurePanel, DisclosureTitle} from './Accordion';

describe('Accordion', () => {
  it('renders expanded default disclosure panel', () => {
    let {queryByTestId} = renderWithProvider(
      <Accordion defaultExpandedKeys={['first']}>
        <Disclosure id="first">
          <DisclosureTitle testID="title">Details</DisclosureTitle>
          <DisclosurePanel testID="panel">Panel content</DisclosurePanel>
        </Disclosure>
      </Accordion>
    );
    expect(queryByTestId('panel')).toBeTruthy();
  });

  it('toggles disclosure panel on title press', () => {
    let {getByTestId, queryByTestId} = renderWithProvider(
      <Accordion>
        <Disclosure id="first">
          <DisclosureTitle testID="title">Details</DisclosureTitle>
          <DisclosurePanel testID="panel">Panel content</DisclosurePanel>
        </Disclosure>
      </Accordion>
    );
    expect(queryByTestId('panel')).toBeNull();
    fireEvent.press(getByTestId('title'));
    expect(queryByTestId('panel')).toBeTruthy();
  });

  it('only allows one disclosure open by default', () => {
    let {getByTestId, queryByTestId} = renderWithProvider(
      <Accordion defaultExpandedKeys={['first']}>
        <Disclosure id="first">
          <DisclosureTitle testID="first-title">First</DisclosureTitle>
          <DisclosurePanel testID="first-panel">First panel</DisclosurePanel>
        </Disclosure>
        <Disclosure id="second">
          <DisclosureTitle testID="second-title">Second</DisclosureTitle>
          <DisclosurePanel testID="second-panel">Second panel</DisclosurePanel>
        </Disclosure>
      </Accordion>
    );
    fireEvent.press(getByTestId('second-title'));
    expect(queryByTestId('first-panel')).toBeNull();
    expect(queryByTestId('second-panel')).toBeTruthy();
  });

  it('supports multiple expanded disclosures', () => {
    let {getByTestId, queryByTestId} = renderWithProvider(
      <Accordion allowsMultipleExpanded defaultExpandedKeys={['first']}>
        <Disclosure id="first">
          <DisclosureTitle testID="first-title">First</DisclosureTitle>
          <DisclosurePanel testID="first-panel">First panel</DisclosurePanel>
        </Disclosure>
        <Disclosure id="second">
          <DisclosureTitle testID="second-title">Second</DisclosureTitle>
          <DisclosurePanel testID="second-panel">Second panel</DisclosurePanel>
        </Disclosure>
      </Accordion>
    );
    fireEvent.press(getByTestId('second-title'));
    expect(queryByTestId('first-panel')).toBeTruthy();
    expect(queryByTestId('second-panel')).toBeTruthy();
  });

  it('does not toggle disabled disclosures', () => {
    let onExpandedChange = jest.fn();
    let {getByTestId, queryByTestId} = renderWithProvider(
      <Accordion disabledKeys={['first']} onExpandedChange={onExpandedChange}>
        <Disclosure id="first">
          <DisclosureTitle testID="title">Details</DisclosureTitle>
          <DisclosurePanel testID="panel">Panel content</DisclosurePanel>
        </Disclosure>
      </Accordion>
    );
    fireEvent.press(getByTestId('title'));
    expect(queryByTestId('panel')).toBeNull();
    expect(onExpandedChange).not.toHaveBeenCalled();
    expect(getByTestId('title').props.accessibilityState.disabled).toBe(true);
  });
});
