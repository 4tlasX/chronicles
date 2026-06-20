import React, { type InputHTMLAttributes } from 'react';
import { Input as DSInput } from '../../../../design-system/components/core/Input.jsx';
import type { InputProps as DSInputProps } from '../../../../design-system/components/core/Input.d';

interface TextInputProps extends Omit<DSInputProps, 'error'> {
  /** @deprecated Use error prop as string message */
  error?: boolean | string;
}

/**
 * Text input field wrapping the design-system Input component.
 * Supports optional label, hint, error message, and leading icon.
 */
export function TextInput({ error, ...props }: TextInputProps) {
  const errorMessage = typeof error === 'string' ? error : error ? 'Error' : undefined;
  return <DSInput error={errorMessage} {...props} />;
}
