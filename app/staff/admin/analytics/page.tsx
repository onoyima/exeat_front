'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
    return (
        <div className="space-y-6 p-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center">
                            <BarChart3 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl text-blue-900">
                                Analytics Dashboard
                            </CardTitle>
                            <CardDescription className="text-lg text-blue-700">
                                Comprehensive reports and insights for system administration
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Coming Soon</CardTitle>
                    <CardDescription>
                        Analytics and reporting features are under development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-lg font-medium">Analytics Dashboard</p>
                        <p className="text-sm">This feature is currently in development</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}





