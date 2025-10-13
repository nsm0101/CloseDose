import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            WebContentView()
                .navigationTitle("CloseDose")
                .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
