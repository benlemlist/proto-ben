import { Button } from "@peteryaz/ui";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h1 className="text-xl font-bold">Lemlist Proto</h1>
      <p className="text-sm text-gray-500">
        Boilerplate ready — start prototyping!
      </p>
      <Button appearance="solid" intent="brand" size="md">
        Get started
      </Button>
    </div>
  );
}
