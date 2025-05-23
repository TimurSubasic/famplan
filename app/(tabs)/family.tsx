import HasFamily from "@/components/HasFamily";
import Loading from "@/components/Loading";
import NoFamily from "@/components/NoFamily";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React from "react";

const Family = () => {
  const { user } = useUser();

  const clerkId = user?.id as string;

  const userFull = useQuery(api.users.getUserByClerk, { clerkId });

  if (userFull === undefined) {
    return <Loading />;
  }

  if (userFull?.familyId) {
    return <HasFamily />;
  } else {
    return <NoFamily />;
  }
};

export default Family;
