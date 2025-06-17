
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bot, Download } from 'lucide-react';

const AIRobotCalculator = () => {
  const [formData, setFormData] = useState({
    teamSize: 5,
    jetsonModel: 'orin-nx',
    lidarType: 'ouster-os1',
    cameraCount: 2,
    actuatorCount: 6,
    trainingHours: 100,
    prototypes: 2,
    awsRegion: 'us-east',
    powerCost: 0.15
  });

  const [results, setResults] = useState<any>(null);

  const jetsonPrices = {
    'orin-nx': 399,
    'orin-agx': 1999
  };

  const lidarPrices = {
    'ouster-os1': 5000,
    'velodyne-vlp16': 4000
  };

  const awsRates = {
    'us-east': 2.50,
    'us-west': 2.75,
    'eu-west': 3.20
  };

  const calculateCosts = () => {
    const licensing = formData.teamSize * 2000; // Omniverse per user
    const jetsonCost = jetsonPrices[formData.jetsonModel as keyof typeof jetsonPrices];
    const lidarCost = lidarPrices[formData.lidarType as keyof typeof lidarPrices];
    const cameraCost = formData.cameraCount * 350;
    const actuatorCost = formData.actuatorCount * 200;
    const microcontrollerCost = 40;
    
    const hardwareTotal = jetsonCost + lidarCost + cameraCost + actuatorCost + microcontrollerCost;
    
    const awsRate = awsRates[formData.awsRegion as keyof typeof awsRates];
    const trainingCost = formData.trainingHours * awsRate;
    
    const prototypingCost = formData.prototypes * 1500;
    const chassisCost = 20000;
    
    const annualPowerCost = 365 * 24 * 0.1 * formData.powerCost; // 100W average
    
    const totalCost = licensing + hardwareTotal + trainingCost + prototypingCost + chassisCost + annualPowerCost;

    setResults({
      licensing,
      hardware: {
        jetson: jetsonCost,
        lidar: lidarCost,
        cameras: cameraCost,
        actuators: actuatorCost,
        microcontroller: microcontrollerCost,
        total: hardwareTotal
      },
      training: trainingCost,
      prototyping: prototypingCost,
      chassis: chassisCost,
      annualPower: annualPowerCost,
      total: totalCost
    });
  };

  const exportResults = () => {
    if (!results) return;
    
    const report = `
AI Robot Cost Analysis Report
=============================

Project Configuration:
- Team Size: ${formData.teamSize} developers
- Jetson Model: ${formData.jetsonModel.toUpperCase()}
- LiDAR: ${formData.lidarType}
- Cameras: ${formData.cameraCount}
- Training Hours: ${formData.trainingHours}

Cost Breakdown:
- Licensing (Omniverse): $${results.licensing.toLocaleString()}
- Hardware Total: $${results.hardware.total.toLocaleString()}
  - Jetson: $${results.hardware.jetson.toLocaleString()}
  - LiDAR: $${results.hardware.lidar.toLocaleString()}
  - Cameras: $${results.hardware.cameras.toLocaleString()}
  - Actuators: $${results.hardware.actuators.toLocaleString()}
- Training (AWS): $${results.training.toLocaleString()}
- Prototyping: $${results.prototyping.toLocaleString()}
- Chassis: $${results.chassis.toLocaleString()}
- Annual Power: $${results.annualPower.toLocaleString()}

TOTAL PROJECT COST: $${results.total.toLocaleString()}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-robot-cost-analysis.txt';
    a.click();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Robot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                value={formData.teamSize}
                onChange={(e) => setFormData({...formData, teamSize: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="prototypes">Prototypes</Label>
              <Input
                id="prototypes"
                type="number"
                value={formData.prototypes}
                onChange={(e) => setFormData({...formData, prototypes: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <Label>Jetson Model</Label>
            <Select value={formData.jetsonModel} onValueChange={(value) => setFormData({...formData, jetsonModel: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orin-nx">Jetson Orin NX (8GB) - $399</SelectItem>
                <SelectItem value="orin-agx">Jetson Orin AGX (32GB) - $1,999</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>LiDAR Sensor</Label>
            <Select value={formData.lidarType} onValueChange={(value) => setFormData({...formData, lidarType: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ouster-os1">Ouster OS1-64 - $5,000</SelectItem>
                <SelectItem value="velodyne-vlp16">Velodyne VLP-16 - $4,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cameraCount">RGB-D Cameras</Label>
              <Input
                id="cameraCount"
                type="number"
                value={formData.cameraCount}
                onChange={(e) => setFormData({...formData, cameraCount: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="actuatorCount">Servo Motors</Label>
              <Input
                id="actuatorCount"
                type="number"
                value={formData.actuatorCount}
                onChange={(e) => setFormData({...formData, actuatorCount: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="trainingHours">Training Hours (AWS)</Label>
            <Input
              id="trainingHours"
              type="number"
              value={formData.trainingHours}
              onChange={(e) => setFormData({...formData, trainingHours: parseInt(e.target.value) || 0})}
            />
          </div>

          <div>
            <Label>AWS Region</Label>
            <Select value={formData.awsRegion} onValueChange={(value) => setFormData({...formData, awsRegion: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us-east">US East - $2.50/hr</SelectItem>
                <SelectItem value="us-west">US West - $2.75/hr</SelectItem>
                <SelectItem value="eu-west">EU West - $3.20/hr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="powerCost">Power Cost ($/kWh)</Label>
            <Input
              id="powerCost"
              type="number"
              step="0.01"
              value={formData.powerCost}
              onChange={(e) => setFormData({...formData, powerCost: parseFloat(e.target.value) || 0})}
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
                <p className="font-medium">NVIDIA Licensing</p>
                <p className="text-2xl font-bold text-blue-600">${results.licensing.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium">Hardware Total</p>
                <p className="text-2xl font-bold text-green-600">${results.hardware.total.toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Hardware Breakdown:</h4>
              <div className="grid grid-cols-2 gap-2 pl-4">
                <span>Jetson Module:</span>
                <span>${results.hardware.jetson.toLocaleString()}</span>
                <span>LiDAR Sensor:</span>
                <span>${results.hardware.lidar.toLocaleString()}</span>
                <span>Cameras:</span>
                <span>${results.hardware.cameras.toLocaleString()}</span>
                <span>Actuators:</span>
                <span>${results.hardware.actuators.toLocaleString()}</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span>Training Cost:</span>
                <span className="font-medium">${results.training.toLocaleString()}</span>
              </div>
              <div>
                <span>Prototyping:</span>
                <span className="font-medium">${results.prototyping.toLocaleString()}</span>
              </div>
              <div>
                <span>Chassis:</span>
                <span className="font-medium">${results.chassis.toLocaleString()}</span>
              </div>
              <div>
                <span>Annual Power:</span>
                <span className="font-medium">${results.annualPower.toLocaleString()}</span>
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

export default AIRobotCalculator;
