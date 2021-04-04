// checking the current component or page is
// server side rendered

export const isOnServer = () => typeof window === "undefined";
