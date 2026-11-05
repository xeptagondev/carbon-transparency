import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailServiceType } from "../enums/email.service.type";
import { FileHandlerModule } from "../file-handler/filehandler.module";
import { FileHandlerInterface } from "../file-handler/filehandler.interface";
import { EmailHandlerInterface } from "./email.interface";
import { GraphEmailService } from "./providers/graph/graph.email.service";
import { SmtpEmailService } from "./providers/smtp/smtp.email.service";

@Module({
  imports: [FileHandlerModule],
  providers: [
    Logger,
    {
      provide: EmailHandlerInterface,
      inject: [Logger, ConfigService, FileHandlerInterface],
      useFactory: (
        logger: Logger,
        configService: ConfigService,
        fileHandler: FileHandlerInterface
      ) => {
        const configured = process.env.EMAIL_SERVICE || EmailServiceType.SMTP;
        // Upper-cased because this repo's sibling switch is set lowercase
        // (FILE_SERVICE: local in every compose file), so an operator following
        // that convention with EMAIL_SERVICE=graph would otherwise crash-loop
        // the container on a value that was never ambiguous.
        const emailService = configured.trim().toUpperCase();
        switch (emailService) {
          case EmailServiceType.SMTP:
            return new SmtpEmailService(logger, configService, fileHandler);
          case EmailServiceType.GRAPH:
            return new GraphEmailService(logger, configService, fileHandler);
          default:
            // Email off: nothing is sent whatever this says, and a throw here
            // aborts bootstrap of AsyncOperationsModuleMain, the only importer.
            // SmtpEmailService no-ops on the same flag.
            if (configService.get<boolean>("email.disabled")) {
              return new SmtpEmailService(logger, configService, fileHandler);
            }
            // Email on: never fall through to SMTP, or a typo sends over
            // credentials the operator believed they had replaced.
            throw new Error(
              `Unsupported EMAIL_SERVICE "${configured}". Expected one of: ${Object.values(
                EmailServiceType
              ).join(", ")}.`
            );
        }
      },
    },
  ],
  exports: [EmailHandlerInterface],
})
export class EmailModule {}
