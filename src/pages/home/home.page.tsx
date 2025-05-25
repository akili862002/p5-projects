import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold">Pet P5 - Projects</h1>
      <div className="mt-6 grid grid-cols-4 gap-4">
        {pages.map((page) => (
          <Link key={page.name} to={page.path} className="block group">
            <div className="aspect-video overflow-hidden relative border rounded-xl">
              <img
                src={page.preview}
                alt={`${page.name} preview`}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 rounded-xl"
              />
              <div className="absolute inset-0 bg-transparent" />
            </div>
            <div>{page.name}</div>
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
    preview: "/preview/collision.png",
  },
  {
    name: "Flocking",
    path: "/flocking",
    preview: "/preview/flocking.png",
  },
  {
    name: "Cube wave",
    path: "/cube-wave",
    preview: "/preview/cube-wave.png",
  },
  {
    name: "Raycasting",
    path: "/raycasting",
    preview: "/preview/raycasting.png",
  },
];
