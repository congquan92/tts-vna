import Image from "next/image";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex justify-center h-screen">
            {/* hinh minh hoa */}
            <div className="w-1/2 relative">
                <Image src="/login.png" alt="login image" fill sizes="50vw" className="object-contain p-5" priority />
            </div>

            {/* pages (login/signup)*/}
            <div className="w-1/2">{children}</div>
        </div>
    );
}
