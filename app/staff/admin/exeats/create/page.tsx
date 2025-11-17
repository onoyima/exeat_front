'use client';

import ExeatApplyForStudentForm from '@/components/staff/ExeatApplyForStudentForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AdminCreateExeatForStudentPage() {
    const router = useRouter();

    return (
        <div className="p-6 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Apply Exeat For Student</CardTitle>
                    <CardDescription>Submit an exeat request on behalf of a student.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExeatApplyForStudentForm onSuccess={() => router.push('/staff/admin/exeats')} />
                </CardContent>
            </Card>
        </div>
    );
}


