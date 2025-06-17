
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Server, Zap, DollarSign } from 'lucide-react';
import AIHardwareCostCalculator from './AIHardwareCostCalculator';
import TokenElectricityCostCalculator from './TokenElectricityCostCalculator';
import AIPowerOperationsCostCalculator from './AIPowerOperationsCostCalculator';

const SLMCostCalculator = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Cost Calculator Suite
        </h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive cost analysis tools for AI hardware, token generation, and operations
        </p>
      </div>

      <Tabs defaultValue="hardware" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hardware" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Hardware Costs
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Token Electricity
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Power & Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hardware" className="mt-6">
          <AIHardwareCostCalculator />
        </TabsContent>

        <TabsContent value="tokens" className="mt-6">
          <TokenElectricityCostCalculator />
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <AIPowerOperationsCostCalculator />
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Calculator Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <strong>Hardware Costs:</strong> Calculate total cost of AI hardware including GPUs, servers, infrastructure, maintenance, and depreciation based on current market prices.
          </div>
          <div>
            <strong>Token Electricity:</strong> Estimate energy consumption and electricity costs for generating AI tokens using different models and deployment scenarios.
          </div>
          <div>
            <strong>Power & Operations:</strong> Analyze power consumption and operational costs for running AI systems at scale with regional pricing variations.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLMCostCalculator;
