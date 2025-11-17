'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExeatApplicationForm from '@/components/ExeatApplicationForm';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

export default function ApplyExeatPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/student/exeats');
    };

    return (
        <div className="py-8 px-4">
            {/* Header */}
            <motion.div
                initial="initial"
                animate="animate"
                variants={fadeIn}
                className="flex items-center gap-4 mb-6"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Apply for Exeat</h1>
                    <p className="text-muted-foreground">Submit a new exeat request</p>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {/* Application Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Exeat Request Form
                            </CardTitle>
                            <CardDescription>Fill in all required fields</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ExeatApplicationForm onSuccess={handleSuccess} />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}