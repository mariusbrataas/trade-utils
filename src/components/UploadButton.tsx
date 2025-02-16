import { Button } from "@/components/Button";
import { PropsWithChildren, useRef } from "react";

export function UploadButton({
  children,
  accept,
  onUpload,
  className,
  multiple,
}: PropsWithChildren<{
  accept: string;
  onUpload: (files: File[]) => void;
  className?: string;
  multiple?: boolean;
}>) {
  const uploadRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        className={className}
        outline
        onClick={() => uploadRef.current?.click()}
      >
        {children}
      </Button>
      <input
        className="hidden"
        type="file"
        ref={uploadRef}
        onClick={(e) => {
          e.stopPropagation();
        }}
        accept={accept}
        multiple={multiple}
        onChange={(event) => onUpload(Array.from(event.target.files || []))}
      />
    </>
  );
}
