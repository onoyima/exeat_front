"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from '@/components/ui/status-pill';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGetExeatRequestsQuery, useGetCategoriesQuery } from "@/lib/services/exeatApi";
import { useGetCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  Stethoscope,
  Palmtree,
  AlertCircle,
  Briefcase,
  Search,
  Calendar,
  MapPin,
  Phone,
  ArrowRight,
  Plus,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Users
} from "lucide-react";

// categories fetched dynamically

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "cmd_review", label: "CMD Review" },
  { value: "secretary_review", label: "Secretary Review" },
  { value: "parent_consent", label: "Parent Consent" },
  { value: "dean_review", label: "Dean/Deputy Dean Review" },
  { value: "hostel_signin", label: "Hostel Sign In" },
  { value: "hostel_signout", label: "Hostel Sign Out" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

export default function ExeatHistory() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useGetCurrentUser();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [displayCount, setDisplayCount] = useState(10);

  // Only fetch exeat requests when user is authenticated
  const { data: exeatData, isLoading, refetch } = useGetExeatRequestsQuery(undefined, {
    skip: !user || userLoading,
  });
  const exeatRequests = exeatData?.exeat_requests || [];
  const { data: categoriesData } = useGetCategoriesQuery();
  const apiCategories = categoriesData?.categories || [];
  const categoryNameById: Record<number, string> = Object.fromEntries(
    apiCategories.map((c) => [c.id, c.name.charAt(0).toUpperCase() + c.name.slice(1)])
  );
  const categoryIconById: Record<number, JSX.Element> = Object.fromEntries(
    apiCategories.map((c) => [
      c.id,
      c.name.toLowerCase() === 'medical' ? <Stethoscope className="h-4 w-4" /> :
        c.name.toLowerCase() === 'family' ? <Users className="h-4 w-4" /> :
          c.name.toLowerCase() === 'exigency' ? <AlertCircle className="h-4 w-4" /> :
            <Briefcase className="h-4 w-4" />
    ])
  );

  // Refetch data when user becomes available
  useEffect(() => {
    if (user && !userLoading) {
      refetch();
    }
  }, [user, userLoading, refetch]);

  // Filter exeat requests
  const filteredRequests = exeatRequests.filter((request) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      request.reason.toLowerCase().includes(searchTerm) ||
      request.destination.toLowerCase().includes(searchTerm) ||
      request.matric_no.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      request.category_id === Number(categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    } else {
      // Get status order based on workflow
      const getStatusOrder = (status: string) => {
        const order = [
          "pending",
          "cmd_review",
          "secretary_review",
          "parent_consent",
          "dean_review",
          "hostel_signin",
          "hostel_signout",
          "approved",
          "rejected",
        ];
        return order.indexOf(status);
      };

      const orderA = getStatusOrder(a.status);
      const orderB = getStatusOrder(b.status);
      return sortOrder === "desc" ? orderB - orderA : orderA - orderB;
    }
  });

  // Get displayed requests based on display count
  const displayedRequests = sortedRequests.slice(0, displayCount);
  const hasMoreRequests = displayedRequests.length < sortedRequests.length;

  // Handle view more
  const handleViewMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, sortedRequests.length));
  };

  // Reset display count when filters change
  const handleFilterChange = (newValue: string, filterType: 'search' | 'status' | 'category') => {
    if (filterType === 'search') {
      setSearch(newValue);
    } else if (filterType === 'status') {
      setStatusFilter(newValue);
    } else if (filterType === 'category') {
      setCategoryFilter(newValue);
    }
    setDisplayCount(10); // Reset to show first 10 results
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Exeat History</CardTitle>
          <CardDescription className="text-base">
            View and manage all your exeat requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile-First Filters and Sorting */}
          <div className="space-y-4">
            {/* Search and Filters - Mobile-First Layout */}
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reason, destination..."
                  value={search}
                  onChange={(e) => handleFilterChange(e.target.value, 'search')}
                  className="pl-9 h-12 touch-manipulation"
                />
              </div>

              {/* Filter Controls - Mobile-First Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => handleFilterChange(value, 'category')}
                >
                  <SelectTrigger className="h-12 touch-manipulation">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {apiCategories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(value) => handleFilterChange(value, 'status')}>
                  <SelectTrigger className="h-12 touch-manipulation">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as "date" | "status")
                  }
                >
                  <SelectTrigger className="h-12 touch-manipulation">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Created</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(value) =>
                    setSortOrder(value as "asc" | "desc")
                  }
                >
                  <SelectTrigger className="h-12 touch-manipulation">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Responsive Content - Mobile Cards, Desktop Table */}
          <div className="mt-6">
            {/* Results Counter */}
            <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
              <span>
                Showing {displayedRequests.length} of {sortedRequests.length} exeat requests
                {filteredRequests.length !== exeatRequests.length && (
                  <span className="ml-2">
                    (filtered from {exeatRequests.length} total)
                  </span>
                )}
              </span>
              {hasMoreRequests && (
                <span className="text-primary font-medium">
                  {sortedRequests.length - displayedRequests.length} more available
                </span>
              )}
            </div>

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="block lg:hidden space-y-4">
              {userLoading || isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : displayedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No exeat requests found</p>
                </div>
              ) : (
                <>
                  {displayedRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 touch-manipulation"
                      onClick={() => router.push(`/student/exeats/${request.id}`)}
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {request.category_id in categoryIconById ? categoryIconById[request.category_id] : <FileText className="h-4 w-4" />}
                            </span>
                            <StatusPill status={request.status} size="sm" />
                          </div>
                        </div>

                        {/* Reason */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {request.reason}
                        </p>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {request.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>
                              {format(new Date(request.departure_date), "MMM d")}{" "}
                              - {format(new Date(request.return_date), "MMM d")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="capitalize">
                              {request.preferred_mode_of_contact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* View More Button for Mobile */}
                  {hasMoreRequests && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={handleViewMore}
                        className="w-full max-w-xs"
                      >
                        View More ({sortedRequests.length - displayedRequests.length} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden lg:block">
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[180px] min-w-[180px]">Category</TableHead>
                        <TableHead className="min-w-[250px]">Reason</TableHead>
                        <TableHead className="min-w-[150px]">Destination</TableHead>
                        <TableHead className="min-w-[180px]">Dates</TableHead>
                        <TableHead className="min-w-[120px]">Contact</TableHead>
                        <TableHead className="min-w-[120px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userLoading || isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : displayedRequests.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No exeat requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedRequests.map((request) => (
                          <TableRow
                            key={request.id}
                            className="group cursor-pointer hover:bg-accent/50 touch-manipulation"
                            onClick={() =>
                              router.push(`/student/exeats/${request.id}`)
                            }
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-primary/5 group-hover:bg-primary/10">
                                  {request.category_id in categoryIconById ? categoryIconById[request.category_id] : <FileText className="h-4 w-4" />}
                                </div>
                                <span className="font-medium text-sm">
                                  {categoryNameById[request.category_id] || 'Unknown'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 max-w-[300px]">
                              <p className="truncate text-sm" title={request.reason}>
                                {request.reason}
                              </p>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                <span
                                  className="truncate max-w-[150px] text-sm"
                                  title={request.destination}
                                >
                                  {request.destination}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm">
                                  {format(
                                    new Date(request.departure_date),
                                    "MMM d"
                                  )}{" "}
                                  - {format(new Date(request.return_date), "MMM d")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="capitalize text-sm">
                                  {request.preferred_mode_of_contact}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <StatusPill status={request.status} size="sm" />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* View More Button for Desktop */}
                {hasMoreRequests && (
                  <div className="flex justify-center p-4 border-t bg-muted/30">
                    <Button
                      variant="outline"
                      onClick={handleViewMore}
                      className="px-8"
                    >
                      View More ({sortedRequests.length - displayedRequests.length} remaining)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
