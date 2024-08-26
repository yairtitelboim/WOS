// data.ts


export type PackageParams = {
  [key: string]: number;
};

export type Package = {
  name: string;
  description: string;
  items: string[];
  params: PackageParams;
};

export type Packages = {
  [key: string]: Package;
};

export type PricingYear = {
  [packageKey: string]: number;
};

export type Pricing = {
  [year: string]: PricingYear;
};

export const packages: Packages = {
  A: { 
    name: 'Flex', 
    description: 'Flex',
    items: ['• Flex Terms', '• Enterprise Network Connectivity', '• Day 1 Branding & Signage', '• Core Occupancy Data'],
    params: {
      'Term Rent': 126,
      'Network WiFi': 20,
      'Branding & Signage': 15,
      'Core Occupancy Data': 8,
    }
  },
  B: { 
    name: 'Inclusive', 
    description: 'Inclusive',
    items: ['• Furnished', '• Full Digital Infrastructure', '• AV Services Hardware', '• Plant Programming', '• Food & Beverage Service'],
    params: {
      'Furniture': 24,
      'Full Digital Infrastructure': 12,
      'Plants Programming': 15,
      'Food & Beverage Service': 61,
    }
  },
  C: { 
    name: 'Fully Managed', 
    description: 'Fully Managed',
    items: ['• Dedicated WX Coordinator', '• Full Mail and Package Handling', '• Hardware & Data Collection', '• IT/AV Help Desk'],
    params: {
      'Dedicated WX': 34,
      'Package Handling': 66,
      'Hardware & Data': 52,
      'IT/AV Help Desk': 22,
    }
  }
};

export type ManagementCosts = {
  preOccupancy: {
    [key: string]: number;
  };
  recurring: {
    [key: string]: number;
  };
};

export const managementCosts: ManagementCosts = {
  preOccupancy: {
    'Term Rent': 80,
    'Upfront WiFi': 3.00,
    'Branding/Signage': 2.00,
    'Furniture': 27.00,
    'Plants Upfront': 0.75,
    'Cabling and Drops': 5.00,
  },
  recurring: {
    'Opex (monthly)': 1.67,
    'WiFi': 975,
    'Plants': 0.05,
    'F&B': 25,
    'Dedicated WX': 10000,
    'IT/AV Help Desk': 25,
  }
};

export const RSF: number = 5374;

export const calculateTermRent = (term: number, baseTermRent: number, termPremium: number): number => {
  if (term === 5) return baseTermRent;
  return baseTermRent * (1 + ((5 - term) * (termPremium / 100)));
};

export const calculateMonthlyTotal = (pkg: string, term: number, managementCosts: ManagementCosts): { monthlyTotal: number; oneTimeTotal: number } => {
  let monthlyTotal = 0;
  let oneTimeTotal = 0;

  // Base Rent
  const baseRent = calculateTermRent(term, managementCosts.preOccupancy['Term Rent'], 10);
  monthlyTotal += (baseRent * RSF) / 12;

  // Enterprise grade WiFi
  monthlyTotal += managementCosts.recurring['WiFi'];
  const wifiInstallation = managementCosts.preOccupancy['Upfront WiFi'] * RSF;
  monthlyTotal += wifiInstallation / (term * 12);

  // Branding & Signage (one-time)
  oneTimeTotal += managementCosts.preOccupancy['Branding/Signage'] * RSF;

  if (pkg === 'B' || pkg === 'C') {
    // Furnished
    monthlyTotal += (managementCosts.preOccupancy['Furniture'] * RSF) / (term * 12);
    
    // Full Digital Infrastructure
    monthlyTotal += 975;
    
    // Plant Programming (one-time)
    oneTimeTotal += managementCosts.preOccupancy['Plants Upfront'] * RSF;
    
    // Food & Beverage Service
    monthlyTotal += 1343.50;
  }

  if (pkg === 'C') {
    // Dedicated Coordinator
    monthlyTotal += managementCosts.recurring['Dedicated WX'];
    
    // IT/AV Help Desk
    monthlyTotal += 1343.50;
  }

  return { monthlyTotal, oneTimeTotal };
};

export const isItemIncluded = (item: string, pkg: string): boolean => {
  const packageItems = {
    A: ['Base Rent', 'Enterprise grade WiFi', 'Branding & Signage *'],
    B: ['Base Rent', 'Enterprise grade WiFi', 'Branding & Signage *', 'Furnished', 'Plant Programming *', 'Full Digital Infrastructure', 'Food & Beverage Service'],
    C: ['Base Rent', 'Enterprise grade WiFi', 'Branding & Signage *', 'Furnished', 'Plant Programming *', 'Full Digital Infrastructure', 'Food & Beverage Service', 'Dedicated Coordinator', 'IT/AV Help Desk']
  };
  return packageItems[pkg as keyof typeof packageItems].includes(item);
};

export const calculateTotal = (category: 'preOccupancy' | 'recurring', managementCosts: ManagementCosts): number => {
  return Object.values(managementCosts[category]).reduce((total, value) => total + value, 0);
};

export const formatPrice = (price: number): string => {
  const roundedPrice = Math.round(price);
  if (roundedPrice >= 1000000) {
    return `$<span class="text-1xl font-bold">${(roundedPrice / 1000000).toFixed(1)}</span>M`;
  } else {
    return `$<span class="text-5xl font-bold">${(roundedPrice / 1000).toFixed(0)}</span> k`;
  }
};

export const generatePricing = (
  isManagementMode: boolean, 
  managementCosts: ManagementCosts, 
  discountRate: number,
  calculateNER: (pkg: string, term: number, discountRate: number) => number
): Pricing => {
  const pricing: Pricing = {};
  [2, 3, 4, 5].forEach(term => {
    pricing[term.toString()] = {
      A: isManagementMode ? calculateNER('A', term, discountRate) : calculateMonthlyTotal('A', term, managementCosts).monthlyTotal,
      B: isManagementMode ? calculateNER('B', term, discountRate) : calculateMonthlyTotal('B', term, managementCosts).monthlyTotal,
      C: isManagementMode ? calculateNER('C', term, discountRate) : calculateMonthlyTotal('C', term, managementCosts).monthlyTotal
    };
  });
  return pricing;
};