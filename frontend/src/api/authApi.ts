import { apiClient } from "./http";
import axios from "axios";

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
};

export type VerifyOtpBody = {
  email: string;
  otp: string;
};

export type SimpleMessageResponse = {
  success: boolean;
  message: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFAEnabled: boolean;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
};

export type GetProfileResponse = {
  success: boolean;
  user: ProfileUser;
};

export type UpdateProfileResponse = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

/** Bước 1: gửi thông tin đăng ký, BE gửi OTP qua email */
export async function registerUser(
  body: RegisterBody
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>(
    "/auth/register",
    body
  );
  return data;
}

/** Bước 2: xác thực OTP trong email */
export async function verifyRegistrationOtp(
  body: VerifyOtpBody
): Promise<SimpleMessageResponse> {
  try {
    const { data } = await apiClient.post<SimpleMessageResponse>(
      "/auth/veri-register-otp",
      body
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const { data } = await apiClient.post<SimpleMessageResponse>(
        "/auth/verify-registration-otp",
        body
      );
      return data;
    }
    throw error;
  }
}

export async function resendRegistrationOtp(
  email: string
): Promise<SimpleMessageResponse> {
  const { data } = await apiClient.post<SimpleMessageResponse>(
    "/auth/resend-registration-otp",
    { email }
  );
  return data;
}

/** Đăng nhập email + mật khẩu */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", body);
  return data;
}

/** Đăng nhập Google (credential = JWT từ Google Identity Services). */
export async function loginWithGoogle(body: {
  credential: string;
}): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/google", body);
  return data;
}

/** Lấy thông tin tài khoản (cần Bearer token). */
export async function getProfile(): Promise<GetProfileResponse> {
  const { data } = await apiClient.get<GetProfileResponse>("/auth/profile");
  return data;
}

/** Cập nhật tên hiển thị (cần Bearer token). */
export async function updateProfile(body: {
  name: string;
}): Promise<UpdateProfileResponse> {
  const { data } = await apiClient.put<UpdateProfileResponse>(
    "/auth/profile",
    body
  );
  return data;
}

/** Đổi mật khẩu (cần Bearer token). */
export async function changePassword(body: {
  oldPassword: string;
  newPassword: string;
}): Promise<SimpleMessageResponse> {
  const { data } = await apiClient.put<SimpleMessageResponse>(
    "/auth/change-password",
    body
  );
  return data;
}

/** Gửi OTP quên mật khẩu về email. */
export async function forgotPassword(
  email: string
): Promise<SimpleMessageResponse> {
  const { data } = await apiClient.post<SimpleMessageResponse>(
    "/auth/forgot-password",
    { email }
  );
  return data;
}

/** Gửi lại OTP đặt lại mật khẩu. */
export async function resendResetPasswordOtp(
  email: string
): Promise<SimpleMessageResponse> {
  const { data } = await apiClient.post<SimpleMessageResponse>(
    "/auth/resend-reset-password-otp",
    { email }
  );
  return data;
}

/** Đặt lại mật khẩu bằng OTP từ email. */
export async function resetPassword(body: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<SimpleMessageResponse> {
  const { data } = await apiClient.post<SimpleMessageResponse>(
    "/auth/reset-password",
    body
  );
  return data;
}
