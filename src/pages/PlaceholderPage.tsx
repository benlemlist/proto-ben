export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-md p-lg">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-foreground/50">Start prototyping</p>
    </div>
  );
}
