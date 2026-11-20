import { HttpException, HttpStatus } from "@nestjs/common";
import { Repository } from "typeorm";
import { ReferenceDataEntity } from "../entities/reference.data.entity";
import { ReferenceDataList } from "../enums/reference.data.enum";
import { HelperService } from "../util/helpers.service";
import { ReferenceDataService } from "./reference.data.service";

const row = (over: Partial<ReferenceDataEntity>): ReferenceDataEntity =>
  ({
    id: 1,
    listKey: ReferenceDataList.SUB_SECTOR,
    code: "Energy",
    label: "Energy",
    isActive: true,
    ...over,
  }) as ReferenceDataEntity;

describe("ReferenceDataService", () => {
  let service: ReferenceDataService;
  let store: ReferenceDataEntity[];
  let repo: Partial<Repository<ReferenceDataEntity>>;

  beforeEach(() => {
    store = [];
    repo = {
      find: jest.fn(async (opts: any) =>
        store.filter(
          (r) =>
            (!opts?.where?.listKey || r.listKey === opts.where.listKey) &&
            (opts?.where?.isActive === undefined || r.isActive === opts.where.isActive)
        )
      ) as any,
      findOneBy: jest.fn(async (where: any) => store.find((r) => r.id === where.id) ?? null) as any,
      create: jest.fn((data: any) => ({ ...data })) as any,
      save: jest.fn(async (r: any) => {
        if (!r.id) {
          r.id = store.length + 1;
          store.push(r);
        }
        return r;
      }) as any,
    };
    const helper: Partial<HelperService> = {
      formatReqMessagesString: jest.fn((tag: string, args: any[]) => `${tag}:${args.join(",")}`),
    };
    service = new ReferenceDataService(repo as any, helper as HelperService);
  });

  it("adds a trimmed value with code equal to its label", async () => {
    const created = await service.addValue(ReferenceDataList.SUB_SECTOR, "  Coastal   Zones ");
    expect(created).toMatchObject({ code: "Coastal Zones", label: "Coastal Zones", isActive: true });
  });

  it("rejects an empty value", async () => {
    await expect(service.addValue(ReferenceDataList.SUB_SECTOR, "   ")).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it("rejects an exact or case-insensitive duplicate in the same list, but not in another list", async () => {
    store.push(row({ id: 1 }));
    await expect(service.addValue(ReferenceDataList.SUB_SECTOR, "energy")).rejects.toBeInstanceOf(
      HttpException
    );
    await expect(
      service.addValue(ReferenceDataList.POLICY_REFERENCE, "Energy")
    ).resolves.toMatchObject({ label: "Energy" });
  });

  it("reports a unique-index violation from a concurrent add as a duplicate, not a server error", async () => {
    // Two requests both pass the read check; the second save hits the unique (listKey, code) index.
    (repo.save as jest.Mock).mockRejectedValueOnce({ code: "23505" });
    await expect(service.addValue(ReferenceDataList.SUB_SECTOR, "Wetlands")).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
    (repo.save as jest.Mock).mockRejectedValueOnce(new Error("connection lost"));
    await expect(service.addValue(ReferenceDataList.SUB_SECTOR, "Marshes")).rejects.toThrow(
      "connection lost"
    );
  });

  it("rejects a duplicate of a disabled value", async () => {
    store.push(row({ id: 1, isActive: false }));
    await expect(service.addValue(ReferenceDataList.SUB_SECTOR, "Energy")).rejects.toBeInstanceOf(
      HttpException
    );
  });

  it("rejects an unknown list", async () => {
    await expect(service.addValue("NOPE", "x")).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
    await expect(service.getActiveValues("NOPE")).rejects.toBeInstanceOf(HttpException);
  });

  it("renames the label but keeps the code", async () => {
    store.push(row({ id: 1 }));
    const renamed = await service.renameValue(1, "Energy supply");
    expect(renamed).toMatchObject({ code: "Energy", label: "Energy supply" });
  });

  it("allows renaming a value to a different case of itself", async () => {
    store.push(row({ id: 1 }));
    await expect(service.renameValue(1, "ENERGY")).resolves.toMatchObject({ label: "ENERGY" });
  });

  it("disables and re-enables a value; getActiveValues hides disabled ones", async () => {
    store.push(row({ id: 1 }), row({ id: 2, code: "Waste", label: "Waste" }));
    await service.setValueStatus(1, false);
    const active = await service.getActiveValues(ReferenceDataList.SUB_SECTOR);
    expect(active.map((r) => r.code)).toEqual(["Waste"]);
    await service.setValueStatus(1, true);
    expect(await service.getActiveValues(ReferenceDataList.SUB_SECTOR)).toHaveLength(2);
  });

  it("allows adding to an add-only list but blocks rename and disable", async () => {
    store.push(row({ id: 1, listKey: ReferenceDataList.CHANNEL_OF_SUPPORT, code: "Bilateral", label: "Bilateral" }));
    await expect(
      service.addValue(ReferenceDataList.CHANNEL_OF_SUPPORT, "Regional")
    ).resolves.toMatchObject({ label: "Regional" });
    await expect(service.renameValue(1, "Two-way")).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
    });
    await expect(service.setValueStatus(1, false)).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
    });
  });

  it("sorts numbers inside the text as numbers", async () => {
    store.push(
      row({ id: 1, listKey: ReferenceDataList.NDC_REFERENCE, code: "A10", label: "A10" }),
      row({ id: 2, listKey: ReferenceDataList.NDC_REFERENCE, code: "A2", label: "A2" }),
      row({ id: 3, listKey: ReferenceDataList.NDC_REFERENCE, code: "A1", label: "A1" })
    );
    const values = await service.getActiveValues(ReferenceDataList.NDC_REFERENCE);
    expect(values.map((r) => r.label)).toEqual(["A1", "A2", "A10"]);
  });

  it("returns 404 for a missing value", async () => {
    await expect(service.renameValue(99, "x")).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
  });

  it("getAllLists returns every list with its edit level and values", async () => {
    store.push(row({ id: 1, isActive: false }));
    const lists = await service.getAllLists();
    expect(lists).toHaveLength(Object.keys(ReferenceDataList).length);
    const sub = lists.find((l) => l.listKey === ReferenceDataList.SUB_SECTOR);
    expect(sub.editLevel).toBe("FULL_EDIT");
    expect(sub.values).toHaveLength(1);
  });
});
