// "use client";

// import Link from "next/link";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";

// type SidebarChildItem = {
//     id: string;
//     label: string;
//     path: string;
// };

// type SidebarMenuItem = {
//     id: number;
//     label: string;
//     isOpen: boolean;
//     items: SidebarChildItem[];
// };

// const initialSidebarMenus: SidebarMenuItem[] = [
//     {
//         id: 1,
//         label: "Hệ thống",
//         isOpen: true,
//         items: [
//             {
//                 id: "permissions",
//                 label: "Phân quyền",
//                 path: "/permissions",
//             },
//             {
//                 id: "roles",
//                 label: "Vai trò",
//                 path: "/roles",
//             },
//             {
//                 id: "accounts",
//                 label: "Tài khoản",
//                 path: "/accounts",
//             },
//             {
//                 id: "business-types",
//                 label: "Loại hình doanh nghiệp",
//                 path: "/business-types",
//             },
//             {
//                 id: "business-industries",
//                 label: "Ngành nghề kinh doanh",
//                 path: "/business-industries",
//             },
//             {
//                 id: "business-managements",
//                 label: "Quản lý doanh nghiệp",
//                 path: "/business-managements",
//             },
//             {
//                 id: "report-periods",
//                 label: "Kỳ báo cáo",
//                 path: "/report-periods",
//             },
//         ],
//     },
//     {
//         id: 2,
//         label: "Tai nạn lao động",
//         isOpen: true,
//         items: [
//             {
//                 id: "categories",
//                 label: "Danh mục chung",
//                 path: "/categories",
//             },
//             {
//                 id: "aggreements",
//                 label: "TNLD theo HĐLĐ",
//                 path: "/aggreements",
//             },
//         ],
//     },
// ];

// export default function Sidebar() {
//     const router = useRouter();
//     const pathname = usePathname();
//     const searchParams = useSearchParams();

//     const [sidebarMenus, setSidebarMenus] = useState<SidebarMenuItem[]>(initialSidebarMenus);
//     const [activeMenu, setActiveMenu] = useState<string>("permissions");

//     useEffect(() => {
//         const validPaths = initialSidebarMenus.flatMap((menu) => menu.items.map((item) => item.path));

//         if (pathname === "/" || !validPaths.includes(pathname)) {
//             router.replace("/permissions");
//             return;
//         }

//         setActiveMenu(pathname.replace("/", ""));

//         setSidebarMenus((prevMenus) =>
//             prevMenus.map((menu) => {
//                 const menuStateFromUrl = searchParams.get(String(menu.id));

//                 return {
//                     ...menu,
//                     isOpen: menuStateFromUrl === null ? menu.isOpen : menuStateFromUrl === "true",
//                 };
//             }),
//         );
//     }, [pathname, searchParams, router]);

//     const handleToggleMenu = (menuId: number) => {
//         const params = new URLSearchParams(searchParams.toString());

//         const currentMenu = sidebarMenus.find((menu) => menu.id === menuId);

//         if (!currentMenu) return;

//         const nextIsOpen = !currentMenu.isOpen;

//         params.set(String(menuId), String(nextIsOpen));

//         setSidebarMenus((prevMenus) =>
//             prevMenus.map((menu) =>
//                 menu.id === menuId
//                     ? {
//                           ...menu,
//                           isOpen: nextIsOpen,
//                       }
//                     : menu,
//             ),
//         );

//         router.replace(`${pathname}?${params.toString()}`, {
//             scroll: false,
//         });
//     };

//     const getMenuPath = (path: string) => {
//         const queryString = searchParams.toString();

//         return queryString ? `${path}?${queryString}` : path;
//     };

//     return (
//         <div className="py-3 space-y-5 bg-[#14317F] text-white h-screen flex flex-col">
//             {/* Header */}
//             <div className="flex items-center gap-5 px-5">
//                 <div className="w-15 h-15">
//                     <img src="quochuy.png" alt="" />
//                 </div>

//                 <h1 className="text-center font-semibold">
//                     Ủy ban nhân dân thành phố
//                     <br />
//                     Hồ Chí Minh
//                 </h1>

//                 <button className="text-2xl font-semibold">
//                     <i className="fa-solid fa-bars"></i>
//                 </button>
//             </div>

//             {/* Body */}
//             <div className="flex-1 border-b border-t border-[#FFFFFF] py-3 space-y-6">
//                 {sidebarMenus.map((menu) => (
//                     <nav key={menu.id} className="space-y-4">
//                         <div className="flex items-center justify-between px-5">
//                             <div className="flex items-center">
//                                 <div className="w-5 flex justify-center">
//                                     <i className="fa-solid fa-gear w-10 overflow-hidden"></i>
//                                 </div>

//                                 <span className="flex-1 ps-6">{menu.label}</span>
//                             </div>

//                             <button onClick={() => handleToggleMenu(menu.id)}>
//                                 <i className={`fa-solid ${menu.isOpen ? "fa-angle-down" : "fa-angle-right"}`}></i>
//                             </button>
//                         </div>

//                         {menu.isOpen && (
//                             <ul>
//                                 {menu.items.map((item) => (
//                                     <li key={item.id} className={`button menu-hover px-5 ${activeMenu === item.id ? "menu-active" : ""}`}>
//                                         <Link href={getMenuPath(item.path)} className="flex items-center py-3">
//                                             <div className="w-5 flex justify-center">
//                                                 <i className="fa-solid fa-circle text-[5px] w-10 overflow-hidden"></i>
//                                             </div>

//                                             <span className="flex-1 ps-6">{item.label}</span>
//                                         </Link>
//                                     </li>
//                                 ))}
//                             </ul>
//                         )}
//                     </nav>
//                 ))}
//             </div>

//             {/* Footer */}
//             <div className="flex items-center gap-5 px-5">
//                 <div className="w-10 h-10 rounded-full bg-black"></div>

//                 <div className="flex-1 flex justify-between">
//                     <h1>Tài khoản A</h1>

//                     <button>
//                         <i className="fa-solid fa-chevron-right"></i>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
