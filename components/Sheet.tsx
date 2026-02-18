
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { SheetData, UploadedImage, ImageAdjustment } from '../types';
import { Settings2, Check, Download, Loader2, Maximize2, Minimize2, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';

// EXACT USER DIMENSIONS: 70mm x 100mm
const SLOT_PORTRAIT_W_MM = 70;
const SLOT_PORTRAIT_H_MM = 100;
const SLOT_LANDSCAPE_W_MM = 100;
const SLOT_LANDSCAPE_H_MM = 70;

const SLOT_PORTRAIT_W = `${SLOT_PORTRAIT_W_MM}mm`;
const SLOT_PORTRAIT_H = `${SLOT_PORTRAIT_H_MM}mm`;
const SLOT_LANDSCAPE_W = `${SLOT_LANDSCAPE_W_MM}mm`;
const SLOT_LANDSCAPE_H = `${SLOT_LANDSCAPE_H_MM}mm`;

interface SheetProps {
  data: SheetData;
  onUpdateAdjustment: (id: string, adjustment: ImageAdjustment) => void;
}

const Sheet: React.FC<SheetProps> = ({ data, onUpdateAdjustment }) => {
  const { images } = data;
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async () => {
    if (!sheetRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(sheetRef.current, {
        scale: 4,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        removeContainer: true,
      });
      
      const link = document.createElement('a');
      link.download = `welfare-academy-sheet-${data.id}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Sheet export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative group/sheet">
      <div className="no-print absolute -top-14 right-0 opacity-0 group-hover/sheet:opacity-100 transition-opacity flex gap-2 z-30" data-html2canvas-ignore="true">
         <button 
           onClick={exportAsImage}
           disabled={isExporting}
           className="bg-white border border-gray-100 px-5 py-2.5 rounded-xl shadow-2xl hover:shadow-indigo-100 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#163666]"
         >
           {isExporting ? <Loader2 size={16} className="animate-spin text-[#D32F2F]" /> : <Download size={16} />}
           {isExporting ? 'Exporting...' : 'Export PNG'}
         </button>
      </div>

      {/* A4 Container: 210x297mm */}
      <div 
        ref={sheetRef}
        className="sheet-export-target bg-white w-[210mm] h-[297mm] mx-auto shadow-2xl flex flex-col items-center border border-gray-100 print:shadow-none print:border-none print:m-0 box-border overflow-hidden relative"
      >
        {/* Academic Header Branding */}
        <div className="w-full flex justify-between items-center px-[20mm] pt-[10mm] pb-[5mm]">
           <div className="flex items-center gap-2 grayscale opacity-10">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Welfare Academy Official Record</span>
           </div>
           <div className="text-[10px] font-bold text-gray-300">SHEET REF: WA-{data.id.toString().padStart(4, '0')}</div>
        </div>

        <div className="flex justify-between w-full px-[15mm]">
          <PhotoSlot 
            image={images[0]} 
            onUpdate={onUpdateAdjustment} 
            width={SLOT_PORTRAIT_W} 
            height={SLOT_PORTRAIT_H} 
            slotW={SLOT_PORTRAIT_W_MM}
            slotH={SLOT_PORTRAIT_H_MM}
          />
          <PhotoSlot 
            image={images[1]} 
            onUpdate={onUpdateAdjustment} 
            width={SLOT_PORTRAIT_W} 
            height={SLOT_PORTRAIT_H}
            slotW={SLOT_PORTRAIT_W_MM}
            slotH={SLOT_PORTRAIT_H_MM}
          />
        </div>

        <div className="h-[10mm] w-full" />

        <div className="flex justify-center w-full">
          <PhotoSlot 
            image={images[2]} 
            onUpdate={onUpdateAdjustment} 
            width={SLOT_LANDSCAPE_W} 
            height={SLOT_LANDSCAPE_H} 
            slotW={SLOT_LANDSCAPE_W_MM}
            slotH={SLOT_LANDSCAPE_H_MM}
            isRotated={true}
          />
        </div>

        <div className="h-[10mm] w-full" />

        <div className="flex justify-between w-full px-[15mm]">
          <PhotoSlot 
            image={images[3]} 
            onUpdate={onUpdateAdjustment} 
            width={SLOT_PORTRAIT_W} 
            height={SLOT_PORTRAIT_H}
            slotW={SLOT_PORTRAIT_W_MM}
            slotH={SLOT_PORTRAIT_H_MM}
          />
          <PhotoSlot 
            image={images[4]} 
            onUpdate={onUpdateAdjustment} 
            width={SLOT_PORTRAIT_W} 
            height={SLOT_PORTRAIT_H}
            slotW={SLOT_PORTRAIT_W_MM}
            slotH={SLOT_PORTRAIT_H_MM}
          />
        </div>

        {/* Brand Footer */}
        <div className="absolute bottom-[10mm] left-0 right-0 flex flex-col items-center gap-1 opacity-20">
           <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#163666] tracking-tight">Welfare</span>
              <span className="text-xs font-bold text-[#D32F2F] tracking-wide">Academy</span>
           </div>
           <div className="h-0.5 w-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

interface PhotoSlotProps {
  image?: UploadedImage;
  onUpdate: (id: string, adjustment: ImageAdjustment) => void;
  width: string;
  height: string;
  slotW: number;
  slotH: number;
  isRotated?: boolean;
}

const PhotoSlot: React.FC<PhotoSlotProps> = ({ image, onUpdate, width, height, slotW, slotH, isRotated = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, imgX: 50, imgY: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const adj = image?.adjustment || { scale: 1, x: 50, y: 50, fitMode: 'cover' };
  const fitMode = adj.fitMode || 'cover';

  const imageStyles = useMemo(() => {
    if (!image || !image.width || !image.height) return {};
    const targetW = isRotated ? slotH : slotW;
    const targetH = isRotated ? slotW : slotH;
    const slotRatio = targetW / targetH;
    const imgRatio = image.width / image.height;
    const isCover = fitMode === 'cover';

    let style: React.CSSProperties = {
      position: 'absolute',
      left: `${adj.x}%`,
      top: `${adj.y}%`,
      transform: `translate(-50%, -50%) scale(${adj.scale})`,
      display: 'block',
      maxWidth: 'none',
      maxHeight: 'none',
    };

    if (isCover) {
      if (imgRatio > slotRatio) {
        style.height = '100%';
        style.width = 'auto';
      } else {
        style.width = '100%';
        style.height = 'auto';
      }
    } else {
      if (imgRatio > slotRatio) {
        style.width = '100%';
        style.height = 'auto';
      } else {
        style.height = '100%';
        style.width = 'auto';
      }
    }
    return style;
  }, [image, slotW, slotH, fitMode, adj.x, adj.y, adj.scale, isRotated]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing || !image) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, imgX: adj.x, imgY: adj.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !image || !containerRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const rect = containerRef.current.getBoundingClientRect();
    const sens = 100 / (Math.min(rect.width, rect.height) * adj.scale);

    if (isRotated) {
      onUpdate(image.id, { 
        ...adj, 
        x: dragStart.current.imgX + (dy * sens), 
        y: dragStart.current.imgY - (dx * sens) 
      });
    } else {
      onUpdate(image.id, { 
        ...adj, 
        x: dragStart.current.imgX + (dx * sens), 
        y: dragStart.current.imgY + (dy * sens) 
      });
    }
  }, [isDragging, image, adj, onUpdate, isRotated]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      style={{ width, height }}
      className={`relative bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 transition-all ${image && !isEditing ? 'cursor-pointer hover:border-[#163666]' : ''} ${isEditing ? 'z-20 ring-4 ring-[#163666] shadow-2xl scale-[1.02]' : ''}`}
      onClick={() => !isEditing && image && setIsEditing(true)}
    >
      {image ? (
        <div className={`w-full h-full relative ${isRotated ? 'flex items-center justify-center' : ''}`}>
           <div 
             className="absolute inset-0 flex items-center justify-center"
             style={isRotated ? { transform: 'rotate(90deg)', width: height, height: width, left: '50%', top: '50%', marginLeft: `-${parseFloat(height)/2}mm`, marginTop: `-${parseFloat(width)/2}mm` } : {}}
           >
              <img 
                src={image.url}
                alt=""
                style={imageStyles}
                className="block pointer-events-none"
              />
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 opacity-5">
           <ShieldCheck size={24} />
           <span className="text-[8px] font-black uppercase tracking-widest">Welfare Academy</span>
        </div>
      )}

      {isEditing && image && (
        <div className="no-print absolute inset-0 z-30" data-html2canvas-ignore="true">
          <div className="absolute inset-0 cursor-move" onMouseDown={handleMouseDown} />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-white rounded-[2rem] p-5 flex flex-col gap-4 pointer-events-auto shadow-2xl border border-gray-100 w-60">
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-[#163666] uppercase tracking-tighter">
                    <span>Magnification</span>
                    <span className="text-[#D32F2F]">{Math.round(adj.scale * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="4" step="0.01" value={adj.scale}
                    onChange={(e) => onUpdate(image.id, { ...adj, scale: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#163666]"
                  />
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     onUpdate(image.id, { ...adj, fitMode: adj.fitMode === 'contain' ? 'cover' : 'contain', scale: 1, x: 50, y: 50 });
                   }}
                   className="flex-1 py-3 bg-gray-50 hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-gray-100 hover:border-[#163666] transition-all"
                 >
                   {adj.fitMode === 'contain' ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                   {adj.fitMode === 'contain' ? 'Fill' : 'Fit'}
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                   className="flex-1 py-3 bg-[#163666] hover:bg-[#0f284d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-xl shadow-blue-900/10 transition-all"
                 >
                   <Check size={12} /> Confirm
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
      
      {image && !isEditing && (
        <div className="no-print absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" data-html2canvas-ignore="true">
          <div className="bg-[#163666] text-white p-2 rounded-xl shadow-xl">
            <Settings2 size={16} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sheet;
