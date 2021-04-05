// static imports
import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";

// relative imports
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toMapErrors } from "../utils/toMapErrors";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          console.log(values);
          // posting the input credentials to the server
          const response = await login(values);
          // not worked
          // by any means
          if (response.data?.login.errors) {
            // making sure that we will fetch the error from our server side
            setErrors(toMapErrors(response.data.login.errors));
          } else if (response.data?.login.user) {
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
                name="usernameOrEmail"
                placeholder="username or email"
                label="Username or Email"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>

            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="twitter"
            >
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
