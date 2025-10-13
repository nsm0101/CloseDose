import Foundation

enum AgeGate {
    case emergency
    case infant
    case pediatric
    case adolescent
}

enum AgeGroup: String, CaseIterable, Identifiable {
    case zeroToTwo = "0-2"
    case twoToSix = "2-6"
    case sixToEleven = "6-11"
    case twelvePlus = "12+"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .zeroToTwo:
            return "0 Months to 2 Months"
        case .twoToSix:
            return "2 Months to 6 Months"
        case .sixToEleven:
            return "6 Months to 11 Years"
        case .twelvePlus:
            return "12 Years and Older"
        }
    }

    var shortLabel: String {
        switch self {
        case .zeroToTwo:
            return "0–2 mo"
        case .twoToSix:
            return "2–6 mo"
        case .sixToEleven:
            return "6 mo–11 yr"
        case .twelvePlus:
            return "12+ yr"
        }
    }

    var gate: AgeGate {
        switch self {
        case .zeroToTwo:
            return .emergency
        case .twoToSix:
            return .infant
        case .sixToEleven:
            return .pediatric
        case .twelvePlus:
            return .adolescent
        }
    }
}

enum WeightUnit: String, CaseIterable, Identifiable {
    case pounds
    case kilograms

    var id: String { rawValue }

    var label: String {
        switch self {
        case .pounds:
            return "lbs"
        case .kilograms:
            return "kg"
        }
    }
}

struct InlineWarning: Identifiable {
    enum Style {
        case teal
        case orange
        case red
    }

    let id = UUID()
    let title: String?
    let message: String
    let style: Style
}

struct MedicationCard: Identifiable {
    let id = UUID()
    let title: String
    let bodyMarkdown: [String]
    let warnings: [InlineWarning]
}

struct CalculationResult {
    let weightKg: Double
    let weightLbs: Double
    let cards: [MedicationCard]
    let trailingWarnings: [InlineWarning]
}

enum DosingCalculator {
    private static let poundsPerKilogram = 2.20462

    static func kilograms(from weight: Double, unit: WeightUnit) -> Double {
        switch unit {
        case .kilograms:
            return weight
        case .pounds:
            return weight / poundsPerKilogram
        }
    }

    static func pounds(from weight: Double, unit: WeightUnit) -> Double {
        switch unit {
        case .kilograms:
            return weight * poundsPerKilogram
        case .pounds:
            return weight
        }
    }

    static func calculate(ageGroup: AgeGroup, weight: Double, unit: WeightUnit) -> CalculationResult? {
        let gate = ageGroup.gate
        guard gate != .emergency else {
            return nil
        }

        let weightKg = kilograms(from: weight, unit: unit)
        let weightLbs = pounds(from: weight, unit: unit)

        var cards: [MedicationCard] = []
        var trailingWarnings: [InlineWarning] = []

        switch gate {
        case .infant:
            let acetaminophenMgCalculated = 12.5 * weightKg
            let acetaminophenMax = 160.0
            let acetaminophenMg = min(acetaminophenMgCalculated, acetaminophenMax)
            let acetaminophenMl = (acetaminophenMg / 160.0) * 5.0
            let capped = acetaminophenMg < acetaminophenMgCalculated - 0.01

            var warnings: [InlineWarning] = []
            if capped {
                warnings.append(
                    InlineWarning(
                        title: "Maximum dose reached",
                        message: "Weight-based dose was limited to this maximum. Consider discussing dosing with your pediatrician.",
                        style: .orange
                    )
                )
            }

            let acetaminophenCard = MedicationCard(
                title: "Acetaminophen (160 mg / 5 mL)",
                bodyMarkdown: [
                    "Give \(Self.format(acetaminophenMl, decimals: 1)) mL (\(Self.format(acetaminophenMg, decimals: 0)) mg) every 4 hours as needed for fever/pain.",
                    "Maximum single dose for this age group is \(Self.format(acetaminophenMax, decimals: 0)) mg."
                ],
                warnings: warnings
            )
            cards.append(acetaminophenCard)

            trailingWarnings.append(
                InlineWarning(
                    title: nil,
                    message: "*Ibuprofen is not recommended for infants under six months. Consult your pediatrician before using ibuprofen for this age group.*",
                    style: .red
                )
            )

        case .pediatric, .adolescent:
            let isPediatric = gate == .pediatric

            let acetaminophenMax = isPediatric ? 480.0 : 1000.0
            let ibuprofenMax = 800.0

            let acetaminophenMgCalculated = 15.0 * weightKg
            let acetaminophenMg = min(acetaminophenMgCalculated, acetaminophenMax)
            let acetaminophenMl = (acetaminophenMg / 160.0) * 5.0
            let acetaminophenCapped = acetaminophenMg < acetaminophenMgCalculated - 0.01

            let ibuprofenMgCalculated = 10.0 * weightKg
            let ibuprofenMg = min(ibuprofenMgCalculated, ibuprofenMax)
            let ibuprofenCapped = ibuprofenMg < ibuprofenMgCalculated - 0.01
            let ibuprofenMl100 = (ibuprofenMg / 100.0) * 5.0
            let ibuprofenMl50 = (ibuprofenMg / 50.0) * 1.25

            var acetaminophenWarnings: [InlineWarning] = []
            if acetaminophenCapped {
                acetaminophenWarnings.append(
                    InlineWarning(
                        title: nil,
                        message: "Maximum single dose for this age group is \(Self.format(acetaminophenMax, decimals: 0)) mg of acetaminophen every 6 hours.",
                        style: .orange
                    )
                )
                acetaminophenWarnings.append(
                    InlineWarning(
                        title: "Maximum dose reached",
                        message: "Weight-based dose was limited to this maximum. Consider discussing dosing with your pediatrician.",
                        style: .orange
                    )
                )
            }

            cards.append(
                MedicationCard(
                    title: "Acetaminophen (160 mg / 5 mL)",
                    bodyMarkdown: [
                        "Give \(Self.format(acetaminophenMl, decimals: 1)) mL (\(Self.format(acetaminophenMg, decimals: 0)) mg) every 6 hours as needed for fever/pain."
                    ],
                    warnings: acetaminophenWarnings
                )
            )

            var ibuprofenWarnings: [InlineWarning] = []
            if ibuprofenCapped {
                ibuprofenWarnings.append(
                    InlineWarning(
                        title: nil,
                        message: "Maximum single dose for this age group is \(Self.format(ibuprofenMax, decimals: 0)) mg of ibuprofen every 6 hours.",
                        style: .orange
                    )
                )
                ibuprofenWarnings.append(
                    InlineWarning(
                        title: "Maximum dose reached",
                        message: "Weight-based dose was limited to this maximum. Consider discussing dosing with your pediatrician.",
                        style: .orange
                    )
                )
            }

            cards.append(
                MedicationCard(
                    title: "Ibuprofen (oral)",
                    bodyMarkdown: [
                        "**Children's 100 mg / 5 mL:** Give \(Self.format(ibuprofenMl100, decimals: 1)) mL (\(Self.format(ibuprofenMg, decimals: 0)) mg) every 6 hours as needed for fever/pain.",
                        "**Infant's 50 mg / 1.25 mL:** Give \(Self.format(ibuprofenMl50, decimals: 1)) mL (\(Self.format(ibuprofenMg, decimals: 0)) mg) every 6 hours as needed for fever/pain."
                    ],
                    warnings: ibuprofenWarnings
                )
            )

            let spacingMessage: String
            if acetaminophenCapped || ibuprofenCapped {
                spacingMessage = "Never exceed \(Self.format(acetaminophenMax, decimals: 0)) mg of acetaminophen or \(Self.format(ibuprofenMax, decimals: 0)) mg of ibuprofen in a single dose, and allow at least 6 hours between doses."
            } else {
                spacingMessage = "Allow at least 6 hours between doses of acetaminophen or ibuprofen. Follow the product instructions for maximum amounts."
            }

            trailingWarnings.append(
                InlineWarning(
                    title: "Dose spacing reminder",
                    message: spacingMessage,
                    style: .teal
                )
            )
        case .emergency:
            break
        }

        return CalculationResult(
            weightKg: weightKg,
            weightLbs: weightLbs,
            cards: cards,
            trailingWarnings: trailingWarnings
        )
    }

    private static func format(_ value: Double, decimals: Int) -> String {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = decimals
        formatter.maximumFractionDigits = decimals
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: value)) ?? String(format: "%0.*f", decimals, value)
    }
}
