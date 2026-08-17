// app/(print)/layout.tsx

type PrintLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default function PrintLayout({ children }: PrintLayoutProps) {
    return <div className="min-h-screen bg-slate-100 print:bg-white">{children}</div>;
}
