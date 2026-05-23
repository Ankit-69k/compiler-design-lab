import { MainLayout } from "@/components/layout/MainLayout";
import { CodePlayground } from "@/components/playground/CodePlayground";

export default function PlaygroundPage() {
  return (
    <MainLayout title="Code Playground">
      <div className="p-4 md:p-8 min-h-screen flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-2">Code Playground</h1>
          <p className="text-slate-400">
            Write, modify, and simulate C programs for compiler design algorithms.
            Select a starter program or write your own.
          </p>
        </div>
        <div className="flex-1">
          <CodePlayground />
        </div>
      </div>
    </MainLayout>
  );
}
