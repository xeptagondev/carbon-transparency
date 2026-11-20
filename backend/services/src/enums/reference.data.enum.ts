/**
 * Lists that administrators maintain under "National configurations".
 * Sector is deliberately absent: it stays code-managed (see Release 1 plan, T03).
 */
export enum ReferenceDataList {
  // Full edit: add, rename, disable
  INTERNATIONAL_SOURCE = "INTERNATIONAL_SOURCE",
  SUB_SECTOR = "SUB_SECTOR",
  NATIONAL_IMPLEMENTING_ENTITY = "NATIONAL_IMPLEMENTING_ENTITY",
  INTERNATIONAL_IMPLEMENTING_ENTITY = "INTERNATIONAL_IMPLEMENTING_ENTITY",
  RECIPIENT_ENTITY = "RECIPIENT_ENTITY",
  USER_ORGANISATION = "USER_ORGANISATION",
  INSTITUTION_RESPONSIBLE = "INSTITUTION_RESPONSIBLE",
  POLICY_REFERENCE = "POLICY_REFERENCE",
  PIPELINE_STATUS = "PIPELINE_STATUS",
  KPI_NAME = "KPI_NAME",
  NDC_REFERENCE = "NDC_REFERENCE",

  // Add only: existing values cannot be renamed or disabled
  CHANNEL_OF_SUPPORT = "CHANNEL_OF_SUPPORT",
  INTERNATIONAL_FINANCIAL_INSTRUMENT = "INTERNATIONAL_FINANCIAL_INSTRUMENT",
  NATIONAL_FINANCIAL_INSTRUMENT = "NATIONAL_FINANCIAL_INSTRUMENT",
  TYPE_OF_TECHNOLOGY = "TYPE_OF_TECHNOLOGY",
  NATIONAL_STRATEGY_ANCHOR = "NATIONAL_STRATEGY_ANCHOR",
}

export enum ReferenceDataEditLevel {
  FULL_EDIT = "FULL_EDIT",
  ADD_ONLY = "ADD_ONLY",
}

/**
 * Edit level of each list. Add-only lists feed UNFCCC reporting, so their existing
 * values are protected.
 */
export const REFERENCE_DATA_LISTS: Record<ReferenceDataList, ReferenceDataEditLevel> = {
  [ReferenceDataList.INTERNATIONAL_SOURCE]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.SUB_SECTOR]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.NATIONAL_IMPLEMENTING_ENTITY]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.INTERNATIONAL_IMPLEMENTING_ENTITY]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.RECIPIENT_ENTITY]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.USER_ORGANISATION]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.INSTITUTION_RESPONSIBLE]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.POLICY_REFERENCE]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.PIPELINE_STATUS]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.KPI_NAME]: ReferenceDataEditLevel.FULL_EDIT,
  [ReferenceDataList.NDC_REFERENCE]: ReferenceDataEditLevel.FULL_EDIT,

  [ReferenceDataList.CHANNEL_OF_SUPPORT]: ReferenceDataEditLevel.ADD_ONLY,
  [ReferenceDataList.INTERNATIONAL_FINANCIAL_INSTRUMENT]: ReferenceDataEditLevel.ADD_ONLY,
  [ReferenceDataList.NATIONAL_FINANCIAL_INSTRUMENT]: ReferenceDataEditLevel.ADD_ONLY,
  [ReferenceDataList.TYPE_OF_TECHNOLOGY]: ReferenceDataEditLevel.ADD_ONLY,
  [ReferenceDataList.NATIONAL_STRATEGY_ANCHOR]: ReferenceDataEditLevel.ADD_ONLY,
};
