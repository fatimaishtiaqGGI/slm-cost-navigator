
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Factory, Download } from 'lucide-react';

const AIFactoryCalculator = () => {
  const [formData, setFormData] = useState({
    facilitySize: 100000,
    rackCount: 500,
    gpuType: 'h100',
    gpuPerRack: 8,
    powerCostPerKwh: 0.15,
    pue: 1.58,
    staffCount: 15,
    region: 'us'
  });

  const [results, setResults] = useState<any>(null);

  const gpuPrices = {
    'h100': 30970,
    'a100': 18000,
    'l40s': 8000
  };

  const gpuPower = {
    'h100': 700,
    'a100': 400,
    'l40s': 300
  };

  const constructionCosts = {
    'us': 800,
    'eu': 900,
    'asia': 600
  };

  const staffCosts = {
    'us': 120000,
    'eu': 85000,
    'asia': 35000
  };

  const calculateCosts = () => {
    const constructionCostPerSqFt = constructionCosts[formData.region as keyof typeof constructionCosts];
    const buildingCost = formData.facilitySize * constructionCostPerSqFt;
    
    const rackCost = formData.rackCount * 3000;
    const networkingCost = formData.rackCount * 30000;
    
    const gpuPrice = gpuPrices[formData.gpuType as keyof typeof gpuPrices];
    const totalGpus = formData.rackCount * formData.gpuPerRack;
    const gpuCost = totalGpus * gpuPrice;
    
    const gpuPowerPerUnit = gpuPower[formData.gpuType as keyof typeof gpuPower];
    const totalPowerKw = (totalGpus * gpuPowerPerUnit + formData.rackCount * 2000) / 1000;
    const totalPowerWithPue = totalPowerKw * formData.pue;
    const annualPowerCost = totalPowerWithPue * 24 * 365 * formData.powerCostPerKwh;
    
    const coolingCost = Math.ceil(totalPowerKw / 5000) * 2000000;
    const backupPowerCost = Math.ceil(totalPowerKw / 2000) * 750000;
    
    const annualStaffCost = formData.staffCount * staffCosts[formData.region as keyof typeof staffCosts];
    
    const totalCapex = buildingCost + rackCost + networkingCost + gpuCost + coolingCost + backupPowerCost;
    const totalOpexAnnual = annualPowerCost + annualStaffCost;
    const fiveYearTco = totalCapex + (totalOpexAnnual * 5);

    setResults({
      building: buildingCost,
      infrastructure: {
        racks: rackCost,
        networking: networkingCost,
        cooling: coolingCost,
        backup: backupPowerCost,
        total: rackCost + networkingCost + coolingCost + backupPowerCost
      },
      compute: {
        gpuCount: totalGpus,
        gpuCost: gpuCost,
        totalPowerKw: totalPowerKw,
        totalPowerWithPue: totalPowerWithPue
      },
      operating: {
        annualPower: annualPowerCost,
        annualStaff: annualStaffCost,
        total: totalOpexAnnual
      },
      totals: {
        capex: totalCapex,
        opexAnnual: totalOpexAnnual,
        fiveYearTco: fiveYearTco
      }
    });
  };

  const exportResults = () => {
    if (!results) return;
    
    const report = `
AI Data Center Cost Analysis Report
===================================

Facility Configuration:
- Size: ${formData.facilitySize.toLocaleString()} sq ft
- Racks: ${formData.rackCount}
- GPU Type: ${formData.gpuType.toUpperCase()}
- Total GPUs: ${results.compute.gpuCount.toLocaleString()}
- Power Draw: ${results.compute.totalPowerWithPue.toFixed(1)} kW (with PUE)

Capital Expenditure (CAPEX):
- Building Construction: $${results.building.toLocaleString()}
- Infrastructure: $${results.infrastructure.total.toLocaleString()}
- GPU Hardware: $${results.compute.gpuCost.toLocaleString()}
- Total CAPEX: $${results.totals.capex.toLocaleString()}

Operating Expenditure (OPEX - Annual):
- Electricity: $${results.operating.annualPower.toLocaleString()}
- Staffing: $${results.operating.annualStaff.toLocaleString()}
- Total Annual OPEX: $${results.operating.total.toLocaleString()}

5-Year Total Cost of Ownership: $${results.totals.fiveYearTco.toLocaleString()}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-datacenter-cost-analysis.txt';
    a.click();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Data Center Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facilitySize">Facility Size (sq ft)</Label>
              <Input
                id="facilitySize"
                type="number"
                value={formData.facilitySize}
                onChange={(e) => setFormData({...formData, facilitySize: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="rackCount">Number of Racks</Label>
              <Input
                id="rackCount"
                type="number"
                value={formData.rackCount}
                onChange={(e) => setFormData({...formData, rackCount: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <Label>GPU Type</Label>
            <Select value={formData.gpuType} onValueChange={(value) => setFormData({...formData, gpuType: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h100">NVIDIA H100 80GB - $30,970</SelectItem>
                <SelectItem value="a100">NVIDIA A100 80GB - $18,000</SelectItem>
                <SelectItem value="l40s">NVIDIA L40S - $8,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gpuPerRack">GPUs per Rack</Label>
            <Input
              id="gpuPerRack"
              type="number"
              value={formData.gpuPerRack}
              onChange={(e) => setFormData({...formData, gpuPerRack: parseInt(e.target.value) || 1})}
            />
          </div>

          <div>
            <Label>Region</Label>
            <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">North America - $800/sq ft</SelectItem>
                <SelectItem value="eu">Europe - $900/sq ft</SelectItem>
                <SelectItem value="asia">Asia Pacific - $600/sq ft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="powerCostPerKwh">Power Cost ($/kWh)</Label>
              <Input
                id="powerCostPerKwh"
                type="number"
                step="0.01"
                value={formData.powerCostPerKwh}
                onChange={(e) => setFormData({...formData, powerCostPerKwh: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="pue">PUE Ratio</Label>
              <Input
                id="pue"
                type="number"
                step="0.01"
                value={formData.pue}
                onChange={(e) => setFormData({...formData, pue: parseFloat(e.target.value) || 1.0})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="staffCount">Staff Count</Label>
            <Input
              id="staffCount"
              type="number"
              value={formData.staffCount}
              onChange={(e) => setFormData({...formData, staffCount: parseInt(e.target.value) || 0})}
            />
          </div>

          <Button onClick={calculateCosts} className="w-full">
            Calculate Total Cost
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Cost Analysis Results
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Total GPUs</p>
                <p className="text-2xl font-bold text-blue-600">{results.compute.gpuCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium">Power Draw</p>
                <p className="text-2xl font-bold text-green-600">{results.compute.totalPowerWithPue.toFixed(1)} kW</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Capital Expenditure (CAPEX):</h4>
              <div className="grid grid-cols-2 gap-2 pl-4">
                <span>Building:</span>
                <span>${results.building.toLocaleString()}</span>
                <span>Infrastructure:</span>
                <span>${results.infrastructure.total.toLocaleString()}</span>
                <span>GPU Hardware:</span>
                <span>${results.compute.gpuCost.toLocaleString()}</span>
                <span className="font-medium">Total CAPEX:</span>
                <span className="font-medium">${results.totals.capex.toLocaleString()}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Operating Expenditure (Annual):</h4>
              <div className="grid grid-cols-2 gap-2 pl-4">
                <span>Electricity:</span>
                <span>${results.operating.annualPower.toLocaleString()}</span>
                <span>Staffing:</span>
                <span>${results.operating.annualStaff.toLocaleString()}</span>
                <span className="font-medium">Total Annual OPEX:</span>
                <span className="font-medium">${results.operating.total.toLocaleString()}</span>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-gray-600">5-Year Total Cost of Ownership</p>
              <p className="text-4xl font-bold text-purple-600">${results.totals.fiveYearTco.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIFactoryCalculator;
