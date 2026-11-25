import { calculateSupportFinance, InvalidBudgetYearsError } from "./support.finance";

describe("calculateSupportFinance", () => {
  const years = { startYear: 2025, endYear: 2027 };

  it("needed support fills only the needed amount, in USD and domestic currency (USD x rate)", () => {
    const result = calculateSupportFinance(
      { direction: "Needed", financeNature: "International", requiredAmount: 1000, receivedAmount: 555, exchangeRate: 119 },
      years
    );
    expect(result.requiredAmount).toBe(1000);
    expect(result.requiredAmountDomestic).toBe(119000);
    expect(result.receivedAmount).toBe(0);
    expect(result.receivedAmountDomestic).toBe(0);
  });

  it("received support (committed or received) fills only the received amount", () => {
    const result = calculateSupportFinance(
      { direction: "Received", financeNature: "International", requiredAmount: 777, receivedAmount: 250.55, exchangeRate: 119 },
      years
    );
    expect(result.receivedAmount).toBe(250.55);
    expect(result.receivedAmountDomestic).toBe(29815.45);
    expect(result.requiredAmount).toBe(0);
    expect(result.requiredAmountDomestic).toBe(0);
  });

  it("rounds domestic amounts to two decimal places", () => {
    const result = calculateSupportFinance(
      { direction: "Needed", financeNature: "International", requiredAmount: 10.01, exchangeRate: 119.33 },
      years
    );
    expect(result.requiredAmountDomestic).toBe(1194.49);
  });

  it("international finance has no national budget fields", () => {
    const result = calculateSupportFinance(
      {
        direction: "Needed",
        financeNature: "International",
        requiredAmount: 1,
        exchangeRate: 119,
        nationallyBudgetSupported: true,
        nationalBudgetAllocation: [{ year: 2025, amount: 5 }],
      },
      years
    );
    expect(result.nationallyBudgetSupported).toBeNull();
    expect(result.nationalBudgetAllocation).toBeNull();
    expect(result.nationalBudgetTotalDomestic).toBeNull();
  });

  it("national finance without budget support keeps the answer but no yearly amounts", () => {
    const result = calculateSupportFinance(
      { direction: "Needed", financeNature: "National", requiredAmount: 1, exchangeRate: 119, nationallyBudgetSupported: false, nationalBudgetAllocation: [{ year: 2025, amount: 5 }] },
      years
    );
    expect(result.nationallyBudgetSupported).toBe(false);
    expect(result.nationalBudgetAllocation).toBeNull();
    expect(result.nationalBudgetTotal).toBeNull();
  });

  it("totals the yearly national budget: domestic total is the sum, USD total is that divided by the rate", () => {
    const result = calculateSupportFinance(
      {
        direction: "Needed",
        financeNature: "National",
        requiredAmount: 1,
        exchangeRate: 119,
        nationallyBudgetSupported: true,
        nationalBudgetAllocation: [
          { year: 2027, amount: 11900 },
          { year: 2025, amount: 23800 },
          { year: 2026, amount: 0 },
        ],
      },
      years
    );
    expect(result.nationalBudgetAllocation.map((e) => e.year)).toEqual([2025, 2026, 2027]);
    expect(result.nationalBudgetTotalDomestic).toBe(35700);
    expect(result.nationalBudgetTotal).toBe(300);
  });

  it("rejects a year outside the activity's years", () => {
    expect(() =>
      calculateSupportFinance(
        { direction: "Needed", financeNature: "National", requiredAmount: 1, exchangeRate: 119, nationallyBudgetSupported: true, nationalBudgetAllocation: [{ year: 2028, amount: 1 }] },
        years
      )
    ).toThrow(InvalidBudgetYearsError);
  });

  it("rejects the same year twice", () => {
    expect(() =>
      calculateSupportFinance(
        { direction: "Needed", financeNature: "National", requiredAmount: 1, exchangeRate: 119, nationallyBudgetSupported: true, nationalBudgetAllocation: [{ year: 2026, amount: 1 }, { year: 2026, amount: 2 }] },
        years
      )
    ).toThrow(InvalidBudgetYearsError);
  });

  it("does not check the range when the activity has no years", () => {
    const result = calculateSupportFinance(
      { direction: "Needed", financeNature: "National", requiredAmount: 1, exchangeRate: 119, nationallyBudgetSupported: true, nationalBudgetAllocation: [{ year: 2040, amount: 119 }] },
      {}
    );
    expect(result.nationalBudgetTotal).toBe(1);
  });
});
