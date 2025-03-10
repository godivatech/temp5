
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export const RecentActivity: React.FC = () => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <p className="text-sm text-gray-600">New customer added: ABC Corp</p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
            <p className="text-sm text-gray-600">Quotation #123 created</p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
            <p className="text-sm text-gray-600">Payment received from XYZ Ltd</p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
            <p className="text-sm text-gray-600">New product added: 5kW Inverter</p>
          </div>
          <Button variant="outline" className="w-full mt-2" size="sm">
            View All Activity
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
