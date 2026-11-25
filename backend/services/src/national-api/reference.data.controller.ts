import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import {
  AddReferenceDataDto,
  RenameReferenceDataDto,
  SetReferenceDataStatusDto,
} from "../dtos/reference.data.dto";
import { ReferenceDataEntity } from "../entities/reference.data.entity";
import { ReferenceDataService } from "../reference-data/reference.data.service";
import { HelperService } from "../util/helpers.service";

@ApiTags("Reference Data")
@Controller("reference-data")
@ApiBearerAuth()
export class ReferenceDataController {
  constructor(
    private readonly referenceDataService: ReferenceDataService,
    private readonly helperService: HelperService
  ) {}

  // Admin screen: all lists, including disabled values. Declared before ':listKey'.
  // The policy guard checks Update permission against request body fields, and a GET has none,
  // so the permission is checked explicitly here.
  @UseGuards(
    JwtAuthGuard,
    PoliciesGuardEx(true, Action.Read, ReferenceDataEntity)
  )
  @Get("lists")
  async getAllLists(@Request() req) {
    if (!req.ability?.can(Action.Update, ReferenceDataEntity)) {
      throw new ForbiddenException(
        this.helperService.formatReqMessagesString("user.userUnAUth", [])
      );
    }
    return await this.referenceDataService.getAllLists();
  }

  // Forms and filters: active values of one list, for every signed-in role.
  @UseGuards(
    JwtAuthGuard,
    PoliciesGuardEx(true, Action.Read, ReferenceDataEntity)
  )
  @Get(":listKey")
  async getActiveValues(@Param("listKey") listKey: string) {
    return await this.referenceDataService.getActiveValues(listKey);
  }

  @UseGuards(
    JwtAuthGuard,
    PoliciesGuardEx(true, Action.Create, ReferenceDataEntity)
  )
  @Post("add")
  async addValue(@Body() dto: AddReferenceDataDto) {
    return await this.referenceDataService.addValue(dto.listKey, dto.label);
  }

  @UseGuards(
    JwtAuthGuard,
    PoliciesGuardEx(true, Action.Update, ReferenceDataEntity)
  )
  @Post("rename")
  async renameValue(@Body() dto: RenameReferenceDataDto) {
    return await this.referenceDataService.renameValue(dto.id, dto.label);
  }

  @UseGuards(
    JwtAuthGuard,
    PoliciesGuardEx(true, Action.Update, ReferenceDataEntity)
  )
  @Post("status")
  async setValueStatus(@Body() dto: SetReferenceDataStatusDto) {
    return await this.referenceDataService.setValueStatus(dto.id, dto.isActive);
  }
}
