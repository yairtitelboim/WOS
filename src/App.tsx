import React, { useState, useEffect, useCallback } from 'react';
import { managementCosts as initialManagementCosts, RSF, ManagementCosts, packages } from './data';
import { PricingMatrix, Sidebar } from './PricingComponents';
import calculateNER from './calculateNER';

const App: React.FC = () => {
  const [selectedBox, setSelectedBox] = useState<{pkg: string, term: number} | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [managementCosts, setManagementCosts] = useState<ManagementCosts>(initialManagementCosts);
  const [discountRate, setDiscountRate] = useState(0.08);

  const getNER = useCallback((pkg: string, term: number, discountRate: number): number => {
    return calculateNER(pkg, term, discountRate, managementCosts, packages);
  }, [managementCosts]);

  useEffect(() => {
    if (selectedBox) {
      setIsExpanded(true);
    }
  }, [selectedBox]);

  return (
    <div className="p-8 font-['Inter'] font-black relative min-h-screen" style={{ color: '#A82229' }}>
      <h1 className="text-1xl mb-20 text-left">Flex Office Pricing (v.01)</h1>
      <div className="flex justify-between">
        <div className="w-[800px] mt-10">
          <PricingMatrix 
            selectedBox={selectedBox} 
            setSelectedBox={setSelectedBox} 
            isManagementMode={isManagementMode}
            managementCosts={managementCosts}
            calculateNER={getNER}
            discountRate={discountRate}
          />
        </div>
        <div className={`w-[450px] flex flex-col mb-1 transition-all duration-300 ${isManagementMode ? '-mt-[-10]' : 'mt-20'}`}>
          <Sidebar 
            selectedBox={selectedBox} 
            setSelectedBox={setSelectedBox}
            isExpanded={isExpanded} 
            setIsExpanded={setIsExpanded}
            isManagementMode={isManagementMode}
            setIsManagementMode={setIsManagementMode}
            managementCosts={managementCosts}
            setManagementCosts={setManagementCosts}
            calculateNER={getNER}
            discountRate={discountRate}
            setDiscountRate={setDiscountRate}
          />
        </div>
      </div>
    </div>
  );
};

export default App;