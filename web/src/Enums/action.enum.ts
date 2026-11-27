export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Approve = 'approve',
  Reject = 'reject',
  Validate = 'validate',
}

export enum ActionType {
  MITIGATION = 'Mitigation',
  ADAPTION = 'Adaptation',
  CROSSCUT = 'Cross-cutting',
  TRANSPARENCY = 'Transparency',
  OTHER = 'Other',
}

/** UN Sustainable Development Goals (Contribution to SDGs — TRAN-258). */
export enum ConSDGs {
  SDG1 = 'SDG 1 – No Poverty: Eradicating extreme poverty and expanding social safety nets for vulnerable populations worldwide.',
  SDG2 = 'SDG 2 – Zero Hunger: Achieving global food security, improving nutrition, and advancing sustainable agricultural practices.',
  SDG3 = 'SDG 3 – Good Health and Well-Being: Expanding universal healthcare access, preventing disease, and promoting physical and mental well-being across all age groups.',
  SDG4 = 'SDG 4 – Quality Education: Guaranteeing equitable access to inclusive schooling and lifelong vocational or academic learning.',
  SDG5 = 'SDG 5 – Gender Equality: Eliminating gender-based discrimination and empowering women and girls socially, economically, and politically.',
  SDG6 = 'SDG 6 – Clean Water and Sanitation: Securing universal access to safe drinking water, adequate sanitation, and sustainable watershed management.',
  SDG7 = 'SDG 7 – Affordable and Clean Energy: Expanding reliable access to modern, renewable, and energy-efficient power systems.',
  SDG8 = 'SDG 8 – Decent Work and Economic Growth: Fostering sustainable economic expansion, fair labor protections, and productive employment.',
  SDG9 = 'SDG 9 – Industry, Innovation, and Infrastructure: Developing resilient public infrastructure, sustainable industrialization, and technological innovation.',
  SDG10 = 'SDG 10 – Reduced Inequalities: Narrowing income, social, and opportunity disparities both within countries and across nations.',
  SDG11 = 'SDG 11 – Sustainable Cities and Communities: Building safe, inclusive, and climate-resilient urban settlements with sustainable housing and transport.',
  SDG12 = 'SDG 12 – Responsible Consumption and Production: Shifting toward circular resource use, waste reduction, and sustainable supply chains.',
  SDG13 = 'SDG 13 – Climate Action: Implementing urgent mitigation and adaptation measures to combat global warming and extreme weather impacts.',
  SDG14 = 'SDG 14 – Life Below Water: Conserving marine ecosystems, curbing ocean pollution, and sustainably managing coastal and fishery resources.',
  SDG15 = 'SDG 15 – Life on Land: Protecting terrestrial habitats, halting deforestation, reversing land degradation, and preventing biodiversity loss.',
  SDG16 = 'SDG 16 – Peace, Justice, and Strong Institutions: Strengthening the rule of law, reducing violence, and building transparent, accountable governance.',
  SDG17 = 'SDG 17 – Partnerships for the Goals: Mobilizing international finance, technology sharing, and global cooperation to deliver on sustainable development.',
}

export enum InstrumentType {
  POLICY = 'Policy',
  REGULATORY = 'Regulatory',
  ECONOMIC = 'Economic',
  OTHER = 'Other',
  INFORMATION_NOT_AVAILABLE = 'Information not available',
}

export enum ActionStatus {
  PLANNED = 'Planned',
  ADOPTED = 'Adopted',
  IMPLEMENTED = 'Implemented',
  INFORMATION_NOT_AVAILABLE = 'Information not available',
}
