import { configureStore } from "@reduxjs/toolkit";

import { toastErrorMiddleware } from "@/lib/middleware/toast-error";
import auth from "./authSlice";
import positions from "./positionsSlice";
import tags from "./tagsSlice";
import companyAddresses from "./companyAddressesSlice";
import jobPosts from "./jobPostsSlice";
import applications from "./applicationsSlice";
import assessments from "./assessmentsSlice";
import dashboard from "./dashboardSlice";
import templates from "./templatesSlice";
import rbac from "./rbacSlice";
import users from "./usersSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth,
      positions,
      tags,
      companyAddresses,
      jobPosts,
      applications,
      assessments,
      dashboard,
      templates,
      rbac,
      users,
    },
    middleware: (getDefault) => getDefault().concat(toastErrorMiddleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
