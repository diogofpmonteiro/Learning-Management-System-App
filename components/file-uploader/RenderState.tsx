import { cn } from "@/lib/utils";
import { CloudUploadIcon, ImageIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export const RenderEmptyState = ({ isDragActive }: { isDragActive: boolean }) => {
  return (
    <div className='text-center'>
      <div className='flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4'>
        <CloudUploadIcon className={cn("size-6 text-muted-foreground", isDragActive && "text-primary")} />
      </div>

      <p className='text-base font-semibold text-foreground'>
        Drop your files here or <span className='text-primary text-bold cursor-pointer'>click to upload</span>
      </p>

      <Button className='mt-4' type='button'>
        Select File
      </Button>
    </div>
  );
};

export const RenderErrorState = () => {
  return (
    <div className='text-center'>
      <div className='flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4'>
        <ImageIcon className={cn("size-6 text-destructive")} />
      </div>

      <p className='text-base font-semibold'>Upload Failed</p>
      <p className='text-xs mt-1 text-muted-foreground'>Something went wrong</p>
      <Button className='mt-4' type='button'>
        Retry Upload
      </Button>
    </div>
  );
};

export const RenderUploadedState = ({
  previewUrl,
  isDeleting,
  handleRemoveFile,
  fileType,
}: {
  previewUrl: string;
  isDeleting: boolean;
  handleRemoveFile: () => void;
  fileType: "image" | "video";
}) => {
  return (
    <div className='relative group w-full h-full flex items-center justify-center'>
      {fileType === "image" ? (
        <Image src={previewUrl} alt='Uploaded file' fill className='object-contain p-2' />
      ) : (
        <video src={previewUrl} controls className='rounded-md w-full h-full' />
      )}

      <Button
        type='button'
        variant='destructive'
        size='icon'
        className={cn("absolute top-4 right-4")}
        onClick={handleRemoveFile}
        disabled={isDeleting}>
        {isDeleting ? <Loader2 className='size-4 animate-spin' /> : <XIcon className='size-4' />}
      </Button>
    </div>
  );
};

export const RenderUploadingState = ({ progress, file }: { progress: number; file: File }) => {
  return (
    <div className='text-center flex justify-center items-center flex-col'>
      <p>{progress}</p>
      <p className='mt-2 text-sm font-medium text-foreground'>Uploading..</p>
      <p className='mt-1 text-xs text-muted-foreground truncate max-w-xs'>{file.name}</p>
    </div>
  );
};
