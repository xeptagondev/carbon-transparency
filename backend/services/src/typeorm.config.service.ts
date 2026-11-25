import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import configuration from "./configuration";
import { DataSource, DataSourceOptions } from "typeorm";
import { patchDataSourceToExtendSectorEnums } from "./util/sectorEnum.util";

patchDataSourceToExtendSectorEnums();

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.configService.get<any>("database");
  }
}

const dbConfig = {
  ...configuration().database,
  synchronize: false,
  migrations: [`src/migrations/*.{ts,js}`],
  migrationsRun: true,
};

export default new DataSource(dbConfig as DataSourceOptions);
