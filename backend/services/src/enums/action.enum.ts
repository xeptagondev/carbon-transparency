export enum InstrumentType {
  POLICY = "Policy",
  REGULATORY = "Regulatory",
  ECONOMIC = "Economic",
  OTHER = "Other",
  INFORMATION_NOT_AVAILABLE = "Information not available",
}

export enum ActionStatus {
  PLANNED = "Planned",
  ADOPTED = "Adopted",
  IMPLEMENTED = "Implemented",
  // Must stay last: the value is appended to the Postgres enum by the migration.
  INFORMATION_NOT_AVAILABLE = "Information not available",
}

export enum NatAnchor {
  NDC = "NDC",
  NAP = "NAP",
  NDP = "NDP",
  OTHER = "Other",
}

export enum ActionType {
  MITIGATION = "Mitigation",
  ADAPTION = "Adaptation",
  CROSSCUT = "Cross-cutting",
  TRANSPARENCY = "Transparency",
  OTHER = "Other",
}
