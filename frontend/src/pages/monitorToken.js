import { jwtDecode } from "jwt-decode";

async function refreshToken() {
  try {
    const response = await fetch("api/auth/refresh-token", { method: "POST" });
    if (!response.ok) {
      throw new Error("Failed to refresh token.");
    }
    const data = await response.json();
    localStorage.setItem("token", data.token);
    console.log("Token refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}
function monitorToken() {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.log("Token has expired.");
        refreshToken();
      } else {
        console.log(
          "Token is still valid. Expires at:",
          new Date(decoded.exp * 1000)
        );
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  } else {
    console.log("No token found in localStorage.");
  }
}

export default monitorToken;
