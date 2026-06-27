import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/shaqaalaha")({
  component: () => (
    <div>
      <PageHeader title="Maamulka Shaqaalaha" breadcrumb="Macalimiinta iyo shaqaalaha kale" />
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        Bogga shaqaalaha wuxuu imanayaa marxaladda xigta.
      </div>
    </div>
  ),
});