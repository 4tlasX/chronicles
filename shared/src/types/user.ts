export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  encryptedMasterKey: string;
  kekSalt: string;
  kekWrapIv: string;
  recoveryWrappedMK: string;
  recoveryWrapIv: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    email: string;
    username: string;
  };
  encryption: {
    encryptionEnabled: boolean;
    kekSalt: string;
    encryptedMasterKey: string;
    kekWrapIv: string;
    kekIterations: number;
    recoveryWrappedMK: string;
    recoveryWrapIv: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newEncryptedMasterKey: string;
  newKekSalt: string;
  newKekWrapIv: string;
}

export interface RecoverRequest {
  email: string;
  recoveryKey: string;
  newPassword: string;
  newEncryptedMasterKey: string;
  newKekSalt: string;
  newKekWrapIv: string;
}
