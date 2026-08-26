import React, { useRef } from 'react';
import { FileText, ImagePlus, X } from 'lucide-react';
import { Field } from '@/components/wizard/FormField';
import { MediaDocumentsData } from '@/types/addProperty';

interface MediaDocumentsStepProps {
  data: MediaDocumentsData;
  onChange: (data: MediaDocumentsData) => void;
}

export const MediaDocumentsStep: React.FC<MediaDocumentsStepProps> = ({ data, onChange }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    onChange({ ...data, images: [...data.images, ...Array.from(files)] });
  };

  const removeImage = (index: number) => {
    onChange({ ...data, images: data.images.filter((_, i) => i !== index) });
  };

  const addDocuments = (files: FileList | null) => {
    if (!files) return;
    onChange({ ...data, documents: [...data.documents, ...Array.from(files)] });
  };

  const removeDocument = (index: number) => {
    onChange({ ...data, documents: data.documents.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-[#0F172A]">Media &amp; Documents</h2>

      <Field label="Property photos">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addImages(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {data.images.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-[#CBD5E1] rounded-lg flex flex-col items-center justify-center gap-1 text-[#94A3B8] hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <ImagePlus size={20} />
            <span className="text-xs">Add photo</span>
          </button>
        </div>
      </Field>

      <Field label="Documents (deeds, permits, contracts...)">
        <input
          ref={docInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addDocuments(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="space-y-2">
          {data.documents.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between border border-[#E2E8F0] rounded-lg px-3 py-2.5"
            >
              <div className="flex items-center gap-2 text-sm text-[#1E293B] min-w-0">
                <FileText size={16} className="text-[#64748B] shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="p-1 text-gray-400 hover:text-red-600 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-[#CBD5E1] rounded-lg flex items-center justify-center gap-2 text-sm text-[#94A3B8] hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <FileText size={16} /> Upload document
          </button>
        </div>
      </Field>
    </div>
  );
};
