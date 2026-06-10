"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button, ConfirmModal } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function DeleteDocumentButton({
  documentId,
  documentTitle,
}: {
  documentId: string;
  documentTitle: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);

    const { error: deleteError } = await supabase.from("documents").delete().eq("id", documentId);

    if (!deleteError) {
      setDeleting(false);
      setOpen(false);
      router.refresh();
      toast.success("Documento eliminado");
      return;
    }

    const { error: archiveError } = await supabase
      .from("documents")
      .update({
        active: false,
        archived_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    setDeleting(false);

    if (archiveError) {
      toast.error(archiveError.message);
      return;
    }

    setOpen(false);
    router.refresh();
    toast.success("Documento archivado");
  };

  return (
    <>
      <Button
        type="button"
        variant="icon"
        onClick={() => setOpen(true)}
        disabled={deleting}
        className="hover:text-red-600"
        aria-label="Eliminar documento"
      >
        <Trash2 size={22} strokeWidth={1.8} />
      </Button>

      <ConfirmModal
        open={open}
        title="Quitar documento"
        description={`Si "${documentTitle}" ya tiene solicitudes históricas, será archivado para conservar los datos antiguos.`}
        confirmLabel="Quitar"
        danger
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setOpen(false);
        }}
        onConfirm={remove}
      />
    </>
  );
}
