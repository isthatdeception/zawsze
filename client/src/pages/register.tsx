// static imports
import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";

// relative imports
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toMapErrors } from "../utils/toMapErrors";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          console.log(values);
          // posting the input credentials to the server
          const response = await register({ options: values });
          // not worked
          // by any means
          if (response.data?.register.errors) {
            // making sure that we will fetch the error from our server side
            setErrors(toMapErrors(response.data.register.errors));
          } else if (response.data?.register.user) {
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
                name="username"
                placeholder="username"
                label="Username"
              />
            </Box>

            <Box mt={4}>
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
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
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
