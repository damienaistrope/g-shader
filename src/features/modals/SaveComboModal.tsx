import React, { useState } from 'react';
import { X, FolderHeart } from 'lucide-react';
import type { LinkedFigmaFile } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  linkedFigmaFiles: LinkedFigmaFile[];
  onSave: (name: string, figmaFileId: string) => void;
  defaultFileId?: string;
}

export default function SaveComboModal({ isOpen, onClose, linkedFigmaFiles, onSave, defaultFileId }: Props) {
  const [name, setName] = useState('');
  const [fileId, setFileId] = useState(defaultFileId || 'none');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), fileId);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-[99] flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-[#2C2C2C] border border-neutral-700/60 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-[#E6E6E6]">
        <div className="p-4 bg-[#222222] border-b border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-4 h-4 text-[#18A0FB]" />
            <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">Save Combination</span>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9.5px] text-neutral-400 uppercase font-bold tracking-wider block">Combination Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Voice Assistant Hero"
              autoFocus
              className="w-full bg-[#1E1E1E] border border-neutral-700/40 text-neutral-200 px-3 py-2 rounded text-xs focus:border-[#18A0FB] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] text-neutral-400 uppercase font-bold tracking-wider block">Link to Figma File</label>
            <select
              value={fileId}
              onChange={e => setFileId(e.target.value)}
              className="w-full bg-[#1E1E1E] text-neutral-200 border border-neutral-700/30 rounded px-2.5 py-2 text-xs focus:border-[#18A0FB] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="none">No file linked</option>
              {linkedFigmaFiles.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] uppercase font-bold text-neutral-300 transition-colors cursor-pointer border-none outline-none">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-1.5 rounded bg-[#18A0FB] hover:bg-[#158CDD] disabled:opacity-40 text-[10.5px] uppercase font-bold text-white transition-colors cursor-pointer border-none outline-none"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
