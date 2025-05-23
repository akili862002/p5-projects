import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Pet P5 - Projects</h1>
      <div className="space-y-2 mt-6">
        {pages.map((page) => (
          <Link
            key={page.name}
            to={page.path}
            className="w-[400px] p-3 border rounded-xl block hover:bg-neutral-100 active:bg-neutral-200"
          >
            {page.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

const pages = [
  {
    name: "Collision",
    path: "/collision",
  },
  {
    name: "Flocking",
    path: "/flocking",
  },
  {
    name: "Cube wave",
    path: "/cube-wave",
  },
];
