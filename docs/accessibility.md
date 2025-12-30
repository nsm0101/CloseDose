# Accessibility checklist

## Keyboard navigation
- Tab order follows the visual flow: header controls → dosing steps → timeline → footer.
- Focus is visible on all buttons, toggles, inputs, and links.
- Accessibility sheet traps focus while open, closes with Escape, and returns focus to the opener.

## Screen reader order
- Headings are in logical order (H2 for page sections, H3 for steps).
- Labels are programmatically associated with inputs.
- ARIA attributes reflect state (expanded, dialog, live regions).

## Contrast targets
- Calm Mode meets high-contrast expectations (aim for 7:1 or higher).
- Default mode maintains at least 4.5:1 for text and 3:1 for large text.

## Motion and font
- Reduced Motion disables animations and auto-scrolling.
- Dyslexia-friendly font is optional and never forced.

## Testing steps
1. Open `index2.html` and toggle each accessibility setting.
2. Verify the UI updates immediately (font, size, motion, contrast, icons).
3. Navigate with keyboard only, ensuring focus never gets trapped outside the sheet.
4. Use a screen reader to confirm labels and button states are announced.
5. Confirm the “When to seek care” banner is reachable and readable at all sizes.
