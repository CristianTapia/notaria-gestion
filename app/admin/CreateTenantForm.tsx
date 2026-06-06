"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { createTenant } from "./actions";

function createSlugPreview(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreateTenantForm() {
  const [name, setName] = useState("");

  const slugPreview = createSlugPreview(name);

  return (
    <Card>
      <form action={createTenant}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la notaría"
          />

          <div className="flex h-11 items-center rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 font-mono text-sm text-[var(--color-muted)]">
            /c/{slugPreview || "slug-url"}
          </div>
        </div>

        <Button className="mt-4">
          <Plus className="h-4 w-4" />
          Crear notaría
        </Button>
      </form>
    </Card>
  );
}
