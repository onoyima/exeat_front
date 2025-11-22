'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useStaff } from '@/hooks/use-staff';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Search } from 'lucide-react';
import { useGetGateEventsQuery } from '@/lib/services/staffApi';

export default function GateEventsPage() {
  const { assignedHostels } = useStaff();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<'all' | 'in' | 'out'>('all');
  const [sortBy, setSortBy] = useState<string>('security_signouts.signout_time');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, refetch } = useGetGateEventsQuery({ page, per_page: perPage, checked, search, sort_by: sortBy, order });

  const onDownload = () => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://attendance.veritas.edu.ng'}/api/staff/gate-events/export`);
    url.searchParams.set('checked', checked);
    if (search) url.searchParams.set('search', search);
    window.open(url.toString(), '_blank');
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { current_page: 1, last_page: 1, total: 0, per_page: perPage };

  const columns = useMemo(() => ([
    { key: 'matric_no', label: 'Matriculation Number' },
    { key: 'student_name', label: 'Name of Student' },
    { key: 'signin_time', label: 'Checked In' },
    { key: 'signout_time', label: 'Checked Out' },
    { key: 'departure_date', label: 'Departure Date' },
    { key: 'return_date', label: 'Returning Date' },
    { key: 'actual_returned_date', label: 'Actual Returned Date' },
  ]), []);

  const rows = items.map((r: any) => ({
    matric_no: r.matric_no,
    student_name: `${r.fname ?? ''} ${r.lname ?? ''}`.trim(),
    signin_time: r.signin_time ? new Date(r.signin_time).toLocaleString() : '-',
    signout_time: r.signout_time ? new Date(r.signout_time).toLocaleString() : '-',
    departure_date: r.departure_date ? new Date(r.departure_date).toLocaleDateString() : '-',
    return_date: r.return_date ? new Date(r.return_date).toLocaleDateString() : '-',
    actual_returned_date: r.signin_time ? new Date(r.signin_time).toLocaleDateString() : '-',
  }));

  const onSortChange = (key: string) => {
    let dbKey = key;
    switch (key) {
      case 'matric_no': dbKey = 'exeat_requests.matric_no'; break;
      case 'student_name': dbKey = 'students.fname'; break;
      case 'signin_time': dbKey = 'security_signouts.signin_time'; break;
      case 'signout_time': dbKey = 'security_signouts.signout_time'; break;
      case 'departure_date': dbKey = 'exeat_requests.departure_date'; break;
      case 'return_date': dbKey = 'exeat_requests.return_date'; break;
      default: dbKey = 'security_signouts.signout_time';
    }
    if (sortBy === dbKey) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(dbKey);
      setOrder('asc');
    }
    refetch();
  };

  return (
    <ProtectedRoute requiredRole="hostel_admin">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 h-full min-h-screen">
        <div className="mb-6 lg:mb-8 pt-4 lg:pt-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
            <div className="space-y-2 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">Gate Events</h1>
              <p className="text-sm text-slate-600">Hostel admin view for gate sign-in/out</p>
              {assignedHostels && assignedHostels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {assignedHostels.map((h: string, i: number) => (
                    <Badge key={i} variant="secondary">{h}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search by matric/name" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
              <Button variant={checked === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setChecked('all')}>All</Button>
              <Button variant={checked === 'out' ? 'default' : 'outline'} size="sm" onClick={() => setChecked('out')}>Checked Out</Button>
              <Button variant={checked === 'in' ? 'default' : 'outline'} size="sm" onClick={() => setChecked('in')}>Checked In</Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}><Search className="h-4 w-4 mr-1" />Search</Button>
              <Button variant="outline" size="sm" onClick={onDownload}><Download className="h-4 w-4 mr-1" />Download CSV</Button>
            </div>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="pb-3 lg:pb-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-slate-600 text-sm">
                Showing {items.length} of {pagination?.total ?? items.length}
              </CardDescription>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Per page</label>
                <Input type="number" value={perPage} min={5} max={50} className="w-20" onChange={(e) => setPerPage(Math.max(5, Math.min(50, Number(e.target.value) || 20)))} />
                <Button variant="outline" size="sm" onClick={() => { setPage(1); refetch(); }}>Apply</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      {columns.map((c) => (
                        <th key={c.key} className="px-4 py-2 text-left font-medium text-slate-700 cursor-pointer" onClick={() => onSortChange(c.key)}>
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {columns.map((c) => (
                          <td key={c.key} className="px-4 py-2 text-slate-800">{(row as any)[c.key]}</td>
                        ))}
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-slate-500" colSpan={columns.length}>No records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-slate-500">Page {pagination?.current_page ?? page} of {pagination?.last_page ?? 1}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={(pagination?.current_page ?? 1) <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <Button variant="outline" size="sm" disabled={(pagination?.current_page ?? 1) >= (pagination?.last_page ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}