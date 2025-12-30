# Parent QA scenarios

## Scenario tests

### Night feed
1. Turn on Calm Mode and Large Text.
2. Tap Night Zoom and confirm the dose area scales without breaking layout.
3. Log a dose one-handed using the Confirm button.

### Grandparent handoff
1. Generate a share link from the dosing flow.
2. Open the link on another device and switch to Spanish.
3. Confirm the card is read-only and large text is respected.

### Neurodiversity support
1. Turn on Reduced Motion, Dyslexia-friendly font, and Icon-first guidance.
2. Ensure no flashing or auto-scrolling occurs.

### Voice entry
1. Deny microphone permission.
2. Confirm the app shows a calm message and typing still works.

### Emergency clarity
1. Scroll the timeline and verify the “When to seek care” banner stays visible.
2. Expand it and confirm it doesn’t cover primary actions.

## Manual browser checks
- iOS Safari: verify sticky banner placement above the bottom bar.
- Android Chrome: verify Night Zoom button is reachable and does not overlap navigation.

## Accessibility checks
- Focus order is logical and all controls are reachable.
- Contrast meets WCAG targets in Calm Mode and default mode.
- Text scaling up to 200% does not clip essential content.
- Screen reader labels are announced for buttons and toggles.
