import SwiftUI

extension Color {
    static let closeDoseTeal400 = Color(red: 0x24 / 255, green: 0xa6 / 255, blue: 0x87 / 255)
    static let closeDoseTeal500 = Color(red: 0x1f / 255, green: 0x8f / 255, blue: 0x7b / 255)
    static let closeDoseTeal600 = Color(red: 0x12 / 255, green: 0x3a / 255, blue: 0x37 / 255)
    static let closeDoseInk900 = Color(red: 0x0f / 255, green: 0x2c / 255, blue: 0x2a / 255)
    static let closeDoseBackground = Color(red: 0xf5 / 255, green: 0xf9 / 255, blue: 0xf9 / 255)
    static let closeDoseCardBackground = Color.white.opacity(0.94)

    static let warningTealBackground = Color(red: 0xd1 / 255, green: 0xf3 / 255, blue: 0xec / 255)
    static let warningOrangeBackground = Color(red: 0xff / 255, green: 0xe4 / 255, blue: 0xc4 / 255)
    static let warningRedBackground = Color(red: 0xff / 255, green: 0xd5 / 255, blue: 0xd6 / 255)
}

private let indexCardCornerRadius: CGFloat = 26

struct IndexCard<Content: View>: View {
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            content()
        }
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: indexCardCornerRadius, style: .continuous)
                .fill(Color.closeDoseCardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: indexCardCornerRadius, style: .continuous)
                .stroke(Color.closeDoseInk900, lineWidth: 3)
        )
        .shadow(color: Color.closeDoseInk900.opacity(0.18), radius: 0, x: 0, y: 6)
    }
}

extension InlineWarning.Style {
    var backgroundColor: Color {
        switch self {
        case .teal:
            return .warningTealBackground
        case .orange:
            return .warningOrangeBackground
        case .red:
            return .warningRedBackground
        }
    }

    var foregroundColor: Color {
        switch self {
        case .teal:
            return .closeDoseInk900
        case .orange:
            return .closeDoseInk900
        case .red:
            return .closeDoseInk900
        }
    }
}

struct CareCellView: View {
    let warning: InlineWarning

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let title = warning.title, !title.isEmpty {
                Text(title)
                    .font(.headline)
                    .bold()
            }
            markdownText(warning.message)
                .font(.subheadline)
        }
        .foregroundStyle(warning.style.foregroundColor)
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(warning.style.backgroundColor)
        )
    }
}

struct ResultCardView: View {
    let card: MedicationCard

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(card.title)
                .font(.headline)
                .foregroundStyle(Color.closeDoseTeal600)
            ForEach(card.bodyMarkdown, id: \.self) { item in
                markdownText(item)
                    .font(.body)
                    .foregroundStyle(Color.closeDoseInk900)
            }
            if !card.warnings.isEmpty {
                VStack(spacing: 12) {
                    ForEach(card.warnings) { warning in
                        CareCellView(warning: warning)
                    }
                }
                .padding(.top, 4)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.white.opacity(0.96))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(Color.closeDoseInk900.opacity(0.12), lineWidth: 1)
        )
    }
}

func markdownText(_ string: String) -> Text {
    if let attributed = try? AttributedString(markdown: string, options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace)) {
        return Text(attributed)
    }
    return Text(string)
}
