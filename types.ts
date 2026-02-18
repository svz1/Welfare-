
export interface ImageAdjustment {
  scale: number;
  x: number; // 0 to 100 (percentage)
  y: number; // 0 to 100 (percentage)
  fitMode?: 'cover' | 'contain';
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  file: File;
  width: number;
  height: number;
  adjustment?: ImageAdjustment;
}

export interface SheetData {
  id: number;
  images: UploadedImage[];
}
