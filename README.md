# CloseDose

CloseDose is a simple front-end prototype for a pediatric medication dosing calculator. It is built with plain HTML, CSS and JavaScript and is hosted via GitHub Pages. The project uses a responsive layout and adapts to your device's preferred color scheme.

## Modular calculator widget

The dosing calculator now ships as a reusable widget that can be embedded inside CloseDose pages or external sites. The widget is implemented in [`widget/close-dose-calculator.js`](widget/close-dose-calculator.js) and exposes a global `CloseDoseCalculator.mount(target, options)` helper. To render the card you can add an empty container element and call the helper:

```html
<div id="my-calculator"></div>
<script src="https://closedose.com/widget/close-dose-calculator.js"></script>
<script>
  window.CloseDoseCalculator.mount('#my-calculator');
</script>
```

The optional `options.strings` object allows you to localize or customize any label. See the language-specific pages (`index-es.html`, `index-fr.html`, `index-pt.html`) for complete examples. Set `options.injectStyles` to `false` if you prefer to provide your own styles.

By default the widget renders four pediatric age groups (0-2 months, 2-6 months, 6-24 months, and 2+ years) with tailored messaging for infants under two months and ibuprofen guidance for children under six months.

## Dark & Light Modes

The site supports both dark and light modes using the CSS prefers-color-scheme media query. Dark mode uses a dark teal background with a white logo, while light mode uses a teal background and dark logo. You can find the assets in the images/ directory. If you wish to swap in different colors or images, update the relevant variables in style.css.

## Logo Files and License

This repository contains several CloseDose logo files in SVG and PNG formats. The logos are the intellectual property of Nickolas Mancini, MD, MBA and are provided solely for use with the CloseDose project. Redistribution or modification of the logo assets is prohibited without express permission. Please see LOGO_LICENSE.md for the full license.
