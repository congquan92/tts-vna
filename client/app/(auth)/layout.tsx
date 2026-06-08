import Image from "next/image";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex h-screen w-full">
            <div className="relative hidden w-1/2 md:block">
                <Image
                    src="/login.png"
                    alt="login image"
                    fill
                    priority // Ưu tiên load ảnh này ngay lập tức
                    className="object-cover"
                />
            </div>
            <div className="flex w-full items-center justify-center md:w-1/2">{children}</div>
        </div>
    );
}
