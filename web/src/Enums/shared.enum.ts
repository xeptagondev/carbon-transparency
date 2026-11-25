export enum EntityType {
  ACTION = 'action',
  PROGRAMME = 'programme',
  PROJECT = 'project',
  ACTIVITY = 'activity',
}

export enum GHGS {
  CO = 'CO2',
  COE = 'CO2e',
  CH = 'CH4',
  NO = 'N2O',
  HFC = 'HFCs',
  NF = 'NF3',
  PFC = 'PFCs',
  SF = 'SF6',
}

export enum TypeOfMitigation {
  AGRICULTURE = 'Agriculture',
  SOLAR = 'Solar',
  EE_HOUSEHOLDS = 'EEHouseholds',
}

export enum ExportFileType {
  XLSX = 'xlsx',
  CSV = 'csv',
}

export enum KPIAction {
  NONE = 'None',
  CREATED = 'Created',
  UPDATED = 'Updated',
}

export enum GHGRecordState {
  SAVED = 'SAVED',
  FINALIZED = 'FINALIZED',
}
