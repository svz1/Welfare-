
import React, { useRef } from 'react';
import { Upload, Plus } from 'lucide-react';
import { UploadedImage } from '../types';

interface FileUploadProps {
  onUpload: (images: UploadedImage[]) => void;
  isCompact?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isCompact = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageDimensions = (url: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newUploadedImages: UploadedImage[] = await Promise.all(
      files.map(async (file) => {
        const url = URL.createObjectURL(file);
        const dimensions = await getImageDimensions(url);
        return {
          id: Math.random().toString(36).substring(2, 9),
          url,
          name: file.name,
          file: file,
          width: dimensions.width,
          height: dimensions.height
        };
      })
    );

    onUpload(newUploadedImages);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isCompact) {
    return (
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <button className="flex items-center gap-2 bg-[#f4f6f9] text-[#163666] px-5 py-3 rounded-2xl font-bold hover:bg-white border-2 border-[#163666]/10 hover:border-[#163666] transition-all shadow-sm">
          <Plus size={18} />
          Add More
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative cursor-pointer group">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div className="w-24 h-24 bg-[#163666] text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
          <Upload size={40} />
        </div>
      </div>
      <div className="text-center mt-10 space-y-3">
        <h3 className="text-2xl font-black text-[#163666] uppercase tracking-tighter">Bulk Student Upload</h3>
        <p className="text-gray-400 font-medium max-w-xs leading-relaxed">Drag your student portraits here or click to browse files.</p>
        <div className="pt-2">
          <span className="inline-block h-1 w-12 bg-[#D32F2F] rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
