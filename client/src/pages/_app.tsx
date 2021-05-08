// static import
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { AppProps } from "next/app";

// relative import
import theme from "../theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <CSSReset />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
