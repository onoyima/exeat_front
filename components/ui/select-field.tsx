// ui/select-field.tsx
import { Label } from './label';
import React from 'react';

interface SelectFieldProps {
  label?: string;
  children: React.ReactNode;
}

export const SelectField = ({ label, children }: SelectFieldProps) => (
  <div className="space-y-1">
    {label && <Label>{label}</Label>}
    {children}
  </div>
);
