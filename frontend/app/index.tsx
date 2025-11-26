import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";

export default function IndexPage() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/dashboard" />;
  }
  return (
    <>
      <Redirect href="/signIn" />
    </>
  );
}
