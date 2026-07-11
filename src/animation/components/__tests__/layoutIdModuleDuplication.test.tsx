import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { animate } from '../animate';

// Regression test for a bundler-level failure mode: if the library's module
// gets evaluated more than once (duplicate webpack chunks from a
// symlinked/monorepo dependency, a module re-executed by hot reloading,
// etc.), a plain module-level `layoutIdRegistry` variable would end up as
// two separate, disconnected Maps — one per module instance. An element
// registered via one copy would be invisible to a lookup from the other
// copy, silently turning every `layoutId` transition into a no-op (no prior
// entry to diff against, so the new element just renders at its target rect
// with no animation, which looks like an instant jump instead of a smooth
// transition).
//
// The fix stores the registry on `globalThis` instead of a module-level
// variable, which is shared across module instances by construction (each
// instance's one-time init lazily reuses whatever Map is already there).
// This test verifies that contract directly: the registry a mounted
// `layoutId` element writes to is reachable via `globalThis`, and mutating
// it "from the outside" (standing in for a second module instance) is
// visible to code using the normal `animate` import.
describe('layoutId registry lives on globalThis, not module scope', () => {
  const REGISTRY_KEY = '__REACT_UI_ANIMATE_LAYOUT_ID_REGISTRY__';

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('registers claims on a Map reachable from globalThis', () => {
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => {
        return {
          left: 0,
          top: 0,
          width: 80,
          height: 40,
          right: 80,
          bottom: 40,
          x: 0,
          y: 0,
          toJSON() {},
        } as DOMRect;
      });

    render(<animate.div data-testid="el" layoutId="global-check" />);

    const registry = (globalThis as any)[REGISTRY_KEY];
    expect(registry).toBeInstanceOf(Map);
    expect(registry.get('global-check')).toBeDefined();
    expect(registry.get('global-check').node).toBe(screen.getByTestId('el'));
  });

  it('an entry written directly on the globalThis map (standing in for a second module instance) still drives a real transition', async () => {
    // A genuinely different module instance wouldn't share any JS closure
    // with this test file — the only thing it could share is the object
    // reachable through globalThis[REGISTRY_KEY]. Writing to that Map
    // directly (bypassing the `animate` import entirely) simulates exactly
    // that: "some other copy of the library already registered this id".
    const registry: Map<string, { rect: DOMRect; node: HTMLElement }> =
      (globalThis as any)[REGISTRY_KEY] ?? new Map();
    (globalThis as any)[REGISTRY_KEY] = registry;

    const priorNode = document.createElement('div');
    registry.set('cross-instance-id', {
      rect: { left: 0, top: 0, width: 80, height: 40 } as DOMRect,
      node: priorNode,
    });

    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => {
        return {
          left: 150,
          top: 0,
          width: 80,
          height: 40,
          right: 230,
          bottom: 40,
          x: 150,
          y: 0,
          toJSON() {},
        } as DOMRect;
      });

    render(<animate.div data-testid="el" layoutId="cross-instance-id" />);
    const el = screen.getByTestId('el');

    // If the library stored its registry in module scope instead of on
    // globalThis, it would never see the entry we just wrote and this would
    // be '' (no animation, the element would just render at its target).
    expect(el.style.transform).toBe(
      'translateX(-150px) translateY(0px) scaleX(1) scaleY(1)'
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(el.style.transform).toBe(
        'translateX(0px) translateY(0px) scaleX(1) scaleY(1)'
      );
    });
  });
});
