import React from 'react';
import { TextField } from '@mui/material';
import { useController } from 'react-hook-form';

// https://react-hook-form.com/get-started#IntegratingwithUIlibraries
export function Input({ control, name, rules, defaultValue, ...props }) {
  const {
    field: { ref, ...inputProps },
    fieldState: { invalid, isTouched, isDirty },
    formState: { touchedFields, dirtyFields },
  } = useController({
    name,
    control,
    rules: rules || { required: true },
    defaultValue: defaultValue || '',
  });

  return <TextField {...inputProps} {...props} inputRef={ref} />;
}
