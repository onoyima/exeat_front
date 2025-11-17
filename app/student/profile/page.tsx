"use client";

import { motion } from "framer-motion";
import { useGetStudentProfileQuery } from "@/lib/services/studentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, IdCard, Phone, ClipboardList, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useGetCurrentUser } from "@/hooks/use-current-user";
import Image from "next/image";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile Card Skeleton */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="bg-muted animate-pulse" />
          </Avatar>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </Card>

      {/* Info Sections Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="space-y-3">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <motion.li
      variants={fadeIn}
      className="flex items-center justify-between py-2 border-b last:border-0 border-border/50"
    >
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || <span className="text-muted-foreground italic">Not provided</span>}</span>
    </motion.li>
  );
}

export default function StudentProfilePage() {
  const { data: profileData, isLoading, error } = useGetStudentProfileQuery();

  const profile = profileData;
  const { user } = useGetCurrentUser();

  if (isLoading) return <ProfileSkeleton />;
  if (error) return (
    <Alert variant="destructive" className="mx-auto max-w-2xl mt-8">
      <AlertDescription>
        {error instanceof Error ? error.message : "Failed to load profile"}
      </AlertDescription>
    </Alert>
  );
  if (!profile) return null;

  const { personal, academic, medical, sponsor_contact } = profile;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="py-8 px-4 space-y-8"
    >
      {/* Profile Card */}
      <motion.div variants={fadeIn}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background" />
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative size-24 rounded-lg overflow-hidden bg-primary/10">
                {user?.passport ? (
                  <Image
                    src={`data:image/jpeg;base64,${user.passport}`}
                    alt={`${user.fname} ${user.lname}`}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {user?.fname?.[0]?.toUpperCase()}{user?.lname?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {personal.fname} {personal.middle_name} {personal.last_name}
                  </h1>
                </div>
                <div className="flex flex-col md:flex-row gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="w-4 h-4" />
                    <span>{personal.contact?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <IdCard className="w-4 h-4" />
                    <span>Matric No: {academic?.matric_no || "Not assigned"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.ul variants={stagger} className="divide-y divide-border/50">
                <InfoItem label="Gender" value={personal.gender} />
                <InfoItem label="Date of Birth" value={personal.dob ? format(new Date(personal.dob), 'PPP') : 'N/A'} />
                <InfoItem label="Marital Status" value={personal.marital_status} />
                <InfoItem label="LGA" value={personal.nationality?.lga_name} />
                <InfoItem label="City" value={personal.nationality?.city} />
                <InfoItem label="Address" value={personal.contact?.address} />
                <InfoItem label="Phone" value={personal.contact?.phone} />
                <InfoItem label="Username" value={personal.contact?.username} />
                <InfoItem label="Hobbies" value={personal.extras?.hobbies} />
              </motion.ul>
            </CardContent>
          </Card>
        </motion.div>
        {/* Sponsor/Contact */}
        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Phone className="w-5 h-5 text-primary" />
                Sponsor/Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sponsor_contact ? (
                <motion.ul variants={stagger} className="divide-y divide-border/50">
                  <InfoItem label="Title" value={sponsor_contact.title} />
                  <InfoItem label="Full Name" value={sponsor_contact.full_name} />
                  <InfoItem label="Relationship" value={sponsor_contact.relationship} />
                  <InfoItem label="Phone" value={sponsor_contact.phone_no} />
                  {sponsor_contact.phone_no_two && (
                    <InfoItem label="Alternative Phone" value={sponsor_contact.phone_no_two} />
                  )}
                  <InfoItem label="Email" value={sponsor_contact.email} />
                  {sponsor_contact.email_two && (
                    <InfoItem label="Alternative Email" value={sponsor_contact.email_two} />
                  )}
                  <InfoItem label="Address" value={sponsor_contact.address} />
                  <InfoItem label="Location" value={`${sponsor_contact.city}, ${sponsor_contact.state}`} />
                </motion.ul>
              ) : (
                <p className="text-muted-foreground italic text-center py-4">No sponsor/contact information available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Medical Records */}
        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="w-5 h-5 text-primary" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medical ? (
                <motion.ul variants={stagger} className="divide-y divide-border/50">
                  <InfoItem label="Physical" value={medical.physical} />
                  <InfoItem label="Blood Group" value={medical.blood_group} />
                  <InfoItem label="Genotype" value={medical.genotype} />
                  <InfoItem label="Medical Condition" value={medical.condition} />
                  <InfoItem label="Allergies" value={medical.allergies} />
                </motion.ul>
              ) : (
                <p className="text-muted-foreground italic text-center py-4">No medical records available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Academic Records */}
        <motion.div variants={fadeIn} className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <GraduationCap className="w-5 h-5 text-primary" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {academic ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <motion.ul variants={stagger} className="divide-y divide-border/50">
                    <InfoItem label="Matriculation No" value={academic.matric_no} />
                    <InfoItem label="Current Level" value={academic.level?.toString()} />
                  </motion.ul>
                  <motion.ul variants={stagger} className="divide-y divide-border/50">
                    <InfoItem label="JAMB Number" value={academic.jamb_no} />
                    <InfoItem label="JAMB Score" value={academic.jamb_score?.toString()} />
                  </motion.ul>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-center py-4">No academic records available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}