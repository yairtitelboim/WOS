import { Package, ManagementCosts } from './data';

const mockCalculateNER = (
  pkg: string, 
  term: number, 
  premiumPercent: number,
  managementCosts: ManagementCosts,
  packages: { [key: string]: Package }
): number => {
  // Get the base Term Rent from managementCosts
  const baseTermRent = managementCosts.preOccupancy['Term Rent'];

  // Calculate the adjusted Term Rent based on the premium percentage
  const adjustedTermRent = baseTermRent * (1 + (premiumPercent / 100));

  // Calculate base NER (assuming Term Rent is annual, convert to monthly)
  let baseNER = adjustedTermRent / 2;

  // Adjust NER based on term (slight decrease for longer terms)
  baseNER *= (1 - (term - 2) * 0.02); // 2% decrease per year above 2 years

  // Adjust NER based on package
  if (pkg === 'B') {
    baseNER *= 1.15; // 15% higher for Package B
  } else if (pkg === 'C') {
    baseNER *= 1.30; // 30% higher for Package C
  }

  // Round to two decimal places
  return Math.round(baseNER * 100) / 100;
};

export default mockCalculateNER;