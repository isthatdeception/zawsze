// static import
import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { createClient, Provider } from "urql";

const client = createClient({
  url: process.env.API_URL!,
  fetchOptions: {
    credentials: "include",
  },
});

// relative import
import theme from "../theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
