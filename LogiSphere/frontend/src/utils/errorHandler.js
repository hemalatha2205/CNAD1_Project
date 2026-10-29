/**
 * Extracts a user-friendly error message from an API error.
 * Prevents exposing Java stack traces or technical details.
 */
export function getErrorMessage(error) {
  if (!error) {
    return "An unexpected error occurred.";
  }

  // Network / connection error
  if (!error.response) {
    if (error.code === "ERR_NETWORK") {
      return "Unable to connect to the server. Please check your connection.";
    }
    return error.message || "A network error occurred.";
  }

  const status = error.response.status;
  const data = error.response.data;

  // Try to extract the backend error message
  const backendMessage =
    typeof data === "string"
      ? data
      : data?.error || data?.message || null;

  switch (status) {
    case 400:
      return backendMessage || "Invalid request. Please check your input.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return backendMessage || "The requested resource was not found.";
    case 409:
      return backendMessage || "A conflict occurred. The resource may already exist.";
    case 500:
      return "An internal server error occurred. Please try again later.";
    default:
      return backendMessage || `An error occurred (status ${status}).`;
  }
}
