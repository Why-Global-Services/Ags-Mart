"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAdminProfile } from "@/app/store/adminProfileSlice";

export default function AdminProfileProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAdminProfile());
  }, [dispatch]);

  return children;
}
