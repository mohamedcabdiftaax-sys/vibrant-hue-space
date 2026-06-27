import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/dacwo")({
  component: () => (
    <div>
      <PageHeader title="Dacwo & Anshax" breadcrumb="Warbixinada dhibaatooyinka ardayda" />
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        Moduulkan wuxuu imanayaa marxaladda xigta.
      </div>
    </div>
  ),
});