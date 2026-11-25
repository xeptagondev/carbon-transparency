import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "../configuration";
import { ReferenceDataEntity } from "../entities/reference.data.entity";
import { UtilModule } from "../util/util.module";
import { ReferenceDataService } from "./reference.data.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`],
    }),
    TypeOrmModule.forFeature([ReferenceDataEntity]),
    UtilModule,
  ],
  providers: [ReferenceDataService],
  exports: [ReferenceDataService],
})
export class ReferenceDataModule {}
