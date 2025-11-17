import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface AuthCardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    isLoading?: boolean;
}

export function AuthCard({
    title = "Veritas University",
    description = "Digital Exeat System",
    children,
    isLoading
}: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/90 backdrop-blur-md">
                <CardHeader className="text-center space-y-4 pb-8">
                    {/* University Logo */}
                    <motion.div
                        className="mx-auto w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-4 p-4"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <Image
                            src="/logo.svg"
                            alt="Veritas University Logo"
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <CardTitle className="text-2xl font-bold bg-clip-text text-university-primary">
                            {title}
                        </CardTitle>
                        {!isLoading && (
                            <CardDescription className="text-lg font-medium text-university-primary/60 mt-2">
                                {description}
                            </CardDescription>
                        )}
                        {isLoading && (
                            <CardDescription className="text-gray-600">
                                Checking authentication...
                            </CardDescription>
                        )}
                    </motion.div>
                </CardHeader>
                <CardContent
                    className={`${isLoading ? "flex items-center justify-center py-8" : "space-y-6"} transition-all duration-300`}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}