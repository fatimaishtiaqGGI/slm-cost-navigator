
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calculator, Zap, Server, Cloud, DollarSign } from 'lucide-react';

interface CostBreakdown {
  training: number;
  inference: number;
  hosting: number;
  energy: number;
  total: number;
}

const SLMCostCalculator = () => {
  // Training costs state
  const [model, setModel] = useState('mistral-7b');
  const [tokens, setTokens] = useState(3200);
  const [gpuCount, setGpuCount] = useState(512);
  const [trainingDays, setTrainingDays] = useState(14);
  const [gpuType, setGpuType] = useState('A100');
  const [energyRate, setEnergyRate] = useState(0.15);

  // Fine-tuning costs state
  const [finetuneType, setFinetuneType] = useState('lora');
  const [finetuneHours, setFinetuneHours] = useState(3);
  const [awsHourlyRate, setAwsHourlyRate] = useState(2.10);

  // Inference costs state
  const [inferenceGpu, setInferenceGpu] = useState('rtx-4090');
  const [batchSize, setBatchSize] = useState(1);
  const [tokensPerSecond, setTokensPerSecond] = useState(45);

  // Hosting costs state
  const [hostingPlatform, setHostingPlatform] = useState('aws');
  const [hoursPerMonth, setHoursPerMonth] = useState(744); // 24*31
  
  const [costs, setCosts] = useState<CostBreakdown>({
    training: 0,
    inference: 0,
    hosting: 0,
    energy: 0,
    total: 0
  });

  // GPU specifications
  const gpuSpecs = {
    'A100': { power: 400, cost: 3.0 },
    'H100': { power: 700, cost: 4.5 },
    'T4': { power: 70, cost: 0.5 },
    'RTX-4090': { power: 450, cost: 1.5 }
  };

  // Model specifications
  const modelSpecs = {
    'mistral-7b': { defaultTokens: 3200, vram: 14, tokensPerSec: 45 },
    'phi-3': { defaultTokens: 4900, vram: 8, tokensPerSec: 62 },
    'tinyllama': { defaultTokens: 3000, vram: 3, tokensPerSec: 112 }
  };

  // Hosting platform rates (per hour)
  const hostingRates = {
    'aws': { rate: 1.212, name: 'AWS g5.2xlarge' },
    'huggingface': { rate: 0.98, name: 'Hugging Face 2×T4' },
    'local': { rate: 0.18, name: 'Local Server RTX 4090' }
  };

  useEffect(() => {
    calculateCosts();
  }, [model, tokens, gpuCount, trainingDays, gpuType, energyRate, finetuneType, finetuneHours, awsHourlyRate, inferenceGpu, batchSize, hostingPlatform, hoursPerMonth]);

  const calculateCosts = () => {
    // Training cost calculation
    const gpuHours = gpuCount * 24 * trainingDays;
    const powerConsumption = gpuCount * gpuSpecs[gpuType as keyof typeof gpuSpecs].power * (24 * trainingDays);
    const energyCost = (powerConsumption / 1000) * energyRate; // Convert watts to kWh
    const trainingCost = energyCost + (gpuHours * gpuSpecs[gpuType as keyof typeof gpuSpecs].cost);

    // Fine-tuning cost
    const finetuneCost = finetuneHours * awsHourlyRate;

    // Inference cost (monthly)
    const inferenceVRAM = modelSpecs[model as keyof typeof modelSpecs].vram;
    const inferenceCost = inferenceVRAM * 10; // Simplified cost per GB VRAM per month

    // Hosting cost
    const hostingCost = hoursPerMonth * hostingRates[hostingPlatform as keyof typeof hostingRates].rate;

    const totalCost = trainingCost + finetuneCost + inferenceCost + hostingCost;

    setCosts({
      training: trainingCost,
      inference: inferenceCost,
      hosting: hostingCost,
      energy: energyCost,
      total: totalCost
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SLM Cost Calculator
        </h1>
        <p className="text-muted-foreground text-lg">
          Calculate the total cost of deploying Small Language Models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="training" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="finetuning">Fine-tuning</TabsTrigger>
              <TabsTrigger value="inference">Inference</TabsTrigger>
              <TabsTrigger value="hosting">Hosting</TabsTrigger>
            </TabsList>

            <TabsContent value="training" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Training Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure pretraining parameters for cost estimation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Model Type</Label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mistral-7b">Mistral-7B</SelectItem>
                          <SelectItem value="phi-3">Phi-3-Mini</SelectItem>
                          <SelectItem value="tinyllama">TinyLlama-1.1B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tokens">Tokens (Billions)</Label>
                      <Input
                        id="tokens"
                        type="number"
                        value={tokens}
                        onChange={(e) => setTokens(Number(e.target.value))}
                        placeholder="3200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gpuCount">GPU Count</Label>
                      <Input
                        id="gpuCount"
                        type="number"
                        value={gpuCount}
                        onChange={(e) => setGpuCount(Number(e.target.value))}
                        placeholder="512"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trainingDays">Training Days</Label>
                      <Input
                        id="trainingDays"
                        type="number"
                        value={trainingDays}
                        onChange={(e) => setTrainingDays(Number(e.target.value))}
                        placeholder="14"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gpuType">GPU Type</Label>
                      <Select value={gpuType} onValueChange={setGpuType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A100">A100</SelectItem>
                          <SelectItem value="H100">H100</SelectItem>
                          <SelectItem value="T4">T4</SelectItem>
                          <SelectItem value="RTX-4090">RTX 4090</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="energyRate">Energy Rate ($/kWh)</Label>
                      <Input
                        id="energyRate"
                        type="number"
                        step="0.01"
                        value={energyRate}
                        onChange={(e) => setEnergyRate(Number(e.target.value))}
                        placeholder="0.15"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="finetuning" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Fine-tuning Configuration
                  </CardTitle>
                  <CardDescription>
                    LoRA/QLoRA fine-tuning cost parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="finetuneType">Fine-tuning Type</Label>
                      <Select value={finetuneType} onValueChange={setFinetuneType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lora">LoRA</SelectItem>
                          <SelectItem value="qlora">QLoRA</SelectItem>
                          <SelectItem value="full">Full Fine-tuning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="finetuneHours">Training Hours</Label>
                      <Input
                        id="finetuneHours"
                        type="number"
                        value={finetuneHours}
                        onChange={(e) => setFinetuneHours(Number(e.target.value))}
                        placeholder="3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="awsHourlyRate">AWS Hourly Rate ($)</Label>
                      <Input
                        id="awsHourlyRate"
                        type="number"
                        step="0.01"
                        value={awsHourlyRate}
                        onChange={(e) => setAwsHourlyRate(Number(e.target.value))}
                        placeholder="2.10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inference" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Inference Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure inference hardware and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inferenceGpu">Inference GPU</Label>
                      <Select value={inferenceGpu} onValueChange={setInferenceGpu}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rtx-4090">RTX 4090</SelectItem>
                          <SelectItem value="rtx-3090">RTX 3090</SelectItem>
                          <SelectItem value="t4">T4</SelectItem>
                          <SelectItem value="a10g">A10G</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchSize">Batch Size</Label>
                      <Input
                        id="batchSize"
                        type="number"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        placeholder="1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hosting" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Hosting Configuration
                  </CardTitle>
                  <CardDescription>
                    Choose hosting platform and usage parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hostingPlatform">Platform</Label>
                      <Select value={hostingPlatform} onValueChange={setHostingPlatform}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws">AWS</SelectItem>
                          <SelectItem value="huggingface">Hugging Face</SelectItem>
                          <SelectItem value="local">Local Server</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerMonth">Hours/Month</Label>
                      <Input
                        id="hoursPerMonth"
                        type="number"
                        value={hoursPerMonth}
                        onChange={(e) => setHoursPerMonth(Number(e.target.value))}
                        placeholder="744"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Platform: {hostingRates[hostingPlatform as keyof typeof hostingRates].name} 
                    (${hostingRates[hostingPlatform as keyof typeof hostingRates].rate}/hour)
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Training Cost</span>
                  <span className="font-mono">${costs.training.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Energy Cost</span>
                  <span className="font-mono">${costs.energy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Inference Cost</span>
                  <span className="font-mono">${costs.inference.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hosting Cost</span>
                  <span className="font-mono">${costs.hosting.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Cost</span>
                  <span className="font-mono text-green-600">${costs.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>VRAM Required:</span>
                  <span>{modelSpecs[model as keyof typeof modelSpecs].vram}GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens/Second:</span>
                  <span>{modelSpecs[model as keyof typeof modelSpecs].tokensPerSec}</span>
                </div>
                <div className="flex justify-between">
                  <span>GPU Power:</span>
                  <span>{gpuSpecs[gpuType as keyof typeof gpuSpecs].power}W</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SLMCostCalculator;
