import { FinanceNature, SupportDirection } from "../enums/support.enum";

/** Thrown when the yearly national budget does not fit the activity's years. */
export class InvalidBudgetYearsError extends Error {}

export interface SupportFinanceInput {
  direction: string;
  financeNature: string;
  requiredAmount?: number;
  receivedAmount?: number;
  exchangeRate: number;
  nationallyBudgetSupported?: boolean;
  nationalBudgetAllocation?: { year: number; amount: number }[];
}

export interface SupportFinanceResult {
  requiredAmount: number;
  receivedAmount: number;
  requiredAmountDomestic: number;
  receivedAmountDomestic: number;
  nationallyBudgetSupported: boolean | null;
  nationalBudgetAllocation: { year: number; amount: number }[] | null;
  nationalBudgetTotalDomestic: number | null;
  nationalBudgetTotal: number | null;
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Works out the stored amounts of one support record.
 *
 * A record is one stage of the money: "Needed" fills the needed amount, "Received" (committed or
 * received) fills the received amount, and the other one stays 0. Every domestic-currency amount is
 * the US dollar amount multiplied by the exchange rate (domestic units per US dollar).
 *
 * National budget by year only applies to national finance that is budget supported; the total in
 * domestic currency is the sum of the years and the US dollar total is that sum divided by the rate.
 */
export function calculateSupportFinance(
  input: SupportFinanceInput,
  activityYears?: { startYear?: number; endYear?: number }
): SupportFinanceResult {
  const rate = Number(input.exchangeRate);
  const needed = input.direction === SupportDirection.NEEDED;
  const requiredAmount = needed ? Number(input.requiredAmount ?? 0) : 0;
  const receivedAmount = needed ? 0 : Number(input.receivedAmount ?? 0);

  const result: SupportFinanceResult = {
    requiredAmount,
    receivedAmount,
    requiredAmountDomestic: round2(requiredAmount * rate),
    receivedAmountDomestic: round2(receivedAmount * rate),
    nationallyBudgetSupported: null,
    nationalBudgetAllocation: null,
    nationalBudgetTotalDomestic: null,
    nationalBudgetTotal: null,
  };

  if (input.financeNature !== FinanceNature.NATIONAL) {
    return result;
  }

  result.nationallyBudgetSupported = input.nationallyBudgetSupported === true;
  if (!result.nationallyBudgetSupported) {
    return result;
  }

  const years = input.nationalBudgetAllocation ?? [];
  const seen = new Set<number>();
  for (const entry of years) {
    const outOfRange =
      activityYears?.startYear != null &&
      activityYears?.endYear != null &&
      (entry.year < activityYears.startYear || entry.year > activityYears.endYear);
    if (outOfRange || seen.has(entry.year)) {
      throw new InvalidBudgetYearsError(String(entry.year));
    }
    seen.add(entry.year);
  }

  const totalDomestic = round2(years.reduce((sum, entry) => sum + Number(entry.amount), 0));
  result.nationalBudgetAllocation = [...years]
    .map((entry) => ({ year: entry.year, amount: round2(Number(entry.amount)) }))
    .sort((a, b) => a.year - b.year);
  result.nationalBudgetTotalDomestic = totalDomestic;
  result.nationalBudgetTotal = round2(totalDomestic / rate);
  return result;
}
