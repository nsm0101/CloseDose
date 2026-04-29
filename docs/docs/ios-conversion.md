# Converting the CloseDose site into an iPhone app

This guide explains how to take the existing static website and ship it as a native iOS application using the SwiftUI scaffolding that lives in `ios/CloseDoseApp`.

## 1. Prepare the iOS project

1. Open Xcode and create a new **App** project named **CloseDose** with the **SwiftUI** interface template.
2. Set the minimum iOS version to 16.0 (or lower if you need broader support and adjust the SwiftUI APIs accordingly).
3. Choose your development team so the project can be run on devices.

## 2. Add the CloseDose SwiftUI wrapper

Copy the contents of `ios/CloseDoseApp` into the newly created project:

- `CloseDoseApp.swift` defines the main entry point.
- `ContentView.swift` provides a navigation container.
- `WebContentView.swift` wraps the site inside `WKWebView` and loads the bundled HTML by default.
- `Info.plist` configures the bundle metadata and App Transport Security rules.
- `Resources/index.html` is the exported site content. Replace this file whenever you update the website.

Make sure the `Resources` folder is added to the Xcode target with the "Copy items if needed" option checked so the HTML ships inside the application bundle.

## 3. Verify the experience

Build and run the app in the simulator. The web content should render full screen with the native navigation bar title "CloseDose". Interactions, forms, and responsive layout will match the mobile web experience because the HTML, CSS, and JavaScript come directly from the existing site.

If you prefer to stream the live production site rather than bundle static HTML, edit `WebContentView` so that the `WKWebView` loads `https://closedose.org` via `load(URLRequest(url:))`. In that case you can remove the `Resources` folder entirely.

## 4. Polish the native shell

- Add an app icon (1024×1024 PNG) and configure it in the Asset Catalog.
- Create a launch screen storyboard that matches the brand.
- Enable background modes, push notifications, or other capabilities as needed.
- Consider adding analytics or native navigation wrappers for key pages to reduce web navigation overhead.

## 5. Ship to TestFlight and the App Store

1. Update the bundle identifier to match your Apple Developer account.
2. Increment the version (`CFBundleShortVersionString`) and build (`CFBundleVersion`) numbers when preparing releases.
3. Archive the build in Xcode, then distribute via TestFlight for internal and external testing.
4. Once satisfied, submit for App Store review, including the privacy questionnaire and screenshots captured from the simulator.

By reusing the responsive site inside a lightweight native shell, you can reach iOS users quickly without re-implementing your content in SwiftUI from scratch. You can evolve the app over time by progressively replacing web sections with native Swift views as needed.
