export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다.</h1>
      <p className="text-sm text-gray-600">요청한 경로가 존재하지 않습니다.</p>
    </main>
  );
}
