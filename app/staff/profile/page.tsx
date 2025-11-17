"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetProfileQuery } from "@/lib/services/authApi";
import { extractRoleName } from "@/lib/utils/csrf";
import { useGetCurrentUser } from "@/hooks/use-current-user";
import { User, Mail, Phone, Briefcase, Users } from "lucide-react";

export default function StaffProfilePage() {
  // RTK Query hooks
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError
  } = useGetProfileQuery();

  // Get current user for avatar
  const { user, avatarUrl } = useGetCurrentUser();

  if (profileLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
        <div className="pt-6">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Profile Card Skeleton */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </Card>

            {/* Info Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
        <div className="max-w-4xl mx-auto pt-6">
          <Alert variant="destructive">
            <AlertTitle>Error Loading Profile</AlertTitle>
            <AlertDescription>
              {(profileError as any)?.data?.message || (profileError as any)?.message || "Failed to load profile data"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!profileData?.profile) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
        <div className="max-w-4xl mx-auto pt-6">
          <Card className="p-8">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-muted-foreground">No Profile Data</h3>
              <p className="text-sm text-muted-foreground mt-2">Unable to load staff profile information.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const { personal, contacts, work_profiles } = profileData.profile;
  // Use user data for initials to match navbar pattern
  const initials = user ? `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase() : '';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen pt-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          My Profile
        </h1>
        <p className="text-base lg:text-lg text-muted-foreground mt-2">
          View your personal and work information
        </p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0">
              <Avatar className="size-20 border-2 border-primary">
                <AvatarImage
                  src={avatarUrl}
                  alt={user ? `${user.fname} ${user.lname}` : 'User avatar'}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                {personal.title} {personal.first_name} {personal.middle_name ? personal.middle_name + ' ' : ''}{personal.last_name}
              </h2>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{personal.contact?.email || 'No email provided'}</span>
                </div>

                {personal.contact?.phone && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{personal.contact.phone}</span>
                  </div>
                )}
              </div>

              {/* Assigned Roles */}
              {personal.exeat_roles && personal.exeat_roles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Assigned Roles:</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {personal.exeat_roles.map((role: any) => (
                      <Badge key={role.id} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {extractRoleName(role)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                <span className="text-sm text-foreground">
                  {personal.first_name} {personal.middle_name ? personal.middle_name + ' ' : ''}{personal.last_name}
                </span>
              </div>

              {personal.contact?.email && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <span className="text-sm text-foreground">{personal.contact.email}</span>
                </div>
              )}

              {personal.contact?.phone && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Phone</span>
                  <span className="text-sm text-foreground">{personal.contact.phone}</span>
                </div>
              )}

              {personal.gender && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Gender</span>
                  <span className="text-sm text-foreground capitalize">{personal.gender}</span>
                </div>
              )}

              {personal.dob && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Date of Birth</span>
                  <span className="text-sm text-foreground">{personal.dob}</span>
                </div>
              )}

              {personal.marital_status && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Marital Status</span>
                  <span className="text-sm text-foreground capitalize">{personal.marital_status}</span>
                </div>
              )}

              {personal.contact?.address && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">Address</span>
                  <span className="text-sm text-foreground">{personal.contact.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Work Information
            </CardTitle>
            <CardDescription>
              Your work profile and employment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {work_profiles && work_profiles.length > 0 ? (
              <div className="space-y-4">
                {work_profiles.map((workProfile: any, index: number) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-1 gap-2">
                      {workProfile.staff_no && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">Staff Number</span>
                          <span className="text-sm text-foreground font-mono">{workProfile.staff_no}</span>
                        </div>
                      )}

                      {workProfile.department && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">Department</span>
                          <span className="text-sm text-foreground">{workProfile.department}</span>
                        </div>
                      )}

                      {workProfile.grade && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">Grade</span>
                          <span className="text-sm text-foreground">{workProfile.grade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No work profile information available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      {contacts && contacts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Emergency Contacts
            </CardTitle>
            <CardDescription>
              Important contacts for emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contacts.map((contact: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {contact.name || (contact.surname && contact.other_names ? `${contact.surname} ${contact.other_names}` : 'Unknown Contact')}
                    </p>
                    {contact.relationship && (
                      <p className="text-xs text-muted-foreground capitalize">{contact.relationship}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {contact.phone_no && (
                      <p className="text-sm font-medium">{contact.phone_no}</p>
                    )}
                    {contact.email && (
                      <p className="text-xs text-muted-foreground">{contact.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
