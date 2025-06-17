
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Users, Download } from 'lucide-react';

const AIManpowerCalculator = () => {
  const [formData, setFormData] = useState({
    projectType: 'rag-system',
    region: 'us',
    employmentType: 'fulltime',
    projectDuration: 6,
    mlEngineers: 2,
    aiResearchers: 1,
    dataScientists: 1,
    mlopsEngineers: 1,
    devopsEngineers: 1,
    productManagers: 1,
    remoteWork: false
  });

  const [results, setResults] = useState<any>(null);

  const salaryData = {
    us: {
      mlEngineer: { fulltime: 158000, freelance: 150 },
      aiResearcher: { fulltime: 258000, freelance: 200 },
      dataScientist: { fulltime: 140000, freelance: 130 },
      mlopsEngineer: { fulltime: 155000, freelance: 140 },
      devopsEngineer: { fulltime: 135000, freelance: 125 },
      productManager: { fulltime: 180000, freelance: 160 }
    },
    eu: {
      mlEngineer: { fulltime: 95000, freelance: 120 },
      aiResearcher: { fulltime: 180000, freelance: 150 },
      dataScientist: { fulltime: 85000, freelance: 100 },
      mlopsEngineer: { fulltime: 105000, freelance: 110 },
      devopsEngineer: { fulltime: 90000, freelance: 95 },
      productManager: { fulltime: 120000, freelance: 130 }
    },
    india: {
      mlEngineer: { fulltime: 25000, freelance: 35 },
      aiResearcher: { fulltime: 45000, freelance: 55 },
      dataScientist: { fulltime: 22000, freelance: 30 },
      mlopsEngineer: { fulltime: 28000, freelance: 38 },
      devopsEngineer: { fulltime: 20000, freelance: 28 },
      productManager: { fulltime: 35000, freelance: 45 }
    },
    asia: {
      mlEngineer: { fulltime: 55000, freelance: 65 },
      aiResearcher: { fulltime: 95000, freelance: 110 },
      dataScientist: { fulltime: 48000, freelance: 55 },
      mlopsEngineer: { fulltime: 58000, freelance: 68 },
      devopsEngineer: { fulltime: 45000, freelance: 52 },
      productManager: { fulltime: 75000, freelance: 85 }
    }
  };

  const calculateCosts = () => {
    const regionData = salaryData[formData.region as keyof typeof salaryData];
    const workHoursPerMonth = 160;
    const isFreelance = formData.employmentType === 'freelance';
    const remoteDiscount = formData.remoteWork ? 0.85 : 1.0;

    const roles = [
      { key: 'mlEngineer', count: formData.mlEngineers, name: 'ML Engineers' },
      { key: 'aiResearcher', count: formData.aiResearchers, name: 'AI Researchers' },
      { key: 'dataScientist', count: formData.dataScientists, name: 'Data Scientists' },
      { key: 'mlopsEngineer', count: formData.mlopsEngineers, name: 'MLOps Engineers' },
      { key: 'devopsEngineer', count: formData.devopsEngineers, name: 'DevOps Engineers' },
      { key: 'productManager', count: formData.productManagers, name: 'Product Managers' }
    ];

    let totalMonthlyCost = 0;
    const roleBreakdown: any = {};

    roles.forEach(role => {
      if (role.count > 0) {
        const roleData = regionData[role.key as keyof typeof regionData];
        let cost = 0;
        
        if (isFreelance) {
          cost = roleData.freelance * workHoursPerMonth * role.count;
        } else {
          cost = (roleData.fulltime / 12) * role.count;
        }
        
        cost *= remoteDiscount;
        totalMonthlyCost += cost;
        
        roleBreakdown[role.key] = {
          name: role.name,
          count: role.count,
          unitCost: isFreelance ? roleData.freelance : roleData.fulltime / 12,
          totalCost: cost
        };
      }
    });

    const totalProjectCost = totalMonthlyCost * formData.projectDuration;
    const totalTeamSize = roles.reduce((sum, role) => sum + role.count, 0);

    setResults({
      monthly: totalMonthlyCost,
      total: totalProjectCost,
      teamSize: totalTeamSize,
      roles: roleBreakdown,
      avgCostPerPerson: totalMonthlyCost / totalTeamSize
    });
  };

  const exportResults = () => {
    if (!results) return;
    
    const report = `
AI Manpower Cost Analysis Report
================================

Project Configuration:
- Type: ${formData.projectType}
- Region: ${formData.region.toUpperCase()}
- Employment: ${formData.employmentType}
- Duration: ${formData.projectDuration} months
- Team Size: ${results.teamSize} people
- Remote Work: ${formData.remoteWork ? 'Yes' : 'No'}

Team Composition:
${Object.entries(results.roles).map(([key, role]: [string, any]) => 
  `- ${role.name}: ${role.count} @ $${role.unitCost.toLocaleString()}/month = $${role.totalCost.toLocaleString()}`
).join('\n')}

Cost Summary:
- Monthly Cost: $${results.monthly.toLocaleString()}
- Total Project Cost: $${results.total.toLocaleString()}
- Average Cost per Person: $${results.avgCostPerPerson.toLocaleString()}/month
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-manpower-cost-analysis.txt';
    a.click();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Project Type</Label>
            <Select value={formData.projectType} onValueChange={(value) => setFormData({...formData, projectType: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rag-system">RAG System Implementation</SelectItem>
                <SelectItem value="llm-finetuning">LLM Fine-tuning</SelectItem>
                <SelectItem value="agentic-pipeline">Agentic AI Pipeline</SelectItem>
                <SelectItem value="computer-vision">Computer Vision</SelectItem>
                <SelectItem value="custom">Custom AI Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Region</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="eu">Europe/UK</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="asia">Southeast Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Employment Type</Label>
              <Select value={formData.employmentType} onValueChange={(value) => setFormData({...formData, employmentType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Full-time</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="projectDuration">Project Duration (months)</Label>
            <Input
              id="projectDuration"
              type="number"
              value={formData.projectDuration}
              onChange={(e) => setFormData({...formData, projectDuration: parseInt(e.target.value) || 1})}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Team Composition:</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mlEngineers">ML Engineers</Label>
                <Input
                  id="mlEngineers"
                  type="number"
                  value={formData.mlEngineers}
                  onChange={(e) => setFormData({...formData, mlEngineers: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="aiResearchers">AI Researchers</Label>
                <Input
                  id="aiResearchers"
                  type="number"
                  value={formData.aiResearchers}
                  onChange={(e) => setFormData({...formData, aiResearchers: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataScientists">Data Scientists</Label>
                <Input
                  id="dataScientists"
                  type="number"
                  value={formData.dataScientists}
                  onChange={(e) => setFormData({...formData, dataScientists: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="mlopsEngineers">MLOps Engineers</Label>
                <Input
                  id="mlopsEngineers"
                  type="number"
                  value={formData.mlopsEngineers}
                  onChange={(e) => setFormData({...formData, mlopsEngineers: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="devopsEngineers">DevOps Engineers</Label>
                <Input
                  id="devopsEngineers"
                  type="number"
                  value={formData.devopsEngineers}
                  onChange={(e) => setFormData({...formData, devopsEngineers: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="productManagers">Product Managers</Label>
                <Input
                  id="productManagers"
                  type="number"
                  value={formData.productManagers}
                  onChange={(e) => setFormData({...formData, productManagers: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remoteWork"
              checked={formData.remoteWork}
              onChange={(e) => setFormData({...formData, remoteWork: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="remoteWork">Remote/Hybrid Work (15% discount)</Label>
          </div>

          <Button onClick={calculateCosts} className="w-full">
            Calculate Team Cost
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
                <p className="font-medium">Team Size</p>
                <p className="text-2xl font-bold text-blue-600">{results.teamSize} people</p>
              </div>
              <div>
                <p className="font-medium">Monthly Cost</p>
                <p className="text-2xl font-bold text-green-600">${results.monthly.toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Team Breakdown:</h4>
              <div className="space-y-1 pl-4">
                {Object.entries(results.roles).map(([key, role]: [string, any]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <span>{role.name}:</span>
                    <span>{role.count}x</span>
                    <span>${role.totalCost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span>Avg. Cost per Person:</span>
                <span className="font-medium">${results.avgCostPerPerson.toLocaleString()}/month</span>
              </div>
              <div>
                <span>Project Duration:</span>
                <span className="font-medium">{formData.projectDuration} months</span>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-gray-600">Total Project Cost</p>
              <p className="text-4xl font-bold text-purple-600">${results.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIManpowerCalculator;
