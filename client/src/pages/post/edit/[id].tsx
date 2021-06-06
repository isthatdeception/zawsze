// relative imports
import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";

// relative imports
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { getPostIdFromServer } from "../../../utils/getPostIdFromServer";

const EditPost = ({}) => {
  const router = useRouter();
  const intId = getPostIdFromServer();
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout>
        <h2>loading post...</h2>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box alignContent="center" flexDirection="row" justifyContent="center">
          something very wrong happened. we could not find the concerned post
        </Box>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          const { error } = await updatePost({ id: intId, ...values });
          if (!error) {
            router.back();
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box>
              <InputField name="title" placeholder="post title" label="Title" />
            </Box>
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="write here"
                label="Body"
              />
            </Box>

            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="twitter"
            >
              update
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(EditPost);
