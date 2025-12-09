"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Search, 
    LogOut, 
    LogIn, 
    X, 
    ArrowRight, 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    MapPin, 
    UserCheck, 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
    Plus 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { staffApi } from '@/lib/services/staffApi';
 

interface Student {
    id: number;
    fname: string;
    lname: string;
    passport: string | null;
    matric_no: string;
}

interface ExeatRequest {
    id: number;
    student: Student;
    category: { id: number; name: string };
    destination: string;
    departure_date: string;
    return_date: string;
    updated_at: string;
    status: string;
    action_type: 'sign_out' | 'sign_in';
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export default function FastTrackGatePage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'sign_out' | 'sign_in'>('sign_out');
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ExeatRequest[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // List State
    const [listData, setListData] = useState<ExeatRequest[]>([]);
    const [listMeta, setListMeta] = useState<PaginationMeta | null>(null);
    const [listLoading, setListLoading] = useState(false);
    const [listPage, setListPage] = useState(1);
    const [filterDate, setFilterDate] = useState<string>(''); // YYYY-MM-DD

    // Queue State
    const [queue, setQueue] = useState<ExeatRequest[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const searchInputRef = useRef<HTMLInputElement>(null);

    const fetchList = useCallback(async () => {
        setListLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/staff/exeat-requests/fast-track/list?type=${activeTab}&page=${listPage}`;
            if (filterDate) url += `&date=${filterDate}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                setListData(data.data);
                setListMeta({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total,
                    per_page: data.per_page
                });
            }
        } catch (error) {
            console.error('Fetch list failed', error);
        } finally {
            setListLoading(false);
        }
    }, [activeTab, listPage, filterDate]);

    // Initial Fetch & Refresh on Tab/Page/Date change
    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const performSearch = useCallback(async (query: string) => {
        setIsSearching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/staff/exeat-requests/fast-track/search?search=${encodeURIComponent(query)}&type=${activeTab}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                const newResults = data.exeat_requests.filter((req: ExeatRequest) => 
                    !queue.some(qItem => qItem.id === req.id)
                );
                setSearchResults(newResults);
            }
        } catch (error) { console.error(error); } 
        finally { setIsSearching(false); }
    }, [activeTab, queue]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, performSearch]);

    const handleTabChange = (value: string) => {
        const mode = value as 'sign_out' | 'sign_in';
        if (queue.length > 0) {
            if (!confirm(`Switching modes will clear your current queue. Continue?`)) return;
        }
        setActiveTab(mode);
        setQueue([]);
        setSearchQuery('');
        setSearchResults([]);
        setListPage(1);
        setFilterDate('');
        setTimeout(() => searchInputRef.current?.focus(), 100);
    };

    const addToQueue = (request: ExeatRequest) => {
        if (queue.some(q => q.id === request.id)) return;
        setQueue(prev => [...prev, request]);
        setSearchQuery('');
        setSearchResults([]);
        searchInputRef.current?.focus();
    };

    const removeFromQueue = (id: number) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    };

    const processQueue = async () => {
        if (queue.length === 0) return;
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/staff/exeat-requests/fast-track/execute`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ request_ids: queue.map(r => r.id) })
            });

            const result = await response.json();
            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Successfully processed ${result.processed.length} students.`,
                    className: "bg-green-600 text-white"
                });
                setQueue([]);
                fetchList(); // Refresh the eligible list
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to process.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const getInitials = (fname: string, lname: string) => `${fname.charAt(0)}${lname.charAt(0)}`.toUpperCase();

    // Helper to check if item is in queue
    const isInQueue = (id: number) => queue.some(q => q.id === id);

    return (
        <div className="container mx-auto p-4 max-w-6xl flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Fast-Track Gate Control</h1>
                    <p className="text-muted-foreground">Rapidly sign students in or out in bulk.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 md:w-[400px] mb-6">
                    <TabsTrigger value="sign_out" className="h-full gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-800 data-[state=active]:border-red-200 border border-transparent">
                        <LogOut className="h-5 w-5" />
                        <span className="font-bold">SIGN OUT</span>
                    </TabsTrigger>
                    <TabsTrigger value="sign_in" className="h-full gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-200 border border-transparent">
                        <LogIn className="h-5 w-5" />
                        <span className="font-bold">SIGN IN</span>
                    </TabsTrigger>
                </TabsList>

                {/* Queue & Search Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* LEFT PANEL: Search */}
                    <Card className={`flex flex-col h-[400px] ${activeTab === 'sign_out' ? 'border-red-200 shadow-red-50' : 'border-green-200 shadow-green-50'}`}>
                        <CardHeader className="pb-3 flex-none">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Search className="h-5 w-5 text-muted-foreground" />
                                1. Scan / Search Student
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
                            <div className="relative flex-none">
                                <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">
                                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </div>
                                <Input
                                    ref={searchInputRef}
                                    className="pl-9 h-12 text-lg"
                                    placeholder="Type Matric No or Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchResults.length > 0) addToQueue(searchResults[0]);
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                                {searchQuery.length > 1 && searchResults.length === 0 && !isSearching && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No eligible students found.</p>
                                    </div>
                                )}
                                {searchResults.map((req) => (
                                    <div key={req.id} onClick={() => addToQueue(req)} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors group">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={req.student.passport ? `data:image/jpeg;base64,${req.student.passport}` : ''} />
                                            <AvatarFallback>{getInitials(req.student.fname, req.student.lname)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate text-sm">{req.student.fname} {req.student.lname}</h4>
                                            <p className="text-xs text-muted-foreground">{req.student.matric_no}</p>
                                        </div>
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT PANEL: Queue */}
                    <Card className="flex flex-col h-[400px] border-slate-200 bg-slate-50/50">
                        <CardHeader className="pb-3 border-b bg-white rounded-t-lg flex-none">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    2. Action Queue 
                                    {queue.length > 0 && <Badge variant="destructive">{queue.length}</Badge>}
                                </h3>
                                {queue.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => setQueue([])} className="h-8 text-xs">
                                        Clear All
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {queue.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                        <UserCheck className="h-10 w-10 mb-2" />
                                        <p className="text-sm">Queue is empty</p>
                                    </div>
                                ) : (
                                    queue.map((req, index) => (
                                        <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white shadow-sm animate-in slide-in-from-left-2 duration-300">
                                            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-500 text-xs font-mono">{index + 1}</div>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={req.student.passport ? `data:image/jpeg;base64,${req.student.passport}` : ''} />
                                                <AvatarFallback>{getInitials(req.student.fname, req.student.lname)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{req.student.fname} {req.student.lname}</h4>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromQueue(req.id)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 bg-white border-t mt-auto">
                                <Button 
                                    className={`w-full h-12 text-lg gap-2 shadow-sm ${activeTab === 'sign_out' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    disabled={queue.length === 0 || isProcessing}
                                    onClick={processQueue}
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : (activeTab === 'sign_out' ? <LogOut /> : <LogIn />)}
                                    Execute {queue.length > 0 && `(${queue.length})`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* BOTTOM: Eligible List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            Eligible Students List
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground hidden sm:inline">Filter by Date:</span>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input 
                                    type="date" 
                                    className="h-9 w-[150px] rounded-md border border-input bg-background px-3 pl-9 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={filterDate}
                                    onChange={(e) => {
                                        setFilterDate(e.target.value);
                                        setListPage(1);
                                    }}
                                />
                            </div>
                            {filterDate && (
                                <Button variant="ghost" size="sm" onClick={() => setFilterDate('')}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-md border bg-white">
                        <div className="p-4 overflow-x-auto">
                            {listLoading ? (
                                <div className="h-24 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : listData.length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                                    No students found for this criteria.
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                                            <th className="pb-3 pl-2">Student</th>
                                            <th className="pb-3">Matric No</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listData.map((req) => (
                                            <tr key={req.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                                <td className="py-3 pl-2 max-w-[200px]">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={req.student.passport ? `data:image/jpeg;base64,${req.student.passport}` : ''} />
                                                            <AvatarFallback>{getInitials(req.student.fname, req.student.lname)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium truncate">{req.student.fname} {req.student.lname}</div>
                                                            <div className="text-xs text-muted-foreground">{req.destination}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 font-mono text-xs">{req.student.matric_no}</td>
                                                <td className="py-3">
                                                    <Badge variant="outline" className={activeTab === 'sign_out' ? 'text-red-600 border-red-200 bg-red-50' : 'text-green-600 border-green-200 bg-green-50'}>
                                                        {activeTab === 'sign_out' ? 'Ready to Leave' : 'Ready to Return'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right pr-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant={isInQueue(req.id) ? "secondary" : "outline"}
                                                        className="h-8 text-xs gap-1"
                                                        onClick={() => isInQueue(req.id) ? removeFromQueue(req.id) : addToQueue(req)}
                                                        disabled={queue.length >= 10 && !isInQueue(req.id)}
                                                    >
                                                        {isInQueue(req.id) ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Plus className="h-3 w-3" />}
                                                        {isInQueue(req.id) ? 'In Queue' : 'Add'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t p-4 text-xs text-muted-foreground">
                            <div>
                                Showing {(listPage - 1) * 10 + 1} to {Math.min(listPage * 10, listMeta?.total || 0)} of {listMeta?.total || 0}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0" 
                                    disabled={listPage === 1 || listLoading}
                                    onClick={() => setListPage(p => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="mx-2">Page {listPage}</span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0" 
                                    disabled={!listMeta || listPage >= listMeta.last_page || listLoading}
                                    onClick={() => setListPage(p => p + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}