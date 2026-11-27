import { validate } from "class-validator";
import { KpiUpdateDto } from "./kpi.update.dto";
import { EntityType, KPIAction } from "../enums/shared.enum";
import { IsReferenceValueWhenConstraint } from "../util/referenceValue.decorator";
import { ReferenceDataList } from "../enums/reference.data.enum";

describe("KpiUpdateDto", () => {
	const validBase = (): KpiUpdateDto => {
		const dto = new KpiUpdateDto();
		dto.kpiId = 1;
		dto.kpiUnit = "percent";
		dto.creatorType = EntityType.ACTION;
		dto.expected = 10;
		dto.kpiAction = KPIAction.UPDATED;
		dto.name = "S1.1: Share of population with safely managed drinking water";
		return dto;
	};

	it("rejects empty name when kpiAction is Updated", async () => {
		const dto = validBase();
		dto.name = "";
		const errors = await validate(dto);
		expect(errors.some((error) => error.property === "name")).toBe(true);
	});

	it("does not require KPI_NAME list membership when kpiAction is Updated", async () => {
		const dto = validBase();
		dto.name = "Legacy KPI name not in national list";
		const spy = jest
			.spyOn(IsReferenceValueWhenConstraint.prototype, "validate")
			.mockResolvedValue(true);
		try {
			const errors = await validate(dto);
			expect(errors.filter((error) => error.property === "name")).toHaveLength(0);
		} finally {
			spy.mockRestore();
		}
	});

	it("checks KPI_NAME list when kpiAction is Created", async () => {
		const dto = validBase();
		dto.kpiAction = KPIAction.CREATED;
		dto.name = "Not in list";
		const spy = jest
			.spyOn(IsReferenceValueWhenConstraint.prototype, "validate")
			.mockImplementation(async (value: unknown, args: { constraints: unknown[]; object: unknown }) => {
				const [predicate] = args.constraints as [(o: Record<string, unknown>) => boolean, ReferenceDataList];
				if (!predicate(args.object as Record<string, unknown>)) {
					return true;
				}
				return value === "S1.1: Share of population with safely managed drinking water";
			});
		try {
			const errors = await validate(dto);
			expect(errors.some((error) => error.property === "name")).toBe(true);
		} finally {
			spy.mockRestore();
		}
	});
});