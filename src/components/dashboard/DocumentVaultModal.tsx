import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Upload, ShieldCheck, Download, Trash2, CheckCircle2 } from 'lucide-react';

interface VaultDocument {
  id: string;
  name: string;
  type: 'Title Deed (UPI)' | 'Topographic Survey Map' | 'Zoning Certificate' | 'Tax Clearance';
  size: string;
  uploadedAt: string;
  verified: boolean;
}

interface DocumentVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
}

const INITIAL_DOCS: VaultDocument[] = [
  {
    id: 'd1',
    name: 'Official_Land_Title_UPI_1029384.pdf',
    type: 'Title Deed (UPI)',
    size: '2.4 MB',
    uploadedAt: '2026-08-01',
    verified: true,
  },
  {
    id: 'd2',
    name: 'Gasabo_Sector_Masterplan_Zoning.pdf',
    type: 'Zoning Certificate',
    size: '1.1 MB',
    uploadedAt: '2026-08-03',
    verified: true,
  },
];

export const DocumentVaultModal: React.FC<DocumentVaultModalProps> = ({
  isOpen,
  onClose,
  propertyTitle = 'Selected Property',
}) => {
  const [docs, setDocs] = useState<VaultDocument[]>(INITIAL_DOCS);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setTimeout(() => {
        setDocs([
          ...docs,
          {
            id: 'd_' + Date.now(),
            name: file.name,
            type: 'Topographic Survey Map',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: new Date().toISOString().slice(0, 10),
            verified: false,
          },
        ]);
        setIsUploading(false);
      }, 1000);
    }
  };

  const removeDoc = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden my-auto flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  Document Vault & Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[260px]">
                  {propertyTitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Upload Box */}
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30">
              <Upload size={24} className="text-indigo-500 mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isUploading ? 'Uploading & Verifying...' : 'Click to Upload Land Documentation'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Supports Title Deeds (UPI), Survey Blueprints, Zoning PDFs up to 15MB
              </span>
              <input
                type="file"
                accept=".pdf,.png,.jpeg,.jpg"
                className="hidden"
                onChange={handleSimulatedUpload}
                disabled={isUploading}
              />
            </label>

            {/* Document List */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Attached Legal Documents ({docs.length})
              </span>

              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs flex-shrink-0 font-bold text-xs">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {doc.name}
                        </span>
                        {doc.verified && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40">
                            <CheckCircle2 size={10} /> Verified Title
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {doc.type} • {doc.size}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => removeDoc(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
