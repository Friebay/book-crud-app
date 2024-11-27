// pages/profile.tsx
import { useSession } from "next-auth/react";

const ProfilePage = () => {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <p>Welcome, {session.user.email}</p>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default ProfilePage;