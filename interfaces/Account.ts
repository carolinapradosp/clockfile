// interfaces/Account.ts

export type AccountProfileFormData = {
    name: string;
    email: string;
    phone: string;
};

export type AccountProfileActionState =
    | {
          success: true;
          message: string;
      }
    | {
          success: false;
          message: string;

          fieldErrors?: Partial<Record<keyof AccountProfileFormData, string>>;
      }
    | null;

export type ChangePasswordFormData = {
    currentPassword: string;
    newPassword: string;
    passwordConfirmation: string;
};

export type ChangePasswordActionState =
    | {
          success: true;
          message: string;
      }
    | {
          success: false;
          message: string;

          fieldErrors?: Partial<Record<keyof ChangePasswordFormData, string>>;
      }
    | null;

export type AccountActionResult = {
    success: boolean;
    message: string;
};

export type DeleteAccountActionState = {
    success: false;
    message: string;

    fieldErrors?: {
        password?: string;
        confirmation?: string;
    };
} | null;
