import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Modal} from './Modal';

describe('Modal', () => {
  it('renders children when open', () => {
    let {root} = renderWithProvider(
      <Modal isOpen onOpenChange={() => {}} testID="m">
        <></>
      </Modal>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'm-modal'
    )[0];
    expect(host).toBeDefined();
    expect(host.props.visible).toBe(true);
    let content = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'm'
    )[0];
    expect(content).toBeDefined();
  });

  it('does not render visible when closed', () => {
    let {root} = renderWithProvider(
      <Modal isOpen={false} onOpenChange={() => {}} testID="m">
        <></>
      </Modal>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'm-modal'
    )[0];
    expect(host.props.visible).toBe(false);
  });

  it('calls onOpenChange(false) on hardware back / onRequestClose', () => {
    let onOpenChange = jest.fn();
    let {root} = renderWithProvider(
      <Modal isOpen onOpenChange={onOpenChange} testID="m">
        <></>
      </Modal>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'm-modal'
    )[0];
    fireEvent(host, 'onRequestClose');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on hardware back when not dismissable', () => {
    let onOpenChange = jest.fn();
    let {root} = renderWithProvider(
      <Modal isDismissable={false} isOpen onOpenChange={onOpenChange} testID="m">
        <></>
      </Modal>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'm-modal'
    )[0];
    fireEvent(host, 'onRequestClose');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('marks inner content as an accessible modal surface', () => {
    let {root} = renderWithProvider(
      <Modal isOpen onOpenChange={() => {}} testID="m">
        <></>
      </Modal>
    );
    let dialog = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'm' &&
        (n.props as any).accessibilityLabel === 'Dialog' &&
        (n.props as any).accessibilityViewIsModal === true
    )[0];
    expect(dialog).toBeDefined();
  });
});
