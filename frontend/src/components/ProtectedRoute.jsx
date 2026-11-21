import { Navigate } from "react-router-dom";

function ProtectedRoute({
  authedUser,
  role,
  children,
}) {
  if (!authedUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    role &&
    authedUser.role !== role
  ) {
    if (authedUser.role === "admin") {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/member"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;