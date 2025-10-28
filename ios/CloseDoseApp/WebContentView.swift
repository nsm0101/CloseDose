import SwiftUI
import WebKit

struct WebContentView: UIViewRepresentable {
    private let initialURL: URL

    init(initialURL: URL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Resources") ?? URL(string: "https://closedose.org")!) {
        self.initialURL = initialURL
    }

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        webView.configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        webView.navigationDelegate = context.coordinator
        webView.loadFileURL(initialURL, allowingReadAccessTo: initialURL.deletingLastPathComponent())
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        guard uiView.url == nil else { return }
        uiView.loadFileURL(initialURL, allowingReadAccessTo: initialURL.deletingLastPathComponent())
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            #if DEBUG
            print("Navigation failed: \(error.localizedDescription)")
            #endif
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            #if DEBUG
            print("Provisional navigation failed: \(error.localizedDescription)")
            #endif
        }
    }
}
