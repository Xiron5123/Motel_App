export const ValidationMessages = {
  required: (field: string) => `${field} là bắt buộc`,
  email: () => 'Email không hợp lệ',
  minLength: (field: string, min: number) => 
    `${field} phải có ít nhất ${min} ký tự`,
  maxLength: (field: string, max: number) => 
    `${field} không được vượt quá ${max} ký tự`,
  isNumber: (field: string) => `${field} phải là số`,
  isPositive: (field: string) => `${field} phải là số dương`,
  isString: (field: string) => `${field} phải là chuỗi`,
  isArray: (field: string) => `${field} phải là mảng`,
  min: (field: string, min: number) => `${field} phải lớn hơn hoặc bằng ${min}`,
  max: (field: string, max: number) => `${field} phải nhỏ hơn hoặc bằng ${max}`,
  isPhoneNumber: () => 'Số điện thoại không hợp lệ',
  isEnum: (field: string, values: string[]) => 
    `${field} phải là một trong: ${values.join(', ')}`,
};
