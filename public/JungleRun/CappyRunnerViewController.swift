import UIKit
import WebKit

/// A custom View Controller designed to load the 3D Capybara Endless Runner game
/// within a native iOS Swift application. It handles loading the game, disabling
/// standard browser scroll/bounce gestures, and capturing close events from the web game.
class CappyRunnerViewController: UIViewController, WKScriptMessageHandler {

    private var webView: WKWebView!

    // The URL where the 3D game is hosted. Change this to your deployed domain.
    // E.g., "https://closedose.com/Cappy3D.html"
    var gameURLString: String = "https://closedose.com/Cappy3D.html"

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        loadGame()
    }

    override var prefersStatusBarHidden: Bool {
        return true // Hide status bar for a clean, immersive game interface
    }

    override var prefersHomeIndicatorAutoHidden: Bool {
        return true // Hide home indicator for full-screen game control
    }

    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Register the script message handler for capturing the exit button signal
        // This coordinates with cappy-3d.js line where messageHandlers.closeHandler is called.
        configuration.userContentController.add(self, name: "closeHandler")

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.translatesAutoresizingMaskIntoConstraints = false

        // Clean up UI options for native game feel
        webView.scrollView.bounces = false
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never // Full-bleed screen layout

        view.addSubview(webView)

        // Constraint Webview to full screen edges
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func loadGame() {
        guard let url = URL(string: gameURLString) else {
            print("CappyRunner: Invalid URL string: \(gameURLString)")
            return
        }

        // Optimizes web requests by passing custom User-Agent details if necessary
        webView.customUserAgent = "CloseDoseNativeiOSApp-Cappy3D"

        let request = URLRequest(url: url)
        webView.load(request)
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "closeHandler", let messageBody = message.body as? String {
            if messageBody == "exit_cappy_runner" {
                // Dismiss the View Controller when the player clicks the close button "✕" in the game UI
                self.dismiss(animated: true, completion: nil)
            }
        }
    }
}

// MARK: - Swift Integration Example
// Copy this extension into your main ViewController (e.g., HomeViewController.swift)
// to wire up a hidden link/gesture that loads this 3D Capybara game dynamically.
/*
extension HomeViewController {

    /// Call this inside your main view controller's viewDidLoad to attach a secret trigger gesture
    func setupSecretCappyGameTrigger(on logoView: UIImageView) {
        logoView.isUserInteractionEnabled = true

        // Example 1: Triple tap gesture trigger on the logo
        let tripleTapGesture = UITapGestureRecognizer(target: self, action: #selector(launchSecretGame))
        tripleTapGesture.numberOfTapsRequired = 3
        logoView.addGestureRecognizer(tripleTapGesture)

        // Example 2: Long press gesture trigger (lasts 3 seconds)
        // let longPressGesture = UILongPressGestureRecognizer(target: self, action: #selector(launchSecretGame))
        // longPressGesture.minimumPressDuration = 3.0
        // logoView.addGestureRecognizer(longPressGesture)
    }

    @objc private func launchSecretGame() {
        // Taptic haptic feedback on launch
        let generator = UIImpactFeedbackGenerator(style: .heavy)
        generator.prepare()
        generator.impactOccurred()

        let gameVC = CappyRunnerViewController()

        // Pass your hosted server URL.
        // TIP: In local development, you can serve cappy-3d.html over localhost/LAN and point here!
        gameVC.gameURLString = "https://closedose.com/Cappy3D.html"

        gameVC.modalPresentationStyle = .fullScreen // Full immersion modal
        gameVC.modalTransitionStyle = .crossDissolve // Slick transition fade

        self.present(gameVC, animated: true, completion: nil)
    }
}
*/
