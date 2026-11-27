import { HttpException } from "@nestjs/common";
import { PayloadValidator } from "./payload.validator";
import { KpiDto } from "../dtos/kpi.dto";
import { EntityType } from "../enums/shared.enum";
import { HelperService } from "../util/helpers.service";

describe("PayloadValidator", () => {
	let validator: PayloadValidator;
	let helperServiceMock: Partial<HelperService>;

	const validKpi = (): KpiDto => {
		const kpi = new KpiDto();
		kpi.name = "S1.1: Share of population with safely managed drinking water";
		kpi.kpiUnit = "percent";
		kpi.creatorType = EntityType.ACTION;
		kpi.expected = 10;
		return kpi;
	};

	beforeEach(() => {
		helperServiceMock = {
			formatReqMessagesString: jest.fn((key: string) => key),
		};
		validator = new PayloadValidator(helperServiceMock as HelperService);
	});

	describe("validateKpiPayload", () => {
		it("should accept expected target of 0", () => {
			const kpi = validKpi();
			kpi.expected = 0;
			expect(() => validator.validateKpiPayload(kpi, EntityType.ACTION)).not.toThrow();
		});

		it("should reject missing expected target", () => {
			const kpi = validKpi();
			(kpi as any).expected = undefined;
			expect(() => validator.validateKpiPayload(kpi, EntityType.ACTION)).toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
				"kpi.expectedCannotBeNull",
				[]
			);
		});

		it("should reject null expected target", () => {
			const kpi = validKpi();
			(kpi as any).expected = null;
			expect(() => validator.validateKpiPayload(kpi, EntityType.ACTION)).toThrow(HttpException);
		});

		it("should reject expected with more than two decimal places", () => {
			const kpi = validKpi();
			kpi.expected = 1.234;
			expect(() => validator.validateKpiPayload(kpi, EntityType.ACTION)).toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
				"kpi.expectCanHaveOnlyTwoDecimals",
				[]
			);
		});
	});
});