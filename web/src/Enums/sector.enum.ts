export enum Sector {
  Energy = 'Energy',
  Transport = 'Transport',
  Industry = 'Industry (IPPU)',
  Agriculture = 'Agriculture',
  Forestry = 'Forestry',
  WaterAndSanitation = 'Water and Sanitation',
  LandUse = 'Land Use',
  CoastalResilience = 'Coastal Resilience',
  Health = 'Health',
  HazardsManagement = 'Hazards Management',
  NatureBasedSolutions = 'Nature Based Solutions',
  BlueEconomy = 'Blue Economy',
  CrossCutting = 'Cross-cutting',
  Other = 'Other',
  Livestock = 'Livestock',
  Biosecurity = 'Biosecurity',
  Fisheries = 'Fisheries',
  Oceans = 'Oceans',
  Biodiversity = 'Biodiversity',
  Waste = 'Waste',
  ResilientInfrastructure = 'Resilient infrastructure',
  Services = 'Services',
  Tourism = 'Tourism',
  SocialInclusion = 'Social inclusion',
  Governance = 'Governance',
  ClimateInformation = 'Climate information',
}

const SECTORS_LAST = [Sector.CrossCutting, Sector.Other];

/** Dropdown order: existing + new Vanuatu sectors, with Cross-cutting and Other last. */
export function getSectorSelectOptions(): Sector[] {
  const values = Object.values(Sector);
  return [...values.filter((sector) => !SECTORS_LAST.includes(sector)), ...SECTORS_LAST];
}
