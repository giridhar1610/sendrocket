import type { ReactNode } from "react";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  // const { userId } = await auth();
  // if (!userId) {
  //   redirect("/auth/login");
  // }
  return <>{children}</>;
}
