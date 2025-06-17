
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, Server, Zap } from 'lucide-react';

interface HardwareCosts {
  gpuCost: number;
  serverCost: number;
  infrastructureCost: number;
  maintenanceCost: number;
  depreciationCost: number;
  total: number;
}

const AIHardwareCostCalculator = () => {
  const [gpuType, setGpuType] = useState('h100');
  const [gpuCount, setGpuCount] = useState(8);
  const [serverType, setServerType] = useState('custom');
  const [deploymentType, setDeploymentType] = useState('onprem');
  const [depreciationYears, setDepreciationYears] = useState(3);
  const [utilizationPercent, setUtilizationPercent] = useState(40);
  
  const [costs, setCosts] = useState<HardwareCosts>({
    gpuCost: 0,
    serverCost: 0,
    infrastructureCost: 0,
    maintenanceCost: 0,
    depreciationCost: 0,
    total: 0
  });

  // GPU pricing data
  const gpuPricing = {
    'a100-40gb': { price: 9000, power: 400, name: 'NVIDIA A100 40GB' },
    'a100-80gb': { price: 19000, power: 400, name: 'NVIDIA A100 80GB' },
    'h100': { price: 28000, power: 700, name: 'NVIDIA H100 80GB' },
    'rtx4090': { price: 2800, power: 450, name: 'RTX 4090 24GB' },
    'l40s': { price: 10000, power: 300, name: 'NVIDIA L40S 48GB' }
  };

  // Server configurations
  const serverConfigs = {
    'lambda-l40s': { baseCost: 82999, gpusIncluded: 8, name: 'Lambda 8×L40S Server' },
    'lambda-h100': { baseCost: 273749, gpusIncluded: 8, name: 'Lambda 8×H100 Server' },
    'custom': { baseCost: 15000, gpusIncluded: 0, name: 'Custom Build (CPU+RAM+Storage)' }
  };

  // Infrastructure costs per rack
  const infraCosts = {
    'onprem': { rackCost: 10000, coolingCost: 50000, networkingCost: 30000, powerCost: 25000 },
    'colo': { rackCost: 5000, coolingCost: 0, networkingCost: 15000, powerCost: 0 },
    'cloud': { rackCost: 0, coolingCost: 0, networkingCost: 0, powerCost: 0 }
  };

  useEffect(() => {
    calculateCosts();
  }, [gpuType, gpuCount, serverType, deploymentType, depreciationYears, utilizationPercent]);

  const calculateCosts = () => {
    const gpu = gpuPricing[gpuType as keyof typeof gpuPricing];
    const server = serverConfigs[serverType as keyof typeof serverConfigs];
    const infra = infraCosts[deploymentType as keyof typeof infraCosts];

    // GPU costs
    let gpuCost = 0;
    if (serverType === 'custom') {
      gpuCost = gpu.price * gpuCount;
    } else {
      // Pre-configured servers include GPUs
      const additionalGPUs = Math.max(0, gpuCount - server.gpusIncluded);
      gpuCost = additionalGPUs * gpu.price;
    }

    // Server cost
    const serverCost = server.baseCost;

    // Infrastructure cost (for on-prem and colo)
    const racksNeeded = Math.ceil(gpuCount / 8); // Assume 8 GPUs per rack
    const infrastructureCost = deploymentType === 'cloud' ? 0 : 
      (infra.rackCost + infra.coolingCost + infra.networkingCost + infra.powerCost) * racksNeeded;

    // Annual maintenance (10-15% of hardware cost)
    const hardwareCost = gpuCost + serverCost;
    const maintenanceCost = hardwareCost * 0.12; // 12% annually

    // Depreciation calculation
    const totalHardwareCost = hardwareCost + infrastructureCost;
    const annualDepreciation = totalHardwareCost / depreciationYears;
    
    // Adjust for utilization - low utilization increases effective cost
    const utilizationMultiplier = utilizationPercent < 30 ? (100 / utilizationPercent) : 1;
    const depreciationCost = annualDepreciation * utilizationMultiplier;

    const total = gpuCost + serverCost + infrastructureCost + maintenanceCost + depreciationCost;

    setCosts({
      gpuCost,
      serverCost,
      infrastructureCost,
      maintenanceCost,
      depreciationCost,
      total
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            AI Hardware Cost Calculator
          </CardTitle>
          <CardDescription>
            Calculate the total cost of AI hardware including GPUs, servers, and infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gpuType">GPU Type</Label>
              <Select value={gpuType} onValueChange={setGpuType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a100-40gb">A100 40GB (~$9K)</SelectItem>
                  <SelectItem value="a100-80gb">A100 80GB (~$19K)</SelectItem>
                  <SelectItem value="h100">H100 80GB (~$28K)</SelectItem>
                  <SelectItem value="rtx4090">RTX 4090 24GB (~$2.8K)</SelectItem>
                  <SelectItem value="l40s">L40S 48GB (~$10K)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpuCount">Number of GPUs</Label>
              <Input
                id="gpuCount"
                type="number"
                value={gpuCount}
                onChange={(e) => setGpuCount(Number(e.target.value))}
                min="1"
                max="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverType">Server Configuration</Label>
              <Select value={serverType} onValueChange={setServerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lambda-l40s">Lambda 8×L40S ($83K)</SelectItem>
                  <SelectItem value="lambda-h100">Lambda 8×H100 ($274K)</SelectItem>
                  <SelectItem value="custom">Custom Build ($15K base)</SelectItem>
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
                  <SelectItem value="onprem">On-Premises</SelectItem>
                  <SelectItem value="colo">Colocation</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depreciationYears">Depreciation Period (Years)</Label>
              <Input
                id="depreciationYears"
                type="number"
                value={depreciationYears}
                onChange={(e) => setDepreciationYears(Number(e.target.value))}
                min="1"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utilizationPercent">Utilization (%)</Label>
              <Input
                id="utilizationPercent"
                type="number"
                value={utilizationPercent}
                onChange={(e) => setUtilizationPercent(Number(e.target.value))}
                min="1"
                max="100"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">GPU Cost</span>
                  <span className="font-mono">${costs.gpuCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Server Cost</span>
                  <span className="font-mono">${costs.serverCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Infrastructure Cost</span>
                  <span className="font-mono">${costs.infrastructureCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Maintenance</span>
                  <span className="font-mono">${costs.maintenanceCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Depreciation</span>
                  <span className="font-mono">${costs.depreciationCost.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Annual Cost</span>
                  <span className="font-mono text-green-600">${costs.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Configuration Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>GPU Model:</span>
                  <span>{gpuPricing[gpuType as keyof typeof gpuPricing].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Power Draw:</span>
                  <span>{(gpuPricing[gpuType as keyof typeof gpuPricing].power * gpuCount / 1000).toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Server Config:</span>
                  <span>{serverConfigs[serverType as keyof typeof serverConfigs].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deployment:</span>
                  <span className="capitalize">{deploymentType}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIHardwareCostCalculator;
