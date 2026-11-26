import "reflect-metadata";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { OtherSpecify, applyOtherText, includesOther } from "./otherSpecify";

class MultiDto {
  list: string[];

  @OtherSpecify("list")
  listOther?: string;
}

class SingleDto {
  value: string;

  @OtherSpecify("value")
  valueOther?: string;
}

async function errorsOf(cls: any, plain: object) {
  const errors = await validate(plainToInstance(cls, plain) as object);
  return errors.map((e) => e.property);
}

describe("includesOther", () => {
  it("recognises Other and Others, alone or inside a list", () => {
    expect(includesOther("Other")).toBe(true);
    expect(includesOther("Others")).toBe(true);
    expect(includesOther(["NDC", "Other"])).toBe(true);
    expect(includesOther(["Others"])).toBe(true);
  });

  it("does not match anything else", () => {
    expect(includesOther("NSDP")).toBe(false);
    expect(includesOther(["NDC", "NAP"])).toBe(false);
    expect(includesOther("other")).toBe(false);
    expect(includesOther([])).toBe(false);
    expect(includesOther(null)).toBe(false);
    expect(includesOther(undefined)).toBe(false);
  });
});

describe("OtherSpecify", () => {
  it("requires the text when Other is among a list of values", async () => {
    expect(await errorsOf(MultiDto, { list: ["NDC", "Other"] })).toEqual(["listOther"]);
    expect(await errorsOf(MultiDto, { list: ["NDC", "Other"], listOther: "" })).toEqual(["listOther"]);
    expect(await errorsOf(MultiDto, { list: ["Other"], listOther: "   " })).toEqual(["listOther"]);
  });

  it("accepts the text when Other is chosen", async () => {
    expect(await errorsOf(MultiDto, { list: ["NDC", "Other"], listOther: "Vila Port Authority" })).toEqual([]);
    expect(await errorsOf(SingleDto, { value: "Others", valueOther: "Something else" })).toEqual([]);
  });

  it("requires the text for a single value too", async () => {
    expect(await errorsOf(SingleDto, { value: "Others" })).toEqual(["valueOther"]);
  });

  it("does not check the text when Other is not chosen", async () => {
    expect(await errorsOf(MultiDto, { list: ["NDC"] })).toEqual([]);
    expect(await errorsOf(SingleDto, { value: "Grant", valueOther: "left over" })).toEqual([]);
  });

  it("limits the text to 250 characters", async () => {
    expect(await errorsOf(SingleDto, { value: "Others", valueOther: "a".repeat(250) })).toEqual([]);
    expect(await errorsOf(SingleDto, { value: "Others", valueOther: "a".repeat(251) })).toEqual(["valueOther"]);
  });

  it("rejects a text that is not a string", async () => {
    expect(await errorsOf(SingleDto, { value: "Others", valueOther: 5 })).toEqual(["valueOther"]);
  });
});

describe("applyOtherText", () => {
  it("keeps the trimmed text while Other is chosen", () => {
    const entity: any = { list: ["NDC", "Other"], listOther: "  Vila Port Authority " };
    applyOtherText(entity, "list", "listOther");
    expect(entity.listOther).toBe("Vila Port Authority");
  });

  it("clears the text when Other is no longer chosen", () => {
    const entity: any = { list: ["NDC"], listOther: "Vila Port Authority" };
    applyOtherText(entity, "list", "listOther");
    expect(entity.listOther).toBeNull();
  });

  it("clears the text of a single value when it changes to a normal value", () => {
    const entity: any = { value: "Grant", valueOther: "old text" };
    applyOtherText(entity, "value", "valueOther");
    expect(entity.valueOther).toBeNull();
  });

  it("stores null for a blank text", () => {
    const entity: any = { value: "Others", valueOther: "   " };
    applyOtherText(entity, "value", "valueOther");
    expect(entity.valueOther).toBeNull();
  });

  it("on create, leaves the property out when there is nothing to store", () => {
    const entity: any = { value: "Grant" };
    applyOtherText(entity, "value", "valueOther", "create");
    expect("valueOther" in entity).toBe(false);
  });

  it("on create, still clears a stray text when Other is not chosen", () => {
    const entity: any = { value: "Grant", valueOther: "stray" };
    applyOtherText(entity, "value", "valueOther", "create");
    expect(entity.valueOther).toBeNull();
  });

  it("leaves the text alone when the request does not carry the values", () => {
    const entity: any = { valueOther: "kept" };
    applyOtherText(entity, "value", "valueOther");
    expect(entity.valueOther).toBe("kept");
  });
});
