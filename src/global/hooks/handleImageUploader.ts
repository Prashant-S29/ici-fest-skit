import { create } from "zustand";

interface FileWithPreview extends File {
  preview: string;
}

interface ImageUploaderState {
  images: FileWithPreview[];
  setImages: (images: FileWithPreview[]) => void;
}

export const useImageUploader = create<ImageUploaderState>((set) => ({
  images: [],
  setImages: (images: FileWithPreview[]) => set({ images }),
}));

interface CoverImageUploaderState {
  images: FileWithPreview[];
  setImages: (images: FileWithPreview[]) => void;
}

export const useCoverImageUploader = create<CoverImageUploaderState>((set) => ({
  images: [],
  setImages: (images: FileWithPreview[]) => set({ images }),
}));

interface UploadedCoverImage {
  images: string;
  setImages: (images: string) => void;
}

export const useUploadedCoverImage = create<UploadedCoverImage>((set) => ({
  images: "",
  setImages: (images: string) => set({ images }),
}));
