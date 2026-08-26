import React from 'react';
import { Field, Input, TextArea } from '@/components/wizard/FormField';
import { LandDetailsData } from '@/types/addProperty';

interface LandDetailsStepProps {
  data: LandDetailsData;
  onChange: (data: LandDetailsData) => void;
}

export const LandDetailsStep: React.FC<LandDetailsStepProps> = ({ data, onChange }) => {
  const update = <K extends keyof LandDetailsData>(key: K, value: LandDetailsData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-[#0F172A]">Land Details</h2>

      <Field label="Listing title" required>
        <Input
          value={data.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Prime residential plot in Gasabo"
        />
      </Field>

      <Field label="Description" required>
        <TextArea
          rows={6}
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Describe the land: access roads, nearby amenities, topography, title status..."
        />
      </Field>
    </div>
  );
};
