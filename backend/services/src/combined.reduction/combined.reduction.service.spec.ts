import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getEntityManagerToken, getRepositoryToken } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { CombinedGhgReductionViewEntity } from "../entities/combined.ghgReduction.view.entity";
import { User } from "../entities/user.entity";
import { ProjectionType } from "../enums/projection.enum";
import { ReductionType } from "../enums/reduction.enum";
import { HelperService } from "../util/helpers.service";
import { GhgCombinedReductionService } from "./combined.reduction.service";

describe("GhgCombinedReductionService", () => {
  let service: GhgCombinedReductionService;
  let viewRepoMock: { query: jest.Mock };
  let helperServiceMock: Partial<HelperService>;
  const user = new User();

  beforeEach(async () => {
    viewRepoMock = { query: jest.fn() };
    helperServiceMock = { formatReqMessagesString: jest.fn().mockReturnValue("message") };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GhgCombinedReductionService,
        { provide: Logger, useValue: { log: jest.fn(), error: jest.fn() } },
        { provide: getEntityManagerToken(), useValue: {} as Partial<EntityManager> },
        { provide: getRepositoryToken(CombinedGhgReductionViewEntity), useValue: viewRepoMock },
        { provide: HelperService, useValue: helperServiceMock },
      ],
    }).compile();

    service = module.get<GhgCombinedReductionService>(GhgCombinedReductionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getActualReductions", () => {
    it("rejects an unknown reduction type", async () => {
      await expect(service.getActualReductions("nope" as ReductionType, user)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
        "ghgInventory.invalidReductionType",
        []
      );
      expect(viewRepoMock.query).not.toHaveBeenCalled();
    });

    it("reads the actual emission reduction column and keys the data by IPCC sub-sector tag", async () => {
      viewRepoMock.query.mockResolvedValueOnce([
        { ipccSubSector: "1A1 Energy Industries", data: 12.5, startYear: 2024 },
        { ipccSubSector: "3B1 Forest land", data: 3, startYear: 2024 },
      ]);

      const result = await service.getActualReductions(ReductionType.EQUIVALENT_EMISSION_REDUCTIONS, user);

      expect(viewRepoMock.query.mock.calls[0][0]).toContain('"actualEmissionReduct" as data');
      expect(result).toEqual({
        reductionData: { "1A1": 12.5, "3B1": 3 },
        reductionType: ReductionType.EQUIVALENT_EMISSION_REDUCTIONS,
      });
    });

    it("returns an empty object when there is no data", async () => {
      viewRepoMock.query.mockResolvedValueOnce([]);

      const result = await service.getActualReductions(ReductionType.BASELINE_EMISSIONS, user);

      expect(viewRepoMock.query.mock.calls[0][0]).toContain('"baselineActualEmissions" as data');
      expect(result.reductionData).toEqual({});
    });
  });

  describe("getExpectedReductions", () => {
    it("rejects an unknown projection type", async () => {
      let error: HttpException;
      try {
        await service.getExpectedReductions("nope" as ProjectionType, user);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(viewRepoMock.query).not.toHaveBeenCalled();
    });

    it("reads the column of the chosen projection type", async () => {
      viewRepoMock.query.mockResolvedValueOnce([
        { ipccSubSector: "2A Mineral Industry", data: 7, startYear: 2030 },
      ]);

      const result = await service.getExpectedReductions(ProjectionType.WITH_ADDITIONAL_MEASURES, user);

      expect(viewRepoMock.query.mock.calls[0][0]).toContain('"expectedEmissionReductWithAM" as data');
      expect(result.reductionData).toEqual({ "2A": 7 });
    });
  });
});
