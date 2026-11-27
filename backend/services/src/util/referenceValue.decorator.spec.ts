import { validate } from "class-validator";
import { Repository } from "typeorm";
import { ReferenceDataEntity } from "../entities/reference.data.entity";
import { ReferenceDataList } from "../enums/reference.data.enum";
import {
  IsReferenceValue,
  IsReferenceValueConstraint,
  IsReferenceValueWhenConstraint,
} from "./referenceValue.decorator";
import { KPIAction } from "../enums/shared.enum";

describe("IsReferenceValue", () => {
  let constraint: IsReferenceValueConstraint;
  let count: jest.Mock;

  const args = (listKey: ReferenceDataList, value: any) =>
    ({ constraints: [listKey], property: "field", value } as any);

  beforeEach(() => {
    count = jest.fn();
    constraint = new IsReferenceValueConstraint({ count } as unknown as Repository<ReferenceDataEntity>);
  });

  it("accepts a value that is in the list", async () => {
    count.mockResolvedValue(1);
    await expect(
      constraint.validate("Department of Energy (DoE)", args(ReferenceDataList.SUB_SECTOR, "x"))
    ).resolves.toBe(true);
    expect(count).toHaveBeenCalledWith({
      where: { listKey: ReferenceDataList.SUB_SECTOR, code: "Department of Energy (DoE)" },
    });
  });

  it("rejects a value that is not in the list", async () => {
    count.mockResolvedValue(0);
    await expect(
      constraint.validate("Nowhere", args(ReferenceDataList.SUB_SECTOR, "Nowhere"))
    ).resolves.toBe(false);
  });

  it("rejects an empty value or a value that is not text, without asking the database", async () => {
    await expect(constraint.validate("", args(ReferenceDataList.SUB_SECTOR, ""))).resolves.toBe(false);
    await expect(constraint.validate(undefined, args(ReferenceDataList.SUB_SECTOR, undefined))).resolves.toBe(false);
    await expect(constraint.validate(5, args(ReferenceDataList.SUB_SECTOR, 5))).resolves.toBe(false);
    expect(count).not.toHaveBeenCalled();
  });

  it("names the property, the value and the list in the message", () => {
    expect(constraint.defaultMessage(args(ReferenceDataList.POLICY_REFERENCE, "Bad"))).toBe(
      'Invalid field: "Bad" is not a value of the POLICY_REFERENCE list'
    );
  });

  describe("IsReferenceValueWhenConstraint", () => {
    let whenConstraint: IsReferenceValueWhenConstraint;

    beforeEach(() => {
      whenConstraint = new IsReferenceValueWhenConstraint({ count } as unknown as Repository<ReferenceDataEntity>);
    });

    it("skips list check when predicate is false", async () => {
      const predicate = (object: Record<string, unknown>) => object.kpiAction === KPIAction.CREATED;
      const validationArgs = {
        constraints: [predicate, ReferenceDataList.KPI_NAME],
        object: { kpiAction: KPIAction.UPDATED },
        property: "name",
        value: "Legacy name",
      } as any;
      await expect(whenConstraint.validate("Legacy name", validationArgs)).resolves.toBe(true);
      expect(count).not.toHaveBeenCalled();
    });
  });

  describe("as a decorator on a class", () => {
    class Sample {
      @IsReferenceValue(ReferenceDataList.RECIPIENT_ENTITY, { each: true })
      recipients: string[];
    }

    it("validates every element of an array", async () => {
      // class-validator builds its own constraint instance here (no Nest container in a unit test),
      // so give the instances it creates a repository too.
      const original = IsReferenceValueConstraint.prototype.validate;
      const spy = jest
        .spyOn(IsReferenceValueConstraint.prototype, "validate")
        .mockImplementation(async (value: any) => value === "Ministry of Health (MoH)");
      try {
        const ok = new Sample();
        ok.recipients = ["Ministry of Health (MoH)"];
        expect(await validate(ok)).toHaveLength(0);

        const bad = new Sample();
        bad.recipients = ["Ministry of Health (MoH)", "Not a ministry"];
        const errors = await validate(bad);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("recipients");
      } finally {
        spy.mockRestore();
        expect(IsReferenceValueConstraint.prototype.validate).toBe(original);
      }
    });
  });
});
