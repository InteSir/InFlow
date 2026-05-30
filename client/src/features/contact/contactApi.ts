// services/contactApi.ts

import { apiClient } from "@/app/api-client";
// types/contactType.ts

export type ContactFormRequest = {
  name: string;
  email: string;
  message: string;
};

export type ContactFormResponse = {
  success: boolean;
  message: string;
};

export const contactApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<
      ContactFormResponse,
      ContactFormRequest
    >({
      query: (body) => ({
        url: "/contact/send-message",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSendMessageMutation } = contactApi;