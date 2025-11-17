'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6 p-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center">
                            <Settings className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl text-blue-900">
                                System Settings
                            </CardTitle>
                            <CardDescription className="text-lg text-blue-700">
                                Configure system-wide settings and preferences
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Coming Soon</CardTitle>
                    <CardDescription>
                        System configuration features are under development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-lg font-medium">System Settings</p>
                        <p className="text-sm">This feature is currently in development</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}





