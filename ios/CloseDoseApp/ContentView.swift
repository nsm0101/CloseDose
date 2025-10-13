import SwiftUI

struct ContentView: View {
    @State private var selectedAge: AgeGroup? = nil
    @State private var weightText: String = ""
    @State private var weightUnit: WeightUnit = .pounds
    @State private var calculationResult: CalculationResult? = nil
    @State private var alertMessage: InlineWarning? = nil
    @FocusState private var weightFieldFocused: Bool

    private var isEmergencyAge: Bool {
        selectedAge?.gate == .emergency
    }

    private var emergencyWarning: InlineWarning? {
        guard selectedAge?.gate == .emergency else { return nil }
        return InlineWarning(
            title: "Seek immediate medical care.",
            message: "If a child less than 60 days old has a fever it is a medical emergency. Please contact your pediatrician or seek care with a healthcare provider immediately.",
            style: .red
        )
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    headerSection
                    ageSelectionSection
                    weightEntrySection
                    calculateButton
                    if let emergencyWarning {
                        CareCellView(warning: emergencyWarning)
                    }
                    if let alertMessage {
                        CareCellView(warning: alertMessage)
                    }
                    if let result = calculationResult {
                        resultsSection(result)
                    }
                    Spacer(minLength: 12)
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 32)
            }
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.closeDoseBackground, Color.white]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
            .navigationTitle("CloseDose")
            .navigationBarTitleDisplayMode(.inline)
        }
        .accentColor(.closeDoseTeal500)
        .onChange(of: selectedAge) { _ in
            resetForNewInput(clearWeight: false)
        }
        .onChange(of: weightUnit) { _ in
            calculationResult = nil
            alertMessage = nil
        }
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Pediatric Fever & Pain Dosing")
                .font(.largeTitle.bold())
                .foregroundStyle(Color.closeDoseInk900)
            Text("Follow the three simple steps to match the original index card calculator: pick an age group, enter weight, and calculate the recommended doses.")
                .font(.callout)
                .foregroundStyle(Color.closeDoseInk900.opacity(0.8))
        }
    }

    private var ageSelectionSection: some View {
        IndexCard {
            VStack(alignment: .leading, spacing: 16) {
                Text("Step 1: Tap an age group")
                    .font(.title3.bold())
                    .foregroundStyle(Color.closeDoseTeal600)
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                    ForEach(AgeGroup.allCases) { age in
                        AgeButton(age: age, isSelected: age == selectedAge) {
                            selectedAge = age
                        }
                    }
                }
            }
        }
    }

    private var weightEntrySection: some View {
        IndexCard {
            VStack(alignment: .leading, spacing: 18) {
                Text("Step 2: Enter weight")
                    .font(.title3.bold())
                    .foregroundStyle(Color.closeDoseTeal600)
                VStack(alignment: .leading, spacing: 10) {
                    Text("Weight")
                        .font(.headline)
                        .foregroundStyle(Color.closeDoseInk900)
                    HStack(spacing: 12) {
                        TextField("Enter weight", text: $weightText)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(.roundedBorder)
                            .focused($weightFieldFocused)
                            .disabled(isEmergencyAge)
                        Picker("Units", selection: $weightUnit) {
                            ForEach(WeightUnit.allCases) { unit in
                                Text(unit.label).tag(unit)
                            }
                        }
                        .pickerStyle(.segmented)
                        .disabled(isEmergencyAge)
                    }
                }
            }
        }
    }

    private var calculateButton: some View {
        Button(action: calculateDose) {
            Text("Step 3: Calculate!")
                .fontWeight(.bold)
                .padding(.vertical, 14)
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.borderedProminent)
        .tint(.closeDoseTeal500)
        .disabled(isEmergencyAge)
    }

    private func resultsSection(_ result: CalculationResult) -> some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Patient weight")
                    .font(.title3.bold())
                    .foregroundStyle(Color.closeDoseInk900)
                Text("\(format(result.weightKg, decimals: 1)) kg (\(format(result.weightLbs, decimals: 1)) lbs)")
                    .font(.headline)
                    .foregroundStyle(Color.closeDoseTeal600)
            }

            VStack(spacing: 18) {
                ForEach(result.cards) { card in
                    ResultCardView(card: card)
                }
            }

            if !result.trailingWarnings.isEmpty {
                VStack(spacing: 16) {
                    ForEach(result.trailingWarnings) { warning in
                        CareCellView(warning: warning)
                    }
                }
            }
        }
    }

    private func calculateDose() {
        weightFieldFocused = false
        calculationResult = nil
        alertMessage = nil

        guard let age = selectedAge else {
            alertMessage = InlineWarning(
                title: "Age required",
                message: "Please select an age group to continue.",
                style: .teal
            )
            return
        }

        guard !weightText.trimmingCharacters(in: .whitespaces).isEmpty else {
            alertMessage = InlineWarning(
                title: "Weight required",
                message: "Please enter a valid weight to calculate dosing.",
                style: .teal
            )
            return
        }

        guard let weight = parseWeight(from: weightText), weight > 0 else {
            alertMessage = InlineWarning(
                title: "Weight required",
                message: "Please enter a valid weight to calculate dosing.",
                style: .teal
            )
            return
        }

        guard age.gate != .emergency else {
            return
        }

        if let result = DosingCalculator.calculate(ageGroup: age, weight: weight, unit: weightUnit) {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                calculationResult = result
            }
        }
    }

    private func resetForNewInput(clearWeight: Bool) {
        calculationResult = nil
        alertMessage = nil
        if clearWeight {
            weightText = ""
        }
    }

    private func parseWeight(from string: String) -> Double? {
        let sanitized = string.replacingOccurrences(of: ",", with: ".")
        return Double(sanitized)
    }

    private func format(_ value: Double, decimals: Int) -> String {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = decimals
        formatter.maximumFractionDigits = decimals
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: value)) ?? String(format: "%0.*f", decimals, value)
    }
}

struct AgeButton: View {
    let age: AgeGroup
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Text(age.shortLabel)
                    .font(.headline)
                Text(age.title)
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Color.closeDoseInk900.opacity(0.7))
            }
            .padding(.vertical, 16)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(isSelected ? Color.closeDoseTeal400.opacity(0.3) : Color.white)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(isSelected ? Color.closeDoseTeal500 : Color.closeDoseInk900.opacity(0.1), lineWidth: 2)
            )
        }
        .foregroundStyle(Color.closeDoseInk900)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
