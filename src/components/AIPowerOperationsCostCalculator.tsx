
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Zap, Server, Calculator } from 'lucide-react';

interface OperationsCosts {
  dailyPowerCost: number;
  monthlyPowerCost: number;
  annualPowerCost: number;
  coolingCost: number;
  totalOperationalCost: number;
  carbonFootprint: number;
}

const AIPowerOperationsCostCalculator = () => {
  const [hardwareType, setHardwareType] = useState('h100');
  const [nodeCount, setNodeCount] = useState(8);
  const [utilizationRate, setUtilizationRate] = useState(61); // 61% typical for H100
  const [region, setRegion] = useState('us');
  const [deploymentType, setDeploymentType] = useState('cloud');
  const [pue, setPue] = useState(1.1);
  const [operationalDays, setOperationalDays] = useState(365);

  const [costs, setCosts] = useState<OperationsCosts>({
    dailyPowerCost: 0,
    monthlyPowerCost: 0,
    annualPowerCost: 0,
    coolingCost: 0,
    totalOperationalCost: 0,
    carbonFootprint: 0
  });

  // Hardware specifications
  const hardwareSpecs = {
    'h100': { power: 700, name: 'NVIDIA H100', efficiency: 1.0 },
    'a100': { power: 400, name: 'NVIDIA A100', efficiency: 0.7 },
    'tpu-v4': { power: 200, name: 'Google TPU v4', efficiency: 1.5 },
    'tpu-v5e': { power: 197, name: 'Google TPU v5e', efficiency: 1.8 },
    'rtx4090': { power: 450, name: 'RTX 4090', efficiency: 0.4 }
  };

  // Regional pricing and carbon data
  const regionData = {
    'us': { 
      commercialRate: 0.15, 
      industrialRate: 0.11, 
      carbonIntensity: 0.5, 
      name: 'United States',
      coolingMultiplier: 0.3 
    },
    'eu': { 
      commercialRate: 0.32, 
      industrialRate: 0.22, 
      carbonIntensity: 0.25, 
      name: 'Europe',
      coolingMultiplier: 0.25 
    },
    'india': { 
      commercialRate: 0.09, 
      industrialRate: 0.07, 
      carbonIntensity: 0.8, 
      name: 'India',
      coolingMultiplier: 0.4 
    },
    'asia': { 
      commercialRate: 0.15, 
      industrialRate: 0.10, 
      carbonIntensity: 0.6, 
      name: 'Asia',
      coolingMultiplier: 0.35 
    }
  };

  // Deployment characteristics
  const deploymentSpecs = {
    'cloud': { pueDefault: 1.1, rateType: 'commercial', overhead: 0.1, name: 'Hyperscaler Cloud' },
    'colo': { pueDefault: 1.3, rateType: 'industrial', overhead: 0.15, name: 'Colocation' },
    'onprem': { pueDefault: 1.5, rateType: 'commercial', overhead: 0.25, name: 'On-Premises' }
  };

  useEffect(() => {
    calculateOperationsCosts();
  }, [hardwareType, nodeCount, utilizationRate, region, deploymentType, pue, operationalDays]);

  const calculateOperationsCosts = () => {
    const hardware = hardwareSpecs[hardwareType as keyof typeof hardwareSpecs];
    const regionInfo = regionData[region as keyof typeof regionData];
    const deployment = deploymentSpecs[deploymentType as keyof typeof deploymentSpecs];

    // Calculate effective power consumption
    const nominalPowerPerNode = hardware.power; // Watts
    const actualPowerPerNode = nominalPowerPerNode * (utilizationRate / 100);
    const totalPower = actualPowerPerNode * nodeCount; // Total watts

    // Convert to kW and apply PUE for total facility power
    const totalPowerKw = (totalPower / 1000) * pue;

    // Select appropriate electricity rate
    const electricityRate = deployment.rateType === 'industrial' 
      ? regionInfo.industrialRate 
      : regionInfo.commercialRate;

    // Calculate daily power costs
    const dailyEnergyKwh = totalPowerKw * 24;
    const dailyPowerCost = dailyEnergyKwh * electricityRate;

    // Calculate cooling costs (typically 25-40% of power consumption)
    const coolingPowerKw = totalPowerKw * regionInfo.coolingMultiplier;
    const dailyCoolingCost = coolingPowerKw * 24 * electricityRate;

    // Calculate monthly and annual costs
    const monthlyPowerCost = dailyPowerCost * 30.44; // Average days per month
    const annualPowerCost = dailyPowerCost * operationalDays;

    // Total operational cost including overhead
    const baseCost = annualPowerCost + (dailyCoolingCost * operationalDays);
    const totalOperationalCost = baseCost * (1 + deployment.overhead);

    // Carbon footprint calculation
    const annualEnergyKwh = dailyEnergyKwh * operationalDays;
    const carbonFootprint = annualEnergyKwh * regionInfo.carbonIntensity; // kg CO2e

    setCosts({
      dailyPowerCost,
      monthlyPowerCost,
      annualPowerCost,
      coolingCost: dailyCoolingCost * operationalDays,
      totalOperationalCost,
      carbonFootprint
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            AI Power & Operations Cost Calculator
          </CardTitle>
          <CardDescription>
            Calculate power consumption and operational costs for AI deployments at scale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hardwareType">Hardware Type</Label>
              <Select value={hardwareType} onValueChange={setHardwareType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h100">NVIDIA H100 (700W)</SelectItem>
                  <SelectItem value="a100">NVIDIA A100 (400W)</SelectItem>
                  <SelectItem value="tpu-v4">Google TPU v4 (200W)</SelectItem>
                  <SelectItem value="tpu-v5e">Google TPU v5e (197W)</SelectItem>
                  <SelectItem value="rtx4090">RTX 4090 (450W)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeCount">Number of Nodes</Label>
              <Input
                id="nodeCount"
                type="number"
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
                min="1"
                max="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utilizationRate">Utilization Rate (%)</Label>
              <Input
                id="utilizationRate"
                type="number"
                value={utilizationRate}
                onChange={(e) => setUtilizationRate(Number(e.target.value))}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">US (Comm: $0.15, Ind: $0.11)</SelectItem>
                  <SelectItem value="eu">Europe (Comm: $0.32, Ind: $0.22)</SelectItem>
                  <SelectItem value="india">India (Comm: $0.09, Ind: $0.07)</SelectItem>
                  <SelectItem value="asia">Asia (Comm: $0.15, Ind: $0.10)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deploymentType">Deployment Type</Label>
              <Select value={deploymentType} onValueChange={setDeploymentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud">Hyperscaler Cloud (PUE 1.1)</SelectItem>
                  <SelectItem value="colo">Colocation (PUE 1.3)</SelectItem>
                  <SelectItem value="onprem">On-Premises (PUE 1.5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pue">Custom PUE</Label>
              <Input
                id="pue"
                type="number"
                step="0.1"
                value={pue}
                onChange={(e) => setPue(Number(e.target.value))}
                min="1.0"
                max="3.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operationalDays">Operational Days/Year</Label>
              <Input
                id="operationalDays"
                type="number"
                value={operationalDays}
                onChange={(e) => setOperationalDays(Number(e.target.value))}
                min="1"
                max="365"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Power & Cost Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Daily Power Cost</span>
                  <span className="font-mono">${costs.dailyPowerCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Power Cost</span>
                  <span className="font-mono">${costs.monthlyPowerCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Power Cost</span>
                  <span className="font-mono">${costs.annualPowerCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Cooling Cost</span>
                  <span className="font-mono">${costs.coolingCost.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Annual OpEx</span>
                  <span className="font-mono text-green-600">${costs.totalOperationalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Carbon Footprint</span>
                  <span className="font-mono">{costs.carbonFootprint.toLocaleString()} kg CO₂e</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">System Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Hardware:</span>
                  <span>{hardwareSpecs[hardwareType as keyof typeof hardwareSpecs].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Peak Power:</span>
                  <span>{(hardwareSpecs[hardwareType as keyof typeof hardwareSpecs].power * nodeCount / 1000).toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Power (w/ util):</span>
                  <span>{(hardwareSpecs[hardwareType as keyof typeof hardwareSpecs].power * nodeCount * utilizationRate / 100000).toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Total w/ PUE:</span>
                  <span>{(hardwareSpecs[hardwareType as keyof typeof hardwareSpecs].power * nodeCount * utilizationRate * pue / 100000).toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Region:</span>
                  <span>{regionData[region as keyof typeof regionData].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deployment:</span>
                  <span>{deploymentSpecs[deploymentType as keyof typeof deploymentSpecs].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity Rate:</span>
                  <span>${deploymentSpecs[deploymentType as keyof typeof deploymentSpecs].rateType === 'industrial' 
                    ? regionData[region as keyof typeof regionData].industrialRate 
                    : regionData[region as keyof typeof regionData].commercialRate}/kWh</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPowerOperationsCostCalculator;
