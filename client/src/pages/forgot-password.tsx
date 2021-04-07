// static imports
import { Box, Button, Container } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { useState } from "react";

// relative imports
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword: React.FC<{}> = ({}) => {
  // toggling the states
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <>
      <Container maxW="xl" centerContent mt={10}>
        <Wrapper variant="small">
          <Formik
            initialValues={{ email: "" }}
            onSubmit={async (values) => {
              await forgotPassword(values);
              setComplete(true);
            }}
          >
            {({ isSubmitting }) =>
              complete ? (
                <Box>
                  if an account with this email exists, we have successfully
                  send you an email
                </Box>
              ) : (
                <Form>
                  <Box>
                    <InputField
                      name="email"
                      placeholder="email"
                      label="Email"
                      type="email"
                    />
                  </Box>

                  <Button
                    mt={4}
                    type="submit"
                    isLoading={isSubmitting}
                    colorScheme="twitter"
                  >
                    forgot password
                  </Button>
                </Form>
              )
            }
          </Formik>
        </Wrapper>
      </Container>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
