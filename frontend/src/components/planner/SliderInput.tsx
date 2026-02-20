import React from 'react';
import { AppSlider } from '../AppSlider';

type SliderInputProps = {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  valueSuffix?: string;
  onValueChange: (value: number) => void;
};

export function SliderInput({
  value,
  min = 0,
  max = 50,
  label,
  valueSuffix = 'years',
  onValueChange,
}: SliderInputProps) {
  return (
    <AppSlider
      value={value}
      minimumValue={min}
      maximumValue={max}
      onValueChange={onValueChange}
      step={1}
      label={label}
      valueSuffix={valueSuffix}
      showValue={true}
    />
  );
}
