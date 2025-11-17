'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode
} from 'lucide-react';

interface ExeatApplication {
  id: string;
  category: string;
  reason: string;
  location: string;
  departureDate: string;
  returnDate: string;
  status: string;
  submittedAt: string;
  approvals: any;
  rejectionReason?: string;
  qrCode?: string;
}

interface ExeatHistoryProps {
  applications: ExeatApplication[];
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'cmd-review': 'bg-blue-100 text-blue-800 border-blue-300',
  'deputy-review': 'bg-purple-100 text-purple-800 border-purple-300',
  'parent-consent': 'bg-orange-100 text-orange-800 border-orange-300',
  'dean-review': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'hostel-approval': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300'
};

const statusIcons = {
  approved: CheckCircle2,
  rejected: XCircle,
  default: Clock
};

export default function ExeatHistory({ applications }: ExeatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<ExeatApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || app.category.toLowerCase() === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const viewDetails = (application: ExeatApplication) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons] || statusIcons.default;
    return IconComponent;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Exeat History
          </CardTitle>
          <CardDescription>View and manage all your exeat applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="dean-review">Dean/Deputy Dean Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="sleepover">Sleepover</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredApplications.map((app) => {
                const StatusIcon = getStatusIcon(app.status);
                return (
                  <div key={app.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`w-5 h-5 ${app.status === 'approved' ? 'text-green-600' :
                                app.status === 'rejected' ? 'text-red-600' :
                                  'text-yellow-600'
                              }`} />
                            <span className="text-sm text-gray-600 font-mono">#{app.id}</span>
                            <Badge variant="outline" className="font-semibold">
                              {app.category}
                            </Badge>
                          </div>
                          <Badge className={`font-medium ${statusColors[app.status as keyof typeof statusColors]}`}>
                            {app.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{app.reason}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {app.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(app.departureDate).toLocaleDateString()} - {new Date(app.returnDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Rejection Reason */}
                        {app.status === 'rejected' && app.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700 mt-1">{app.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDetails(app)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>

                        {app.status === 'approved' && app.qrCode && (
                          <>
                            <Button size="sm" className="bg-university-primary hover:bg-university-secondary">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline">
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination could be added here for large datasets */}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Application Details - #{selectedApplication.id}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge className={`mt-1 ${statusColors[selectedApplication.status as keyof typeof statusColors]}`}>
                    {selectedApplication.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="font-semibold">{selectedApplication.category}</p>
                </div>
              </div>

              {/* Reason and Location */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Reason</label>
                  <p className="mt-1 text-gray-900">{selectedApplication.reason}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Destination</label>
                  <p className="mt-1 text-gray-900">{selectedApplication.location}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Departure Date</label>
                  <p className="mt-1 font-semibold">{new Date(selectedApplication.departureDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Return Date</label>
                  <p className="mt-1 font-semibold">{new Date(selectedApplication.returnDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Approval Timeline */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Approval Timeline</label>
                <div className="space-y-3">
                  {Object.entries(selectedApplication.approvals).map(([key, approval]: [string, any]) => (
                    <div key={key} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                        <p className="text-sm text-green-700">Approved on {new Date(approval.date).toLocaleString()}</p>
                        {approval.comment && (
                          <p className="text-sm text-green-600 mt-1">"{approval.comment}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedApplication.status === 'approved' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button className="bg-university-primary hover:bg-university-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Download Permit
                  </Button>
                  <Button variant="outline">
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}