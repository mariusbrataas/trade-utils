import { useEffect, useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "./Button";

export function DeleteButton({ onDelete }: { onDelete?: () => void }) {
  const [didClick, setDidClick] = useState(false);
  useEffect(() => {
    if (didClick) {
      const timeout = setTimeout(() => {
        setDidClick(false);
      }, 2e3);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [didClick]);
  return (
    <Button
      outline
      className="!border-red-600 !text-red-600 hover:!border-red-600 hover:!bg-red-600 hover:!text-white"
      onClick={didClick ? onDelete : () => setDidClick(true)}
    >
      {didClick ? "Confirm" : "Delete"}
      <IoMdTrash />
    </Button>
  );
}
