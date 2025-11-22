"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, UserPlus, Trash2, Loader2, Users, Shield } from "lucide-react";
import {
  useGetStaffAssignmentsQuery,
  useAssignExeatRoleMutation,
  useUnassignExeatRoleMutation,
  useGetRolesQuery,
  useGetStaffListQuery,
} from '@/lib/services/adminApi';
import { useToast } from "@/hooks/use-toast";
import { extractRoleName } from "@/lib/utils/csrf";
import AssignExeatRoleSkeleton from "@/components/skeletons/assign-exeat-role-skeleton";

export default function AssignExeatRolePage() {
  // RTK Query hooks
  const {
    data: staffList,
    isLoading: staffListLoading,
    error: staffListError
  } = useGetStaffListQuery();

  const {
    data: staffAssignments,
    isLoading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments
  } = useGetStaffAssignmentsQuery();

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError
  } = useGetRolesQuery();

  const [assignRole, {
    isLoading: assigning,
    error: assignError,
    isSuccess: assignSuccess
  }] = useAssignExeatRoleMutation();

  const [unassignRole, {
    isLoading: unassigningRole,
    error: unassignError,
    isSuccess: unassignSuccess
  }] = useUnassignExeatRoleMutation();

  // Local state
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [roleToUnassign, setRoleToUnassign] = useState<{ staffEmail: string; roleName: string; staffName: string; staffId: number; roleId: number } | null>(null);

  // Toast hook
  const { toast } = useToast();

  // Combined loading state
  const loading = assignmentsLoading || rolesLoading || staffListLoading;

  // Combined error state
  const error = assignmentsError || rolesError || staffListError;

  // Helper function to get error message
  const getErrorMessage = (error: any) => {
    if (!error) return null;

    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (typeof error === 'string') return error;

    return 'An unexpected error occurred';
  };

  // Convert staff list to searchable options
  const staffOptions: SearchableSelectOption[] = useMemo(() => {
    if (!staffList) return [];
    return staffList.map(staff => ({
      value: String(staff.id),
      label: `${staff.fname}${staff.middle_name ? ' ' + staff.middle_name : ''} ${staff.lname}`,
      description: staff.email
    }));
  }, [staffList]);

  // Convert roles to searchable options
  const roleOptions: SearchableSelectOption[] = useMemo(() => {
    if (!roles) return [];
    return roles.map(role => ({
      value: String(role.id),
      label: role.display_name || role.name,
      description: role.description
    }));
  }, [roles]);

  // Keep original data for other uses
  const staffMembers = useMemo(() => {
    if (!staffList) return [];
    return staffList.map(staff => ({
      id: staff.id,
      fname: staff.fname,
      lname: staff.lname,
      middle_name: staff.middle_name,
      email: staff.email
    }));
  }, [staffList]);

  const exeatRoles = useMemo(() => {
    if (!roles) return [];
    return roles.map(role => ({
      id: role.id,
      name: role.name,
      display_name: role.display_name,
      description: role.description
    }));
  }, [roles]);

  // Handle assignment success
  useEffect(() => {
    if (assignSuccess) {
      setSelectedStaff("");
      setSelectedRole("");
      refetchAssignments();
      toast({
        title: "Role Assigned Successfully",
        description: "Role has been assigned to the staff member.",
        variant: "success",
      });
    }
  }, [assignSuccess, refetchAssignments, toast]);

  // Handle unassignment success
  useEffect(() => {
    if (unassignSuccess) {
      refetchAssignments();
      toast({
        title: "Role Removed Successfully",
        description: "Role has been removed from the staff member.",
        variant: "success",
      });
    }
  }, [unassignSuccess, refetchAssignments, toast]);

  async function handleAssignRole() {
    const staffId = Number(selectedStaff);
    const roleId = Number(selectedRole);

    try {
      await assignRole({
        staffId,
        exeatRoleId: roleId
      }).unwrap();
    } catch (error: any) {
      toast({
        title: "Assignment Failed",
        description: error?.data?.message || error?.message || "Failed to assign role.",
        variant: "destructive",
      });
    }
  }

  // Function to show confirmation dialog
  function handleUnassignClick(staffId: number, roleId: number, staffEmail: string, roleName: string, staffName: string) {

    // Check if roleId is valid
    let actualRoleId = roleId;
    if (!actualRoleId || actualRoleId === undefined || actualRoleId === null) {

      // Try to find role ID by name if the direct ID is not available
      const foundRole = exeatRoles.find((role: any) =>
        (role.display_name?.toLowerCase() === roleName?.toLowerCase()) ||
        (role.name?.toLowerCase() === roleName?.toLowerCase())
      );

      if (foundRole) {
        actualRoleId = foundRole.id;
      } else {
        console.error('Could not find role by name:', roleName);
        toast({
          title: "Error",
          description: "Could not find role. Please refresh the page and try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // Double-check we have a valid role ID
    if (!actualRoleId) {
      toast({
        title: "Error",
        description: "Invalid role ID. Cannot unassign role.",
        variant: "destructive",
      });
      return;
    }

    let actualStaffId = staffId;

    // If staffId is not valid, try to find it from the staff list using email
    if (!actualStaffId || actualStaffId === undefined || actualStaffId === null) {

      // Find staff member by email
      const foundStaff = staffMembers.find((staff: any) =>
        staff.email?.toLowerCase() === staffEmail?.toLowerCase()
      );

      if (foundStaff) {
        actualStaffId = foundStaff.id;
      } else {
        console.error('Could not find staff member with email:', staffEmail);
        toast({
          title: "Error",
          description: "Could not find staff member. Please refresh the page and try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // Double-check we have a valid staff ID
    if (!actualStaffId) {
      toast({
        title: "Error",
        description: "Invalid staff ID. Cannot unassign role.",
        variant: "destructive",
      });
      return;
    }

    setRoleToUnassign({ staffId: actualStaffId, roleId: actualRoleId, staffEmail, roleName, staffName });
    setConfirmDialogOpen(true);
  }

  // Function to handle actual unassignment after confirmation
  async function handleConfirmUnassign() {
    if (!roleToUnassign) return;

    const { staffId, roleId, staffName, roleName } = roleToUnassign;
    setConfirmDialogOpen(false);


    // Verify we have a valid staff ID (should be resolved by handleUnassignClick)
    if (!staffId) {
      toast({
        title: "Removal Failed",
        description: "Invalid staff ID. Please try again.",
        variant: "destructive",
      });
      setRoleToUnassign(null);
      return;
    }

    // Verify staff exists in our staff list
    const staffExists = staffMembers.some((staff: any) => staff.id === staffId);

    // Verify role exists in our roles list
    const roleExists = exeatRoles.some((role: any) => role.id === roleId);

    try {
      const result = await unassignRole({
        staffId,
        exeatRoleId: roleId
      }).unwrap();
    } catch (error: any) {
      toast({
        title: "Removal Failed",
        description: error?.data?.message || error?.message || "Failed to unassign role.",
        variant: "destructive",
      });
    } finally {
      setRoleToUnassign(null);
    }
  }

  if (loading) return (
    <AssignExeatRoleSkeleton />
  );

  if (error) return (
    <div className="container mx-auto p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{getErrorMessage(error)}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="w-full mx-auto p-4 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Assign and manage exeat roles for staff members
        </p>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Exeat Role
          </CardTitle>
          <CardDescription>
            Select a staff member and assign them an exeat role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Staff Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Staff Member</label>
              <SearchableSelect
                options={staffOptions}
                value={selectedStaff}
                onValueChange={setSelectedStaff}
                placeholder="Choose staff member"
                searchPlaceholder="Search staff by name or email..."
                emptyMessage="No staff members found"
                disabled={assigning}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Exeat Role</label>
              <SearchableSelect
                options={roleOptions}
                value={selectedRole}
                onValueChange={setSelectedRole}
                placeholder="Choose role"
                searchPlaceholder="Search roles..."
                emptyMessage="No roles found"
                disabled={assigning}
              />
            </div>

            {/* Assign Button */}
            <div className="flex items-end">
              <Button
                onClick={handleAssignRole}
                disabled={!selectedStaff || !selectedRole || assigning}
                className="w-full"
                size="lg"
              >
                {assigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Role
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {assignError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getErrorMessage(assignError)}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      {/* Assignment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assignment History
          </CardTitle>
          <CardDescription>
            View and manage current role assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignmentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : assignmentsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to Load Assignments</AlertTitle>
              <AlertDescription>{getErrorMessage(assignmentsError)}</AlertDescription>
            </Alert>
          ) : !staffAssignments || staffAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No assignments found</p>
              <p className="text-sm">Staff members will appear here once roles are assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {staffAssignments.map((item: any, idx: number) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.staff_name || item.staff_email}</p>
                        <p className="text-sm text-muted-foreground">{item.staff_email}</p>
                      </div>
                      <Badge variant="secondary">
                        {item.role_display_name || item.role_name}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Assigned: {item.assigned_at}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={unassigningRole}
                        onClick={() => handleUnassignClick(
                          item.staff_id,
                          item.exeat_role_id,
                          item.staff_email,
                          item.role_display_name || item.role_name,
                          item.staff_name || item.staff_email
                        )}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {unassigningRole ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffAssignments.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.staff_name || item.staff_email}</p>
                            <p className="text-sm text-muted-foreground">{item.staff_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {item.role_display_name || item.role_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.assigned_at}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={unassigningRole}
                            onClick={() => handleUnassignClick(
                              item.staff_id,
                              item.exeat_role_id,
                              item.staff_email,
                              item.role_display_name || item.role_name,
                              item.staff_name || item.staff_email
                            )}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {unassigningRole ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Available Exeat Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Available Exeat Roles
          </CardTitle>
          <CardDescription>
            Overview of all system roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exeatRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No roles available</p>
              <p className="text-sm">Roles will be displayed here once created</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {exeatRoles.map((role: any) => (
                  <Card key={role.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{extractRoleName(role)}</h4>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {extractRoleName(role)}
                        </Badge>
                      </div>
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exeatRoles.map((role: any) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <Badge variant="outline">{extractRoleName(role)}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {extractRoleName(role)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {role.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the <strong>&quot;{roleToUnassign?.roleName}&quot;</strong> role from{" "}
              <strong>{roleToUnassign?.staffName}</strong>?
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToUnassign(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnassign}
              className="bg-red-600 hover:bg-red-700"
              disabled={unassigningRole}
            >
              {unassigningRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Role
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}