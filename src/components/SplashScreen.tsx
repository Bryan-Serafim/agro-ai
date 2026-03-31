export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-beige flex items-center justify-center z-50">
      <div className="text-center animate-pulse">
        <img
          src="/image copy.png"
          alt="AgroAI Logo"
          className="w-32 h-32 mx-auto mb-6 object-contain"
        />
      </div>
    </div>
  );
}
