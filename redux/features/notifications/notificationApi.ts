import { apiSlice } from "../api/apiSlice";

/* ────────── notification api ────────── */
export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── my unread list ────────── */
    getMyUnreadNotifications: builder.query<any, void>({
      query: () => "/my-unread-notifications?limit=50&skip=0",
      providesTags: ["MyUnreadNotifications"],
    }),

    /* ────────── my unread count ────────── */
    getMyUnreadNotificationsCount: builder.query<{ dataCount: number }, void>({
      query: () => "/my-unread-notifications-count",
      providesTags: ["MyUnreadNotificationsCount"],
    }),

    /* ────────── mark one read ────────── */
    updateNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notification/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["MyUnreadNotifications", "MyUnreadNotificationsCount"],
    }),

    /* ────────── delete one notification ────────── */
    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyUnreadNotifications", "MyUnreadNotificationsCount"],
    }),

    /* ────────── admin list ────────── */
    getAdminNotifications: builder.query<any, void>({
      query: () => "/admin-notifications?limit=50&skip=0",
      providesTags: ["AdminNotifications"],
    }),

    /* ────────── admin mark read ────────── */
    updateAdminNotificationIsRead: builder.mutation<
      any,
      { notificationIds: string[] }
    >({
      query: (body) => ({
        url: "/update-admin-notification",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
  }),
});

export const {
  useGetMyUnreadNotificationsQuery,
  useGetMyUnreadNotificationsCountQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetAdminNotificationsQuery,
  useUpdateAdminNotificationIsReadMutation,
} = notificationApi;
