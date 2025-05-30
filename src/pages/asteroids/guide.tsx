import { useLocalStorage } from "react-use";

export const Guide = () => {
  const [shouldShow, setShouldShow] = useLocalStorage<boolean>(
    "show-asteroids-guide",
    true
  );
  //   const [shouldShow, setShouldShow] = useState<boolean>(true);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 p-8 rounded-2xl text-white max-w-md w-full max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Asteroids</h1>

        <section>
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Luật chơi
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Phá hủy các tiểu hành tinh để kiếm điểm</li>
            <li>
              Tiểu hành tinh lớn sẽ tách thành tiểu hành tinh vừa khi bị bắn
              trúng
            </li>
            <li>
              Tiểu hành tinh vừa sẽ tách thành tiểu hành tinh nhỏ khi bị bắn
              trúng
            </li>
            <li>Tiểu hành tinh nhỏ sẽ bị phá hủy khi bị bắn trúng</li>
            <li>Tránh va chạm với các tiểu hành tinh</li>
            <li>Bạn có 3 mạng khi bắt đầu</li>
            <li>Trò chơi kết thúc khi mất hết mạng</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Cách chơi
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-green-300">Di chuyển</h3>
              <p>Phím mũi tên hoặc WAS để điều khiển tàu</p>
              <ul className="list-disc pl-5">
                <li>
                  <Kbd>↑</Kbd> hoặc <Kbd>W</Kbd>: Đẩy tàu tiến lên
                </li>
                <li>
                  <Kbd>←</Kbd> hoặc <Kbd>A</Kbd>: Xoay tàu sang trái
                </li>
                <li>
                  <Kbd>→</Kbd> hoặc <Kbd>D</Kbd>: Xoay tàu sang phải
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-300">Hành động</h3>
              <ul className="list-disc pl-5">
                <li>Phím cách: Bắn</li>
              </ul>
            </div>
          </div>
        </section>

        <button
          onClick={() => setShouldShow(false)}
          className="text-base w-full mt-6 bg-white hover:scale-105 transition-all duration-300 active:scale-95 p-3 rounded-xl text-black font-bold"
        >
          Quẩy thôi
        </button>
      </div>
    </div>
  );
};

const Kbd = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="px-1 py-0.5 bg-gray-800 rounded-md text-sm text-white">
      {children}
    </span>
  );
};
