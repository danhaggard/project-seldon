export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. Swap min-h-svh for flex-1 so it perfectly fills the remaining space
    <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
      {/* 2. Add -mt-14 to pull the form up, offsetting the header's visual weight */}
      <div className="w-full max-w-sm -mt-14">
        {children}
      </div>
    </div>
  );
}