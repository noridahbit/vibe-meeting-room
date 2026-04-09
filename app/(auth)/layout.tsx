export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="app-shell relative isolate overflow-hidden">{children}</div>;
}
