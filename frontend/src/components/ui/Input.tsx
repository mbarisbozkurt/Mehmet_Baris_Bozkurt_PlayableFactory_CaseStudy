'use client';

import { forwardRef } from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps, InputRef } from 'antd';

interface Props extends Omit<InputProps, 'status'> {
  error?: string;
}

export const Input = forwardRef<InputRef, Props>(({ error, ...props }, ref) => {
  return (
    <div className="w-full">
      <AntInput 
        ref={ref} 
        {...props} 
        status={error ? 'error' : undefined}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const PasswordInput = forwardRef<InputRef, Props>(
  ({ error, ...props }, ref) => {
    return (
      <div className="w-full">
        <AntInput.Password 
          ref={ref} 
          {...props} 
          status={error ? 'error' : undefined}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';