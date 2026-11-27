import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { ActionDto } from "../dtos/action.dto";
import { ActionUpdateDto } from "../dtos/actionUpdate.dto";
import { ActivityDto } from "../dtos/activity.dto";
import { ActionStatus, InstrumentType } from "../enums/action.enum";
import { ActivityStatus } from "../enums/activity.enum";
import { INFORMATION_NOT_AVAILABLE, isYearNotAvailable, yearOrNotAvailable } from "./informationNotAvailable";

/** Properties with a validation error (the national strategy check needs the database, so it is not run here). */
const failing = (cls: any, plain: object): string[] =>
  validateSync(plainToInstance(cls, plain)).map((e) => e.property);

const action = {
  title: "t",
  description: "d",
  objective: "o",
  sector: "Energy",
  type: "Mitigation",
  instrumentType: [InstrumentType.POLICY],
  status: ActionStatus.PLANNED,
  startYear: 2025,
  natAnchor: ["NDC"],
};

describe("Information not available", () => {
  it("is a value of the action status, activity status and instrument type lists", () => {
    expect(ActionStatus.INFORMATION_NOT_AVAILABLE).toBe(INFORMATION_NOT_AVAILABLE);
    expect(ActivityStatus.INFORMATION_NOT_AVAILABLE).toBe(INFORMATION_NOT_AVAILABLE);
    expect(InstrumentType.INFORMATION_NOT_AVAILABLE).toBe(INFORMATION_NOT_AVAILABLE);
  });

  it("is appended to the status enums so the Postgres enum order matches", () => {
    expect(Object.values(ActionStatus).pop()).toBe(INFORMATION_NOT_AVAILABLE);
    expect(Object.values(ActivityStatus).pop()).toBe(INFORMATION_NOT_AVAILABLE);
  });

  describe("years", () => {
    it("shows the text for an empty year and the year otherwise", () => {
      expect(yearOrNotAvailable(null)).toBe(INFORMATION_NOT_AVAILABLE);
      expect(yearOrNotAvailable(undefined)).toBe(INFORMATION_NOT_AVAILABLE);
      expect(yearOrNotAvailable("")).toBe(INFORMATION_NOT_AVAILABLE);
      expect(yearOrNotAvailable(2030)).toBe(2030);
      expect(yearOrNotAvailable("2030")).toBe("2030");
    });

    it("recognises an empty year", () => {
      expect(isYearNotAvailable(null)).toBe(true);
      expect(isYearNotAvailable(undefined)).toBe(true);
      expect(isYearNotAvailable(0)).toBe(false);
      expect(isYearNotAvailable(2030)).toBe(false);
    });

    it.each([ActionDto, ActionUpdateDto])("%p accepts an action start year of null", (cls) => {
      const plain = { ...action, actionId: "A1", startYear: null };
      expect(failing(cls, plain)).not.toContain("startYear");
    });

    it.each([ActionDto, ActionUpdateDto])("%p still requires the action start year to be sent", (cls) => {
      const { startYear, ...withoutYear } = action;
      expect(failing(cls, { ...withoutYear, actionId: "A1" })).toContain("startYear");
    });

    it.each([ActionDto, ActionUpdateDto])("%p still rejects a start year outside the range", (cls) => {
      expect(failing(cls, { ...action, actionId: "A1", startYear: 1999 })).toContain("startYear");
      expect(failing(cls, { ...action, actionId: "A1", startYear: 2060 })).toContain("startYear");
    });

    it("accepts activity start and end years of null, and still checks real years", () => {
      expect(failing(ActivityDto, { startYear: null, endYear: null })).not.toContain("startYear");
      expect(failing(ActivityDto, { startYear: null, endYear: null })).not.toContain("endYear");
      expect(failing(ActivityDto, { startYear: 1999, endYear: 2060 })).toEqual(
        expect.arrayContaining(["startYear", "endYear"])
      );
    });
  });

  describe("type of instrument", () => {
    it.each([ActionDto, ActionUpdateDto])("%p accepts Information not available on its own", (cls) => {
      const plain = { ...action, actionId: "A1", instrumentType: [INFORMATION_NOT_AVAILABLE] };
      expect(failing(cls, plain)).not.toContain("instrumentType");
    });

    it.each([ActionDto, ActionUpdateDto])("%p rejects it combined with another instrument", (cls) => {
      const plain = {
        ...action,
        actionId: "A1",
        instrumentType: [InstrumentType.POLICY, INFORMATION_NOT_AVAILABLE],
      };
      expect(failing(cls, plain)).toContain("instrumentType");
    });

    it.each([ActionDto, ActionUpdateDto])("%p still accepts several normal instruments", (cls) => {
      const plain = {
        ...action,
        actionId: "A1",
        instrumentType: [InstrumentType.POLICY, InstrumentType.ECONOMIC],
      };
      expect(failing(cls, plain)).not.toContain("instrumentType");
    });
  });

  describe("status", () => {
    it("is accepted as an action status and an activity status", () => {
      expect(failing(ActionDto, { ...action, status: INFORMATION_NOT_AVAILABLE })).not.toContain("status");
      expect(failing(ActivityDto, { status: INFORMATION_NOT_AVAILABLE })).not.toContain("status");
    });

    it("still rejects an unknown status", () => {
      expect(failing(ActionDto, { ...action, status: "Unknown" })).toContain("status");
      expect(failing(ActivityDto, { status: "Unknown" })).toContain("status");
    });
  });
});
