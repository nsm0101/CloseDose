# CloseDose iOS Calculator

This directory contains the SwiftUI implementation of the CloseDose pediatric fever and pain dosing calculator. The native app mirrors the logic and presentation of the original CloseDose index card, including the teal-tinted care cells and dosing result cards that highlight the output values.

## Features

- SwiftUI interface with the three calculator steps (age, weight, calculate)
- Weight entry supports pounds and kilograms with automatic conversion in the results
- Dose calculations match the production web widget and respect age-based safety caps
- Care cell callouts for urgent guidance, maximum dose reminders, and spacing instructions
- Styling aligns with CloseDose brand colors and card layouts for familiarity and clarity

## Getting started in Xcode

1. Open Xcode and create a new **App** project that targets iOS 16 or later.
2. Name the project **CloseDose** with the **SwiftUI** interface and **Swift** language.
3. Replace the generated files with the contents of this directory:
   - Add `CloseDoseApp.swift`, `ContentView.swift`, `DosingCalculator.swift`, and `CloseDoseStyle.swift` to the main target.
   - Merge the provided `Info.plist` keys into your project's Info.plist if needed.
4. Build and run on the iOS Simulator or a provisioned device.

## Updating medication logic

All dosing rules are centralized in `DosingCalculator.swift`. Update the constants or formulas in that file if guidelines change. The SwiftUI views automatically reflect any adjustments made to the calculations or warning messages.

## Assets

Brand images and icons from the main CloseDose web project can be added to the Xcode asset catalog to complete the native experience.
