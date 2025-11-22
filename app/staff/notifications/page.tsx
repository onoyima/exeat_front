'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useGetStaffNotificationsQuery, useGetStaffUnreadCountQuery, useMarkStaffNotificationReadMutation, useMarkAllStaffNotificationsReadMutation } from '@/lib/services/staffApi';


export default function StaffNotificationsPage() {
  const [filter, setFilter] = useState<'unread' | 'read'>('unread');
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetStaffNotificationsQuery({ page, per_page: 20, read_status: filter });
  const { data: unreadCount, refetch: refetchUnread } = useGetStaffUnreadCountQuery();
  const [markRead] = useMarkStaffNotificationReadMutation();
  const [markAllRead] = useMarkAllStaffNotificationsReadMutation();

  const onMarkRead = async (id: number) => {
    try {
      await markRead(id).unwrap();
      refetch();
      refetchUnread();
    } catch (e) {
    }
  };

  const onMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      refetch();
      refetchUnread();
    } catch (e) {
    }
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? null;

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 h-full min-h-screen">
      <div className="mb-6 lg:mb-8 pt-4 lg:pt-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">Notifications</h1>
            <p className="text-sm text-slate-600">Unread: {unreadCount ?? 0}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
                    <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => { setFilter('unread'); setPage(1); }}>Unread</Button>
                    <Button variant={filter === 'read' ? 'default' : 'outline'} size="sm" onClick={() => { setFilter('read'); setPage(1); }}>Read</Button>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh</Button>
                    <Button variant="outline" size="sm" onClick={onMarkAllRead}>Mark All Read</Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {isLoading ? (
          <div className="space-y-3 lg:space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 lg:h-12 lg:w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 lg:h-8 w-16 lg:w-20" />
                      <Skeleton className="h-6 lg:h-8 w-16 lg:w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-3 lg:pb-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600 text-sm">
                    Showing {items.length} of {pagination?.total ?? items.length}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {items.map((n: any) => (
                    <li key={n.id} className="p-4 lg:p-5 flex items-start gap-3">
                      <div className="mt-0.5">
                        {n.priority === 'high' || n.priority === 'urgent' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Bell className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800">{n.title || 'Notification'}</p>
                          <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{n.message}</p>
                        {n?.exeat_request?.student && (
                          <p className="text-xs text-slate-500 mt-1">
                            {n.exeat_request.student.fname} {n.exeat_request.student.lname} — {n.exeat_request?.matric_no}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          {!n.is_read && (
                            <Button size="sm" onClick={() => onMarkRead(n.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Read
                            </Button>
                          )}
                          {n.action_url && (
                            <a href={n.action_url} className="text-xs text-primary underline">Open</a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-slate-500">Page {pagination?.current_page ?? page} of {pagination?.last_page ?? 1}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={(pagination?.current_page ?? 1) <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                <Button variant="outline" size="sm" disabled={(pagination?.current_page ?? 1) >= (pagination?.last_page ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-10 w-10 text-slate-400" />
              <p className="mt-2 text-slate-700">No notifications found.</p>
              <Button variant="outline" className="mt-3" onClick={() => refetch()}>Refresh</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}