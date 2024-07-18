import { NestFactory } from "@nestjs/core";
import { Handler } from "aws-lambda";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { Organisation, OrganisationType } from "../enums/organisation.enum";
import { Role, SubRole } from "../casl/role.enum";
import { UserDto } from "../dtos/user.dto";
import { UtilModule } from "../util/util.module";
import { CountryService } from "../util/country.service";
import { Country } from "../entities/country.entity";
import { getLogger } from "../server";
import { LocationModule } from "../location/location.module";
import { LocationInterface } from "../location/location.interface";
import { Sector } from "../enums/sector.enum";
import { GHGInventoryManipulate, SubRoleManipulate, ValidateEntity } from "src/enums/user.enum";

const fs = require("fs");

export const handler: Handler = async (event) => {
  console.log(`Setup Handler Started with: ${event}`);

  if (!event) {
    event = process.env;
  }

  // const companyApp = await NestFactory.createApplicationContext(
  //   OrganisationModule,
  //   {
  //     logger: getLogger(OrganisationModule),
  //   }
  // );

  const userApp = await NestFactory.createApplicationContext(UserModule, {
    logger: getLogger(UserModule),
  });
  const userService = userApp.get(UserService);
  // const companyService = companyApp.get(OrganisationService);
  // const configService = companyApp.get(ConfigService);

  const locationApp = await NestFactory.createApplicationContext(
    LocationModule,
    {
      logger: getLogger(UserModule),
    }
  );
  const locationInterface = locationApp.get(LocationInterface);
  const regionRawData = fs.readFileSync('regions.csv', 'utf8');
  await locationInterface.init(regionRawData);

  if (event.type === "IMPORT_USERS" && event.body) {

    const users = event.body.split("\n");

    let c = 0;
    for (const user of users) {
      c++;
      if (c === 1) {
        continue;
      }
      let fields = user.split(",");
      if (fields.length < 7) {
        continue;
      }
      fields = fields.map(f => f.trim())
      // (name: string, companyRole: CompanyRole, taxId: string, password: string, email: string, userRole: string
      const userRole =
        fields[4] == "admin"
          ? Role.Admin
          : fields[4] == "GovernmentUser"
          ? Role.GovernmentUser
          : Role.Observer;

			const userSubRole =
					fields[5] == "GovernmentDepartment"
						? SubRole.GovernmentDepartment
						: fields[5] == "Consultant"
						? SubRole.Consultant
						: fields[5] == "SEO"
						? SubRole.SEO
						: fields[5] == "TechnicalReviewer"
						? SubRole.TechnicalReviewer
						: SubRole.DevelopmentPartner;

      const sectors: Sector[] = fields[6] ? fields[6].split("-") : undefined;

      console.log('Inserting user', fields[0],
			fields[3],
			fields[7],
			fields[1],
			userRole,
			userSubRole,
			sectors,
			undefined)
      try {
        await userService.createUserWithPassword(
          fields[0],
          fields[3],
          fields[7],
          fields[1],
          userRole,
					userSubRole,
          fields[2],
					sectors,
          undefined
        );
      } catch (e) {
        console.log('Fail to create user', fields[1])
      }
     
    }
    return;
  }

  // if (event.type === "IMPORT_ORG" && event.body) {
    

  //   const companies = event.body.split("\n");

  //   let c = 0;
  //   for (const company of companies) {
  //     c++;
  //     if (c === 1) {
  //       continue;
  //     }
  //     let fields = company.split(",");
  //     if (fields.length < 5) {
  //       continue;
  //     }
  //     fields = fields.map(f => f.trim())
  //     // (name: string, companyRole: CompanyRole, taxId: string, password: string, email: string, userRole: string
  //     const cr = fields[4] == "API"
  //         ? OrganisationType.API
  //         : OrganisationType.DEPARTMENT;

  //     const secScope = fields[4] === "Department" && fields[5] ? fields[5].split("-") : undefined;

  //     try {
  //       const org = await companyService.create({
  //         // taxId: fields[3],
  //         organisationId: fields[3],
  //         // paymentId: undefined,
  //         name: fields[0],
  //         email: fields[1],
  //         phoneNo: fields[2],
  //         // nameOfMinister: undefined,
  //         sector: secScope,
  //         // ministry: undefined,
  //         // govDep: undefined,
  //         website: undefined,
  //         address: configService.get("systemCountryName"),
  //         logo: undefined,
  //         country: configService.get("systemCountry"),
  //         organisationType: cr,
  //         createdTime: undefined,
  //         regions: [],
  //         // state: undefined //double check this
  //       });
  //       console.log('Company created', org)
  //     } catch (e) {
  //       console.log('Fail to create company', fields[1], e)
  //     }
  //   }
  //   return;
  // }

  // if (event.type === "UPDATE_COORDINATES") {
  //   const prApp = await NestFactory.createApplicationContext(ProgrammeModule, {
  //     logger: getLogger(ProgrammeModule),
  //   });
  //   const programmeService = prApp.get(ProgrammeService);
  //   await programmeService.regenerateRegionCoordinates();
  //   return;
  // }

  const u = await userService.findOne(event["rootEmail"]);
  if (u != undefined) {
    console.log("Root user already created and setup is completed");
  }

  // const app = await NestFactory.createApplicationContext(LedgerDbModule, {
  //   logger: getLogger(LedgerDbModule),
  // });
  // try {
  //   const ledgerModule = app.get(LedgerDBInterface);

  //   await ledgerModule.createTable("company");
  //   await ledgerModule.createIndex("txId", "company");

  //   await ledgerModule.createTable("overall");
  //   await ledgerModule.createIndex("txId", "overall");
  //   const creditOverall = new CreditOverall();
  //   creditOverall.credit = 0;
  //   creditOverall.txId = event["systemCountryCode"];
  //   creditOverall.txRef = "genesis block";
  //   creditOverall.txType = TxType.ISSUE;
  //   await ledgerModule.insertRecord(creditOverall, "overall");
  //   await ledgerModule.createTable();
  //   await ledgerModule.createIndex("programmeId");
  //   console.log("QLDB Table created");
  // } catch (e) {
  //   console.log("QLDB table does not create", e);
  // }

  try {
    // const company = new OrganisationDto();
    // company.country = event["systemCountryCode"];
    // company.name = event["name"];
    // company.logo = event["logoBase64"];
    // company.organisationType = OrganisationType.GOVERNMENT;
    // company.email = event["rootEmail"];
    // // company.taxId = `00000${event["systemCountryCode"]}`

    // console.log("Adding company", company);
    

    // const gov = await companyService.create(company, true);

    const user = new UserDto();
    user.email = event["rootEmail"];
    user.name = "Root";
    user.role = Role.Root;
    user.validatePermission = ValidateEntity.CAN;
    user.subRolePermission = SubRoleManipulate.CAN;
    user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
    // user.organisationId = gov.organisationId;
		// user.organisation = Organisation.Government
    user.country = event["systemCountryCode"];
    console.log("Adding user", user);
    await userService.create(user);
    
  } catch (e) {
    console.log(`User ${event["rootEmail"]} failed to create`, e);
  }

  const countryData = fs.readFileSync("countries.json", "utf8");
  const jsonCountryData = JSON.parse(countryData);
  const utils = await NestFactory.createApplicationContext(UtilModule);
  const countryService = utils.get(CountryService);

  jsonCountryData.forEach(async (countryItem) => {
    if (countryItem["UN Member States"] === "x") {
      const country = new Country();
      country.alpha2 = countryItem["ISO-alpha2 Code"];
      country.alpha3 = countryItem["ISO-alpha3 Code"];
      country.name = countryItem["English short"];
      await countryService.insertCountry(country);
    }
  });
};
