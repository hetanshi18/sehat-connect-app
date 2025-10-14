import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockHealthTrends } from '@/lib/mockData';

const Trends = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Health Trends">
      <div className="max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6">
          {/* Consultations Trend */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Consultation Trend</CardTitle>
              <CardDescription>Number of consultations over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockHealthTrends.consultations}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Symptoms Distribution */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Common Symptoms</CardTitle>
              <CardDescription>Frequency of symptoms reported</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockHealthTrends.symptoms}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--secondary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Total Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {mockHealthTrends.consultations.reduce((sum, item) => sum + item.count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Last 6 months</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Most Common Symptom</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-secondary">
                  {mockHealthTrends.symptoms.reduce((max, item) => item.count > max.count ? item : max).name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {mockHealthTrends.symptoms.reduce((max, item) => item.count > max.count ? item : max).count} occurrences
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Average per Month</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">
                  {(mockHealthTrends.consultations.reduce((sum, item) => sum + item.count, 0) / mockHealthTrends.consultations.length).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Consultations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trends;
