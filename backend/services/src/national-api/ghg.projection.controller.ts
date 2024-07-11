import {
    Controller,
    UseGuards,
    Request,
    Post,
    Body,
    Get,
    Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PoliciesGuardEx } from "src/casl/policy.guard";
import { Action } from "src/casl/action.enum";
import { GhgProjectionService } from "src/projection/projection.service";
import { BaselineDto } from "src/dtos/baseline.dto";
import { ProjectionEntity } from "src/entities/projection.entity";
import { ProjectionDto } from "src/dtos/projection.dto";
import { ProjectionType } from "src/enums/projection.enum";

@ApiTags("Projections")
@ApiBearerAuth()
@Controller("projections")
export class GHGProjectionController {
    constructor(private projectionService: GhgProjectionService) {}
  
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, ProjectionEntity))
    @Post("add")
    addEmission(@Body() projectionDto: ProjectionDto, @Request() req) {
      console.log("came here")
        return this.projectionService.create(projectionDto, req.user);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, ProjectionEntity))
    @Post("setBaseline")
    setBaseline(@Body() baselineDto: BaselineDto, @Request() req) {
        return this.projectionService.setBaselineYear(baselineDto, req.user);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProjectionEntity, true))
    @Get('/actual/:projectionType/:projectionYear')
    getActualProjections(@Param('projectionType') projectionType: ProjectionType, @Param('projectionYear') projectionYear: string) {
      return this.projectionService.getActualProjection(projectionType, projectionYear);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProjectionEntity, true))
    @Get('/calculated/:projectionType/:projectionYear')
    getPredictedProjections(@Param('projectionType') projectionType: ProjectionType, @Param('projectionYear') projectionYear: string) {
      return this.projectionService.getCalculatedProjection(projectionType, projectionYear);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProjectionEntity, true))
    @Get("/summary/available/:projectionType")
    getProjectionYears(@Param('projectionType') projectionType: ProjectionType) {
      return this.projectionService.getProjectionSummary(projectionType);
    }
    
}