import React, { type SelectHTMLAttributes } from 'react';
import { Select as DSSelect } from '../../../../design-system/components/core/Select.jsx';
import type { SelectProps as DSSelectProps } from '../../../../design-system/components/core/Select.d';

/**
 * Select field wrapping the design-system Select component.
 * Supports optional label, hint, and pass-through children (option elements).
 */
export function Select(props: DSSelectProps) {
  return <DSSelect {...props} />;
}
