# Native Package Fix Plan — Design Spec

**Date:** 2026-05-16  
**Package:** `packages/@react-spectrum/native`  
**Strategy:** Phase-by-phase, P0 first — critical bugs → a11y gaps → design/API → test coverage

---

## Context

The `@react-spectrum/native` package is a new Expo/React Native implementation of React Spectrum components (6 commits, pre-1.0). A full audit identified 20 issues across 4 severity tiers. This document defines what to fix and how, ordered to deliver ship-blocking value first.

---

## Phase 0 — Critical Functional Bugs (P0)

These break core functionality. Fix before anything else.

### 0-1 Slider drag is unimplemented

**File:** `src/components/slider/Slider.tsx`, `RangeSlider` in same file  
**Issue:** `handleTrackPress` is a stub — it checks `resolvedDisabled` then returns nothing. The thumb never moves when the user drags.  
**Fix:**
- Measure the track width via `onLayout` and store in a `useRef`.
- Add a `PanResponder` (or `react-native-gesture-handler` `Pan` gesture if the peer dep is available) to the track `View`.
- On move: compute `clamp((locationX / trackWidth), 0, 1)`, map to `[minValue, maxValue]`, call `state.setThumbValue(0, newValue)`.
- For `RangeSlider`: identify the closest thumb on `onGrant`, then update that thumb index on move.
- Emit `onChange` / `onChangeEnd` at the correct lifecycle points (move vs release).

### 0-2 Private react-stately subpath imports

**Files:** Calendar, ListView, TreeView, ComboBox, Slider — all import from `react-stately/<hookName>` private paths.  
**Issue:** Private subpath imports are not part of the public API and can silently break on any react-stately version bump.  
**Fix:** Replace all `react-stately/<hookName>` imports with the public barrel `react-stately` or the scoped package `@react-stately/<domain>`. Update type imports to come from `@react-types/shared` or `@react-types/<domain>`.

Affected imports to migrate:
- `react-stately/useCalendarState` → `@react-stately/calendar`
- `react-stately/useListState` → `@react-stately/list`
- `react-stately/useTreeState` → `@react-stately/tree`
- `react-stately/useComboBoxState` → `@react-stately/combobox`
- `react-stately/useSliderState` → `@react-stately/slider`
- `react-stately/useToggleState` → `@react-stately/toggle`

### 0-3 Calendar day names ignore locale

**File:** `src/components/calendar/Calendar.tsx`  
**Issue:** `const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']` is hardcoded English and ignores the resolved locale and first-day-of-week (e.g. Monday-first for most of Europe).  
**Fix:**
- Derive day names from `Intl.DateTimeFormat(locale, { weekday: 'short' })` for each day of a reference week.
- Use `@internationalized/date`'s `startOfWeek(today(timezone), locale)` to find the correct first day.
- Memoize the derived array on `[resolvedLocale]`.

### 0-4 `Intl.NumberFormat` created on every Slider render

**File:** `src/components/slider/Slider.tsx`, `RangeSlider`  
**Issue:** `new Intl.NumberFormat(resolvedLocale, formatOptions)` is called unconditionally in the render function. This constructs a new formatter object on every re-render.  
**Fix:** Wrap in `useMemo(() => new Intl.NumberFormat(resolvedLocale, formatOptions), [resolvedLocale, formatOptions])`.

### 0-5 Provider `useMemo` fires on every render

**File:** `src/provider/Provider.tsx`  
**Issue:** The `...defaults` rest-spread from props destructuring creates a new object on every render. This object is included in the `useMemo` dependency array, so the memo always invalidates — all consumers re-render unnecessarily.  
**Fix:** Enumerate each default prop key explicitly in the `useMemo` dep array:
```ts
}, [colorScheme, direction, isDisabled, isEmphasized, isQuiet, isReadOnly, isRequired, locale, parent, scale, theme, validationState]);
```

---

## Phase 1 — Accessibility Gaps (P1)

These cause failures in screen reader audits and accessibility tests.

### 1-1 `accessibilityRole="dialog"` cast as `never`

**Files:** `src/components/modal/Modal.tsx`, `src/components/popover/Popover.tsx`  
**Issue:** `accessibilityRole={'dialog' as never}` silences a TS error by lying to the type system. React Native's `AccessibilityRole` type does not include `'dialog'`.  
**Fix:**
- Remove the `as never` cast.
- On the content `View`, use `accessibilityViewIsModal={true}` + `accessibilityLabel="Dialog"` instead — this is the correct RN pattern for modal-like surfaces.
- Leave `accessibilityRole` unset or use `'none'` on the content view.

### 1-2 `accessibilityRole="list"` on ScrollView

**Files:** `src/components/listview/ListView.tsx`, `src/components/tree/TreeView.tsx`, `src/components/table/TableView.tsx`  
**Issue:** React Native's `ScrollView` does not accept `"list"` as an `accessibilityRole`. The prop is silently ignored on both iOS and Android.  
**Fix:** Remove `accessibilityRole` from the `ScrollView`. Wrap the scroll content in a `View` with `accessibilityRole="list"` so the list semantics are present without affecting scroll behavior.

### 1-3 Slider missing VoiceOver/TalkBack increment/decrement

**File:** `src/components/slider/Slider.tsx`  
**Issue:** The slider `View` has `accessibilityRole="adjustable"` but no increment/decrement handlers. VoiceOver (iOS) uses swipe-up/down for adjustable elements; TalkBack (Android) uses volume buttons. Without handlers, screen reader users cannot change the value.  
**Fix:**
- Add `onAccessibilityAction` handler responding to `"increment"` and `"decrement"` action names (Android / React Native unified API).
- Increment: `state.setThumbValue(0, Math.min(max, current + step))`.
- Decrement: `state.setThumbValue(0, Math.max(min, current - step))`.
- Declare `accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}`.

### 1-4 Nested Pressable in TreeView causes touch event leakage

**File:** `src/components/tree/TreeView.tsx`  
**Issue:** The expand/collapse `Pressable` is nested inside the row `Pressable`. On Android, the outer `Pressable` receives the touch even when the inner one is tapped, causing both toggle and row-press to fire simultaneously.  
**Fix:** Restructure the row so the expand/collapse affordance and the row label/checkbox area are sibling `Pressable` components inside a wrapping `View`, not parent/child. The wrapping `View` has the row's visual styles; the two `Pressable` siblings have `flex` allocations (e.g. `w-8` for toggle, `flex-1` for content).

### 1-5 Interactive TableView rows use `accessibilityRole="none"`

**File:** `src/components/table/TableView.tsx`  
**Issue:** Row `Pressable` elements always use `accessibilityRole="none"`, even when `selectionMode !== "none"` or `onAction` is defined, making them invisible to screen readers as interactive elements.  
**Fix:** Derive role dynamically:
```ts
accessibilityRole={selectionMode !== 'none' ? 'checkbox' : onAction ? 'button' : 'none'}
```

---

## Phase 2 — Design & API Fixes (P2)

These hurt UX consistency or create subtle API bugs.

### 2-1 Dialog hardcoded `w-[480px]` exceeds mobile screen width

**File:** `src/components/dialog/Dialog.tsx`  
**Issue:** `w-[480px]` is wider than a typical phone screen (375–414pt). On narrow screens the dialog overflows or gets clipped.  
**Fix:** Replace with `max-w-[90%] w-full` in the Dialog's `contentClassName` default. Consumers can still override via `contentClassName`.

### 2-2 Popover 'top' placement formula does not subtract popover height

**File:** `src/components/popover/Popover.tsx`  
**Issue:** `top: Math.max(0, anchor.y - offset)` positions the popover's top edge near the anchor, not the popover's bottom edge above the anchor. The popover overlaps the anchor on 'top' placement.  
**Fix:** Use `onLayout` on the content `View` to measure popover height, then set `top: anchor.y - measuredHeight - offset`. Initial render shows at `anchor.y` (invisible), second render corrects position. This is the standard RN popover pattern since absolute positioning requires measured dimensions.

### 2-3 ComboBox does not dismiss keyboard when Tray opens

**File:** `src/components/combobox/ComboBox.tsx`  
**Issue:** When the input is focused, the system keyboard appears. The Tray also opens. Both are visible simultaneously, which is a poor UX on mobile.  
**Fix:** In `handleFocus`, call `Keyboard.dismiss()` after `state.open()`:
```ts
import {Keyboard} from 'react-native';
let handleFocus = useCallback(() => {
  state.open();
  Keyboard.dismiss();
}, [state]);
```

### 2-4 Modal `testID` targets the backdrop, not the dialog content

**File:** `src/components/modal/Modal.tsx`  
**Issue:** `testID={testID}` is on the `RNModal` element (the backdrop). Tests that query by `testID` get the backdrop, not the content.  
**Fix:** Move `testID` to the inner `View` (the dialog content box). Use `testID={testID ? `${testID}-modal` : undefined}` on the `RNModal` if consumers ever need both.

### 2-5 `Pressable` base spreads raw style-prop keys into the native element

**File:** `src/primitives/Pressable.tsx`  
**Issue:** `resolveStyleProps(otherProps, provider)` extracts resolved style from `otherProps`, but `{...otherProps}` also spreads the source style-prop keys (e.g. `margin`, `width`, `backgroundColor`) onto the native `Pressable`, creating duplicate/invalid native props.  
**Fix:** Strip all `NativeStyleProps` keys from `otherProps` before spreading:
```ts
let {margin, width, height, padding, ...safeOtherProps} = otherProps;
// (enumerate all NativeStyleProps keys)
```
Or maintain an explicit allowlist of passthrough props.

---

## Phase 3 — Test Coverage (P3)

Fill gaps in test coverage revealed by the audit. All tests use the existing `renderWithProvider` + `react-test-renderer` pattern.

### 3-1 Slider tests (after P0-1 drag fix)
- Value updates when position changes (simulate `onLayout` → `onPressIn` at location X).
- `onChange` fires with correct value.
- `onChangeEnd` fires on release.
- Disabled slider does not update value.
- VoiceOver increment/decrement fires (after P1-3 fix).

### 3-2 Calendar tests
- Month navigation forward/backward updates visible month.
- Tapping a date calls `onChange` with correct `CalendarDate`.
- Disabled/unavailable dates do not call `onChange`.
- Today's date has the `border-accent` style.
- Day header names derived from locale (after P0-3 fix).

### 3-3 ComboBox tests
- Opening (focus) shows Tray.
- Selecting an item updates `inputValue` and closes Tray.
- `onSelectionChange` fires with correct key.
- `onInputChange` fires on typing.
- Disabled ComboBox does not open.

### 3-4 TreeView tests
- Tapping expand toggle renders child nodes.
- Tapping collapse toggle hides child nodes.
- Row selection updates `accessibilityState.selected`.
- `onSelectionChange` fires with correct keys.
- `onAction` fires on row press.

### 3-5 TableView tests
- Tapping a column header calls `onSortChange` with correct direction.
- Second tap toggles direction ascending → descending.
- Row press with `selectionMode="single"` selects one row and deselects previous.
- Row press with `selectionMode="multiple"` accumulates selections.
- `onAction` fires on row press regardless of selectionMode.
- Disabled row press does not call handlers.

---

## Issue Inventory (Quick Reference)

| # | Phase | Component | Issue | Severity |
|---|-------|-----------|-------|----------|
| 0-1 | P0 | Slider/RangeSlider | Drag is unimplemented stub | Critical |
| 0-2 | P0 | Multiple | Private react-stately subpath imports | Critical |
| 0-3 | P0 | Calendar | Day names ignore locale | Critical |
| 0-4 | P0 | Slider | `Intl.NumberFormat` not memoized | Bug |
| 0-5 | P0 | Provider | `useMemo` always invalidates | Bug |
| 1-1 | P1 | Modal/Popover | `accessibilityRole="dialog" as never` | A11y |
| 1-2 | P1 | ListView/TreeView/TableView | `accessibilityRole="list"` on ScrollView | A11y |
| 1-3 | P1 | Slider | No increment/decrement a11y actions | A11y |
| 1-4 | P1 | TreeView | Nested Pressable — touch event leakage | A11y |
| 1-5 | P1 | TableView | Interactive rows use `role="none"` | A11y |
| 2-1 | P2 | Dialog | `w-[480px]` overflows narrow screens | Design |
| 2-2 | P2 | Popover | 'top' placement formula wrong | Design |
| 2-3 | P2 | ComboBox | Keyboard not dismissed on Tray open | UX |
| 2-4 | P2 | Modal | `testID` on backdrop, not content | API |
| 2-5 | P2 | Pressable | Style props double-applied | API |
| 3-1 | P3 | Slider | No interaction tests | Coverage |
| 3-2 | P3 | Calendar | No selection/navigation tests | Coverage |
| 3-3 | P3 | ComboBox | No open/select/close tests | Coverage |
| 3-4 | P3 | TreeView | No expand/collapse tests | Coverage |
| 3-5 | P3 | TableView | No sort/selection tests | Coverage |

---

## Success Criteria

- **P0 done:** Slider drag works, no private stately imports remain, Calendar respects locale.
- **P1 done:** Screen reader audit passes on Modal, Slider, ListView, TreeView, TableView.
- **P2 done:** Dialog fits 375pt screen, Popover positions correctly, ComboBox UX correct.
- **P3 done:** All 5 component suites have >80% branch coverage for interactive paths.
