
import { useState } from 'react';
import { Calculator, Bot, Factory, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AIRobotCalculator from '@/components/AIRobotCalculator';
import AIFactoryCalculator from '@/components/AIFactoryCalculator';
import AIManpowerCalculator from '@/components/AIManpowerCalculator';

const Index = () => {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  const calculators = [
    {
      id: 'robot',
      title: 'AI Robot Cost Calculator',
      description: 'Calculate costs for AI robots using NVIDIA Digital Twin and Isaac Sim stack',
      icon: Bot,
      gradient: 'from-blue-500 to-purple-600',
      component: AIRobotCalculator
    },
    {
      id: 'factory',
      title: 'AI Factory Cost Calculator',
      description: 'Estimate costs for AI data centers and GPU clusters',
      icon: Factory,
      gradient: 'from-green-500 to-teal-600',
      component: AIFactoryCalculator
    },
    {
      id: 'manpower',
      title: 'AI Manpower Cost Calculator',
      description: 'Calculate global manpower costs for AI teams and projects',
      icon: Users,
      gradient: 'from-orange-500 to-red-600',
      component: AIManpowerCalculator
    }
  ];

  if (activeCalculator) {
    const calculator = calculators.find(c => c.id === activeCalculator);
    if (calculator) {
      const Component = calculator.component;
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setActiveCalculator(null)}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{calculator.title}</h1>
              <p className="text-gray-600">{calculator.description}</p>
            </div>
            <Component />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Calculator className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Cost Compass
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive cost calculators for AI robots, data centers, and manpower. 
            Get accurate estimates for your AI projects with industry-leading benchmarks.
          </p>
        </div>

        {/* Calculator Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {calculators.map((calc) => {
            const IconComponent = calc.icon;
            return (
              <Card 
                key={calc.id} 
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                onClick={() => setActiveCalculator(calc.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${calc.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <CardHeader className="relative">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${calc.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {calc.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {calc.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={`w-full bg-gradient-to-r ${calc.gradient} hover:opacity-90 transition-opacity`}
                  >
                    Open Calculator
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AI Cost Compass?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Industry Benchmarks",
                description: "Based on 2024-2025 market data from leading companies"
              },
              {
                title: "Regional Pricing",
                description: "Accurate costs across USA, EU, Asia, and emerging markets"
              },
              {
                title: "Real-time Updates",
                description: "Dynamic calculations with instant cost breakdowns"
              },
              {
                title: "Export Results",
                description: "Download detailed reports for stakeholder presentations"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
