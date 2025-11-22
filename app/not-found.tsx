'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    const router = useRouter();

    // Auto-redirect after 10 seconds
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push('/');
        }, 10000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                {/* Animated 404 Text */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <h1 className="text-9xl font-bold text-primary/20">404</h1>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <span className="text-4xl font-semibold text-primary">
                            Page Not Found
                        </span>
                    </motion.div>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <p className="text-muted-foreground">
                        Oops! It seems like you&apos;ve ventured into uncharted territory.
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                        You&apos;ll be automatically redirected to the homepage in a few seconds...
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                >
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Go Back</span>
                    </Button>

                    <Button
                        variant="default"
                        asChild
                        className="space-x-2"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4" />
                            <span>Return Home</span>
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}