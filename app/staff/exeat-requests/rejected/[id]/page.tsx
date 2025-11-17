'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    UserIcon,
    FileText,
    UserCheck,
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    XCircle,
    AlertTriangle,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetRejectedExeatRequestDetailsQuery } from '@/lib/services/staffApi';
import type { StaffExeatRequest } from '@/lib/services/staffApi';

export default function RejectedExeatRequestDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const exeatId = parseInt(params.id as string);

    // Fetch the rejected exeat request data
    const { data: response, isLoading: isLoadingRequest, error } = useGetRejectedExeatRequestDetailsQuery(exeatId, {
        skip: !exeatId || isNaN(exeatId),
    });

    const request = response?.exeat_request;

    // Extract error message from API response
    const getErrorMessage = (error: any) => {
        if (!error) return null;

        console.log('API Error:', error); // Debug logging

        // Check for permission error in the response data
        if (error?.data?.message) return error.data.message;
        if (error?.message) return error.message;
        if (error?.error) return error.error;
        if (typeof error === 'string') return error;

        return 'An unexpected error occurred while loading the request.';
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <ProtectedRoute requiredRole="staff">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
                {/* Header with Navigation Skeleton */}
                <div className="mb-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-9 w-64" />
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            </div>
                        </div>
                        <Skeleton className="h-5 w-96" />
                    </div>
                </div>

                {/* Request Summary Skeleton */}
                <div className="mb-6">
                    <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Information Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-40" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="space-y-1">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-5 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Details Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-36" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-5 w-28" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6">
                        {/* Student Photo Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-center">
                                    <Skeleton className="h-6 w-28 mx-auto" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Skeleton className="h-48 w-48 rounded-full" />
                            </CardContent>
                        </Card>

                        {/* Request Metadata Skeleton */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    <Skeleton className="h-6 w-32" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );

    if (isLoadingRequest) {
        return <LoadingSkeleton />;
    }

    if (error || !request) {
        const errorMessage = getErrorMessage(error);

        return (
            <ProtectedRoute requiredRole="staff">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                                <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold text-slate-800">
                                    {error ? 'Access Denied' : 'Request Not Found'}
                                </h2>
                                <p className="text-slate-600 max-w-md">
                                    {errorMessage || 'Unable to load the rejected exeat request details.'}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="mt-4 hover:bg-slate-100 transition-colors"
                                onClick={() => router.push('/staff/rejected')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Rejected Requests
                            </Button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const duration = Math.ceil(
        (new Date(request.return_date).getTime() - new Date(request.departure_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const getCategoryIcon = (request: StaffExeatRequest) => {
        if (request.is_medical || request.category_id === 1) return '🏥';
        if (request.category_id === 2 || request.category?.name === 'casual') return '🌴';
        if (request.category_id === 3) return '🚨';
        if (request.category_id === 4) return '💼';
        return '📋';
    };

    const getCategoryName = (request: StaffExeatRequest) => {
        if (request.is_medical || request.category_id === 1) return 'Medical';
        if (request.category_id === 2 || request.category?.name === 'casual') return 'Casual';
        if (request.category_id === 3) return 'Emergency';
        if (request.category_id === 4) return 'Official';
        return request.category?.name || 'General';
    };

    const getInitials = (fname: string, lname: string) => `${(fname || '').charAt(0)}${(lname || '').charAt(0)}`.toUpperCase();

    return (
        <ProtectedRoute requiredRole="staff">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
                {/* Header with Navigation */}
                <div className="mb-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/staff/rejected')}
                                className="border-slate-300 hover:bg-slate-100 transition-all duration-200 hover:scale-105"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Rejected Requests
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">
                                {getCategoryIcon(request)}
                            </span>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">
                                    Rejected Exeat Request
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                                        {request.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-sm">
                                        {getCategoryName(request)}
                                    </Badge>
                                    {request.is_expired && (
                                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                            Expired
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-600 mt-2">
                            View details for rejected exeat request from {request.student.fname} {request.student.lname}
                        </p>
                    </div>
                </div>

                {/* Request Summary - Quick Overview */}
                <div className="mb-6">
                    <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Reason & Destination */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Reason</Label>
                                    <p className="text-slate-800 font-medium text-lg">{request.reason}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Destination</Label>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <p className="text-slate-800 font-medium text-lg">{request.destination}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Duration</Label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <p className="text-slate-800 font-medium text-lg">{duration} day{duration !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Dates</Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <p className="text-slate-800 font-medium text-sm">
                                            {format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Information */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <UserIcon className="h-5 w-5 text-blue-600" />
                                    Student Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Full Name</Label>
                                        <p className="text-slate-800 font-medium">{request.student.fname} {request.student.lname}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Matric Number</Label>
                                        <p className="text-slate-800 font-mono font-medium">{request.matric_no}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Student ID</Label>
                                        <p className="text-slate-800 font-medium">{request.student_id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Email</Label>
                                        <p className="text-slate-800">{request.student.email || 'Not provided'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Accommodation</Label>
                                        <p className="text-slate-800">{request.student_accommodation || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Details */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Request Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Reason</Label>
                                        <p className="text-slate-800 font-medium">{request.reason}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Destination</Label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800 font-medium">{request.destination}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Departure Date</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800 font-medium">{format(new Date(request.departure_date), 'PPP')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Return Date</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800 font-medium">{format(new Date(request.return_date), 'PPP')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Duration</Label>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800 font-medium">{duration} day{duration !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Preferred Parent Contact Method</Label>
                                        <p className="text-slate-800">{request.preferred_mode_of_contact}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parent Information */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <UserCheck className="h-5 w-5 text-blue-600" />
                                    Parent/Guardian Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Parent Name</Label>
                                        <p className="text-slate-800 font-medium">{request.parent_surname} {request.parent_othernames}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Primary Phone</Label>
                                        <p className="text-slate-800 font-medium">{request.parent_phone_no}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Secondary Phone</Label>
                                        <p className="text-slate-800">{request.parent_phone_no_two || 'Not provided'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Email</Label>
                                        <p className="text-slate-800">{request.parent_email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Student Photo */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="text-center text-slate-800">Student Photo</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <div className="relative group">
                                    <Avatar className="size-48 border-4 border-slate-200 group-hover:border-red-300 transition-all duration-300">
                                        <AvatarImage
                                            src={request.student.passport ? `data:image/jpeg;base64,${request.student.passport}` : ''}
                                            alt={`${request.student.fname} ${request.student.lname}`}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-red-100 to-orange-100 text-red-600 text-4xl font-bold">
                                            {getInitials(request.student.fname, request.student.lname)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-red-200/50 transition-all duration-300"></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Metadata */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg text-slate-800">Request Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm text-slate-600">Created:</span>
                                        <span className="text-sm text-slate-800 font-medium">{format(new Date(request.created_at), 'PPp')}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                        <span className="text-sm text-red-700">Rejected:</span>
                                        <span className="text-sm text-red-800 font-medium">
                                            {format(new Date(request.updated_at), 'PPp')}
                                        </span>
                                    </div>
                                    {request.is_expired && (
                                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                                            <span className="text-sm text-orange-700">Expired:</span>
                                            <span className="text-sm text-orange-800 font-medium">
                                                {request.expired_at ? format(new Date(request.expired_at), 'PPp') : 'Unknown'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rejection Status */}
                        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-center gap-3">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-red-800">Request Rejected</h3>
                                        <p className="text-sm text-red-700 mt-1">
                                            This exeat request has been rejected
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
