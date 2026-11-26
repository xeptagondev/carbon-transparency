import { rulesToQuery } from "@casl/ability/extra";
import { CaslAbilityFactory } from "./casl-ability.factory";
import { Action } from "./action.enum";
import { Role } from "./role.enum";
import { User } from "../entities/user.entity";
import { ConfigurationSettingsEntity } from "../entities/configuration.settings.entity";
import { ConfigurationSettingsType } from "../enums/configuration.settings.type.enum";

describe("CaslAbilityFactory", () => {
  const factory = new CaslAbilityFactory();

  const userWithRole = (role: Role) => {
    const user = new User();
    user.id = 1;
    user.role = role;
    user.sector = [];
    return user;
  };

  /**
   * What the policy guard checks when a setting is saved: the request body becomes a settings
   * entity and the user needs the update ability on every field of it.
   */
  const canSaveSetting = (role: Role, id: ConfigurationSettingsType) => {
    const ability = factory.createForUser(userWithRole(role));
    const setting = Object.assign(new ConfigurationSettingsEntity(), {
      id,
      settingValue: { mostRecentYear: 2024 },
    });
    return Object.keys(setting).every((field) => ability.can(Action.Update, setting, field));
  };

  it("should be defined", () => {
    expect(factory).toBeDefined();
  });

  describe("configuration settings", () => {
    it("lets Root save every setting", () => {
      for (const id of Object.values(ConfigurationSettingsType)) {
        expect(canSaveSetting(Role.Root, id)).toBe(true);
      }
    });

    it("lets an Admin save the sector year configuration", () => {
      expect(canSaveSetting(Role.Admin, ConfigurationSettingsType.SECTOR_YEAR_CONFIGURATION)).toBe(true);
    });

    it("does not let an Admin save any other setting", () => {
      const others = Object.values(ConfigurationSettingsType).filter(
        (id) => id !== ConfigurationSettingsType.SECTOR_YEAR_CONFIGURATION
      );
      expect(others.length).toBeGreaterThan(0);
      for (const id of others) {
        expect(canSaveSetting(Role.Admin, id)).toBe(false);
      }
    });

    it("does not let an Admin create a setting", () => {
      const ability = factory.createForUser(userWithRole(Role.Admin));
      expect(ability.can(Action.Create, ConfigurationSettingsEntity)).toBe(false);
    });

    it("lets an Admin read the settings", () => {
      const ability = factory.createForUser(userWithRole(Role.Admin));
      expect(ability.can(Action.Read, ConfigurationSettingsEntity)).toBe(true);
    });

    it("builds the query the policy guard asks for, without error, for an Admin", () => {
      const ability = factory.createForUser(userWithRole(Role.Admin));
      expect(() =>
        rulesToQuery(ability, Action.Update, ConfigurationSettingsEntity, (rule) =>
          rule.inverted ? { $not: rule.conditions } : rule.conditions
        )
      ).not.toThrow();
    });

    it.each([Role.GovernmentUser, Role.Observer])("does not let a %s save any setting", (role) => {
      for (const id of Object.values(ConfigurationSettingsType)) {
        expect(canSaveSetting(role, id)).toBe(false);
      }
    });
  });
});
