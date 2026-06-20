import React, { type TextareaHTMLAttributes } from 'react';
import { Textarea as DSTextarea } from '../../../../design-system/components/core/Textarea.jsx';
import type { TextareaProps as DSTextareaProps } from '../../../../design-system/components/core/Textarea.d';

interface TextareaProps extends Omit<DSTextareaProps, 'error'> {
  /** @deprecated Use error prop as string message */
  error?: boolean | string;
}

/**
 * Multi-line text area wrapping the design-system Textarea component.
 * Supports optional label, hint, and error message.
 */
export function Textarea({ error, ...props }: TextareaProps) {
  const errorMessage = typeof error === 'string' ? error : error ? 'Error' : undefined;
  return <DSTextarea error={errorMessage} {...props} />;
}
