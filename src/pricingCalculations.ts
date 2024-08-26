// pricingCalculations.ts

import { ManagementCosts, RSF, Package } from './data';

// Constants
const MONTHS_PER_YEAR = 12;
const MAX_TERM_INCREASE = 0.3;
const TERM_INCREASE_PER_YEAR = MAX_TERM_INCREASE / 3;
const BASE_TERM = 5;

export const calculateMonthlyCost = (
  pkg: string, 
  term: number, 
  managementCosts: ManagementCosts, 
  packages: { [key: string]: Package }
): number => {
  const { monthlyTotal } = calculateTenantTotal(pkg, term, managementCosts);
  return monthlyTotal;
};

export const updatePricingMatrix = (
  isManagementMode: boolean, 
  managementCosts: ManagementCosts, 
  packages: { [key: string]: Package },
  calculateNER: (pkg: string, term: number, discountRate: number) => number
): { [key: string]: { [key: string]: number } } => {
  const pricing: { [key: string]: { [key: string]: number } } = {};
  const terms = [2, 3, 4, 5];
  const pkgs = ['A', 'B', 'C'];

  terms.forEach(term => {
    pricing[term.toString()] = {};
    pkgs.forEach(pkg => {
      if (isManagementMode) {
        pricing[term.toString()][pkg] = calculateNER(pkg, term, 0.08);
      } else {
        const { monthlyTotal } = calculateTenantTotal(pkg, term, managementCosts);
        pricing[term.toString()][pkg] = monthlyTotal;
      }
    });
  });

  return pricing;
};

export const calculateTenantTotal = (pkg: string, term: number, managementCosts: ManagementCosts) => {
  let monthlyTotal = 0;
  let oneTimeTotal = 0;

  // Base Rent
  monthlyTotal += calculateBaseRent(managementCosts.preOccupancy['Term Rent'], term);

  // WiFi
  monthlyTotal += calculateWifi(term, managementCosts);

  // Other items
  if (isItemIncluded('Furnished', pkg)) monthlyTotal += calculateFurniture(term, managementCosts);
  if (isItemIncluded('Plant Programming *', pkg) || pkg === 'B' || pkg === 'C') {
    const plantCost = calculatePlants(managementCosts);
    oneTimeTotal += plantCost;
  }
  if (isItemIncluded('Food & Beverage Service', pkg)) monthlyTotal += calculateFBAndITAV();
  if (isItemIncluded('Branding & Signage *', pkg)) {
    const brandingCost = calculateBrandingSignage(managementCosts);
    oneTimeTotal += brandingCost;
  }
  if (isItemIncluded('Full Digital Infrastructure', pkg)) monthlyTotal += calculateDigitalInfrastructure();
  if (isItemIncluded('Dedicated Coordinator', pkg)) monthlyTotal += calculateDedicatedCoordinator();
  if (isItemIncluded('IT/AV Help Desk', pkg)) monthlyTotal += calculateFBAndITAV();

  // Convert one-time costs to monthly
  monthlyTotal += oneTimeTotal / (term * MONTHS_PER_YEAR);

  return { monthlyTotal, oneTimeTotal };
};

const calculateBaseRent = (baseCost: number, term: number): number => {
  if (term === BASE_TERM) return (baseCost * RSF) / MONTHS_PER_YEAR;
  const adjustedBaseCost = baseCost * (1 + (BASE_TERM - term) * TERM_INCREASE_PER_YEAR);
  return (adjustedBaseCost * RSF) / MONTHS_PER_YEAR;
};

const calculateWifi = (term: number, managementCosts: ManagementCosts): number => {
  const monthlyRate = managementCosts.recurring['WiFi'];
  const installationCost = managementCosts.preOccupancy['Upfront WiFi'] * RSF;
  return monthlyRate + (installationCost / (term * MONTHS_PER_YEAR));
};

const calculateFurniture = (term: number, managementCosts: ManagementCosts): number => 
  (managementCosts.preOccupancy['Furniture'] * RSF) / (term * MONTHS_PER_YEAR);

const calculatePlants = (managementCosts: ManagementCosts): number => 
  managementCosts.preOccupancy['Plants Upfront'] * RSF;

const calculateFBAndITAV = (): number => 1343.50;

const calculateBrandingSignage = (managementCosts: ManagementCosts): number => 
  managementCosts.preOccupancy['Branding/Signage'] * RSF;

const calculateDigitalInfrastructure = (): number => 975;

const calculateDedicatedCoordinator = (): number => 10000;

const isItemIncluded = (item: string, pkg: string): boolean => {
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

export const calculateTermRent = (term: number, baseTermRent: number, termPremium: number): number => {
  if (term === BASE_TERM) return baseTermRent;
  return baseTermRent * (1 + ((BASE_TERM - term) * termPremium));
};

// export const formatPrice = (price: number): string => {
//   const roundedPrice = Math.round(price);
//   if (roundedPrice >= 1000000) {
//     return `$<span class="text-6xl">${(roundedPrice / 1000000).toFixed(1)}</span>M`;
//   } else {
//     return `$<span class="text-5xl">${(roundedPrice / 1000).toFixed(0)}</span>k`;
//   }
// };