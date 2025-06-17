
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Zap, Calculator } from 'lucide-react';

interface TokenCosts {
  energyConsumption: number;
  electricityCost: number;
  carbonFootprint: number;
  costPer1MTokens: number;
  costPer1KTokens: number;
}

const TokenElectricityCostCalculator = () => {
  const [model, setModel] = useState('gpt-4');
  const [gpuType, setGpuType] = useState('h100');
  const [region, setRegion] = useState('us');
  const [tokens, setTokens] = useState(1000000); // 1M tokens default
  const [deploymentType, setDeploymentType] = useState('cloud');
  const [pue, setPue] = useState(1.1);

  const [costs, setCosts] = useState<TokenCosts>({
    energyConsumption: 0,
    electricityCost: 0,
    carbonFootprint: 0,
    costPer1MTokens: 0,
    costPer1KTokens: 0
  });

  // Model energy efficiency (kWh per token)
  const modelEfficiency = {
    'gpt-3': { kwhPerToken: 0.000286, name: 'GPT-3' },
    'gpt-4': { kwhPerToken: 0.00017, name: 'GPT-4' },
    'mistral': { kwhPerToken: 0.000006, name: 'Mistral' },
    'llama3-65b': { kwhPerToken: 0.00011, name: 'LLaMA-3 65B (H100)' },
    'llama3-65b-opt': { kwhPerToken: 0.0011, name: 'LLaMA-3 65B (A100)' }
  };

  // GPU specifications
  const gpuSpecs = {
    'a100': { power: 400, tokensPerSec: 1400, name: 'NVIDIA A100' },
    'h100': { power: 700, tokensPerSec: 2800, name: 'NVIDIA H100' },
    'rtx4090': { power: 450, tokensPerSec: 30, name: 'RTX 4090' }
  };

  // Regional electricity pricing and carbon intensity
  const regionData = {
    'us': { electricityRate: 0.15, carbonIntensity: 0.4, name: 'United States' },
    'eu': { electricityRate: 0.30, carbonIntensity: 0.25, name: 'Europe' },
    'india': { electricityRate: 0.08, carbonIntensity: 0.8, name: 'India' },
    'asia': { electricityRate: 0.14, carbonIntensity: 0.6, name: 'Asia' }
  };

  // Deployment efficiency factors
  const deploymentFactors = {
    'cloud': { pueDefault: 1.1, efficiency: 1.0, name: 'Cloud Hosted' },
    'onprem': { pueDefault: 1.5, efficiency: 0.8, name: 'On-Premises' },
    'edge': { pueDefault: 2.0, efficiency: 0.6, name: 'Edge Deployment' }
  };

  useEffect(() => {
    calculateTokenCosts();
  }, [model, gpuType, region, tokens, deploymentType, pue]);

  const calculateTokenCosts = () => {
    const modelData = modelEfficiency[model as keyof typeof modelEfficiency];
    const gpu = gpuSpecs[gpuType as keyof typeof gpuSpecs];
    const regionInfo = regionData[region as keyof typeof regionData];
    const deploymentFactor = deploymentFactors[deploymentType as keyof typeof deploymentFactors];

    // Calculate energy consumption per token
    let kwhPerToken = modelData.kwhPerToken;
    
    // If using GPU-based calculation instead of model benchmark
    if (model === 'custom') {
      kwhPerToken = (gpu.power / 1000) / gpu.tokensPerSec; // Convert W to kW, then kWh per token
    }

    // Apply deployment efficiency factor
    kwhPerToken = kwhPerToken / deploymentFactor.efficiency;

    // Apply PUE for total facility energy
    const totalKwhPerToken = kwhPerToken * pue;

    // Calculate costs
    const totalEnergyConsumption = totalKwhPerToken * tokens;
    const electricityCost = totalEnergyConsumption * regionInfo.electricityRate;
    const carbonFootprint = totalEnergyConsumption * regionInfo.carbonIntensity;

    // Calculate per 1M and 1K token costs
    const costPer1MTokens = (totalKwhPerToken * 1000000) * regionInfo.electricityRate;
    const costPer1KTokens = (totalKwhPerToken * 1000) * regionInfo.electricityRate;

    setCosts({
      energyConsumption: totalEnergyConsumption,
      electricityCost,
      carbonFootprint,
      costPer1MTokens,
      costPer1KTokens
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Token to Electricity Cost Calculator
          </CardTitle>
          <CardDescription>
            Calculate energy consumption and costs for AI token generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model Type</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3">GPT-3 (0.000286 kWh/token)</SelectItem>
                  <SelectItem value="gpt-4">GPT-4 (0.00017 kWh/token)</SelectItem>
                  <SelectItem value="mistral">Mistral (0.000006 kWh/token)</SelectItem>
                  <SelectItem value="llama3-65b">LLaMA-3 65B H100</SelectItem>
                  <SelectItem value="llama3-65b-opt">LLaMA-3 65B A100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpuType">GPU Type (for custom calc)</Label>
              <Select value={gpuType} onValueChange={setGpuType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a100">A100 (400W, 1400 tok/s)</SelectItem>
                  <SelectItem value="h100">H100 (700W, 2800 tok/s)</SelectItem>
                  <SelectItem value="rtx4090">RTX 4090 (450W, 30 tok/s)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">US ($0.15/kWh)</SelectItem>
                  <SelectItem value="eu">Europe ($0.30/kWh)</SelectItem>
                  <SelectItem value="india">India ($0.08/kWh)</SelectItem>
                  <SelectItem value="asia">Asia ($0.14/kWh)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokens">Number of Tokens</Label>
              <Input
                id="tokens"
                type="number"
                value={tokens}
                onChange={(e) => setTokens(Number(e.target.value))}
                placeholder="1000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deploymentType">Deployment Type</Label>
              <Select value={deploymentType} onValueChange={setDeploymentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud">Cloud Hosted</SelectItem>
                  <SelectItem value="onprem">On-Premises</SelectItem>
                  <SelectItem value="edge">Edge Deployment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pue">PUE (Power Usage Effectiveness)</Label>
              <Input
                id="pue"
                type="number"
                step="0.1"
                value={pue}
                onChange={(e) => setPue(Number(e.target.value))}
                placeholder="1.1"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Energy & Cost Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Energy Consumption</span>
                  <span className="font-mono">{costs.energyConsumption.toFixed(4)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Electricity Cost</span>
                  <span className="font-mono">${costs.electricityCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Carbon Footprint</span>
                  <span className="font-mono">{costs.carbonFootprint.toFixed(3)} kg CO₂e</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cost per 1K tokens</span>
                  <span className="font-mono">${costs.costPer1KTokens.toFixed(6)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Cost per 1M tokens</span>
                  <span className="font-mono text-green-600">${costs.costPer1MTokens.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Configuration Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span>{modelEfficiency[model as keyof typeof modelEfficiency].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>kWh per token:</span>
                  <span>{modelEfficiency[model as keyof typeof modelEfficiency].kwhPerToken.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GPU:</span>
                  <span>{gpuSpecs[gpuType as keyof typeof gpuSpecs].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Region:</span>
                  <span>{regionData[region as keyof typeof regionData].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity Rate:</span>
                  <span>${regionData[region as keyof typeof regionData].electricityRate}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>PUE Factor:</span>
                  <span>{pue}×</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenElectricityCostCalculator;
