import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  InjectEntityManager,
  InjectRepository,
} from "@nestjs/typeorm";
import { UserDto } from "../dtos/user.dto";
import {
  EntityManager,
  QueryFailedError,
  Repository,
} from "typeorm";
import { User } from "../entities/user.entity";
import { PG_UNIQUE_VIOLATION } from "@drdgvhbh/postgres-error-codes";
import { UserUpdateDto } from "../dtos/user.update.dto";
import { Role } from "../casl/role.enum";
import { nanoid } from "nanoid";
import { ConfigService } from "@nestjs/config";
import { OrganisationType } from "../enums/organisation.type.enum";
import { plainToClass } from "class-transformer";
import { Organisation } from "../entities/organisation.entity";
import { OrganisationService } from "../organisation/organisation.service";
import { HelperService } from "src/util/helpers.service";
import { AsyncAction, AsyncOperationsInterface } from "src/async-operations/async-operations.interface";
import { PasswordHashService } from "src/util/passwordHash.service";
import { HttpUtilService } from "src/util/http.util.service";
import { AsyncActionType } from "src/enums/async.action.type.enum";
import { EmailTemplates } from "src/email-helper/email.template";
import { PasswordUpdateDto } from "src/dtos/password.update.dto";
import { BasicResponseDto } from "src/dtos/basic.response.dto";
import { QueryDto } from "src/dtos/query.dto";
import { DataListResponseDto } from "src/dtos/data.list.response";
import { DataResponseMessageDto } from "src/dtos/data.response.message";
import { API_KEY_SEPARATOR } from "src/constants";
import { DataResponseDto } from "src/dtos/data.response.dto";
import { UserState } from "src/enums/user.state.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private logger: Logger,
    private configService: ConfigService,
    private helperService: HelperService,
    @InjectEntityManager() private entityManger: EntityManager,
    @Inject(forwardRef(() => OrganisationService))
    private organisationService: OrganisationService,
    private asyncOperationsInterface: AsyncOperationsInterface,
    private passwordHashService: PasswordHashService,
    private httpUtilService: HttpUtilService
  ) { }

  private async validateUserCreatePayload(
    // user: User,
    userDto: UserDto,
    organisation: Organisation,
    organisationId: number,
    organisationRole: OrganisationType
  ) {
    const user = await this.findOne(userDto.email);
    if (user) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "user.createExistingUser",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }



    if (!organisation) {
      if (userDto.role === Role.DepartmentUser) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "user.departmentDoesNotExist",
            []
          ),
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "user.orgDoesNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (organisationRole != OrganisationType.GOVERNMENT && organisationRole != OrganisationType.API && organisationRole !== OrganisationType.DEPARTMENT) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.userUnAUth", []),
        HttpStatus.FORBIDDEN
      );
    }

    if (
      OrganisationType.GOVERNMENT != organisationRole &&
      userDto.organisationId &&
      userDto.organisationId != organisationId
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.userUnAUth", []),
        HttpStatus.FORBIDDEN
      );
    }

    if (userDto.organisationType == OrganisationType.DEPARTMENT && userDto.role != Role.DepartmentUser) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.departmentCanHaveOnlyDepUsers", []),
        HttpStatus.FORBIDDEN
      );
    }

    if (userDto.organisationType == OrganisationType.GOVERNMENT && userDto.role == Role.DepartmentUser) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.govCannotHaveDepUsers", []),
        HttpStatus.FORBIDDEN
      );
    }

  }

  async create(
    userDto: UserDto,
    organisationId: number,
    organisationType: OrganisationType,
    isRegistration?: boolean
  ): Promise<User | DataResponseMessageDto | undefined> {
    this.logger.verbose(`User create received  ${userDto.email} ${organisationId}`);
    userDto.email = userDto.email?.toLowerCase();
    const organisation = await this.organisationService.findByCompanyId(userDto.organisationId);


    await this.validateUserCreatePayload(userDto, organisation, organisationId, organisationType)

    const u: User = plainToClass(User, userDto);
    u.organisationId = organisation.organisationId;
    u.organisationType = organisation.organisationType;

    let generatedPassword = this.helperService.generateRandomPassword();
    u.password = this.passwordHashService.getPasswordHash(generatedPassword);

    if (userDto.role == Role.Admin && u.organisationType == OrganisationType.API) {
      u.apiKey = await this.generateApiKey(userDto.email);
    }

    const hostAddress = this.configService.get("host");

    const templateData = {
      name: u.name,
      countryName: this.configService.get("systemCountryName"),
      systemName: this.configService.get("systemName"),
      tempPassword: generatedPassword,
      home: hostAddress,
      email: u.email,
      address: this.configService.get("email.adresss"),
      liveChat: this.configService.get("liveChat"),
      helpDoc: hostAddress + `/help`,
    };

    const action: AsyncAction = {
      actionType: AsyncActionType.Email,
      actionProps: {
        emailType: EmailTemplates.USER_CREATE.id,
        sender: u.email,
        subject: this.helperService.getEmailTemplateMessage(
          EmailTemplates.USER_CREATE["subject"],
          templateData,
          true
        ),
        emailBody: this.helperService.getEmailTemplateMessage(
          EmailTemplates.USER_CREATE["html"],
          templateData,
          false
        ),
      },
    };
    await this.asyncOperationsInterface.AddAction(action);

    u.createdTime = new Date().getTime();

    const usr = await this.entityManger
      .transaction(async (em) => {
        const user = await em.save<User>(u);
        await this.organisationService.increaseUserCount(user.organisationId);
        return user;
      })
      .catch((err: any) => {
        console.log(err);
        if (err instanceof QueryFailedError) {
          console.log(err);
          switch (err.driverError.code) {
            case PG_UNIQUE_VIOLATION:
              if (err.driverError.detail.includes("email")) {
                throw new HttpException(
                  `${err.driverError.table == "company"
                    ? this.helperService.formatReqMessagesString(
                      "user.orgEmailExist",
                      []
                    )
                    : "Email already exist"
                  }`,
                  HttpStatus.BAD_REQUEST
                );
              } else if (err.driverError.detail.includes("taxId")) {
                throw new HttpException(
                  this.helperService.formatReqMessagesString(
                    "user.taxIdExistAlready",
                    []
                  ),
                  HttpStatus.BAD_REQUEST
                );
              } else if (err.driverError.detail.includes("paymentId")) {
                throw new HttpException(
                  this.helperService.formatReqMessagesString(
                    "user.paymentIdExistAlready",
                    []
                  ),
                  HttpStatus.BAD_REQUEST
                );
              }
          }
          this.logger.error(`User add error ${err}`);
        } else {
          this.logger.error(`User add error ${err}`);
        }
        return err;
      });

    const { apiKey, password, ...resp } = usr;

    const response = new DataResponseMessageDto(
      HttpStatus.CREATED,
      this.helperService.formatReqMessagesString("user.createUserSuccess", []),
      resp
    );

    return response;
  }

  private async generateApiKey(email) {
    return Buffer.from(
      `${email}${API_KEY_SEPARATOR}${await nanoid()}`
    ).toString("base64");
  }

  async getAdminUserDetails(organisationId) {
    const result = await this.userRepo.find({
      where: {
        role: Role.Admin,
        organisationId: parseInt(organisationId),
      },
    });

    return result;
  }

  async getUserCredentials(username: string): Promise<User | undefined> {
    const users = await this.userRepo.find({
      select: [
        "id",
        "email",
        "password",
        "role",
        "apiKey",
        "organisationId",
        "organisationType",
        "name",
        "state"
      ],
      where: {
        email: username,
      },
    });
    return users && users.length > 0 ? users[0] : undefined;
  }

  async findOne(username: string): Promise<User | undefined> {
    const users = await this.userRepo.find({
      where: {
        email: username,
      },
    });
    return users && users.length > 0 ? users[0] : undefined;
  }

  async getRoot(): Promise<User | undefined> {
    const users = await this.userRepo.find({
      where: {
        role: Role.Root,
      },
    });
    return users && users.length > 0 ? users[0] : undefined;
  }

  async getUserProfileDetails(id: number) {
    const userProfileDetails = await this.findById(id);
    const organisationDetails = await this.organisationService.findByCompanyId(
      userProfileDetails.organisationId
    );
    return {
      user: userProfileDetails,
      Organisation: organisationDetails,
    };
  }

  async findById(id: number): Promise<User | undefined> {
    return await this.userRepo.findOneBy({
      id: id,
    });
  }

  async update(
    userDto: UserUpdateDto,
    abilityCondition: string
  ): Promise<DataResponseDto | undefined> {
    this.logger.verbose("User update received", abilityCondition);

    userDto.email = userDto.email?.toLowerCase()

    const { id, remarks, ...update } = userDto;
    const user = await this.findById(id);
    if (!user) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.noUserFound", []),
        HttpStatus.NOT_FOUND
      );
    }

    let isStateUpdate: boolean;

    if (update.state && user.state != update.state) isStateUpdate = true;
    if (update.state && update.state == UserState.SUSPENDED && !remarks) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.remarksRequired", []),
        HttpStatus.NOT_FOUND
      );
    }

    const result = await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set(update)
      .where(
        `id = ${id} ${abilityCondition
          ? " AND (" +
          this.helperService.parseMongoQueryToSQL(abilityCondition) +
          ")"
          : ""
        }`
      )
      .execute()
      .catch((err: any) => {
        this.logger.error(err);
        return err;
      });
    if (result.affected) {
      if (isStateUpdate) {
        await this.notifyUserStateUpdate(userDto);
      }
      return new DataResponseMessageDto(
        HttpStatus.OK,
        this.helperService.formatReqMessagesString("user.editUserSuccess", []),
        await this.findById(id)
      );
    }
    throw new HttpException(
      this.helperService.formatReqMessagesString("user.userUnAUth", []),
      HttpStatus.FORBIDDEN
    );
  }

  async resetPassword(
    id: number,
    passwordResetDto: PasswordUpdateDto,
    abilityCondition: string
  ) {
    this.logger.verbose("User password reset received", id);

    const user = await this.userRepo
      .createQueryBuilder()
      .where(
        `id = '${id}' ${abilityCondition
          ? " AND (" +
          this.helperService.parseMongoQueryToSQL(abilityCondition) + ")"
          : ""
        }`
      )
      .addSelect(["User.password"])
      .getOne();

    passwordResetDto.oldPassword = this.passwordHashService.getPasswordHash(passwordResetDto.oldPassword);
    passwordResetDto.newPassword = this.passwordHashService.getPasswordHash(passwordResetDto.newPassword);

    if (!user || user.password != passwordResetDto.oldPassword) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "user.oldPasswordIncorrect",
          []
        ),
        HttpStatus.UNAUTHORIZED
      );
    }
    const result = await this.userRepo
      .update(
        {
          id: id,
        },
        {
          password: passwordResetDto.newPassword,
        }
      )
      .catch((err: any) => {
        this.logger.error(err);
        return err;
      });
    if (result.affected > 0) {
      const templateData = {
        name: user.name,
        countryName: this.configService.get("systemCountryName"),
      };
      const action: AsyncAction = {
        actionType: AsyncActionType.Email,
        actionProps: {
          emailType: EmailTemplates.CHANGE_PASSOWRD.id,
          sender: user.email,
          subject: this.helperService.getEmailTemplateMessage(
            EmailTemplates.CHANGE_PASSOWRD["subject"],
            templateData,
            true
          ),
          emailBody: this.helperService.getEmailTemplateMessage(
            EmailTemplates.CHANGE_PASSOWRD["html"],
            templateData,
            false
          ),
        },
      };
      await this.asyncOperationsInterface.AddAction(action);
      return new BasicResponseDto(
        HttpStatus.OK,
        this.helperService.formatReqMessagesString("user.resetSuccess", [])
      );
    }
    throw new HttpException(
      this.helperService.formatReqMessagesString(
        "user.passwordUpdateFailed",
        []
      ),
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  async regenerateApiKey(email, abilityCondition) {
    email = email?.toLowerCase()
    this.logger.verbose("Regenerated api key received", email);
    const user = await this.userRepo
      .createQueryBuilder()
      .where(
        `email = '${email}' ${abilityCondition
          ? " AND (" +
          this.helperService.parseMongoQueryToSQL(abilityCondition) + ")"
          : ""
        }`
      )
      .getOne();
    if (!user) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.noUserFound", []),
        HttpStatus.UNAUTHORIZED
      );
    }
    const apiKey = await this.generateApiKey(email);
    const result = await this.userRepo
      .update(
        {
          id: user.id,
        },
        {
          apiKey: apiKey,
        }
      )
      .catch((err: any) => {
        this.logger.error(err);
        return err;
      });

    if (result.affected > 0) {
      const templateData = {
        name: user.name,
        apiKey: apiKey,
      };

      const action: AsyncAction = {
        actionType: AsyncActionType.Email,
        actionProps: {
          emailType: EmailTemplates.API_KEY_EMAIL.id,
          sender: user.email,
          subject: this.helperService.getEmailTemplateMessage(
            EmailTemplates.API_KEY_EMAIL["subject"],
            templateData,
            true
          ),
          emailBody: this.helperService.getEmailTemplateMessage(
            EmailTemplates.API_KEY_EMAIL["html"],
            templateData,
            false
          ),
        },
      };
      await this.asyncOperationsInterface.AddAction(action);

      return new BasicResponseDto(
        HttpStatus.OK,
        this.helperService.formatReqMessagesString("user.resetSuccess", [])
      );
    }
    throw new HttpException(
      this.helperService.formatReqMessagesString(
        "user.passwordUpdateFailed",
        []
      ),
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private async notifyUserStateUpdate(userDto: UserUpdateDto) {

    const user = await this.findById(userDto.id);
    const govOrg = await this.organisationService.findGovByCountry(user.country);

    const templateData = {
      name: user.name,
      countryName: this.configService.get("systemCountryName"),
      remarks: userDto.remarks,
      government: govOrg.name
    };
    const action: AsyncAction = {
      actionType: AsyncActionType.Email,
      actionProps: {
        emailType: (user.state == UserState.SUSPENDED) ? EmailTemplates.USER_DEACTIVATED.id : EmailTemplates.USER_REACTIVATED.id,
        sender: user.email,
        subject: this.helperService.getEmailTemplateMessage(
          (user.state == UserState.SUSPENDED) ? EmailTemplates.USER_DEACTIVATED["subject"] : EmailTemplates.USER_REACTIVATED["subject"],
          templateData,
          true
        ),
        emailBody: this.helperService.getEmailTemplateMessage(
          (user.state == UserState.SUSPENDED) ? EmailTemplates.USER_DEACTIVATED["html"] : EmailTemplates.USER_REACTIVATED["html"],
          templateData,
          false
        ),
      },
    };
    await this.asyncOperationsInterface.AddAction(action);
  }


  async createUserWithPassword(
    name: string,
    organisationType: OrganisationType,
    organisationId: number,
    password: string,
    email: string,
    userRole: Role,
    phoneNo: string,
    APIkey: string
  ) {
    const organisation: Organisation = await this.organisationService.findByCompanyId(organisationId);

    if (!organisation) {
      throw new HttpException(
        "Company does not exist" + email,
        HttpStatus.BAD_REQUEST
      );
    }
    const user = new User();
    user.email = email;
    user.password = password;
    user.organisationId = organisationId;
    user.organisationType = organisation.organisationType;
    user.name = name;
    user.createdTime = new Date().getTime();
    user.country = this.configService.get("systemCountry");
    user.phoneNo = phoneNo;
    user.role = userRole;
    user.apiKey = APIkey;

    // Query the user before the operation
    const userBefore = await this.findOne(user.email)

    console.log("Inserting user", user.email);
    const res = await this.userRepo
      .createQueryBuilder()
      .insert()
      .values(user)
      .orUpdate(
        ["password", "organisationId", "organisationType", "name", "role", "phoneNo"],
        ["email"]
      )
      .execute();
      const userAfter = await this.findOne(user.email)
      console.log('------------------------- res', res)
    if (!userBefore && userAfter) {
      console.log('------------------------- Inside IF', res)
      await this.organisationService.increaseUserCount(organisationId);
    }
    return res;
  }

  async validateAndCreateUser(
    userDto: UserDto,
    organisationId: number,
    organisationType: OrganisationType,
    isRegistration?: boolean
  ): Promise<User | DataResponseMessageDto | undefined> {

    this.logger.verbose(`User received for validation ${userDto.email} ${organisationId}`);
    userDto.email = userDto.email?.toLowerCase();
    const user = await this.findOne(userDto.email);
    if (user) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "user.createExistingUser",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    return await this.create(userDto, organisationId, organisationType, isRegistration);
  };


  async query(query: QueryDto, abilityCondition: string): Promise<any> {
    const resp = await this.userRepo
      .createQueryBuilder("user")
      .where(
        this.helperService.generateWhereSQL(
          query,
          this.helperService.parseMongoQueryToSQLWithTable(
            '"user"',
            abilityCondition
          ),
          '"user"'
        )
      )
      .leftJoinAndMapOne(
        "user.organisation",
        Organisation,
        "organisation",
        "organisation.organisationId = user.organisationId"
      )
      .orderBy(
        query?.sort?.key ? `"user"."${query?.sort?.key}"` : `"user"."id"`,
        query?.sort?.order ? query?.sort?.order : "DESC"
      )
      .offset(query.size * query.page - query.size)
      .limit(query.size)
      .getManyAndCount();

    return new DataListResponseDto(
      resp.length > 0 ? resp[0] : undefined,
      resp.length > 1 ? resp[1] : undefined
    );
  }


  public async checkUserExists(email: string) {
    return await this.findOne(email);
  }
}