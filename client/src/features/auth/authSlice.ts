import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  expiresAt: number | null;
  user: User | null;
  reportSetting: ReportSetting | null;
  mfaPending?:boolean;
}

interface UserPreferences {
    enable2FA:boolean;
    emailNotification:boolean;
    twoFactorSecret?:string;
}

interface User {
  id: number;
  name: string;
  email: string;
  profilePicture: string;
  userPreference?:UserPreferences
  trialEndsAt?:string | null;
  currentPeriodEnd?: string | null;
  subscriptionPlan?: "free" | "pro";
}
export interface ReportConditions {
  minExpenses:    number | null;
  maxSavingsRate: number | null;
  detectUnusual:  boolean;
}

interface ReportSetting {
  userId: string;
  frequency?: string;
  isEnabled: boolean;
  reportPeriod:"LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_MONTH" | "CUSTOM";
  customFromDate?: string | null;
  customToDate?:   string | null;
  conditions?:     ReportConditions;
}

const initialState: AuthState = {
  accessToken: null,
  expiresAt: null,
  user: null,
  reportSetting: null,
  mfaPending:false,
 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.expiresAt = action.payload.expiresAt;
      state.user = action.payload.user;
      state.reportSetting = action.payload.reportSetting;
      state.mfaPending = action.payload.mfaPending;
    },
    updateCredentials: (state, action) => {
      const { accessToken, expiresAt, user, reportSetting } = action.payload;

      if (accessToken !== undefined) state.accessToken = accessToken;
      if (expiresAt !== undefined) state.expiresAt = expiresAt;
      if (user !== undefined) state.user = { 
        ...state.user,
        ...user,
        userPreference:{
          ...state.user?.userPreference,
          ...user.userPreference,
        },
      } as User;
      if (reportSetting !== undefined)
        state.reportSetting = { ...state.reportSetting, ...reportSetting };
    },
     updateSubscription: (state, action) => {
      if (state.user) {
        state.user.subscriptionPlan   = action.payload.subscriptionPlan;
        state.user.trialEndsAt        = action.payload.trialEndsAt;
        state.user.currentPeriodEnd   = action.payload.currentPeriodEnd;
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.expiresAt = null;
      state.user = null;
      state.reportSetting = null;
    },
  },
});

export const { setCredentials, updateCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
