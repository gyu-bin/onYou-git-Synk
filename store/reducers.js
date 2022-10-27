// const initialState = {
//   authToken:
//    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiLsnqXspIDsmqkiLCJzb2NpYWxJZCI6IjIxOTAwMzc4NTAiLCJpZCI6NCwiZXhwIjoxMDAwMDAxNjU0NjA3MDA4fQ.m8OBIZEcB5dZ339YvhnWgJIRatKoF-DVPk2RrbXirsQRnYdFaALwnjR4oNmHGE-OZDfhDfOITaYzWLqYnU2vcQ",
//   //
// };

const initialState = {
  authToken:
   "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYnFsczY2NTFAZ21haWwuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTY2NjQwNzI2MywiZXhwIjoxMTY2NjQwNzI2M30.pBXahhVB9fLpXQ4P1zh1zNCmIw_y6lRHPRb9G3Ac-fM",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        authToken: action.payload,
      };
    case "LOGOUT":
      return {
        ...initialState,
      };
    default:
      return state;
  }
};
