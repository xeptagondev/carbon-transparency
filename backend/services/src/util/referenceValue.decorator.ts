import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from "class-validator";
import { Repository } from "typeorm";
import { ReferenceDataEntity } from "../entities/reference.data.entity";
import { ReferenceDataList } from "../enums/reference.data.enum";

/**
 * Checks that a value is one of the values of an admin-managed list ("National configurations").
 *
 * Disabled values are accepted on purpose: they are hidden from the dropdowns of the forms, but a
 * record that already holds one must still be saveable. What is rejected is anything that is not in
 * the list at all (typos, values of another list, values that were never configured).
 */
@ValidatorConstraint({ name: "isReferenceValue", async: true })
@Injectable()
export class IsReferenceValueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(ReferenceDataEntity)
    private referenceDataRepo: Repository<ReferenceDataEntity>
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [listKey] = args.constraints;
    if (typeof value !== "string" || value.length === 0) {
      return false;
    }
    const found = await this.referenceDataRepo.count({ where: { listKey, code: value } });
    return found > 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Invalid ${args.property}: "${args.value}" is not a value of the ${args.constraints[0]} list`;
  }
}

export function IsReferenceValue(listKey: ReferenceDataList, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isReferenceValue",
      target: object.constructor,
      propertyName,
      constraints: [listKey],
      options: validationOptions,
      validator: IsReferenceValueConstraint,
    });
  };
}
