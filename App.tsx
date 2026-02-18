
import React, { useState, useCallback, useMemo } from 'react';
import { Trash2, Printer, LayoutGrid, X, Download, Archive, Loader2, ShieldCheck } from 'lucide-react';
import { UploadedImage, SheetData, ImageAdjustment } from './types';
import FileUpload from './components/FileUpload';
import Sheet from './components/Sheet';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const handleImagesUploaded = useCallback((newImages: UploadedImage[]) => {
    const initialized = newImages.map(img => ({
      ...img,
      adjustment: { scale: 1, x: 50, y: 50, fitMode: 'cover' as const }
    }));
    setImages(prev => [...prev, ...initialized]);
  }, []);

  const handleUpdateAdjustment = useCallback((id: string, adjustment: ImageAdjustment) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, adjustment } : img
    ));
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return filtered;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
  };

  const downloadAllSheets = async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const sheetElements = document.querySelectorAll('.sheet-export-target');
      
      for (let i = 0; i < sheetElements.length; i++) {
        const element = sheetElements[i] as HTMLElement;
        const canvas = await html2canvas(element, {
          scale: 4, 
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 0,
        });
        
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
        if (blob) {
          zip.file(`sheet-${i + 1}.png`, blob);
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "welfare-academy-sheets.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Bulk download failed", error);
      alert("Failed to export. Try downloading sheets individually.");
    } finally {
      setIsZipping(false);
    }
  };

  const sheets: SheetData[] = useMemo(() => {
    const result: SheetData[] = [];
    for (let i = 0; i < images.length; i += 5) {
      result.push({ id: Math.floor(i / 5) + 1, images: images.slice(i, i + 5) });
    }
    return result;
  }, [images]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="no-print bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#163666] p-2.5 rounded-xl shadow-lg shadow-blue-900/10">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black text-[#163666] tracking-tight">Welfare</span>
              <span className="text-lg font-bold text-[#D32F2F] tracking-wide">Academy</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {images.length > 0 && (
              <>
                <button
                  onClick={clearAll}
                  className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#D32F2F] transition-colors px-4 py-2"
                >
                  Clear Queue
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-[#163666] hover:bg-[#0f284d] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-xl shadow-blue-900/10"
                >
                  <Printer size={18} />
                  Print Sheets
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="no-print mb-12">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] shadow-sm">
              <FileUpload onUpload={handleImagesUploaded} />
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-[#163666] tracking-tighter uppercase italic">Ready to Process</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-pulse"></span>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{images.length} Photos in Queue</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={downloadAllSheets}
                    disabled={isZipping}
                    className="flex items-center gap-3 px-8 py-3.5 text-white bg-[#163666] hover:bg-[#0f284d] rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-900/20 disabled:opacity-50"
                  >
                    {isZipping ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
                    {isZipping ? 'Processing...' : 'Bulk Download'}
                  </button>
                  <FileUpload onUpload={handleImagesUploaded} isCompact />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group aspect-[7/10] rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#163666] transition-all bg-gray-50 shadow-sm">
                    <img 
                      src={img.url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#163666]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2" data-html2canvas-ignore>
                      <button 
                        onClick={() => removeImage(img.id)} 
                        className="bg-white text-[#D32F2F] p-3 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-24">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="print-break">
              <div className="no-print mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black text-[#163666] uppercase tracking-[0.4em]">Section Sheet</span>
                   <span className="text-xs font-bold text-[#D32F2F]">{sheet.id.toString().padStart(2, '0')}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              </div>
              <Sheet data={sheet} onUpdateAdjustment={handleUpdateAdjustment} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
