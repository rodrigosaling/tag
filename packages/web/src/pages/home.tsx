/* eslint-disable react/jsx-props-no-spreading */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getDataWithAuthorization } from '../api/get-data';
import { postDataWithAuthorization } from '../api/post-data';
import { putDataWithAuthorization } from '../api/put-data';

type Inputs = {
  name: string;
};

type Tags = {
  name: string;
  hash: string;
};

export default function App() {
  const queryClient = useQueryClient();

  const queryTags = useQuery({
    queryKey: ['tags'],
    queryFn: () => getDataWithAuthorization('/tags'),
  });

  const queryDeletedTags = useQuery({
    queryKey: ['tags', 'deleted'],
    queryFn: () => getDataWithAuthorization('/tags?deleted=true'),
  });

  const createTag = useMutation({
    mutationFn: (formData) => postDataWithAuthorization('/tags', formData),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tags'], exact: true });
    },
  });

  const deleteTag = useMutation({
    mutationFn: (hash) => putDataWithAuthorization(`/tags/${hash}/delete`),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const restoreTag = useMutation({
    mutationFn: (hash) => putDataWithAuthorization(`/tags/${hash}/restore`),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const {
    register,
    handleSubmit,
    // watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (formData) => {
    createTag.mutate(formData);
  };

  const handleDelete = (hash: string) => {
    deleteTag.mutate(hash);
  };

  const handleRestore = (hash: string) => {
    restoreTag.mutate(hash);
  };

  return (
    <>
      <header>
        <h1 className="text-indigo ml-12 underline underline-dotted">Events</h1>
        <nav>
          <ul>
            <li>Home</li>
            <li>Reports</li>
            <li>Tags</li>
            <li>Preferences</li>
            <li>
              <Link to="/logout">Logout</Link>
            </li>
          </ul>
        </nav>
      </header>
      <hr />
      <main>
        <h2>Adicionar uma tag</h2>
        {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* register your input into the hook by invoking the "register" function */}
          <input
            {...register('name', { required: true })}
            id="name-something"
            data-1p-ignore
          />
          {/* include validation with required or other standard HTML validation rules */}
          {/* <input {...register('exampleRequired', { required: true })} /> */}
          {/* errors will return when field validation fails  */}
          {errors.name && <span>This field is required</span>}
          <button type="submit">Send</button>
          {createTag.isPending ? (
            <div>Adding todo...</div>
          ) : (
            <>
              {createTag.isError ? (
                <div>An error occurred: {createTag.error.message}</div>
              ) : null}

              {createTag.isSuccess ? <div>Todo added!</div> : null}
            </>
          )}
        </form>
        {queryTags.isError && <p>{queryTags.error.message}</p>}

        <h2>Tags cadastradas</h2>
        {queryTags.data && queryTags.data.length === 0 && (
          <p>Nenhuma tag cadastrada</p>
        )}
        <ul>
          {queryTags.data &&
            queryTags.data.map((tag: Tags) => (
              <li key={tag.hash}>
                {tag.name}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => handleDelete(tag.hash)}
                >
                  delete
                </button>
              </li>
            ))}
        </ul>

        <h2>Tags apagadas</h2>
        {queryDeletedTags.isError && <p>{queryDeletedTags.error.message}</p>}
        {queryDeletedTags.data && queryDeletedTags.data.length === 0 && (
          <p>Nenhuma tag apagada</p>
        )}
        <ul>
          {queryDeletedTags.data &&
            queryDeletedTags.data.map((tag: Tags) => (
              <li key={tag.hash}>
                {tag.name}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => handleRestore(tag.hash)}
                >
                  restore
                </button>
              </li>
            ))}
        </ul>
      </main>
      <hr />
      <footer>2023</footer>
    </>
  );
}
