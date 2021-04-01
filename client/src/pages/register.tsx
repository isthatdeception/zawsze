// static imports
import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useMutation } from "urql";

// relative imports
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";

interface registerProps {}

// graphql register mutation
const REGISTER_MUTATION = `
mutation Register($username: String!, $password: String!) {
  register(options: { username: $username, password: $password }) {
    errors {
      field
      message
    }

    user {
      _id
      username
    }
  }
}`;

const Register: React.FC<registerProps> = ({}) => {
  const [, register] = useMutation(REGISTER_MUTATION);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
          return register(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
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

export default Register;
