import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGetCategoriesQuery } from '@/lib/services/exeatApi';
import {
    Filter,
    Search,
    Calendar,
    User,
    MapPin,
    Clock
} from 'lucide-react';

interface ExeatRequestFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    dateFilter: string;
    setDateFilter: (date: string) => void;
    categoryFilter: string;
    setCategoryFilter: (category: string) => void;
    onClearFilters: () => void;
}

export const ExeatRequestFilters: React.FC<ExeatRequestFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    categoryFilter,
    setCategoryFilter,
    onClearFilters,
}) => {
    const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || categoryFilter !== 'all';
    const { data: categoriesData } = useGetCategoriesQuery();
    const categories = useMemo(() => categoriesData?.categories || [], [categoriesData]);

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Filter className="h-5 w-5" />
                    Filters & Search
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, matric no, destination..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Approval Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="pending">⏳ Pending Review</SelectItem>
                                <SelectItem value="medical">🏥 Medical Review</SelectItem>
                                <SelectItem value="dean">🎓 Dean/Deputy Dean Review</SelectItem>
                                <SelectItem value="approved">✅ Approved & Ready</SelectItem>
                                <SelectItem value="active">📍 Student Away</SelectItem>
                                <SelectItem value="rejected">❌ Not Approved</SelectItem>
                                <SelectItem value="completed">🎉 Request Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Leave Type</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All leave types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All leave types</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.name.toLowerCase()}>
                                        {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Request Date</label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All time periods" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All time periods</SelectItem>
                                <SelectItem value="today">📅 Today</SelectItem>
                                <SelectItem value="week">📊 This Week</SelectItem>
                                <SelectItem value="month">📈 This Month</SelectItem>
                                <SelectItem value="quarter">📉 This Quarter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">🔍 Active Filters:</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs">
                                        <Search className="h-3 w-3" />
                                        "{searchTerm}"
                                    </Badge>
                                )}
                                {statusFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 text-xs">
                                        <Clock className="h-3 w-3" />
                                        {statusFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                )}
                                {categoryFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 text-xs">
                                        <MapPin className="h-3 w-3" />
                                        {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Leave
                                    </Badge>
                                )}
                                {dateFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        {dateFilter === 'today' ? 'Today' :
                                            dateFilter === 'week' ? 'This Week' :
                                                dateFilter === 'month' ? 'This Month' :
                                                    dateFilter === 'quarter' ? 'This Quarter' : dateFilter}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                className="border-slate-300 hover:bg-slate-100 self-start sm:self-auto"
                            >
                                ✕ Clear All
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
