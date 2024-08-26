// pricingComponents.tsx


import React, { useState, useEffect, useCallback } from 'react';
import { 
  packages, 
  RSF, 
  ManagementCosts, 
  Package, 
  formatPrice, 
  Pricing, 
  generatePricing, 
  calculateMonthlyTotal, 
  isItemIncluded, 
  calculateTotal 
} from './data';


const FlipCard: React.FC<{ packageKey: string; packageData: Package; className?: string }> = ({ packageKey, packageData, className }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`box-standard relative border-4 border-[#A82229] flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-full h-full transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'} flex flex-col items-center justify-center`}>
        <h3 className="text-7xl font-bold">{packageKey}</h3>
        <p className="text-lg">{packageData.name}</p>
      </div>
      <div className={`absolute top-0 left-0 w-full h-full bg-white p-1 overflow-auto transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <ul className="text-left text-sm leading-tight">
          {packageData.items.map((item, index) => (
            <li key={index} className="mb-1">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const SplitBox: React.FC<{ pkg: string; term: number; color: string; isSelected: boolean }> = ({ pkg, term, color, isSelected }) => (
  <div className={`w-full h-full relative ${isSelected ? 'bg-white' : color} ${isSelected ? 'text-[#A82229]' : 'text-white'}`}>
    <div className="absolute top-0 right-0 p-2">
      <div className="text-sm">INSIDE</div>
      <div className="text-sm">TERM</div>
    </div>
    <div className="absolute bottom-0 left-0 p-2">
      <div className="text-sm">OUTSIDE</div>
      <div className="text-sm">TERM</div>
    </div>
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
      <div className={`transform rotate-45 w-[140%] h-0.5 ${isSelected ? 'bg-[#A82229]' : 'bg-white'}`}></div>
    </div>
  </div>
);

const LineItem: React.FC<{
  label: string;
  value: number | string;
  isWhole?: boolean;
  isBold?: boolean;
  isText?: boolean;
  isItalic?: boolean;
  isWhite?: boolean;
  opacity?: string;
  onChange?: (newValue: number) => void;
  textColor?: string;
}> = ({ label, value, isWhole = false, isBold = false, isText = false, isItalic = false, isWhite = false, opacity = 'opacity-100', onChange, textColor }) => (
  <div className={`flex justify-between ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${opacity}`}>
    <div className={textColor || (isWhite ? 'text-white' : 'text-[#A82229]')}>{label}</div>
    {onChange && typeof value === 'number' ? (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="bg-transparent text-right"
      />
    ) : (
      <div className={textColor || (isWhite ? 'text-white' : 'text-gray-500')}>
        {isText ? (
          value
        ) : (
          <>
            $
            {typeof value === 'number'
              ? isWhole
                ? value.toLocaleString()
                : value.toFixed(2)
              : value}
          </>
        )}
      </div>
    )}
  </div>
);




const getColor = (term: number, pkg: string): string => {
  const baseColors = ['#E6B3B3', '#D98B8B', '#CC6666'];
  const index = ['A', 'B', 'C'].indexOf(pkg);
  return baseColors[Math.min(term - 2, 2) * 3 + index];
};

export const PricingMatrix: React.FC<{
  selectedBox: {pkg: string, term: number} | null;
  setSelectedBox: React.Dispatch<React.SetStateAction<{pkg: string, term: number} | null>>;
  isManagementMode: boolean;
  managementCosts: ManagementCosts;
  calculateNER: (pkg: string, term: number, discountRate: number) => number;
  discountRate: number;
}> = ({ selectedBox, setSelectedBox, isManagementMode, managementCosts, calculateNER, discountRate }) => {
  const [splitBoxes, setSplitBoxes] = useState<{[key: string]: boolean}>({});
  const [pricing, setPricing] = useState<Pricing>(() => 
    generatePricing(isManagementMode, managementCosts, discountRate, calculateNER)
  );

  useEffect(() => {
    setPricing(generatePricing(isManagementMode, managementCosts, discountRate, calculateNER));
  }, [isManagementMode, managementCosts, discountRate, calculateNER]);
  
  
  const handleBoxClick = (pkg: string, term: number) => {
    setSelectedBox({pkg, term});
  };

  const formatDisplayValue = (value: number): string => {
    if (isManagementMode) {
      return `$ ${value.toFixed(1)}`;
    } else {
      return formatPrice(value);
    }
  };

  const handleDoubleClick = (pkg: string, term: number) => {
    setSplitBoxes(prev => ({...prev, [`${pkg}-${term}`]: !prev[`${pkg}-${term}`]}));
  };


 

  const getOpacity = (term: number) => {
    switch(term) {
      case 2: return 'opacity-50';
      case 3: return 'opacity-70';
      case 4: return 'opacity-90';
      case 5: return 'opacity-20';
      case 6: return 'opacity-20';
      default: return 'opacity-100';
    }
  };



  return (
    <div className="grid grid-cols-[auto,1fr,1fr,1fr]">
      <div className="invisible mr-4 mb-8"></div>
      {Object.entries(packages).map(([key, value]) => (
        <FlipCard key={key} packageKey={key} packageData={value} className="mt-10 mb-10" />
      ))}
      
      {Object.keys(pricing).map((term) => (
        <React.Fragment key={term}>
          <div className={`box-standard flex justify-center items-center border-4 border-[#A82229] font-bold mr-12 mb-1 ${parseInt(term) === 5 ? 'opacity-25' : ''}`}>
            <div className="flex flex-col items-start">
              <div className="text-sm">Year</div>
              <div className="text-6xl mb-1">{term.padStart(2, '0')}</div>
            </div>
          </div>
          {Object.keys(pricing[term]).map((pkg) => {
            const selected = selectedBox?.pkg === pkg && selectedBox?.term === parseInt(term);
            const value = pricing[term.toString()]?.[pkg] || 0;
            return (
              <button
                key={`${term}-${pkg}`}
                className={`box-standard flex items-center justify-center text-center
                  ${selected ? 'bg-white !text-[#A82229]' : 'bg-[#A82229] text-white'} text-4xl font-bold
                  border-4 ml-1 border-[#A82229] ${selected ? 'border-8' : ''}
                  ${getOpacity(parseInt(term))}
                  transition-all duration-300 mb-1
                  hover:scale-90 hover:z-10`}
                onClick={() => handleBoxClick(pkg, parseInt(term))}
                onDoubleClick={() => handleDoubleClick(pkg, parseInt(term))}
              >
                {splitBoxes[`${pkg}-${term}`] ? (
                  <SplitBox pkg={pkg} term={parseInt(term)} color={getColor(parseInt(term), pkg)} isSelected={selected} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: formatDisplayValue(value) }}></div>
                )}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};




export const Sidebar: React.FC<{
  selectedBox: {pkg: string, term: number} | null;
  setSelectedBox: React.Dispatch<React.SetStateAction<{pkg: string, term: number} | null>>;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isManagementMode: boolean;
  setIsManagementMode: React.Dispatch<React.SetStateAction<boolean>>;
  managementCosts: ManagementCosts;
  setManagementCosts: React.Dispatch<React.SetStateAction<ManagementCosts>>;
  calculateNER: (pkg: string, term: number, discountRate: number) => number;
  discountRate: number;
  setDiscountRate: React.Dispatch<React.SetStateAction<number>>;
}> = ({ selectedBox, setSelectedBox, isExpanded, setIsExpanded, isManagementMode, setIsManagementMode, managementCosts, setManagementCosts, calculateNER, discountRate, setDiscountRate }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [termPremium, setTermPremium] = useState(0);
  const [baseTermRent, setBaseTermRent] = useState(managementCosts.preOccupancy['Term Rent']);
  const [ner, setNer] = useState<number | null>(null);

  useEffect(() => {
    if (selectedBox && isManagementMode) {
      const newNer = calculateNER(selectedBox.pkg, selectedBox.term, discountRate);
      setNer(newNer);
    }
  }, [selectedBox, isManagementMode, discountRate, calculateNER]);

  const toggleExpand = useCallback(() => {
    if (!selectedBox) {
      setIsExpanded(!isExpanded);
    }
  }, [selectedBox, setIsExpanded, isExpanded]);

  const toggleMode = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsManagementMode(!isManagementMode);
      setIsFlipping(false);
    }, 300);
  }, [isManagementMode, setIsManagementMode]);

  const calculateTermRent = useCallback((term: number) => {
    if (term === 5) return baseTermRent;
    return baseTermRent * (1 + ((5 - term) * (termPremium / 100)));
  }, [baseTermRent, termPremium]);

  useEffect(() => {
    if (selectedBox) {
      const newTermRent = calculateTermRent(selectedBox.term);
      setManagementCosts(prev => ({
        ...prev,
        preOccupancy: {
          ...prev.preOccupancy,
          'Term Rent': newTermRent
        }
      }));
    }
  }, [selectedBox, calculateTermRent, setManagementCosts]);
  


  
  if (!selectedBox && !isExpanded) {
    return (
      <div 
        className="border-4 border-[#A82229] rounded-3xl p-6 text-[#A82229] cursor-pointer hover:bg-[#A82229] hover:text-white transition-colors duration-300"
        onClick={toggleExpand}
      >
        <div className="text-xl font-bold">160 Varick in Hudson</div>
      </div>
    );
  }

  const renderTenantView = () => {
    if (!selectedBox) {
      return (
        <>
          <div className="mb-4 text-xl font-bold">160 Varick in Hudson</div>
          <div className="flex justify-between mb-4">
            <div>0 yr</div>
          </div>
          <div className="flex justify-between mb-4 bg-[#A82229] text-white p-2 rounded-lg">
            <div className="font-bold">RSF:</div>
            <div className="text-2xl">{RSF.toLocaleString()}</div>
          </div>
        </>
      );
    } else {
      const {pkg, term} = selectedBox;
      

      const calculateBaseRent = (baseCost: number, term: number) => {
        if (term === 5) return baseCost * RSF / 12;
        const maxIncrease = 0.3; // 30% max increase for 2-year terms
        const increasePerYear = maxIncrease / 3; // Distribute the increase over 3 years (5 to 2)
        const adjustedBaseCost = baseCost * (1 + (5 - term) * increasePerYear);
        return (adjustedBaseCost * RSF) / 12; // Monthly cost
      };

      const calculateWifi = () => {
        const monthlyRate = managementCosts.recurring['WiFi'];
        const installationCost = managementCosts.preOccupancy['Upfront WiFi'] * RSF;
        return monthlyRate + (installationCost / (term * 12));
      };

      const calculateFurniture = () => (managementCosts.preOccupancy['Furniture'] * RSF) / (term * 12);
      const calculatePlants = () => managementCosts.preOccupancy['Plants Upfront'] * RSF;
      const calculateFBAndITAV = () => 1343.50; // 5374 / 100 people per person
      const calculateBrandingSignage = () => managementCosts.preOccupancy['Branding/Signage'] * RSF;
      const calculateDigitalInfrastructure = () => 975; // Fixed cost as per Management View
      const calculateDedicatedCoordinator = () => 10000; // Fixed cost of $10,000
      // const calculateITAVHelpDesk = () => managementCosts.recurring['IT/AV Help Desk'] * RSF / 12; // Monthly cost

   const calculateTenantTotal = () => {
      let monthlyTotal = 0;
      let oneTimeTotal = 0;

      // Base Rent
      monthlyTotal += calculateBaseRent(managementCosts.preOccupancy['Term Rent'], term);

      // WiFi
      monthlyTotal += calculateWifi();

 // Other monthly items
 if (isItemIncluded('Furnished', pkg)) monthlyTotal += calculateFurniture();
 if (isItemIncluded('Full Digital Infrastructure', pkg)) monthlyTotal += calculateDigitalInfrastructure();
 if (isItemIncluded('Food & Beverage Service', pkg)) monthlyTotal += calculateFBAndITAV();
 if (isItemIncluded('Dedicated Coordinator', pkg)) monthlyTotal += calculateDedicatedCoordinator();
 if (isItemIncluded('IT/AV Help Desk', pkg)) monthlyTotal += calculateFBAndITAV();

 // One-time items
 if (isItemIncluded('Plant Programming *', pkg) || pkg === 'B' || pkg === 'C') {
   oneTimeTotal += calculatePlants();
 }
 if (isItemIncluded('Branding & Signage *', pkg)) {
   oneTimeTotal += calculateBrandingSignage();
 }

 return { monthlyTotal, oneTimeTotal };
};



const displayItems = [
  { label: 'Base Rent', value: calculateBaseRent(managementCosts.preOccupancy['Term Rent'], term), isRecurring: true },
  { label: 'Enterprise grade WiFi', value: calculateWifi(), isRecurring: true },
  { label: 'Branding & Signage *', value: calculateBrandingSignage(), isRecurring: false, border: 'A' },
  { label: 'Furnished', value: calculateFurniture(), isRecurring: true },
  { label: 'Plant Programming *', value: calculatePlants(), isRecurring: false },
  { label: 'Full Digital Infrastructure', value: calculateDigitalInfrastructure(), isRecurring: true },
  { label: 'Food & Beverage Service', value: calculateFBAndITAV(), isRecurring: true, border: 'B' },
  { label: 'Dedicated Coordinator', value: calculateDedicatedCoordinator(), isRecurring: true },
  { label: 'IT/AV Help Desk', value: calculateFBAndITAV(), isRecurring: true },
];
  
      const getLineOpacity = (borderPackage: string) => {
        const packages = ['A', 'B', 'C'];
        const selectedIndex = packages.indexOf(pkg);
        const borderIndex = packages.indexOf(borderPackage);
        return selectedIndex >= borderIndex ? 'opacity-100' : 'opacity-20';
      };



      const result = calculateTenantTotal();
      const monthlyTotal = result.monthlyTotal;
      const oneTimeTotal = result.oneTimeTotal;
      const annualTotal = (monthlyTotal * 12 * term) + oneTimeTotal;

      const packageItems = {
        A: ['Base Rent', 'Enterprise grade WiFi', 'Branding & Signage *'],
        B: ['Base Rent', 'Enterprise grade WiFi', 'Branding & Signage *', 'Furnished', 'Plant Programming *', 'Full Digital Infrastructure', 'Food & Beverage Service'],
        C: ['Base Rent', 'Enterprise grade WiFi', 'Branding & Signage *', 'Furnished', 'Plant Programming *', 'Full Digital Infrastructure', 'Food & Beverage Service', 'Dedicated Coordinator', 'IT/AV Help Desk']
      };
  
   
      const getOpacity = (item: string) => {
        if (item === 'WiFi') {
          return pkg === 'A' ? 'opacity-20' : 'opacity-100';
        }
        if (item === 'Branding/Signage') return 'opacity-100';
        if (item === 'Plants' && (pkg === 'B' || pkg === 'C')) return 'opacity-100';
        return isItemIncluded(item, pkg) ? 'opacity-100' : 'opacity-20';
      };

      const formatNumber = (value: number) => {
        return value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      };

      



    
      return (
        <>
          <div className="flex justify-between items-center mb-1 mt-1">
            <div className="text-2xl font-bold">Tenant Name</div>
            <div className="flex items-center">
              <div className="bg-[#A82229] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-xl">
                {pkg}
              </div>
              <button className="bg-white text-[#A82229] border-2 border-[#A82229] px-4 py-1 rounded-full text-sm">Select</button>
            </div>
          </div>
          <div className="text-l mb-2 font-thin text-gray-400">{packages[pkg as keyof typeof packages].name}</div> 
          <div className="flex justify-between mb-4 text-lg">
            <div>160 Varick in Hudson</div>
            <div>{term} yr</div>
          </div>
          <div className="flex justify-between mb-6 bg-[#A82229] text-white p-2 rounded-lg">
            <div className="font-bold text-lg">RSF:</div>
            <div className="text-2xl">{RSF.toLocaleString()}</div>
          </div>
          
          <div className="mb-4 space-y-2">
            {displayItems.map(({label, value, isRecurring, border}) => (
              <React.Fragment key={label}>
                <LineItem 
                  label={label} 
                  value={formatNumber(value)}
                  opacity={getOpacity(label)}
                  isBold={!isRecurring}
                  isItalic={!isRecurring}
                />
                {border && (
                  <div className="py-3">
                    <hr className={`border-t-2 border-[#A82229] ${getLineOpacity(border)}`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t-2 border-[#A82229]">
            <div className="flex justify-between font-bold text-lg">
              <div>One-Time*</div>
              <div>${formatNumber(oneTimeTotal)}</div>
            </div>
            <div className="flex justify-between font-bold text-lg bg-[#A82229] text-white p-2 mt-5 rounded-lg">
              <div>Monthly</div>
              <div>${formatNumber(monthlyTotal)}</div>
            </div>
            <div className="flex justify-between font-bold text-lg bg-[#A82229] text-white p-2 mt-1 rounded-lg">
              <div>Per Term</div>
              <div>${formatNumber(annualTotal)}</div>
            </div>
          </div>
        </>
      );
    }
  };



  const renderManagementView = () => {
    const pkg = selectedBox?.pkg || 'A';
    const term = selectedBox?.term || 2;
  

    const calculatePayback = (ner: number) => {
      // Normalize NER to a 0-1 scale (assuming NER ranges from 40 to 100)
      const normalizedNER = Math.min(Math.max((ner - 40) / 40, 0), 1);
      
      // Invert the scale (higher NER = lower payback)
      const invertedScale = 1 - normalizedNER;
      
      // Calculate payback months (1 to 6 range)
      const paybackMonths = 1 + (invertedScale * 4);
      
      // Round to nearest whole number
      return Math.round(paybackMonths);
    };


    console.log(`Calculating NER for Package: ${pkg}, Term: ${term}, Discount Rate: ${discountRate}`);
    const ner = calculateNER(pkg, term, discountRate);
    console.log(`Calculated NER: ${ner}`);
  
    const packageItems = {
      A: ['Term Rent', 'Upfront WiFi', 'Branding/Signage', 'Opex (monthly)', 'WiFi'],
      B: ['Term Rent', 'Upfront WiFi', 'Branding/Signage', 'Furniture', 'Plants Upfront', 'Cabling and Drops', 'Opex (monthly)', 'WiFi', 'Plants', 'F&B'],
      C: ['Term Rent', 'Upfront WiFi', 'Branding/Signage', 'Furniture', 'Plants Upfront', 'Cabling and Drops', 'Opex (monthly)', 'WiFi', 'Plants', 'F&B', 'Dedicated WX', 'IT/AV Help Desk']
    };
  
    const getOpacity = (item: string) => {
      return packageItems[pkg as keyof typeof packageItems].includes(item) ? 'opacity-100' : 'opacity-20';
    };
  
    const calculateRelevantTotal = (category: 'preOccupancy' | 'recurring') => {
      return Object.entries(managementCosts[category]).reduce((total, [key, value]) => {
        if (packageItems[pkg as keyof typeof packageItems].includes(key)) {
          return total + value;
        }
        return total;
      }, 0);
    };
  
    const preOccupancyTotal = calculateRelevantTotal('preOccupancy');
    const ongoingTotal = calculateRelevantTotal('recurring');
  
    const handleCostChange = (category: 'preOccupancy' | 'recurring', key: string, newValue: number) => {
      setManagementCosts((prevCosts: typeof managementCosts) => ({
        ...prevCosts,
        [category]: {
          ...prevCosts[category],
          [key]: newValue
        }
      }));
    };
  
    const formatNumberWithCommas = (number: number): string => {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    
    return (
      <>
        <div className="flex justify-between items-center mb-1">
          <div className="text-2xl font-bold">Management Team</div>
          <div className="flex items-center">
            <div className="bg-[#A82229] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-xl">
              {pkg}
            </div>
            <button className="bg-white text-[#A82229] border-2 border-[#A82229] px-4 py-1 rounded-full text-sm">Select</button>
          </div>
        </div>
        <div className="text-l mb-2 font-thin italic text-gray-400">{packages[pkg as keyof typeof packages].name} Package</div>
        <div className="flex justify-between mb-4 text-lg">
          <div>160 Varick in Hudson</div>
          <div>{term} yr</div>
        </div>
        <div className="flex justify-between mb-6 bg-[#A82229] text-white p-2 rounded-lg">
          <div className="font-bold text-lg">RSF:</div>
          <div className="text-2xl">{RSF.toLocaleString()}</div>
        </div>
  
        {/* Term Rent section */}
        <div className="flex justify-between items-center mb-3">
        <div className="text-[#A82229]">Term Rent</div>
        <div className="flex items-center">
          <div className="flex items-center">
            <input
              type="number"
              value={termPremium}
              onChange={(e) => setTermPremium(Number(e.target.value))}
              className="w-12 text-right bg-transparent border-b border-[#A82229] text-gray-400"
            />
            <span className="ml-1 text-gray-400">%</span>
          </div>
          <div className="text-[#A82229] w-14 text-right mr-4">
            ${Math.round(calculateTermRent(term)).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        {Object.entries(managementCosts.preOccupancy).map(([key, value]) => (
          key !== 'Term Rent' && (
            <LineItem
              key={key}
              label={key}
              value={value}
              opacity={getOpacity(key)}
              onChange={(newValue) => handleCostChange('preOccupancy', key, newValue)}
            />
          )
        ))}
      </div>

      <div className="bg-white p-1 rounded-lg mb-8 ml-[-2] border-4 border-[#A82229]">
        <LineItem label="PRE OCCUPANCY" value={preOccupancyTotal} isBold isWhite
        
        textColor="text-[#A82229]"
/>
      </div>

      <div className="my-2 space-y-2 mb-0">
        {Object.entries(managementCosts.recurring).map(([key, value]) => (
          <LineItem
            key={key}
            label={key}
            value={value}
            isWhole={key === 'Dedicated WX'}
            opacity={getOpacity(key)}
            onChange={(newValue) => handleCostChange('recurring', key, newValue)}
          />
        ))}
      </div>

<div className=" p-1 rounded-lg mb-6 mt-4 border-4 border-[#A82229]" style={{ color: '#A82229' }}>


<LineItem 
    label="ON-GOING" 
    value={`$${formatNumberWithCommas(Math.round(ongoingTotal))}`}
    isBold 
    isWhite 
    textColor= "color: '#A82229'"
    isText={true}
  />
</div>



      <div className="bg-[#A82229] p-3 rounded-lg mb-1 mt-1 border-4 border-[#A82229]">
        <LineItem
          label="NER"
          value={ner.toFixed(2)}
          textColor="text-white"
        />
      </div>
      <div className="bg-[#A82229] p-3 rounded-lg mb-1 mt-1 border-4 border-[#A82229]">
        <LineItem
          label="PAYBACK"
          value={`${calculatePayback(ner)} Months`}
          isText
          textColor="text-white"
        />
      </div>
    </>
  );
};



  return (
    <div 
      className={`w-full transition-all duration-500 ease-in-out ${
        isExpanded ? 'h-[calc(100%-0px)]' : 'h-24'
      }`}
      onClick={toggleExpand}
    >
      <div 
        className={`border-4 border-[#A82229] rounded-3xl p-6 text-[#A82229] backface-hidden transition-all duration-600 ${
          isFlipping ? 'rotate-y-180' : ''
        } ${isExpanded ? 'h-full' : 'h-24 flex items-center justify-center'} overflow-hidden`}
      >
        {isExpanded ? (
          isManagementMode ? renderManagementView() : renderTenantView()
        ) : (
          <div className="text-xl font-bold">160 Varick in Hudson</div>
        )}
        {isExpanded && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleMode();
            }}
            className="w-full bg-[#ffffff] border-2 border-[#A82229] text-[#A82229] py-2 rounded-full mt-4 mb-2 hover:bg-[#ffffff] transition-colors duration-300"
          >
            {isManagementMode ? 'Switch to Tenant View' : 'Management View'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PricingMatrix;
