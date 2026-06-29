export enum Permission {
  // AUTH
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_CHANGE_PASSWORD = 'AUTH_CHANGE_PASSWORD',

  // USER
  USER_VIEW = 'USER_VIEW',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_IMPORT = 'USER_IMPORT',
  USER_EXPORT = 'USER_EXPORT',
  USER_TOGGLE_STATUS = 'USER_TOGGLE_STATUS',
  USER_RESET_PASSWORD = 'USER_RESET_PASSWORD',

  // BUSINESS
  BUSINESS_VIEW = 'BUSINESS_VIEW',
  BUSINESS_CREATE = 'BUSINESS_CREATE',
  BUSINESS_UPDATE = 'BUSINESS_UPDATE',
  BUSINESS_DELETE = 'BUSINESS_DELETE',
  BUSINESS_UPLOAD_FILE = 'BUSINESS_UPLOAD_FILE',
  BUSINESS_TOGGLE_STATUS = 'BUSINESS_TOGGLE_STATUS',
  BUSINESS_RESET_PASSWORD = 'BUSINESS_RESET_PASSWORD',

  // REPORT SỞ 
  REPORT_SO_VIEW = 'REPORT_SO_VIEW',
  REPORT_SO_APPROVE = 'REPORT_SO_APPROVE',
  REPORT_SO_REJECT = 'REPORT_SO_REJECT',
  REPORT_SO_REOPEN = 'REPORT_SO_REOPEN',

  // ROLE
  ROLE_VIEW = 'ROLE_VIEW',
  ROLE_CREATE = 'ROLE_CREATE',
  ROLE_UPDATE = 'ROLE_UPDATE',
  ROLE_DELETE = 'ROLE_DELETE',

  // REPORT DOANH NGHIỆP
  REPORT_DN_VIEW = 'REPORT_DN_VIEW',
  REPORT_DN_CREATE = 'REPORT_DN_CREATE',
  REPORT_DN_UPDATE = 'REPORT_DN_UPDATE',
  REPORT_DN_EXPORT = 'REPORT_DN_EXPORT',
  REPORT_DN_SUBMIT = 'REPORT_DN_SUBMIT',
}

export const PermissionDescription: Record<string, string> = {
  // AUTH
  AUTH_LOGIN: 'Đăng nhập hệ thống',
  AUTH_CHANGE_PASSWORD: 'Đổi mật khẩu',

  // USER
  USER_VIEW: 'Xem người dùng',
  USER_CREATE: 'Tạo người dùng',
  USER_UPDATE: 'Cập nhật người dùng',
  USER_DELETE: 'Xóa người dùng',
  USER_IMPORT: 'Import người dùng',
  USER_EXPORT: 'Export người dùng',
  USER_TOGGLE_STATUS: 'Khóa/mở người dùng',
  USER_RESET_PASSWORD: 'Reset mật khẩu người dùng',

  // BUSINESS
  BUSINESS_VIEW: 'Xem doanh nghiệp',
  BUSINESS_CREATE: 'Tạo doanh nghiệp',
  BUSINESS_UPDATE: 'Cập nhật doanh nghiệp',
  BUSINESS_DELETE: 'Xóa doanh nghiệp',
  BUSINESS_UPLOAD_FILE: 'Upload file doanh nghiệp',
  BUSINESS_TOGGLE_STATUS: 'Khóa/mở doanh nghiệp',
  BUSINESS_RESET_PASSWORD: 'Reset mật khẩu doanh nghiệp',

  // REPORT SO
  REPORT_SO_VIEW: 'Xem báo cáo sở',
  REPORT_SO_APPROVE: 'Duyệt báo cáo sở',
  REPORT_SO_REJECT: 'Từ chối báo cáo sở',
  REPORT_SO_REOPEN: 'Mở lại báo cáo sở',

  // ROLE
  ROLE_VIEW: 'Xem vai trò',
  ROLE_CREATE: 'Tạo vai trò',
  ROLE_UPDATE: 'Cập nhật vai trò',
  ROLE_DELETE: 'Xóa vai trò',

  // REPORT DN
  REPORT_DN_VIEW: 'Xem báo cáo doanh nghiệp',
  REPORT_DN_CREATE: 'Tạo báo cáo doanh nghiệp',
  REPORT_DN_UPDATE: 'Cập nhật báo cáo doanh nghiệp',
  REPORT_DN_EXPORT: 'Xuất báo cáo doanh nghiệp',
  REPORT_DN_SUBMIT: 'Gửi báo cáo doanh nghiệp',
};