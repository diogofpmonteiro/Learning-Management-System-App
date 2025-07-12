"use client";

import { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { RenderEmptyState, RenderErrorState, RenderUploadedState, RenderUploadingState } from "./RenderState";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import useConstructUrl from "@/hooks/use-construct-url";

interface UploaderState {
  id: string | null;
  file: File | null;
  isUploading: boolean;
  isDeleting: boolean;
  progress: number;
  key?: string;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
}

interface IUploaderProps {
  value?: string;
  onChange?: (value: string) => void;
}

const Uploader = ({ value, onChange }: IUploaderProps) => {
  const fileUrl = useConstructUrl(value || "");

  const [fileState, setFileState] = useState<UploaderState>({
    id: null,
    file: null,
    isUploading: false,
    isDeleting: false,
    progress: 0,
    error: false,
    fileType: "image",
    key: value,
    objectUrl: fileUrl,
  });

  const uploadFile = async (file: File) => {
    setFileState((prev) => ({
      ...prev,
      isUploading: true,
      progress: 0,
    }));

    try {
      const presignedResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });

      if (!presignedResponse.ok) {
        toast.error("Failed to get presigned url");

        setFileState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 0,
          error: true,
        }));

        return;
      }

      const { presignedUrl, key } = await presignedResponse.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;

            setFileState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted),
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFileState((prev) => ({
              ...prev,
              progress: 100,
              isUploading: false,
              key,
            }));

            onChange?.(key);

            toast.success("File uploaded successfully");

            resolve();
          } else {
            reject(new Error("Upload failed.."));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Upload failed.."));
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      toast.error("Something went wrong");

      setFileState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: true,
      }));
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(fileState.objectUrl);
        }

        setFileState({
          id: uuidv4(),
          file,
          isUploading: false,
          isDeleting: false,
          progress: 0,
          error: false,
          objectUrl: URL.createObjectURL(file),
          fileType: "image",
        });

        uploadFile(file);
      }
    },
    [fileState.objectUrl]
  );

  const onDropRejected = (fileRejection: FileRejection[]) => {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find((rejection) => rejection.errors[0].code === "too-many-files");
      if (tooManyFiles) {
        toast.error("Too many files selected, max is 1");
      }

      const fileSizeTooBig = fileRejection.find((rejection) => rejection.errors[0].code === "file-too-large");
      if (fileSizeTooBig) {
        toast.error("File size exceeds the limit");
      }
    }
  };

  const handleRemoveFile = async () => {
    if (fileState.isDeleting || !fileState.objectUrl) return;

    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: fileState.key,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to remove file from storage");
        setFileState((prev) => ({
          ...prev,
          isDeleting: true,
          error: true,
        }));

        return;
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }

      onChange?.("");

      setFileState(() => ({
        id: null,
        file: null,
        isUploading: false,
        progress: 0,
        objectUrl: undefined,
        isDeleting: false,
        error: false,
        fileType: "image",
      }));

      toast.success("File removed successfully");
    } catch (error) {
      toast.error("Error removing file, please try again.");

      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
      }));
    }
  };

  const renderContent = () => {
    if (fileState.isUploading) {
      return <RenderUploadingState progress={fileState.progress} file={fileState.file as File} />;
    }

    if (fileState.error) {
      return <RenderErrorState />;
    }

    if (fileState.objectUrl) {
      return (
        <RenderUploadedState
          previewUrl={fileState.objectUrl}
          handleRemoveFile={handleRemoveFile}
          isDeleting={fileState.isDeleting}
        />
      );
    }

    return <RenderEmptyState isDragActive={isDragActive} />;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: fileState.isUploading || !!fileState.objectUrl,
  });

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
    };
  }, [fileState.objectUrl]);

  return (
    <Card
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-48",
        isDragActive ? "border-primary bg-primary/10 border-solid" : "border-border hover:border-primary"
      )}
      {...getRootProps()}>
      <CardContent className='flex items-center justify-center h-full w-full p-4'>
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default Uploader;
