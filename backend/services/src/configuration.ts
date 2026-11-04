export default () => ({
  stage: process.env.STAGE || "local",
  systemCountry: process.env.systemCountryCode || "NG",
  systemCountryName: process.env.systemCountryName || "CountryX",
  systemCountryGovernmentName: process.env.systemCountryGovernmentName || "Government of CountryX",
  systemContinentName: process.env.systemContinentName || "CountryX",
  defaultCreditUnit: process.env.defaultCreditUnit || "ITMO",
  year: parseInt(process.env.REPORT_YEAR),
  dateTimeFormat: "DD LLLL yyyy @ HH:mm",
  dateFormat: "DD LLLL yyyy",
  database: {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "hquser",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "carbondev",
    synchronize: process.env.NODE_ENV == "prod" ? true : true,
    autoLoadEntities: true,
    logging: ["error"],
  },
  jwt: {
    expiresIn: process.env.EXPIRES_IN || "15m",
    userSecret: process.env.USER_JWT_SECRET || "1324",
    adminSecret: process.env.ADMIN_JWT_SECRET || "8654",
    refreshSecret: process.env.REFRESH_JWT_SECRET || "refresh1324",
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "2d",
    encodePassword: process.env.ENCODE_PASSWORD || false
  },
  email: {
    // Which transport EmailModule builds: SMTP (default) | GRAPH.
    service: process.env.EMAIL_SERVICE || "SMTP",
    source: process.env.SOURCE_EMAIL || "info@xeptagon.com",
    endpoint:
      process.env.SMTP_ENDPOINT ||
      "vpce-02cef9e74f152b675-b00ybiai.email-smtp.us-east-1.vpce.amazonaws.com",
    username: process.env.SMTP_USERNAME || "AKIAUMXKTXDJIOFY2QXL",
    password: process.env.SMTP_PASSWORD,
    disabled: process.env.IS_EMAIL_DISABLED === "true" ? true : false,
    disableLowPriorityEmails:
      process.env.DISABLE_LOW_PRIORITY_EMAIL === "true" ? true : false,
    getemailprefix: process.env.EMAILPREFIX || "",
    adresss: process.env.HOST_ADDRESS || "Address <br>Region, Country Zipcode",
    // An SES construct, read only by SmtpEmailService. Empty means no header.
    configSet: process.env.EMAIL_CONFIG_SET || "",
    // Microsoft Graph backend (EMAIL_SERVICE=GRAPH). Presence of the three
    // credentials is validated in GraphEmailService's constructor rather than
    // here: this file is evaluated by ConfigModule.forRoot in 16 modules, so a
    // throw here would abort every RUN_MODULE container, including the ones that
    // send no mail.
    graph: {
      appName: process.env.EMAIL_SERVICE_GRAPH_APP_NAME || "",
      tenantId: process.env.EMAIL_SERVICE_GRAPH_TENANT_ID,
      clientId: process.env.EMAIL_SERVICE_GRAPH_CLIENT_ID,
      clientSecret: process.env.EMAIL_SERVICE_GRAPH_CLIENT_SECRET,
      loginHost:
        process.env.EMAIL_SERVICE_GRAPH_LOGIN_HOST ||
        "https://login.microsoftonline.com",
      apiHost:
        process.env.EMAIL_SERVICE_GRAPH_API_HOST || "https://graph.microsoft.com",
      saveToSentItems:
        process.env.EMAIL_SERVICE_GRAPH_SAVE_TO_SENT_ITEMS === "true",
      maxAttachmentBytes:
        parseInt(process.env.EMAIL_SERVICE_GRAPH_MAX_ATTACHMENT_BYTES) || 2500000,
      attachmentFailureMode:
        process.env.EMAIL_SERVICE_GRAPH_ATTACHMENT_FAILURE_MODE || "skip",
      requestTimeoutMs:
        parseInt(process.env.EMAIL_SERVICE_GRAPH_REQUEST_TIMEOUT_MS) || 20000,
    },
  },
  s3CommonBucket: {
    name: process.env.S3_COMMON_BUCKET || "carbon-common-dev",
  },
  host: process.env.HOST || "https://test.carbreg.org",
  backendHost: process.env.BACKEND_HOST || "http://localhost:3000",
  liveChat: "https://undp2020cdo.typeform.com/to/emSWOmDo",
  asyncQueueName:
    process.env.ASYNC_QUEUE_NAME ||
    "https://sqs.us-east-1.amazonaws.com/302213478610/AsyncQueuedev.fifo",
  cadTrust: {
    enable: process.env.CADTRUST_ENABLE === "true" ? true : false,
    endpoint: process.env.CADTRUST_ENDPOINT || "http://44.212.139.61:31310/"
  },
  systemType: process.env.SYSTEM_TYPE || "CARBON_UNIFIED_SYSTEM",
  systemName: process.env.SYSTEM_NAME || "SystemX",
});
