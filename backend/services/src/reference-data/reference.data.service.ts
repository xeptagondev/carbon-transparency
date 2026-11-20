import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReferenceDataEntity } from "../entities/reference.data.entity";
import {
  REFERENCE_DATA_LISTS,
  ReferenceDataEditLevel,
  ReferenceDataList,
} from "../enums/reference.data.enum";
import { HelperService } from "../util/helpers.service";

@Injectable()
export class ReferenceDataService {
  constructor(
    @InjectRepository(ReferenceDataEntity)
    private referenceDataRepo: Repository<ReferenceDataEntity>,
    private helperService: HelperService
  ) {}

  /** Values offered in forms and filters: disabled values are left out. */
  async getActiveValues(listKey: string): Promise<ReferenceDataEntity[]> {
    this.assertValidList(listKey);
    return await this.referenceDataRepo.find({
      where: { listKey, isActive: true },
      order: { label: "ASC" },
    });
  }

  /** Every list with its edit level and all of its values (disabled included), for the admin screen. */
  async getAllLists() {
    const rows = await this.referenceDataRepo.find({ order: { label: "ASC" } });
    return (Object.keys(REFERENCE_DATA_LISTS) as ReferenceDataList[]).map((listKey) => ({
      listKey,
      editLevel: REFERENCE_DATA_LISTS[listKey],
      values: rows.filter((row) => row.listKey === listKey),
    }));
  }

  async addValue(listKey: string, label: string): Promise<ReferenceDataEntity> {
    this.assertValidList(listKey);
    const cleanLabel = this.cleanLabel(label);
    await this.assertNoDuplicate(listKey, cleanLabel);

    return await this.referenceDataRepo.save(
      this.referenceDataRepo.create({
        listKey,
        code: cleanLabel,
        label: cleanLabel,
        isActive: true,
      })
    );
  }

  async renameValue(id: number, label: string): Promise<ReferenceDataEntity> {
    const row = await this.getRow(id);
    this.assertFullEdit(row.listKey);
    const cleanLabel = this.cleanLabel(label);
    await this.assertNoDuplicate(row.listKey, cleanLabel, row.id);

    row.label = cleanLabel;
    return await this.referenceDataRepo.save(row);
  }

  async setValueStatus(id: number, isActive: boolean): Promise<ReferenceDataEntity> {
    const row = await this.getRow(id);
    this.assertFullEdit(row.listKey);

    row.isActive = isActive;
    return await this.referenceDataRepo.save(row);
  }

  // ---------------------------------------------------------------- helpers

  private assertValidList(listKey: string) {
    if (!Object.prototype.hasOwnProperty.call(REFERENCE_DATA_LISTS, listKey)) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("referenceData.invalidList", [listKey]),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private assertFullEdit(listKey: string) {
    if (REFERENCE_DATA_LISTS[listKey as ReferenceDataList] !== ReferenceDataEditLevel.FULL_EDIT) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("referenceData.addOnlyList", []),
        HttpStatus.FORBIDDEN
      );
    }
  }

  private cleanLabel(label: string): string {
    const cleaned = (label ?? "").trim().replace(/\s+/g, " ");
    if (!cleaned) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("referenceData.labelRequired", []),
        HttpStatus.BAD_REQUEST
      );
    }
    return cleaned;
  }

  /** Same list, same text ignoring case and spacing, disabled values included. */
  private async assertNoDuplicate(listKey: string, label: string, exceptId?: number) {
    const rows = await this.referenceDataRepo.find({ where: { listKey } });
    const wanted = label.toLowerCase();
    const clash = rows.find(
      (row) =>
        row.id !== exceptId &&
        (row.label.trim().toLowerCase() === wanted || row.code.trim().toLowerCase() === wanted)
    );
    if (clash) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("referenceData.duplicateValue", [label]),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async getRow(id: number): Promise<ReferenceDataEntity> {
    const row = await this.referenceDataRepo.findOneBy({ id });
    if (!row) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("referenceData.valueNotFound", [String(id)]),
        HttpStatus.NOT_FOUND
      );
    }
    return row;
  }
}
