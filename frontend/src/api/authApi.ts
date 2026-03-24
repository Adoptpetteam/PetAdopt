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

export type Setup2FAResponse = {
  success: boolean;
  message: string;
  qrCode: string;
  secret: string;
};

export type Login2FABody = {
  email: string;
  password: string;
  totpCode: string;
};

export type Login2FAResponse = {
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

/** Bước 3: lấy QR code để thiết lập 2FA */
export async function setup2FA(email: string): Promise<Setup2FAResponse> {
  const { data } = await apiClient.post<Setup2FAResponse>("/auth/setup-2fa", {
    email,
  });
  return data;
}

/** Bước 4: xác thực mã TOTP để kích hoạt 2FA */
export async function verify2FA(body: {
  email: string;
  token: string;
}): Promise<SimpleMessageResponse> {
  const { data } = await apiClient.post<SimpleMessageResponse>(
    "/auth/verify-2fa",
    body
  );
  return data;
}

/** Đăng nhập bắt buộc 2FA (email/password + TOTP). */
export async function login2FA(body: Login2FABody): Promise<Login2FAResponse> {
  const { data } = await apiClient.post<Login2FAResponse>("/auth/login-2fa", body);
  return data;
}
