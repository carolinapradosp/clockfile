export default function Title({ children }: { children: React.ReactNode }) {
    return (
        <h1 className="lg:text-3xl text-2xl font-light text-black tracking-wide uppercase">
            {children}
        </h1>
    );
}
