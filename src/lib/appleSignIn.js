// The API verifies the identity token's signature and audience. State binds the
// popup result to this browser's authorization attempt before it reaches the API.
export async function authorizeWithApple(auth, { clientId, redirectURI }) {
  const state = crypto.randomUUID();
  auth.init({ clientId, redirectURI, scope: "name email", state, usePopup: true });
  const response = await auth.signIn();
  if (response?.authorization?.state !== state || !response.authorization.id_token) {
    throw new Error("Apple sign-in could not be verified. Please try again.");
  }
  return response;
}
