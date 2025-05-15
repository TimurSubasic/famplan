import HasFamily from "@/components/HasFamily";
import Loading from "@/components/Loading";
import NoFamily from "@/components/NoFamily";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";

const Family = () => {
  const { user } = useUser();

  const clerkId = user?.id as string;

  const userFull = useQuery(api.users.getUserByClerk, { clerkId });

  const [hasFamily, setHasFamily] = useState(false);

  useEffect(() => {
    if (userFull?.familyId) {
      setHasFamily(true);
    } else {
      setHasFamily(false);
    }
  }, [userFull]);

  if (userFull === undefined) {
    return <Loading />;
  }

  if (hasFamily) {
    return <HasFamily />;
  } else {
    return <NoFamily />;
  }
};

export default Family;
