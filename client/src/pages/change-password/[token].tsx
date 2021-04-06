// static imports
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

// relative imports
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toMapErrors } from "../../utils/toMapErrors";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  return (
    <>
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            console.log(values);
            // posting the input credentials to the server
            const response = await changePassword({
              newPassword: values.newPassword,
              token,
            });
            // not worked
            // by any means
            if (response.data?.changePassword.errors) {
              // making sure that we will fetch the error from our server side
              const errorMap = toMapErrors(response.data.changePassword.errors);

              // error handling of token
              // client side
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              } else {
                setErrors(errorMap);
              }
              // if not an error occured
            } else if (response.data?.changePassword.user) {
              // if it worked
              // we will redirect the user to the homepage
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Box>
                <InputField
                  name="newPassword"
                  placeholder="new password"
                  label="New Password"
                  type="password"
                />
              </Box>

              <Box>
                {tokenError ? (
                  <>
                    <Flex>
                      <Box mt={4} mr={2} color="red.500">
                        {tokenError}
                      </Box>
                      <Box mt={4}>
                        <NextLink href="/forgot-password">
                          <Link>get a new one !</Link>
                        </NextLink>
                      </Box>
                    </Flex>
                  </>
                ) : null}
              </Box>

              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                colorScheme="twitter"
              >
                change password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword as any);
